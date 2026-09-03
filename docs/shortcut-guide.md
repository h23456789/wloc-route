# WLOC 虛擬定位 - 使用說明

## 工作原理

```
使用者在手機 Safari 開啟選點頁面
  → 地圖選位置 / 搜尋地名 / 貼上地圖連結
  → 點選「儲存到裝置」
  → 頁面請求 https://gs-loc.apple.com/wloc-settings/save?lon=x&lat=y
  → 代理模組攔截請求 → wloc-settings.js 寫入 $persistentStore
  → 下次 Apple 定位觸發 → wloc.js 讀取座標 → 修改定位響應
```

如果模組未啟用 → 請求不會被攔截 → 頁面提示檢查 MITM/模組配置。

---

## 使用方法

### 1. 安裝模組（一次性）
訂閱對應平臺的模組並啟用 MITM。

### 2. 開啟選點頁面
在 Safari 中開啟公共選點頁面（建議新增到主螢幕）:
```
https://你的worker域名/
```

> Worker 不儲存任何資料。座標直接寫入你的裝置本地；`/api/parse` 只在解析連結時
> 臨時向地圖服務發一次請求，處理完即丟，不寫儲存、不落日誌。

### 3. 選擇位置
- **點選地圖** — 直接點選
- **搜尋地名** — 輸入"上海外灘"等
- **貼上連結** — 從 Apple Maps / Google Maps / 高德 / 百度複製分享連結
- **當前位置** — 使用瀏覽器定位

### 4. 儲存到裝置
點選「儲存到裝置」→ 顯示 ✓ 即成功。

---

## 部署公共選點頁面

無需任何繫結：

```bash
cd worker
npm install
npm run deploy
```

不需要 KV、不需要資料庫、不需要環境變數。

> Worker 由 `worker/src/` 下的多個模組打包而成（頁面模板、連結解析、座標換算），
> 不能靠在 Dashboard 裡貼上單個檔案來部署，請用上面的 wrangler 流程。

---

## 模組配置

模組包含兩條指令碼規則（已自動配置，使用者無需操作）：

| 規則 | 型別 | 路徑 | 作用 |
|------|------|------|------|
| Apple WLOC | http-response | `/clls/wloc` | 修改定位響應 |
| WLOC Settings | http-request | `/wloc-settings/save` | 接收選點頁面寫入 |

MITM 主機名: `gs-loc.apple.com, gs-loc-cn.apple.com`（已包含在模組中）

---

## 儲存失敗排查

頁面顯示紅色提示時，檢查：
1. **模組已啟用** — 在代理工具中確認 WLOC 模組開關開啟
2. **MITM 證書** — 已安裝並信任 CA 證書
3. **MITM 主機名** — 包含 `gs-loc.apple.com`
4. **代理連線** — 當前網路走代理（Safari 請求會經過代理）

---

## 備選：手動編輯（BoxJS）

不使用選點頁面時，可在 BoxJS 中直接編輯 `wloc_settings`:
```json
{"longitude":121.4737,"latitude":31.2304,"accuracy":25}
```

優先順序: 已儲存座標 > 模組引數 > 預設值
