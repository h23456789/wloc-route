# WLOC 路線控制版：自架與使用

這個版本以原始 WLOC 專案為基礎，新增：

- 地圖點選建立路線
- GPX 匯入（檔案只在瀏覽器本機解析）
- 自訂速度
- 開始、暫停、繼續、停止
- 路線反轉與迴圈
- 地圖浮動工具列（單點、手繪路線、GPX、搖桿與收藏捷徑）
- 搖桿按住連續移動，可自訂速度
- 地圖固定向北／允許旋轉切換
- WLOC 總開關（關閉時保留設定並恢復真實定位）
- 可命名儲存單點座標與 GPX／手繪路線
- 關閉 Safari 後仍依開始時間計算路線進度

## 架構

1. `worker/` 部署到你自己的 Cloudflare Worker，提供控制頁與地圖連結解析。
2. `dist/wloc.js` 與 `dist/wloc-settings.js` 放在你自己的 GitHub Repository。
3. `modules/` 內的代理模組會從你的 GitHub 載入這兩個指令碼。
4. GPX 不會上傳 Cloudflare；按下「開始」後，最多 280 個簡化後路線點會寫入手機代理工具的 `wloc_settings`。
5. 已命名儲存的單點與路線儲存在瀏覽器 `localStorage`，不會寫入 Cloudflare。

## 1. 建立 GitHub Repository

在 GitHub 建立公開 Repository：

```text
h23456789/wloc-route
```

把本專案全部檔案上傳到 `main` 分支。`modules/` 內的指令碼網址已預設指向這個 Repository。

如果 Repository 名稱不同，請搜尋並替換：

```text
https://raw.githubusercontent.com/h23456789/wloc-route/refs/heads/main/
```

## 2. 部署 Cloudflare Worker

電腦需先安裝 Node.js，接著在終端機執行：

```bash
cd worker
npm install
npm test
npx wrangler login
npm run deploy
```

完成後 Cloudflare 會顯示你的網址，例如：

```text
https://wloc-spoofer.<你的 Cloudflare 子網域>.workers.dev/
```

開啟網址後應可看到地圖浮動工具列，以及「單點定位／路線移動／搖桿移動」切換。

## 3. 安裝自己的代理模組

依使用的代理工具選擇：

| 工具 | 模組檔案 |
|---|---|
| Shadowrocket | `modules/wloc.module` |
| Surge / Egern | `modules/wloc.sgmodule` |
| Quantumult X | `modules/wloc.conf` |
| Loon | `modules/wloc.lpx` |
| Stash | `modules/wloc.stoverride` |

代理模組必須啟用 MITM，並信任代理工具安裝的憑證。

## 4. 路線模式

1. 開啟自己的 Worker 網址。
2. 選「路線移動」。
3. 在地圖依序點選路線，或匯入 `.gpx`。
4. 設定速度與是否迴圈。
5. 按「開始」。

開始後，路線、速度與開始時間會一次寫入手機代理工具。WLOC 每次收到 Apple 網路定位請求時才計算當下位置，不需要 Safari 每秒持續執行。

## 5. 搖桿模式

1. 點地圖左側的「搖桿」。
2. 設定移動速度後，按住方向鍵即可連續移動，放開便停止。
3. 搖桿模式約每秒更新一次 WLOC 單點座標，因此需要讓控制頁保持在前景。
4. 右側的 `N` 按鈕亮起時固定向北；關閉後可旋轉地圖，搖桿方向會跟隨畫面方向。

「停止」會把當時的計算位置改存成一般單點；「清除資料」則恢復透傳真實定位。

## WLOC 總開關與恢復真實定位

關閉控制頁上方的「WLOC 虛擬定位」後，代理指令碼會保留目前的單點或路線資料，但停止修改 Apple 定位回應。若當時正在走路線，會先凍結進度；重新開啟時從原本位置繼續。

恢復真實定位建議順序：

1. 關閉 WLOC 總開關。
2. 關閉 iPhone 定位服務。
3. 等幾秒後重新開啟定位服務。
4. 開啟 Apple 地圖確認真實位置。

iOS 26 以上若仍使用舊定位快取，請在關閉 WLOC 與定位服務後重新啟動 iPhone。

## 儲存單點與路線

- 單點：選好位置後按「收藏位置」，輸入名稱即可儲存。
- 路線：匯入 GPX 或在地圖畫好路線後按「儲存路線」，輸入名稱即可儲存。
- 點選已儲存專案可重新載入；刪除只會移除瀏覽器內的收藏，不會自動改變目前生效的裝置定位。

## 限制

- 路線最多寫入 280 個點；較大的 GPX 會在瀏覽器依路程等距簡化。
- 手動畫線是節點間直線，不會自動沿道路導航。
- WLOC 修改的是 Apple 網路定位回應，不是 GPS 硬體。
- iOS 26 以上的 `locationd` 快取可能使新位置延遲生效；必要時需依原專案說明重新啟動裝置。
- iOS 27 beta 6 起，Apple 已限制 `gs-loc.apple.com` 的 MITM；受影響版本無法使用此方法。

## 隱私

- 不使用 KV、D1、R2 或其他資料庫。
- Cloudflare Worker 的 observability 維持關閉。
- GPX 由瀏覽器的 `FileReader` 與 `DOMParser` 本機解析，不會傳到 Worker。
- 地圖圖磚與地名搜尋仍會連線到頁面設定的地圖服務；地圖連結解析會由你的 Worker 連線到對應地圖服務。

本專案延續原專案的 AGPL-3.0 授權；原作者與授權資訊請見 `README.md`、`LICENSE` 與 Git 歷史。
