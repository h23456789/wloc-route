import { Hono } from "hono/tiny";
import { getPageHtml } from "./page.js";
import { parseCoords, gcj02ToWgs84, toWgs84, round6, inRange } from "./parse.js";

const app = new Hono();

app.get("/", (c) => {
  return c.html(getPageHtml({
    googleMapsApiKey: c.env.GOOGLE_MAPS_API_KEY || "",
    appleMapKitToken: c.env.APPLE_MAPKIT_TOKEN || "",
  }));
});

// 地圖連結解析: 供快捷指令呼叫。
// GET /api/parse?u=<連結>&format=json&cs=<gcj|none>
//   返回 {lat, lon, name}; Apple / Google 地圖連結會依來源轉為 WGS84。cs=none 可強制不轉換。
//   不帶 format=json 時返回純文字 "lat=..&lon=.." 片段。
app.get("/api/parse", async (c) => {
  const raw = c.req.query("u") || "";
  const cs = (c.req.query("cs") || "").toLowerCase();
  const fmt = (c.req.query("format") || "").toLowerCase();
  try {
    let { lat, lon, name, src } = await parseCoords(raw);
    // 預設按來源自動換算; cs=none 強制不轉換, cs=gcj/bd 強制按指定座標系轉換。
    if (cs === "gcj") ({ lat, lon } = gcj02ToWgs84(lat, lon));
    else if (cs === "bd") ({ lat, lon } = toWgs84(lat, lon, "baidu"));
    else if (cs !== "none") ({ lat, lon } = toWgs84(lat, lon, src));
    // 出口再校驗一次: cs= 是呼叫方指定的, 強行按錯誤座標系換算也可能把值推出值域。
    // 寧可報錯也不要返回一個能被當成座標寫進裝置的數字。
    if (!inRange(lat, lon)) throw new Error("解析出的座標超出合法範圍");
    lat = round6(lat);
    lon = round6(lon);
    name = name || "";
    c.header("Access-Control-Allow-Origin", "*");
    if (fmt === "json") return c.json({ lat, lon, name });
    return c.text(`lat=${lat}&lon=${lon}`);
  } catch (e) {
    c.header("Access-Control-Allow-Origin", "*");
    return c.json({ error: String(e && e.message ? e.message : e) }, 422);
  }
});

// 兜底 500 也要帶 CORS —— 否則快捷指令那邊看到的是跨域錯誤, 而不是真正的原因。
app.onError((e, c) => {
  c.header("Access-Control-Allow-Origin", "*");
  return c.text(`${e && e.message ? e.message : e}`, 500);
});

export default app;
