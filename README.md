<p align="center">
  <img src="wloc.jpg" width="144" />
</p>

# Apple WLOC 定位修改

修改 Apple 網路定位服務 (WiFi/基站) 返回的座標，實現 iOS 網路定位虛擬定位。打開線上選點頁面選位置即可生效，無需手動填經緯度。

> ⚠️ **iOS 27 beta 6 起，系統已禁止對 `gs-loc.apple.com` 進行 MITM 攔截。** 目前該版本及之後的 beta 版本暫時無法使用本專案，等待後續適配方案。

---

## 訂閱地址

**Surge:**
https://raw.githubusercontent.com/Yu9191/wloc/refs/heads/main/modules/wloc.sgmodule

**Quantumult X:**
https://raw.githubusercontent.com/Yu9191/wloc/refs/heads/main/modules/wloc.conf

**Loon:**
https://raw.githubusercontent.com/Yu9191/wloc/refs/heads/main/modules/wloc.lpx

**Stash:**
https://raw.githubusercontent.com/Yu9191/wloc/refs/heads/main/modules/wloc.stoverride

**Shadowrocket(小火箭):**
https://raw.githubusercontent.com/Yu9191/wloc/refs/heads/main/modules/wloc.module

> Egern 可直接使用 Surge 模組
> Stash 請直接訂閱上面的 `.stoverride`，無需用 Script Hub 轉換

### 默認擴展功能變數名稱支持

預設模組已覆蓋目前已知的完整 WLOC 功能變數名稱集合：

- `gsp-ssl.ls.apple.com`
- `bluedot.is.autonavi.com`
- `bluedot.is.autonavi.com.gds.alibabadns.com`


---

## 快捷指令（推薦，最方便）

直接用快捷指令切換 / 清除定位，無需打開選點頁面：

- **wloc 設置地理位置**：https://www.icloud.com/shortcuts/a82717d8fdad4e6280866fcf911173f7
- **wloc 清理恢復位置**：https://www.icloud.com/shortcuts/f42632d406504f24a2cd163af4fe012f

**用法**

- **設置位置：** 在地圖 App 裡選好位置（長按地圖選點）→ 共用 → 選「wloc 設置地理位置」即可切換。
  - 蘋果地圖：選點 → 共用 → 「wloc 設置地理位置」
  - 高德地圖：選點 → 分享 → **更多** → 「wloc 設置地理位置」
- **清理位置：** 點「wloc 清理恢復位置」即可恢復真實定位。

支援蘋果地圖、高德（含短鏈，自動跟跳轉 + GCJ-02→WGS84 座標換算）。

> 前提：代理已開 + 模組已啟用 + 信任 `gs-loc.apple.com`。選點頁面（Worker / Pages）方案仍保留，見下方。

---

### 關於地圖連結解析（worker）

為了讓蘋果地圖和高德走同一條流程，連結統一發給 `wloc-spoofer.wloc.workers.dev/api/parse` 解析：

- **高德**：分享出來是短鏈，真實座標只藏在 302 跳轉的 `Location` 頭裡，且是 GCJ-02 偏移座標。快捷指令既讀不到跳轉頭、也難做座標換算，所以由 worker 跟跳轉 → 摳座標 → GCJ-02→WGS84 → 返回經緯度。
- **蘋果地圖**：連結裡直接帶 `coordinate=緯度,經度`，但在**中國大陸同樣是 GCJ-02 偏移座標**，所以和高德一樣由 worker 做 GCJ-02→WGS84 換算後返回；境外座標會自動跳過換算（`out_of_china` 判斷）原樣返回。除了統一坐標系，走同一介面也方便統一處理短鏈、文本夾連結、名稱解碼等。

**隱私：** `/api/parse` 是純轉發解析——收到連結 → 跟跳轉 → 解析座標 → 返回 JSON，全程不寫任何存儲、不記日誌、不緩存，處理完即丟（`wrangler.jsonc` 裡已顯式關閉 observability）。跟跳轉時只接受 http/https，單次請求 8 秒超時、唯讀回應正文前 512 KB。

**不放心可自行部署：** worker 源碼完全開源，可自己部署一份替換上面的地址：

- 路由：[`worker/src/index.js`](worker/src/index.js)
- 連結解析與座標換算：[`worker/src/parse.js`](worker/src/parse.js)
- 選點頁面：[`worker/src/page.js`](worker/src/page.js)、[`worker/src/gcj-browser.js`](worker/src/gcj-browser.js)
- 部署後把快捷指令裡的 `wloc-spoofer.wloc.workers.dev` 換成你自己的 worker 功能變數名稱即可。

解析邏輯帶一套不聯網的回歸測試，改動後跑一下：

```bash
cd worker && npm install && npm test
```

**坐標系說明：** 頁面內部一律以 WGS84 為准。底圖切到「高德」時，瓦片畫的是 GCJ-02
地物，與 Leaflet 的 WGS84 圖元映射差著一個偏移量（深圳一帶約 600 米），頁面會在
選點/落點時自動雙向換算，所以在任意底圖上點選得到的都是同一個 WGS84 座標。

各家地圖的坐標系不同，換算按「來源 × 地區」分派：

| 來源 | 中國大陸 | 港澳臺 |
|------|----------|--------|
| 蘋果地圖 / Google | GCJ-02，需換算 | **WGS84，不換算** |
| 高德 / 百度 | GCJ-02 / BD-09，需換算 | 同左，仍需換算 |

**港澳臺建議優先用蘋果或高德的連結。** 百度在港澳臺的分享短鏈，座標要靠網頁腳本
帶反爬權杖去查，服務端取不到；變通辦法是在流覽器打開該連結，等位址欄變成
`map.baidu.com/poi/名稱/@數位,數位,19z` 之後複製整條地址再粘貼——但百度的針腳位置
與蘋果/高德常有幾十到兩百米的出入（大陸約 5 米，港澳臺可達 240 米），精確定位時
不建議用它。

---

<details>
<summary><b>使用方法</b></summary>

1. 訂閱模組並啟用 MITM
2. 打開線上選點頁面（公共 Worker，建議添加到主螢幕）
3. 地圖選位置 / 搜索地名 / 粘貼地圖連結
4. 點擊「儲存到設備」
5. 下次 Apple 定位觸發時自動生效

支援 Apple Maps / Google Maps / 高德 / 百度 / 座標文本 連結解析。

> **iOS 26/27 及更高版本注意：** Apple 從 iOS 26 開始大幅強化了 `locationd` 的定位緩存機制，系統會將之前獲取的真實定位結果緩存在記憶體中並長時間複用。這意味著安裝模組或切換目標座標後，即使腳本已成功修改了 WLOC 回應（日誌顯示"已修改"），系統仍可能繼續使用緩存中的舊座標，導致定位看起來沒有變化。
>
> **解決方法：重啟設備。** 重啟會清空 `locationd` 的記憶體緩存，系統重新發起 WLOC 請求時會拿到修改後的座標。飛行模式開關、關閉定位服務等方式在 iOS 26+ 上**無法**清除此緩存，必須重啟。iOS 15~18 通常不需要重啟即可生效。

**高版本系統推薦操作流程（成功率最高）：**

方法一：
1. 先在選點頁面選好需要修改的定位並儲存到設備
2. 開飛行模式 → 關閉定位服務 → 重啟設備
3. 關閉飛行模式（WiFi 也要關）→ 連接代理工具（確認 VPN 圖示出現）→ 打開定位服務
4. 打開地圖驗證

方法二：
1. 關閉定位服務
2. 在選點頁面選好位置並儲存到設備
3. 打開定位服務 → 彈出「允許訪問位置資訊」時選擇**「下次詢問或在我共用時」**
4. 打開地圖驗證

</details>

<details>
<summary><b>工作原理</b></summary>

```
選點頁面 → fetch gs-loc.apple.com/wloc-settings/save?lon=x&lat=y
         → 代理模組攔截 → wloc-settings.js 寫入 $persistentStore
         → 下次 WLOC 觸發 → wloc.js 讀取座標 → patch protobuf 回應
```

模組包含兩條規則：
- `wloc.js` — 攔截 `/clls/wloc` 回應，解析 protobuf 並替換座標
- `wloc-settings.js` — 攔截 `/wloc-settings/save` 請求，寫入持久化存儲

</details>

<details>
<summary><b>參數配置</b></summary>

| 參數 | 說明 | 預設值 |
|------|------|--------|
| longitude | 目標經度(線上選點優先) | null (透傳) |
| latitude | 目標緯度(線上選點優先) | null (透傳) |
| accuracy | 精度(米) | 25 |
| randomRadius | 擾動半徑(米)，每次定位在目標點周圍隨機偏移，0=關閉 | 0 |
| logLevel | 日誌級別 | info |

優先順序: 線上選點儲存 > 模組參數 > 預設值

> **擾動半徑說明：** 啟用後每次定位響應會在目標座標周圍指定米數內隨機偏移，避免每次定位結果完全相同。Surge/Loon/Stash/Shadowrocket 可在模組參數中設置；QX 使用者可通過選點頁面設置。默認 0（關閉），不影響現有用戶。

</details>

<details>
<summary><b>取消虛擬定位 / 恢復真實定位</b></summary>

**方法一：關閉或刪除模組**（推薦）

關閉模組後腳本不再攔截 WLOC 請求，系統自動恢復真實定位。iOS 26+ 需要重啟設備清除定位緩存。

**方法二：清除持久化資料（透傳模式）**

清除已保存的座標後，腳本進入**透傳模式**——不修改 WLOC 回應，直接放行原始資料，系統自動恢復真實 GPS 定位。

**透傳模式觸發條件：** 持久化資料為空（null）且模組參數為預設值（113.94114, 22.544577）時，腳本判定用戶未自訂座標，自動跳過修改。模組預設參數無需更改，僅清除持久化資料即可觸發透傳。

在代理工具中刪除持久化資料，欄位名為 `wloc_settings`：

- **Surge** — 腳本編輯器運行: `$persistentStore.write(null, "wloc_settings")`
- **Quantumult X** — 運行: `$prefs.removeValueForKey("wloc_settings")`
- **Loon** — 運行: `$persistentStore.write(null, "wloc_settings")`

清除後重啟設備即可恢復真實定位。無需關閉模組，腳本會自動檢測到無自訂座標並跳過修改。

> **注意：** 如果使用者在模組參數中手動修改了經緯度（非默認 113.94114, 22.544577），即使清除持久化資料，腳本仍會使用模組參數中的座標進行修改。只有保持預設參數不變時，清除持久化資料才會進入透傳模式。

</details>

<details>
<summary><b>收藏位置功能</b></summary>

線上選點頁面支援收藏多個位置，方便來回切換：

- **添加收藏**：選好位置後點擊「收藏位置」→ 輸入備註名稱（支援中文/英文/數位，最多 30 字）→ 保存
- **快速切換**：點擊收藏列表中的位置 → 地圖自動跳轉 → 點「儲存到設備」即可切換
- **當前生效標記**：與設備已保存座標一致的收藏會顯示「✓ 當前生效」
- **刪除管理**：單個刪除（×按鈕）或清空全部
- **當前生效座標**：頁面顯示裝置端持久化資料（wloc_settings），支援刷新查詢和清除

**資料存儲說明：**
- **收藏列表** → 保存在流覽器 `localStorage`（僅用於選點頁面的 UI 便捷操作）
- **生效座標** → 保存在代理工具持久化存儲 `$persistentStore`（腳本運行時實際讀取的資料）

兩者獨立存儲。收藏清單是流覽器端的輔助資料，清除流覽器緩存或換流覽器後需重新收藏，但不影響已儲存到設備的生效座標。

</details>

<details>
<summary><b>自部署 Worker（推薦）</b></summary>

公共選點頁面有請求上限，建議部署自己的實例：

- **Workers**: `https://wloc-spoofer.wloc.workers.dev/`
- **Pages**: `https://wloc-pages.pages.dev/`

**一鍵部署（Workers）：**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Yu9191/wloc/tree/main/worker)

> 一鍵部署僅支援 Workers 模式，點擊按鈕後按提示授權即可完成部署。

**手動部署（Workers）：**

```bash
# 1. 克隆倉庫
git clone https://github.com/Yu9191/wloc.git
cd wloc/worker

# 2. 安裝依賴
npm install

# 3. 登錄 Cloudflare（首次需要）
npx wrangler login

# 4. 部署
npm run deploy
```

部署成功後會得到你自己的 Worker 地址（如 `https://wloc-spoofer.<你的子功能變數名稱>.workers.dev`），用這個位址選點即可。

> 免費帳戶每天 10 萬次請求，個人使用完全夠用。

<details>
<summary>高級：Pages 部署</summary>

Pages 部署不支援一鍵按鈕，需要手動執行：

```bash
git clone https://github.com/Yu9191/wloc.git
cd wloc/worker
npm install
npm run pages:deploy
```

> 必須走 `npm run pages:deploy`（它帶 `-c wrangler.pages.jsonc`）。直接跑
> `wrangler pages deploy dist` 會丟掉配置裡的 compatibility 設定。

部署時會提示設置 production branch，輸入 `main` 即可。部署成功後得到 `https://<項目名>.pages.dev` 地址。

Pages 和 Workers 功能完全一致，按需選擇即可。

</details>

</details>

<details>
<summary><b>注意事項</b></summary>

- 需要 MITM 證書信任 `gs-loc.apple.com` 和 `gs-loc-cn.apple.com`
- 僅修改網路定位(WiFi/基站)，不影響 GPS 硬體定位
- iOS 在 GPS 信號強時可能忽略網路定位結果
- 適用於 WiFi 定位為主的室內場景效果最佳
- 選點頁面需在代理模式下使用（Safari 走代理才能攔截儲存請求）

</details>

---

## 致謝

- [proxypin-wloc-spoofer](https://github.com/FFF686868/proxypin-wloc-spoofer) - 原始 WLOC 定位修改思路 by FFF686868
- [NSNanoCat/Util](https://github.com/NSNanoCat/util) - 跨平臺腳本工具框架

### 貢獻者

- [@YmlyZA](https://github.com/YmlyZA) - 百度地圖支援、港澳臺邊界處理、GCJ 換算優化、回歸測試覆蓋 ([#83](https://github.com/Yu9191/wloc/pull/83))
- [@YeTianXingShi](https://github.com/YeTianXingShi) - randomRadius 隨機座標擾動功能原始實現 ([#70](https://github.com/Yu9191/wloc/pull/70))
- [@SajoLuo](https://github.com/SajoLuo) - Stash 回應格式修復 ([#66](https://github.com/Yu9191/wloc/pull/66))
- [@SkywardLab](https://github.com/SkywardLab) - 擴展 WLOC 備用功能變數名稱攔截 ([#90](https://github.com/Yu9191/wloc/pull/90))
- [@beiming0000](https://github.com/beiming0000) - 逗號小數格式座標丟失問題報告 ([#96](https://github.com/Yu9191/wloc/issues/96))

---

## 許可證

本項目採用 [AGPL-3.0](LICENSE) 許可證。未經授權，禁止將本專案代碼用於商業產品或上架應用商店。
