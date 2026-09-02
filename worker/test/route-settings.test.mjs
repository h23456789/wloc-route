import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const workerDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function executeSettings(url, initial = null) {
  const script = await readFile(path.resolve(workerDir, "../dist/wloc-settings.js"), "utf8");
  let stored = initial;
  let payload;
  const context = vm.createContext({
    $rocket: {},
    $request: { url },
    $persistentStore: {
      read() {
        return stored == null ? null : JSON.stringify(stored);
      },
      write(value) {
        stored = value == null ? null : JSON.parse(value);
        return true;
      },
    },
    $done(value) {
      payload = value;
    },
    console: { log() {} },
  });
  vm.runInContext(script, context);
  const response = payload.response || payload;
  return { result: JSON.parse(response.body), stored };
}

test("route action stores validated route settings", async () => {
  const { result, stored } = await executeSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=route&speed=4.5&loop=1&points=25.033%2C121.565%3B25.034%2C121.566%3B25.035%2C121.567",
  );
  assert.equal(result.success, true);
  assert.equal(stored.route.status, "running");
  assert.equal(stored.route.loop, true);
  assert.equal(stored.route.speedKph, 4.5);
  assert.deepEqual(stored.route.points, [
    [25.033, 121.565],
    [25.034, 121.566],
    [25.035, 121.567],
  ]);
  assert.equal(stored.latitude, 25.033);
  assert.equal(stored.longitude, 121.565);
});

test("normal point save clears an active route", async () => {
  const initial = {
    longitude: 121.565,
    latitude: 25.033,
    route: { points: [[25.033, 121.565], [25.034, 121.566]], speedKph: 4.5 },
  };
  const { result, stored } = await executeSettings(
    "https://gs-loc.apple.com/wloc-settings/save?lon=121.6&lat=25.1&acc=25",
    initial,
  );
  assert.equal(result.success, true);
  assert.equal(stored.route, null);
  assert.equal(stored.latitude, 25.1);
  assert.equal(stored.longitude, 121.6);
});

test("master switch preserves data and freezes or resumes route", async () => {
  const initial = {
    enabled: true,
    longitude: 121.565,
    latitude: 25.033,
    route: {
      points: [[25.033, 121.565], [25.034, 121.566]],
      speedKph: 4.5,
      startedAt: Date.now() - 10000,
      status: "running",
    },
  };
  const disabled = await executeSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=disable",
    initial,
  );
  assert.equal(disabled.result.enabled, false);
  assert.equal(disabled.stored.longitude, 121.565);
  assert.equal(disabled.stored.route.status, "paused");
  assert.equal(disabled.stored.route.resumeAfterEnable, true);

  const enabled = await executeSettings(
    "https://gs-loc.apple.com/wloc-settings/save?action=enable",
    disabled.stored,
  );
  assert.equal(enabled.result.enabled, true);
  assert.equal(enabled.stored.route.status, "running");
  assert.equal(enabled.stored.route.pausedAt, null);
  assert.equal(enabled.stored.route.resumeAfterEnable, false);
});

test("WLOC response script calculates position from route time", async () => {
  const script = await readFile(path.resolve(workerDir, "../dist/wloc.js"), "utf8");
  const logs = [];
  let done;
  const now = Date.now();
  const context = vm.createContext({
    $rocket: {},
    $argument: "longitude=113.94114&latitude=22.544577&accuracy=25&logLevel=debug",
    $request: { url: "https://gs-loc.apple.com/clls/wloc", headers: {} },
    $response: { status: 200, headers: {}, body: new Uint8Array() },
    $persistentStore: {
      read() {
        return JSON.stringify({
          longitude: 121.565,
          latitude: 25.033,
          route: {
            points: [[25.033, 121.565], [25.043, 121.565]],
            speedKph: 36,
            startedAt: now - 5000,
            status: "running",
            loop: false,
          },
        });
      },
      write() {
        return true;
      },
    },
    $done(value) {
      done = value;
    },
    console: { log(value) { logs.push(String(value)); } },
    setTimeout,
    clearTimeout,
    Uint8Array,
    ArrayBuffer,
  });
  vm.runInContext(script, context);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.ok(done);
  assert.match(logs.join("\n"), /使用已保存坐标: 121\.565,25\.0334/);
});
