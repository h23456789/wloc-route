<p align="center">
  <img src="wloc.jpg" width="144" />
</p>

# Apple WLOC 定位修改

修改 Apple 網路定位服務 (WiFi/基站) 返回的座標，實現 iOS 網路定位虛擬定位。開啟線上選點頁面選位置即可生效，無需手動填經緯度。

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

### 預設擴充套件域名支援

預設模組已覆蓋目前已知的完整 WLOC 域名集合：

- `gsp-ssl.ls.apple.com`
- `bluedot.is.autonavi.com`
- `bluedot.is.autonavi.com.gds.alibabadns.com`


---

## 快捷指令（推薦，最方便）

直接用快捷指令切換 / 清除定位，無需開啟選點頁面：

- **wloc 設定地理位置**：https://www.icloud.com/shortcuts/a82717d8fdad4e6280866fcf911173f7
- **wloc 清理恢復位置**：https://www.icloud.com/shortcuts/f42632d406504f24a2cd163af4fe012f

**用法**

- **設定位置：** 在地圖 App 裡選好位置（長按地圖選點）→ 共享 → 選「wloc 設定地理位置」即可切換。
  - 蘋果地圖：選點 → 共享 → 「wloc 設定地理位置」
  - Google 地圖：選點 → 分享 → 「wloc 設定地理位置」
- **清理位置：** 點「wloc 清理恢復位置」即可恢復真實定位。

此自架版本的控制頁只使用官方 Google 地圖與 Apple 地圖，並支援兩者的分享連結。

> 前提：代理已開 + 模組已啟用 + 信任 `gs-loc.apple.com`。選點頁面（Worker / Pages）方案仍保留，見下方。

---

### 關於地圖連結解析（worker）

Apple Maps 與 Google Maps 的分享連結會交給 `/api/parse` 解析；短鏈需要由 Worker 跟隨跳轉後取得座標，再回傳給瀏覽器。

**隱私：** `/api/parse` 是純轉發解析——收到連結 → 跟跳轉 → 解析座標 → 返回 JSON，全程不寫任何儲存、不記日誌、不快取，處理完即丟（`wrangler.jsonc` 裡已顯式關閉 observability）。跟跳轉時只接受 http/https，單次請求 8 秒超時、只讀響應正文前 512 KB。

**不放心可自行部署：** worker 原始碼完全開源，可自己部署一份替換上面的地址：

- 路由：[`worker/src/index.js`](worker/src/index.js)
- 連結解析與座標換算：[`worker/src/parse.js`](worker/src/parse.js)
- 選點頁面：[`worker/src/page.js`](worker/src/page.js)、[`worker/src/gcj-browser.js`](worker/src/gcj-browser.js)
- 部署後把快捷指令裡的 `wloc-spoofer.wloc.workers.dev` 換成你自己的 worker 域名即可。

解析邏輯帶一套不聯網的迴歸測試，改動後跑一下：

```bash
cd worker && npm install && npm test
```

**官方地圖設定：** 控制頁不再使用 Leaflet、OpenStreetMap 或其他第三方圖磚。請在
Cloudflare Worker 的 **Settings → Variables and Secrets** 建立下列兩個 Secret：

| 名稱 | 用途 |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API；請限制為你的 Worker 網域，並只開啟 Maps JavaScript API 與 Geocoding API。 |
| `APPLE_MAPKIT_TOKEN` | Apple MapKit JS 的 JWT；設定時將你的 Worker 網域加入 Maps ID。 |

金鑰不會寫入 GitHub。瀏覽器必須取得官方 SDK 的驗證值，因此仍應在 Google／Apple 後台做好網域與 API 限制。

---

<details>
<summary><b>使用方法</b></summary>

1. 訂閱模組並啟用 MITM
2. 開啟線上選點頁面（公共 Worker，建議新增到主螢幕）
3. 地圖選位置 / 搜尋地名 / 貼上地圖連結
4. 點選「儲存到裝置」
5. 下次 Apple 定位觸發時自動生效

支援 Apple Maps / Google Maps / 座標文字連結解析。

> **iOS 26/27 及更高版本注意：** Apple 從 iOS 26 開始大幅強化了 `locationd` 的定位快取機制，系統會將之前獲取的真實定位結果快取在記憶體中並長時間複用。這意味著安裝模組或切換目標座標後，即使指令碼已成功修改了 WLOC 響應（日誌顯示"已修改"），系統仍可能繼續使用快取中的舊座標，導致定位看起來沒有變化。
>
> **解決方法：重啟裝置。** 重啟會清空 `locationd` 的記憶體快取，系統重新發起 WLOC 請求時會拿到修改後的座標。飛航模式開關、關閉定位服務等方式在 iOS 26+ 上**無法**清除此快取，必須重啟。iOS 15~18 通常不需要重啟即可生效。

**高版本系統推薦操作流程（成功率最高）：**

方法一：
1. 先在選點頁面選好需要修改的定位並儲存到裝置
2. 開飛航模式 → 關閉定位服務 → 重啟裝置
3. 關閉飛航模式（WiFi 也要關）→ 連線代理工具（確認 VPN 圖示出現）→ 開啟定位服務
4. 開啟地圖驗證

方法二：
1. 關閉定位服務
2. 在選點頁面選好位置並儲存到裝置
3. 開啟定位服務 → 彈出「允許訪問位置資訊」時選擇**「下次詢問或在我共享時」**
4. 開啟地圖驗證

</details>

<details>
<summary><b>工作原理</b></summary>

```
選點頁面 → fetch gs-loc.apple.com/wloc-settings/save?lon=x&lat=y
         → 代理模組攔截 → wloc-settings.js 寫入 $persistentStore
         → 下次 WLOC 觸發 → wloc.js 讀取座標 → patch protobuf 響應
```

模組包含兩條規則：
- `wloc.js` — 攔截 `/clls/wloc` 響應，解析 protobuf 並替換座標
- `wloc-settings.js` — 攔截 `/wloc-settings/save` 請求，寫入持久化儲存

</details>

<details>
<summary><b>引數配置</b></summary>

| 引數 | 說明 | 預設值 |
|------|------|--------|
| longitude | 目標經度(線上選點優先) | null (透傳) |
| latitude | 目標緯度(線上選點優先) | null (透傳) |
| accuracy | 精度(米) | 25 |
| randomRadius | 擾動半徑(米)，每次定位在目標點周圍隨機偏移，0=關閉 | 0 |
| logLevel | 日誌級別 | info |

優先順序: 線上選點儲存 > 模組引數 > 預設值

> **擾動半徑說明：** 啟用後每次定位響應會在目標座標周圍指定米數內隨機偏移，避免每次定位結果完全相同。Surge/Loon/Stash/Shadowrocket 可在模組引數中設定；QX 使用者可透過選點頁面設定。預設 0（關閉），不影響現有使用者。

</details>

<details>
<summary><b>取消虛擬定位 / 恢復真實定位</b></summary>

**方法一：關閉或刪除模組**（推薦）

關閉模組後指令碼不再攔截 WLOC 請求，系統自動恢復真實定位。iOS 26+ 需要重啟裝置清除定位快取。

**方法二：清除持久化資料（透傳模式）**

清除已儲存的座標後，指令碼進入**透傳模式**——不修改 WLOC 響應，直接放行原始資料，系統自動恢復真實 GPS 定位。

**透傳模式觸發條件：** 持久化資料為空（null）且模組引數為預設值（113.94114, 22.544577）時，指令碼判定使用者未自定義座標，自動跳過修改。模組預設引數無需更改，僅清除持久化資料即可觸發透傳。

在代理工具中刪除持久化資料，欄位名為 `wloc_settings`：

- **Surge** — 指令碼編輯器執行: `$persistentStore.write(null, "wloc_settings")`
- **Quantumult X** — 執行: `$prefs.removeValueForKey("wloc_settings")`
- **Loon** — 執行: `$persistentStore.write(null, "wloc_settings")`

清除後重啟裝置即可恢復真實定位。無需關閉模組，指令碼會自動檢測到無自定義座標並跳過修改。

> **注意：** 如果使用者在模組引數中手動修改了經緯度（非預設 113.94114, 22.544577），即使清除持久化資料，指令碼仍會使用模組引數中的座標進行修改。只有保持預設引數不變時，清除持久化資料才會進入透傳模式。

</details>

<details>
<summary><b>收藏位置功能</b></summary>

線上選點頁面支援收藏多個位置，方便來回切換：

- **新增收藏**：選好位置後點選「收藏位置」→ 輸入備註名稱（支援中文/英文/數字，最多 30 字）→ 儲存
- **快速切換**：點選收藏列表中的位置 → 地圖自動跳轉 → 點「儲存到裝置」即可切換
- **當前生效標記**：與裝置已儲存座標一致的收藏會顯示「✓ 當前生效」
- **刪除管理**：單個刪除（×按鈕）或清空全部
- **當前生效座標**：頁面顯示裝置端持久化資料（wloc_settings），支援重新整理查詢和清除

**資料儲存說明：**
- **收藏列表** → 儲存在瀏覽器 `localStorage`（僅用於選點頁面的 UI 便捷操作）
- **生效座標** → 儲存在代理工具持久化儲存 `$persistentStore`（指令碼執行時實際讀取的資料）

兩者獨立儲存。收藏列表是瀏覽器端的輔助資料，清除瀏覽器快取或換瀏覽器後需重新收藏，但不影響已儲存到裝置的生效座標。

</details>

<details>
<summary><b>自部署 Worker（推薦）</b></summary>

公共選點頁面有請求上限，建議部署自己的例項：

- **Workers**: `https://wloc-spoofer.wloc.workers.dev/`
- **Pages**: `https://wloc-pages.pages.dev/`

**一鍵部署（Workers）：**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Yu9191/wloc/tree/main/worker)

> 一鍵部署僅支援 Workers 模式，點選按鈕後按提示授權即可完成部署。

**手動部署（Workers）：**

```bash
# 1. 克隆倉庫
git clone https://github.com/Yu9191/wloc.git
cd wloc/worker

# 2. 安裝依賴
npm install

# 3. 登入 Cloudflare（首次需要）
npx wrangler login

# 4. 部署
npm run deploy
```

部署成功後會得到你自己的 Worker 地址（如 `https://wloc-spoofer.<你的子域名>.workers.dev`），用這個地址選點即可。

> 免費賬戶每天 10 萬次請求，個人使用完全夠用。

<details>
<summary>高階：Pages 部署</summary>

Pages 部署不支援一鍵按鈕，需要手動執行：

```bash
git clone https://github.com/Yu9191/wloc.git
cd wloc/worker
npm install
npm run pages:deploy
```

> 必須走 `npm run pages:deploy`（它帶 `-c wrangler.pages.jsonc`）。直接跑
> `wrangler pages deploy dist` 會丟掉配置裡的 compatibility 設定。

部署時會提示設定 production branch，輸入 `main` 即可。部署成功後得到 `https://<專案名>.pages.dev` 地址。

Pages 和 Workers 功能完全一致，按需選擇即可。

</details>

</details>

<details>
<summary><b>注意事項</b></summary>

- 需要 MITM 證書信任 `gs-loc.apple.com` 和 `gs-loc-cn.apple.com`
- 僅修改網路定位(WiFi/基站)，不影響 GPS 硬體定位
- iOS 在 GPS 訊號強時可能忽略網路定位結果
- 適用於 WiFi 定位為主的室內場景效果最佳
- 選點頁面需在代理模式下使用（Safari 走代理才能攔截儲存請求）

</details>

---

## 致謝

- [proxypin-wloc-spoofer](https://github.com/FFF686868/proxypin-wloc-spoofer) - 原始 WLOC 定位修改思路 by FFF686868
- [NSNanoCat/Util](https://github.com/NSNanoCat/util) - 跨平臺指令碼工具框架

### 貢獻者

- [@YmlyZA](https://github.com/YmlyZA) - 百度地圖支援、港澳臺邊界處理、GCJ 換算最佳化、迴歸測試覆蓋 ([#83](https://github.com/Yu9191/wloc/pull/83))
- [@YeTianXingShi](https://github.com/YeTianXingShi) - randomRadius 隨機座標擾動功能原始實現 ([#70](https://github.com/Yu9191/wloc/pull/70))
- [@SajoLuo](https://github.com/SajoLuo) - Stash 響應格式修復 ([#66](https://github.com/Yu9191/wloc/pull/66))
- [@SkywardLab](https://github.com/SkywardLab) - 擴充套件 WLOC 備用域名攔截 ([#90](https://github.com/Yu9191/wloc/pull/90))
- [@beiming0000](https://github.com/beiming0000) - 逗號小數格式座標丟失問題報告 ([#96](https://github.com/Yu9191/wloc/issues/96))

---

## 許可證

本專案採用 [AGPL-3.0](LICENSE) 許可證。未經授權，禁止將本專案程式碼用於商業產品或上架應用商店。
