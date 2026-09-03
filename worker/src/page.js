export function getPageHtml({ googleMapsApiKey = "" } = {}) {
  // 官方地圖 SDK 必須在瀏覽器取得憑證；這只避免把設定值提交至 GitHub。
  const mapConfig = JSON.stringify({ googleMapsApiKey }).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WLOC 虛擬定位</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="WLOC">
<!-- 內聯圖示: 沒有它瀏覽器每次載入都會去要 /favicon.ico 並拿到 404 -->
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='26'%3E%F0%9F%93%8D%3C/text%3E%3C/svg%3E">
<style>
:root { --blue:#007aff; --green:#34c759; --red:#ff3b30; --gray:#8e8e93; --bg:#f2f2f7; --orange:#ff9500; }
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:100%; height:100%; overflow:hidden; }
body { font-family:-apple-system,system-ui,"SF Pro","Helvetica Neue",sans-serif; background:var(--bg); }
#map { height:100dvh; width:100%; min-height:420px; }
.map-shell { position:relative; width:100%; height:100dvh; background:#dce7ee; }
.map-topbar { position:absolute; z-index:1200; top:max(10px,env(safe-area-inset-top)); left:10px; right:10px; display:flex; gap:7px; align-items:center; pointer-events:none; }
.map-topbar > * { pointer-events:auto; }
.map-status-pill { flex:1; min-width:0; padding:13px; background:rgba(255,255,255,.96); border-radius:12px; box-shadow:0 3px 14px rgba(0,0,0,.2); color:#333; font:600 13px/1.2 "SF Mono",monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.map-config-error { position:absolute; inset:50% auto auto 50%; transform:translate(-50%,-50%); width:min(340px,calc(100% - 100px)); padding:18px; border-radius:16px; background:rgba(255,255,255,.96); color:#333; box-shadow:0 8px 30px rgba(0,0,0,.2); text-align:center; font-size:14px; line-height:1.55; }
.map-config-error b { display:block; margin-bottom:5px; font-size:16px; }
.location-legend { position:absolute; z-index:1100; top:72px; left:50%; transform:translateX(-50%); display:flex; gap:10px; padding:7px 10px; border-radius:99px; background:rgba(255,255,255,.94); box-shadow:0 2px 9px rgba(0,0,0,.17); color:#4b4b50; font-size:10px; white-space:nowrap; pointer-events:none; }
.location-legend span { display:flex; align-items:center; gap:4px; }
.legend-color { width:8px; height:8px; border-radius:50%; }
.float-tools { position:absolute; z-index:1150; display:flex; flex-direction:column; gap:7px; }
.float-tools.left { top:72px; left:10px; }
.float-tools.right { top:72px; right:10px; }
.float-btn { width:48px; min-height:48px; border:0; border-radius:11px; background:rgba(255,255,255,.96); color:#31343a; box-shadow:0 2px 10px rgba(0,0,0,.2); font-size:20px; font-weight:700; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; touch-action:manipulation; }
.float-btn small { font-size:10px; line-height:1.1; margin-top:2px; }
.float-btn.active { background:var(--blue); color:#fff; }
.float-btn.danger.active { background:var(--green); }
.float-btn.live-active { background:var(--green); color:#fff; }
.joystick-panel { position:absolute; z-index:1200; left:50%; bottom:18px; transform:translateX(-50%); display:none; align-items:center; gap:12px; }
.joystick-panel.show { display:flex; }
.joystick { position:relative; width:164px; height:164px; border-radius:50%; background:rgba(255,255,255,.9); box-shadow:0 4px 18px rgba(0,0,0,.25); touch-action:none; }
.joy-btn { position:absolute; width:52px; height:52px; border:0; border-radius:50%; background:#5d91ee; color:#fff; font-size:24px; font-weight:800; box-shadow:0 2px 5px rgba(0,0,0,.2); user-select:none; -webkit-user-select:none; touch-action:none; }
.joy-btn:active { background:#2568d7; transform:scale(.94); }
.joy-n { top:7px; left:56px; }.joy-e { right:7px; top:56px; }.joy-s { bottom:7px; left:56px; }.joy-w { left:7px; top:56px; }
.joy-center { position:absolute; left:58px; top:58px; width:48px; height:48px; border-radius:50%; background:#fff; border:3px solid #5d91ee; display:flex; align-items:center; justify-content:center; color:#5d91ee; font-size:18px; }
.joy-status { background:rgba(25,25,28,.82); color:#fff; border-radius:12px; padding:9px 11px; font-size:12px; line-height:1.4; min-width:112px; text-align:center; }
.joy-status input { width:62px; margin:5px 2px; padding:5px; border:0; border-radius:6px; font-size:14px; text-align:center; }
.panel-backdrop { position:fixed; inset:0; z-index:5000; background:rgba(15,23,42,.38); opacity:0; pointer-events:none; transition:opacity .2s; }
.panel-backdrop.show { opacity:1; pointer-events:auto; }
.panel { position:fixed; z-index:5100; left:50%; bottom:max(10px,env(safe-area-inset-bottom)); width:min(620px,calc(100% - 18px)); max-height:82dvh; padding:54px 14px 14px; overflow:auto; border-radius:22px; background:rgba(242,242,247,.97); box-shadow:0 14px 50px rgba(0,0,0,.32); transform:translate(-50%,calc(100% + 30px)); opacity:0; pointer-events:none; transition:transform .24s ease,opacity .2s; }
.panel.show { transform:translate(-50%,0); opacity:1; pointer-events:auto; }
.panel-head { position:sticky; z-index:4; top:-54px; height:48px; margin:-54px -14px 10px; padding:7px 10px 7px 16px; display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,.97); border-bottom:1px solid rgba(0,0,0,.08); }
.panel-head strong { font-size:16px; }
.panel-close { width:34px; height:34px; border:0; border-radius:50%; background:#e5e5ea; color:#333; font-size:20px; }
.card { background:#fff; border-radius:12px; padding:16px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
.card h3 { font-size:15px; font-weight:600; margin-bottom:10px; }
.coords { font-family:"SF Mono",monospace; font-size:14px; color:#333; padding:8px 12px; background:var(--bg); border-radius:8px; word-break:break-all; }
.row { display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
.btn { flex:1; min-width:100px; padding:12px 16px; border:none; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; transition:all .15s; }
.btn-primary { background:var(--blue); color:#fff; }
.btn-primary:active { background:#005bb5; transform:scale(.97); }
.btn-secondary { background:#e5e5ea; color:#333; }
.btn-secondary:active { background:#d1d1d6; transform:scale(.97); }
.btn-danger { background:var(--red); color:#fff; }
.btn-danger:active { background:#d63027; transform:scale(.97); }
.btn.success { background:var(--green); color:#fff; }
.btn-sm { flex:none; min-width:auto; padding:6px 12px; font-size:12px; border-radius:8px; }
.input-row { display:flex; gap:8px; margin-top:10px; }
.input-row input { flex:1; padding:10px 12px; border:1px solid #d1d1d6; border-radius:8px; font-size:14px; outline:none; min-width:0; }
.input-row input:focus { border-color:var(--blue); }
.status { font-size:12px; color:var(--gray); margin-top:8px; text-align:center; }
.error-banner { background:var(--red); color:#fff; padding:14px 16px; border-radius:12px; margin-bottom:12px; font-size:14px; line-height:1.5; display:none; }
.error-banner b { display:block; margin-bottom:4px; }
.toast { position:fixed; top:60px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,.8); color:#fff; padding:10px 20px; border-radius:20px; font-size:14px; opacity:0; transition:opacity .3s; pointer-events:none; z-index:9999; max-width:90vw; text-align:center; }
.toast.show { opacity:1; }
.active-loc { background:var(--bg); border-radius:8px; padding:10px 12px; font-size:13px; color:#333; }
.active-loc .label { font-size:11px; color:var(--gray); margin-bottom:4px; }
.active-loc .value { font-family:"SF Mono",monospace; font-size:13px; }
.fav-list { max-height:240px; overflow-y:auto; }
.fav-item { display:flex; align-items:center; gap:8px; padding:10px 12px; background:var(--bg); border-radius:8px; margin-bottom:6px; cursor:pointer; transition:background .15s; }
.fav-item:active { background:#e0e0e5; }
.fav-item .fav-info { flex:1; min-width:0; }
.fav-item .fav-name { font-size:14px; font-weight:500; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fav-item .fav-coords { font-size:11px; color:var(--gray); font-family:"SF Mono",monospace; margin-top:2px; }
.fav-item .fav-active { font-size:10px; color:var(--green); font-weight:600; }
.fav-item .fav-del { flex:none; width:28px; height:28px; border:none; border-radius:50%; background:transparent; color:var(--red); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
.fav-item .fav-del:hover { background:rgba(255,59,48,.1); }
.fav-empty { text-align:center; color:var(--gray); font-size:13px; padding:16px 0; }
.fav-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.fav-header h3 { margin-bottom:0; }
.modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,.4); z-index:10000; display:none; align-items:center; justify-content:center; padding:20px; }
.modal-overlay.show { display:flex; }
.modal { background:#fff; border-radius:16px; padding:20px; width:100%; max-width:340px; }
.modal h3 { font-size:17px; font-weight:600; margin-bottom:16px; text-align:center; }
.modal input { width:100%; padding:12px; border:1px solid #d1d1d6; border-radius:10px; font-size:15px; outline:none; margin-bottom:12px; }
.modal input:focus { border-color:var(--blue); }
.modal .modal-btns { display:flex; gap:8px; }
.modal .modal-btns .btn { padding:12px; }
.move-marker-key { display:flex; justify-content:center; gap:18px; margin:-4px 0 14px; color:var(--gray); font-size:12px; }
.move-marker-key span { display:flex; align-items:center; gap:6px; }
.marker-dot { width:12px; height:12px; border-radius:50%; border:3px solid currentColor; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); }
.marker-dot.blue { color:var(--blue); }
.marker-dot.red { color:var(--red); }
.move-summary { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
.move-summary > div { padding:12px 8px; border-radius:10px; background:var(--bg); text-align:center; }
.move-summary b { display:block; color:#222; font-size:18px; margin-bottom:3px; }
.move-summary span { color:var(--gray); font-size:11px; }
.move-coords { padding:9px; margin-bottom:10px; border-radius:9px; background:#fff5f4; color:#9f241e; font:12px/1.45 "SF Mono",monospace; text-align:center; }
.move-note { margin-bottom:14px; color:var(--gray); font-size:12px; line-height:1.45; text-align:center; }
.mode-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; padding:4px; background:var(--bg); border-radius:10px; margin-bottom:12px; }
.mode-tab { border:0; background:transparent; border-radius:8px; padding:9px 8px; color:#666; font-size:14px; font-weight:600; cursor:pointer; }
.mode-tab.active { background:#fff; color:var(--blue); box-shadow:0 1px 4px rgba(0,0,0,.12); }
.route-panel { display:none; }
.route-panel.show { display:block; }
.route-tools { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
.route-tools .btn { width:100%; }
.route-meta { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:10px; }
.route-stat { background:var(--bg); border-radius:9px; padding:9px; text-align:center; }
.route-stat b { display:block; color:#222; font-size:14px; }
.route-stat span { color:var(--gray); font-size:11px; }
.route-options { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
.route-options label { display:flex; align-items:center; gap:7px; background:var(--bg); border-radius:9px; padding:10px; font-size:13px; }
.route-options input[type=number] { width:78px; min-width:0; border:1px solid #d1d1d6; border-radius:7px; padding:7px; font-size:14px; }
.route-progress { height:7px; background:#e5e5ea; border-radius:99px; overflow:hidden; margin-top:10px; }
.route-progress > div { height:100%; width:0; background:linear-gradient(90deg,var(--blue),#5ac8fa); transition:width .5s linear; }
.route-hint { color:var(--gray); font-size:12px; line-height:1.45; margin-top:8px; }
.route-actions { display:grid; grid-template-columns:1.3fr 1fr 1fr; gap:8px; margin-top:10px; }
.route-actions .btn { min-width:0; padding-left:8px; padding-right:8px; }
.file-input { display:none; }
.route-node { background:var(--blue); border:2px solid #fff; border-radius:50%; width:14px; height:14px; box-shadow:0 1px 5px rgba(0,0,0,.35); }
.master-switch { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px; margin-bottom:12px; border-radius:10px; background:var(--bg); }
.master-switch strong { display:block; font-size:14px; color:#222; }
.master-switch small { display:block; margin-top:2px; color:var(--gray); font-size:11px; }
.switch { position:relative; width:50px; height:30px; flex:none; }
.switch input { opacity:0; width:0; height:0; }
.switch span { position:absolute; inset:0; border-radius:99px; background:#c7c7cc; cursor:pointer; transition:.2s; }
.switch span:before { content:''; position:absolute; width:26px; height:26px; left:2px; top:2px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:.2s; }
.switch input:checked + span { background:var(--green); }
.switch input:checked + span:before { transform:translateX(20px); }
.saved-route-list { margin-top:12px; max-height:220px; overflow:auto; }
.saved-route-item { display:flex; align-items:center; gap:8px; padding:10px 12px; margin-top:6px; background:var(--bg); border-radius:9px; }
.saved-route-main { flex:1; min-width:0; cursor:pointer; }
.saved-route-name { font-size:14px; font-weight:600; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.saved-route-meta { font-size:11px; color:var(--gray); margin-top:2px; }
@media(max-width:480px) { #map,.map-shell { height:100dvh; min-height:480px; } .panel { width:calc(100% - 14px); } .float-btn { width:44px; min-height:44px; } .joystick { width:148px; height:148px; } .joy-btn { width:48px; height:48px; } .joy-n { top:5px; left:50px; }.joy-e { right:5px; top:50px; }.joy-s { bottom:5px; left:50px; }.joy-w { left:5px; top:50px; }.joy-center { left:52px; top:52px; width:44px; height:44px; } }
</style>
</head>
<body>
<div class="map-shell">
<div id="map"></div>
<div class="map-topbar">
  <button class="float-btn" onclick="openToolPanel('controlPanel','WLOC 設定')" aria-label="開啟控制面板">☰</button>
  <div class="map-status-pill" id="floatingCoords">尚未選擇位置</div>
</div>
<div class="location-legend" aria-label="地圖位置圖例">
  <span><i class="legend-color" style="background:#007aff"></i>WLOC</span>
  <span><i class="legend-color" style="background:#34c759"></i>即時定位</span>
  <span><i class="legend-color" style="background:#ff3b30"></i>目標</span>
</div>
<div class="float-tools left" aria-label="定位工具">
  <button class="float-btn active" id="floatPointBtn" onclick="setMode('point');openToolPanel('targetPanel','單點定位')" aria-label="單點定位">⌖<small>單點</small></button>
  <button class="float-btn" id="floatRouteBtn" onclick="setMode('route');openToolPanel('controlPanel','路線設定')" aria-label="手繪路線">⌁<small>路線</small></button>
  <button class="float-btn" id="floatJoystickBtn" onclick="setMode('joystick')" aria-label="搖桿模式">✥<small>搖桿</small></button>
  <button class="float-btn" onclick="document.getElementById('gpxInput').click()" aria-label="匯入 GPX">GPX</button>
  <button class="float-btn" onclick="openInputPanel()" aria-label="輸入座標或地圖連結">↗<small>輸入</small></button>
  <button class="float-btn" onclick="openSavedPanel()" aria-label="已儲存項目">▣<small>儲存</small></button>
</div>
<div class="float-tools right" aria-label="地圖工具">
  <button class="float-btn" id="liveLocationBtn" onclick="locateMe()" aria-label="即時系統定位" aria-pressed="false">◎<small>定位</small></button>
  <button class="float-btn danger active" id="northLockBtn" onclick="toggleNorthLock()" aria-pressed="true" aria-label="固定向北">N<small>已鎖北</small></button>
</div>
<div class="joystick-panel" id="joystickPanel">
  <div class="joystick" aria-label="方向搖桿">
    <button class="joy-btn joy-n" data-bearing="0" aria-label="向北移動">↑</button>
    <button class="joy-btn joy-e" data-bearing="90" aria-label="向東移動">→</button>
    <button class="joy-btn joy-s" data-bearing="180" aria-label="向南移動">↓</button>
    <button class="joy-btn joy-w" data-bearing="270" aria-label="向西移動">←</button>
    <div class="joy-center">●</div>
  </div>
  <div class="joy-status"><b>移動速度</b><br><input id="joySpeedInput" type="number" min="0.5" max="300" step="0.5" value="4.5"> km/h<br><span id="joyState">按住方向移動</span></div>
</div>
</div>
<div class="panel-backdrop" id="panelBackdrop" onclick="closeToolPanel()"></div>
<div class="panel">
  <div class="panel-head"><strong id="panelTitle">功能設定</strong><button class="panel-close" onclick="closeToolPanel()" aria-label="關閉">×</button></div>
  <div class="error-banner" id="errorBanner">
    <b>模組未生效</b>
    請檢查以下配置：<br>
    1. 已安裝並啟用 WLOC 定位模組<br>
    2. MITM 已開啟且信任證書<br>
    3. MITM 主機名包含 gs-loc.apple.com<br>
    4. 當前網路已走代理
  </div>
  <div class="card" id="controlPanel">
    <div class="master-switch">
      <div><strong>WLOC 虛擬定位</strong><small id="wlocSwitchText">查詢目前狀態...</small></div>
      <label class="switch" aria-label="WLOC 虛擬定位開關"><input id="wlocSwitch" type="checkbox" onchange="toggleWloc(this.checked)" /><span></span></label>
    </div>
    <div class="mode-tabs" role="tablist" aria-label="定位模式">
      <button class="mode-tab active" id="pointTab" onclick="setMode('point')">單點定位</button>
      <button class="mode-tab" id="routeTab" onclick="setMode('route')">路線移動</button>
      <button class="mode-tab" id="joystickTab" onclick="setMode('joystick')">搖桿移動</button>
    </div>
    <div id="routePanel" class="route-panel">
      <h3>建立移動路線</h3>
      <div class="route-tools">
        <button class="btn btn-secondary" onclick="document.getElementById('gpxInput').click()">匯入 GPX</button>
        <button class="btn btn-secondary" onclick="undoRoutePoint()">復原上一點</button>
        <button class="btn btn-secondary" onclick="reverseRoute()">反轉路線</button>
        <button class="btn btn-secondary" onclick="openRouteSaveModal()">儲存路線</button>
        <button class="btn btn-danger" onclick="clearRoute()">清除路線</button>
      </div>
      <input class="file-input" id="gpxInput" type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onchange="importGpx(event)" />
      <div class="route-meta">
        <div class="route-stat"><b id="routePoints">0</b><span>路線點</span></div>
        <div class="route-stat"><b id="routeDistance">0 m</b><span>總距離</span></div>
        <div class="route-stat"><b id="routeDuration">--</b><span>預估時間</span></div>
      </div>
      <div class="route-options">
        <label>速度 <input id="speedInput" type="number" min="0.5" max="300" step="0.5" value="4.5" /> km/h</label>
        <label><input id="loopInput" type="checkbox" /> 完成後迴圈</label>
      </div>
      <div class="route-progress"><div id="routeProgressBar"></div></div>
      <div class="route-hint" id="routeHint">在地圖依序點選至少兩個位置，或匯入 GPX。GPX 只在本機解析；開始後路線會寫入代理工具。</div>
      <div class="route-actions">
        <button class="btn btn-primary" id="routeStartBtn" onclick="startRoute()">▶ 開始</button>
        <button class="btn btn-secondary" id="routePauseBtn" onclick="toggleRoutePause()" disabled>暫停</button>
        <button class="btn btn-danger" onclick="stopRoute()">停止</button>
      </div>
      <div class="fav-header" style="margin-top:16px"><h3>已儲存的 GPX／手繪路線</h3></div>
      <div id="savedRouteList" class="saved-route-list"></div>
    </div>
  </div>
  <div class="card" id="targetPanel">
    <h3>選擇目標位置</h3>
    <div class="coords" id="coords">點選地圖或使用下方工具選擇位置</div>
    <div class="input-row" style="margin-top:10px">
      <label style="font-size:13px;color:var(--gray);display:flex;align-items:center;gap:6px;white-space:nowrap">擾動半徑(米)
        <input id="radiusInput" type="number" min="0" max="5000" step="1" value="0" style="width:80px;flex:none" />
      </label>
      <span style="font-size:11px;color:var(--gray);line-height:1.3">每次定位在目標點周圍隨機偏移，0=關閉</span>
    </div>
    <div class="row">
      <button class="btn btn-primary" id="saveBtn" onclick="openMoveConfirm()">確認移動</button>
      <button class="btn btn-secondary" onclick="addFav()">收藏位置</button>
      <button class="btn btn-secondary" onclick="locateMe()">即時定位</button>
    </div>
  </div>
  <div class="card" id="favoritesPanel">
    <div class="fav-header">
      <h3>已儲存的單點座標</h3>
      <button class="btn btn-sm btn-secondary" onclick="clearAllFav()" id="clearAllBtn" style="display:none">清空全部</button>
    </div>
    <div id="favList" class="fav-list"></div>
  </div>
  <div class="card" id="activePanel">
    <h3>當前生效座標</h3>
    <div class="active-loc" id="activeLoc">
      <div class="label">裝置持久化資料 (wloc_settings)</div>
      <div class="value" id="activeValue">查詢中...</div>
    </div>
    <div class="row">
      <button class="btn btn-sm btn-secondary" onclick="queryActive()">重新整理</button>
      <button class="btn btn-sm btn-danger" onclick="clearActive()">清除資料</button>
    </div>
  </div>
  <div class="card" id="inputPanel">
    <h3>貼上地圖連結</h3>
    <div class="input-row">
      <input id="urlInput" placeholder="Google 地圖連結或經緯度" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="parseUrl()">解析</button>
    </div>
    <div style="font-size:11px;color:var(--gray);margin-top:6px">支援 Google Maps 與座標文字</div>
  </div>
  <div class="card" id="searchPanel">
    <h3>搜尋地點</h3>
    <div class="input-row">
      <input id="searchInput" placeholder="輸入地名（如: 上海外灘）" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="searchPlace()">搜尋</button>
    </div>
  </div>
  <div class="status" id="status">選好位置後點選「儲存到裝置」寫入代理工具</div>
</div>
<div class="toast" id="toast"></div>
<div class="modal-overlay" id="favModal">
  <div class="modal">
    <h3>收藏此位置</h3>
    <input id="favNameInput" placeholder="輸入備註名稱（如: 公司、家）" maxlength="30" />
    <div style="font-size:12px;color:var(--gray);margin-bottom:12px;text-align:center" id="favModalCoords"></div>
    <div class="modal-btns">
      <button class="btn btn-secondary" onclick="closeFavModal()">取消</button>
      <button class="btn btn-primary" onclick="confirmFav()">儲存</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="routeSaveModal">
  <div class="modal">
    <h3>儲存此路線</h3>
    <input id="routeNameInput" placeholder="輸入路線名稱" maxlength="40" />
    <div style="font-size:12px;color:var(--gray);margin-bottom:12px;text-align:center" id="routeModalInfo"></div>
    <div class="modal-btns">
      <button class="btn btn-secondary" onclick="closeRouteSaveModal()">取消</button>
      <button class="btn btn-primary" onclick="confirmSaveRoute()">儲存</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="moveConfirmModal">
  <div class="modal">
    <h3>確認移動到此位置？</h3>
    <div class="move-marker-key"><span><i class="marker-dot blue"></i>WLOC 位置</span><span><i class="marker-dot red"></i>移動位置</span></div>
    <div class="move-summary">
      <div><b id="moveDistance">--</b><span>直線距離</span></div>
      <div><b id="moveCooldown">--</b><span>冷卻時間（10 km/h）</span></div>
    </div>
    <div class="move-coords" id="moveConfirmCoords"></div>
    <div class="move-note" id="moveConfirmNote">只有按下「確定移動」才會將新座標寫入小火箭。</div>
    <div class="modal-btns">
      <button class="btn btn-secondary" onclick="closeMoveConfirm()">取消</button>
      <button class="btn btn-danger" id="confirmMoveBtn" onclick="confirmMove()">確定移動</button>
    </div>
  </div>
</div>
<script>
const MAP_CONFIG = ${mapConfig};
const SAVE_API = 'https://gs-loc.apple.com/wloc-settings/save';
const FAV_KEY = 'wloc_favorites';
const ROUTE_KEY = 'wloc_saved_routes';
// lat/lon 恆為 WGS84 —— 這是寫進裝置、也是 WLOC 唯一認的座標系。
let lat = 22.544577, lon = 113.94114;
let selected = false;
let activeLon = null, activeLat = null;
let mode = 'point';
let routePoints = [];
let activeRoute = null;
let routeTimer = null;
let routeSuggestedName = '';
let routeSource = 'manual';
let wlocEnabled = false;
let northLocked = true;
let joystickTimer = null;
let joystickSaving = false;
let joystickLastSave = 0;
let liveWatchId = null, liveLat = null, liveLon = null, liveAccuracy = null;
let googleMap, googleCandidateMarker, googleActiveMarker, googleLiveMarker, googleLiveAccuracyCircle, googleRouteLine, googleRouteMarkers = [];

function mapError(message) {
  document.getElementById('map').innerHTML = '<div class="map-config-error"><b>地圖尚未啟用<\/b>' + message + '<br><br>請到 Cloudflare Worker 的「Settings → Variables and Secrets」設定後重新部署。<\/div>';
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
  });
}
function handleMapPick(la, lo) {
  if (mode === 'route') { routePoints.push([la, lo]); routeSource = 'manual'; renderRoute(); return; }
  setPos(la, lo);
  if (mode === 'point') openMoveConfirm();
}
async function initGoogleMap() {
  if (!MAP_CONFIG.googleMapsApiKey) return mapError('尚未設定 Google 地圖金鑰。請在 Cloudflare 新增 GOOGLE_MAPS_API_KEY。');
  if (!window.google || !google.maps) await loadScript('https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(MAP_CONFIG.googleMapsApiKey) + '&v=weekly');
  googleMap = new google.maps.Map(document.getElementById('map'), {center:{lat, lng:lon}, zoom:13, mapTypeId:'roadmap', gestureHandling:'greedy', heading:0, tilt:0, headingInteractionEnabled:!northLocked});
  googleMap.addListener('click', e => handleMapPick(e.latLng.lat(), e.latLng.lng()));
  googleMap.addListener('heading_changed', () => { if (northLocked && googleMap.getHeading()) googleMap.setHeading(0); });
  renderMapObjects();
}
async function initMap() {
  googleMap = undefined; googleCandidateMarker = undefined; googleActiveMarker = undefined; googleLiveMarker = undefined; googleLiveAccuracyCircle = undefined; googleRouteLine = undefined; googleRouteMarkers = [];
  document.getElementById('map').innerHTML = '';
  try { await initGoogleMap(); }
  catch (e) { mapError('Google 地圖載入失敗，請檢查 API 金鑰、網域限制及 Maps JavaScript API 是否已啟用。'); }
}
function renderMapObjects() {
  if (googleMap) {
    if (googleCandidateMarker) googleCandidateMarker.setMap(null);
    if (googleActiveMarker) googleActiveMarker.setMap(null);
    if (googleLiveMarker) googleLiveMarker.setMap(null);
    if (googleLiveAccuracyCircle) googleLiveAccuracyCircle.setMap(null);
    googleRouteMarkers.forEach(m => m.setMap(null)); googleRouteMarkers = [];
    if (googleRouteLine) googleRouteLine.setMap(null);
    if (activeLat !== null && activeLon !== null) googleActiveMarker = new google.maps.Marker({
      position:{lat:activeLat,lng:activeLon}, map:googleMap, clickable:false, zIndex:20,
      title:'小火箭目前儲存的 WLOC 位置', icon:locationPinIcon('#007aff')
    });
    if (mode === 'point' && selected) googleCandidateMarker = new google.maps.Marker({
      position:{lat,lng:lon}, map:googleMap, draggable:true, zIndex:30,
      title:'準備移動的位置', icon:locationPinIcon('#ff3b30')
    });
    if (googleCandidateMarker) googleCandidateMarker.addListener('dragend', e => { setPos(e.latLng.lat(), e.latLng.lng()); openMoveConfirm(); });
    renderLiveLocation(false);
    if (routePoints.length > 1) googleRouteLine = new google.maps.Polyline({path:routePoints.map(p => ({lat:p[0],lng:p[1]})),strokeColor:'#007aff',strokeOpacity:.9,strokeWeight:5,map:googleMap});
    if (routePoints.length <= 40) routePoints.forEach((p, i) => { const m = new google.maps.Marker({position:{lat:p[0],lng:p[1]},map:googleMap,draggable:true,label:String(i+1)}); m.addListener('dragend', e => { routePoints[i]=[e.latLng.lat(),e.latLng.lng()]; renderRoute(); }); googleRouteMarkers.push(m); });
  }
}
function renderLiveLocation(centerMap) {
  if (!googleMap || liveLat === null || liveLon === null) return;
  const position = {lat:liveLat,lng:liveLon};
  if (!googleLiveMarker) googleLiveMarker = new google.maps.Marker({
    position, map:googleMap, clickable:false, zIndex:40, title:'iPhone 即時系統定位', icon:liveLocationIcon()
  });
  else googleLiveMarker.setPosition(position), googleLiveMarker.setMap(googleMap);
  if (!googleLiveAccuracyCircle) googleLiveAccuracyCircle = new google.maps.Circle({
    map:googleMap, center:position, radius:liveAccuracy || 0, strokeColor:'#22a06b', strokeOpacity:.65,
    strokeWeight:1, fillColor:'#34c759', fillOpacity:.12, clickable:false, zIndex:10
  });
  else googleLiveAccuracyCircle.setCenter(position), googleLiveAccuracyCircle.setRadius(liveAccuracy || 0), googleLiveAccuracyCircle.setMap(googleMap);
  if (centerMap) { googleMap.setCenter(position); if ((googleMap.getZoom() || 0) < 16) googleMap.setZoom(16); }
}
function liveLocationIcon() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">' +
    '<circle cx="17" cy="17" r="14" fill="#34c759" fill-opacity=".2"/>' +
    '<circle cx="17" cy="17" r="9" fill="#34c759" stroke="#fff" stroke-width="3"/>' +
    '<circle cx="17" cy="17" r="3" fill="#fff"/></svg>';
  return {url:'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize:new google.maps.Size(34,34), anchor:new google.maps.Point(17,17)};
}
function locationPinIcon(color) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="54" height="64" viewBox="0 0 54 64">' +
    '<ellipse cx="27" cy="57" rx="19" ry="5" fill="none" stroke="#bfc0c4" stroke-width="3"/>' +
    '<path d="M27 3C15.4 3 6 12.4 6 24c0 14.2 15.1 24.9 21 31 5.9-6.1 21-16.8 21-31C48 12.4 38.6 3 27 3Z" fill="' + color + '" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="27" cy="24" r="9" fill="#fff"/>' +
    '</svg>';
  return {url:'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize:new google.maps.Size(43,51), anchor:new google.maps.Point(21.5,46)};
}
function moveMapTo(la, lo, zoom) {
  if (googleMap) googleMap.setCenter({lat:la,lng:lo}), googleMap.setZoom(zoom || 15);
}
function fitRoute() {
  if (routePoints.length < 2) return;
  if (googleMap) { const b = new google.maps.LatLngBounds(); routePoints.forEach(p => b.extend({lat:p[0],lng:p[1]})); googleMap.fitBounds(b, 24); }
}
function toggleNorthLock() {
  northLocked = !northLocked;
  const btn = document.getElementById('northLockBtn');
  btn.classList.toggle('active', northLocked);
  btn.setAttribute('aria-pressed', String(northLocked));
  btn.querySelector('small').textContent = northLocked ? '已鎖北' : '可旋轉';
  if (googleMap) {
    googleMap.setOptions({headingInteractionEnabled:!northLocked});
    if (northLocked) { googleMap.setHeading(0); googleMap.setTilt(0); }
  }
  toast(northLocked ? '地圖已固定向北' : '已允許旋轉地圖');
}
function openToolPanel(targetId, title) {
  const panel = document.querySelector('.panel');
  document.getElementById('panelTitle').textContent = title || '功能設定';
  panel.classList.add('show');
  document.getElementById('panelBackdrop').classList.add('show');
  requestAnimationFrame(() => {
    const target = document.getElementById(targetId);
    if (target) panel.scrollTo({top:Math.max(0,target.offsetTop-58),behavior:'smooth'});
  });
}
function closeToolPanel() {
  document.querySelector('.panel').classList.remove('show');
  document.getElementById('panelBackdrop').classList.remove('show');
}
function openInputPanel() {
  openToolPanel('inputPanel','輸入位置');
  setTimeout(() => document.getElementById('urlInput').focus(), 280);
}
function openSavedPanel() {
  if (mode === 'route') openToolPanel('controlPanel','已儲存路線');
  else openToolPanel('favoritesPanel','已儲存的單點座標');
}

// 引數恆為 WGS84。
function setPos(newLat, newLon) {
  lat = newLat; lon = newLon; selected = true;
  renderMapObjects();
  document.getElementById('coords').textContent = '經度 ' + lon.toFixed(6) + '  緯度 ' + lat.toFixed(6);
  document.getElementById('floatingCoords').textContent = lon.toFixed(6) + ', ' + lat.toFixed(6);
}

function cooldownForMove() {
  if (activeLat === null || activeLon === null) return null;
  const meters = distanceMeters([activeLat, activeLon], [lat, lon]);
  const rawMinutes = meters / 10000 * 60;
  return { meters, minutes:Math.min(120, Math.max(0, Math.ceil(rawMinutes))), capped:rawMinutes > 120 };
}

function openMoveConfirm() {
  if (!selected) return toast('請先在地圖上選擇一個位置');
  const cooldown = cooldownForMove();
  document.getElementById('moveConfirmCoords').textContent = '經度 ' + lon.toFixed(6) + '  緯度 ' + lat.toFixed(6);
  document.getElementById('moveDistance').textContent = cooldown ? formatDistance(cooldown.meters) : '--';
  document.getElementById('moveCooldown').textContent = cooldown ? cooldown.minutes + ' 分鐘' : '--';
  document.getElementById('moveConfirmNote').textContent = cooldown
    ? '依 10 km/h 估算' + (cooldown.capped ? '，計算結果超過上限，顯示 120 分鐘。' : '；只有按下「確定移動」才會寫入新座標。')
    : '尚無已生效的目前位置，因此無法計算距離與冷卻時間；確認後才會寫入新座標。';
  document.getElementById('moveConfirmModal').classList.add('show');
}

function closeMoveConfirm() {
  document.getElementById('moveConfirmModal').classList.remove('show');
}

async function confirmMove() {
  const btn = document.getElementById('confirmMoveBtn');
  btn.disabled = true;
  btn.textContent = '移動中...';
  const ok = await save();
  btn.disabled = false;
  btn.textContent = '確定移動';
  if (ok) closeMoveConfirm();
}

function moveTo(newLat, newLon, zoom) {
  setPos(newLat, newLon);
  moveMapTo(lat, lon, zoom);
}

function toast(msg, ms) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms || 2500);
}

function showError(show) {
  document.getElementById('errorBanner').style.display = show ? 'block' : 'none';
}

/* ---- Route controller (all route files are parsed locally) ---- */
function setMode(nextMode) {
  stopJoystick();
  mode = nextMode === 'route' ? 'route' : nextMode === 'joystick' ? 'joystick' : 'point';
  document.getElementById('pointTab').classList.toggle('active', mode === 'point');
  document.getElementById('routeTab').classList.toggle('active', mode === 'route');
  document.getElementById('joystickTab').classList.toggle('active', mode === 'joystick');
  document.getElementById('floatPointBtn').classList.toggle('active', mode === 'point');
  document.getElementById('floatRouteBtn').classList.toggle('active', mode === 'route');
  document.getElementById('floatJoystickBtn').classList.toggle('active', mode === 'joystick');
  document.getElementById('routePanel').classList.toggle('show', mode === 'route');
  document.getElementById('joystickPanel').classList.toggle('show', mode === 'joystick');
  renderMapObjects();
  if (mode === 'route') toast('點選地圖可依序加入路線節點');
  if (mode === 'joystick') toast('按住搖桿方向即可移動');
}

function currentMapHeading() {
  if (northLocked) return 0;
  if (googleMap && Number.isFinite(googleMap.getHeading())) return googleMap.getHeading();
  return 0;
}
function moveByBearing(bearing, elapsedMs) {
  const speedKph = Math.min(300, Math.max(.5, parseFloat(document.getElementById('joySpeedInput').value) || 4.5));
  const distance = speedKph / 3.6 * elapsedMs / 1000;
  const angle = (bearing + currentMapHeading()) * Math.PI / 180;
  const earth = 6378137;
  const dLat = distance * Math.cos(angle) / earth;
  const dLon = distance * Math.sin(angle) / (earth * Math.max(.1, Math.cos(lat * Math.PI / 180)));
  setPos(lat + dLat * 180 / Math.PI, lon + dLon * 180 / Math.PI);
  moveMapTo(lat, lon, googleMap ? googleMap.getZoom() : 16);
  document.getElementById('joyState').textContent = '移動中 · ' + lon.toFixed(6) + ', ' + lat.toFixed(6);
  if (Date.now() - joystickLastSave >= 900) saveJoystickPosition();
}
async function saveJoystickPosition() {
  if (joystickSaving) return;
  joystickSaving = true; joystickLastSave = Date.now();
  try {
    const radius = parseInt(document.getElementById('radiusInput').value) || 0;
    const response = await fetch(SAVE_API + '?lon=' + lon + '&lat=' + lat + '&acc=25&randomRadius=' + radius, {method:'GET',mode:'cors',cache:'no-store'});
    const data = await response.json();
    if (!data.success) throw new Error(data.error || '寫入失敗');
    activeLon = lon; activeLat = lat; renderWlocSwitch(true, true);
  } catch (e) { document.getElementById('joyState').textContent = '無法寫入 WLOC'; }
  finally { joystickSaving = false; }
}
function startJoystick(bearing) {
  if (mode !== 'joystick') return;
  stopJoystick(false);
  moveByBearing(bearing, 250);
  joystickTimer = setInterval(() => moveByBearing(bearing, 250), 250);
}
function stopJoystick(saveFinal = true) {
  if (joystickTimer) { clearInterval(joystickTimer); joystickTimer = null; if (saveFinal) saveJoystickPosition(); }
  const state = document.getElementById('joyState');
  if (state && mode === 'joystick') state.textContent = '按住方向移動';
}

function distanceMeters(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad;
  const dLon = (b[1] - a[1]) * rad;
  const la1 = a[0] * rad;
  const la2 = b[0] * rad;
  const h = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return 12742000 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function routeMetrics(points) {
  const segments = [];
  let total = 0;
  for (let i=1; i<points.length; i++) {
    const length = distanceMeters(points[i-1], points[i]);
    segments.push(length);
    total += length;
  }
  return { segments, total };
}

function formatDistance(meters) {
  return meters >= 1000 ? (meters/1000).toFixed(meters >= 10000 ? 1 : 2) + ' km' : Math.round(meters) + ' m';
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.max(1, Math.round((seconds % 3600) / 60));
  return hours ? hours + ' 小時 ' + mins + ' 分' : mins + ' 分鐘';
}

function compactRoute(points, maxPoints) {
  const clean = points.filter(p => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180);
  if (clean.length <= maxPoints) return clean;
  const metrics = routeMetrics(clean);
  if (!metrics.total) return [clean[0], clean[clean.length-1]];
  const out = [clean[0]];
  let target = metrics.total / (maxPoints - 1);
  let walked = 0;
  let segStart = clean[0];
  for (let i=1; i<clean.length && out.length < maxPoints-1; i++) {
    let segEnd = clean[i];
    let segLength = distanceMeters(segStart, segEnd);
    while (walked + segLength >= target && out.length < maxPoints-1) {
      const ratio = segLength ? (target - walked) / segLength : 0;
      const p = [segStart[0] + (segEnd[0]-segStart[0])*ratio, segStart[1] + (segEnd[1]-segStart[1])*ratio];
      out.push(p);
      segStart = p;
      segLength = distanceMeters(segStart, segEnd);
      walked = target;
      target += metrics.total / (maxPoints - 1);
    }
    walked += segLength;
    segStart = segEnd;
  }
  out.push(clean[clean.length-1]);
  return out.slice(0, maxPoints);
}

function renderRoute() {
  renderMapObjects();
  const metrics = routeMetrics(routePoints);
  const speed = parseFloat(document.getElementById('speedInput').value) || 4.5;
  document.getElementById('routePoints').textContent = routePoints.length;
  document.getElementById('routeDistance').textContent = formatDistance(metrics.total);
  document.getElementById('routeDuration').textContent = formatDuration(metrics.total / (speed/3.6));
}

function undoRoutePoint() {
  routePoints.pop();
  renderRoute();
}

function clearRoute() {
  routePoints = [];
  routeSuggestedName = '';
  routeSource = 'manual';
  activeRoute = null;
  renderRoute();
  updateRouteStatus();
}

function reverseRoute() {
  if (routePoints.length < 2) return toast('路線至少需要兩個點');
  routePoints.reverse();
  renderRoute();
  fitRoute();
  toast('路線方向已反轉');
}

function getSavedRoutes() {
  try { return JSON.parse(localStorage.getItem(ROUTE_KEY)) || []; } catch(e) { return []; }
}

function saveSavedRoutes(routes) {
  localStorage.setItem(ROUTE_KEY, JSON.stringify(routes));
}

function renderSavedRoutes() {
  const routes = getSavedRoutes();
  const el = document.getElementById('savedRouteList');
  if (!routes.length) {
    el.innerHTML = '<div class="fav-empty">尚未儲存路線；匯入 GPX 或畫好路線後按「儲存路線」</div>';
    return;
  }
  el.innerHTML = routes.map((r, i) => {
    const metrics = routeMetrics(r.points || []);
    return '<div class="saved-route-item">' +
      '<div class="saved-route-main" onclick="loadSavedRoute(' + i + ')">' +
        '<div class="saved-route-name">' + escHtml(r.name) + '<\/div>' +
        '<div class="saved-route-meta">' + (r.source === 'gpx' ? 'GPX' : '手繪') + ' · ' + (r.points ? r.points.length : 0) + ' 點 · ' + formatDistance(metrics.total) + ' · ' + Number(r.speedKph || 4.5).toFixed(1) + ' km/h<\/div>' +
      '<\/div>' +
      '<button class="fav-del" onclick="deleteSavedRoute(' + i + ')" title="刪除">×<\/button>' +
    '<\/div>';
  }).join('');
}

function openRouteSaveModal() {
  if (routePoints.length < 2) return toast('路線至少需要兩個點才能儲存');
  const metrics = routeMetrics(routePoints);
  document.getElementById('routeNameInput').value = routeSuggestedName || '';
  document.getElementById('routeModalInfo').textContent = routePoints.length + ' 點 · ' + formatDistance(metrics.total);
  document.getElementById('routeSaveModal').classList.add('show');
  setTimeout(() => document.getElementById('routeNameInput').focus(), 100);
}

function closeRouteSaveModal() {
  document.getElementById('routeSaveModal').classList.remove('show');
}

function confirmSaveRoute() {
  const name = document.getElementById('routeNameInput').value.trim();
  if (!name) return toast('請輸入路線名稱');
  const routes = getSavedRoutes();
  const points = compactRoute(routePoints, 280);
  routes.unshift({
    name,
    points,
    speedKph: parseFloat(document.getElementById('speedInput').value) || 4.5,
    loop: document.getElementById('loopInput').checked,
    source: routeSource,
    savedAt: new Date().toISOString()
  });
  saveSavedRoutes(routes.slice(0, 50));
  routeSuggestedName = name;
  closeRouteSaveModal();
  renderSavedRoutes();
  toast('已儲存路線：' + name);
}

function loadSavedRoute(index) {
  const route = getSavedRoutes()[index];
  if (!route || !Array.isArray(route.points)) return;
  routePoints = route.points;
  routeSuggestedName = route.name;
  routeSource = route.source || 'manual';
  document.getElementById('speedInput').value = route.speedKph || 4.5;
  document.getElementById('loopInput').checked = !!route.loop;
  setMode('route');
  renderRoute();
  fitRoute();
  toast('已載入路線：' + route.name);
}

function deleteSavedRoute(index) {
  const routes = getSavedRoutes();
  if (!routes[index]) return;
  const name = routes[index].name;
  routes.splice(index, 1);
  saveSavedRoutes(routes);
  renderSavedRoutes();
  toast('已刪除路線：' + name);
}

function importGpx(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) return toast('GPX 檔案過大，請使用 8 MB 以下檔案', 3500);
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const xml = new DOMParser().parseFromString(String(reader.result), 'application/xml');
      if (xml.querySelector('parsererror')) throw new Error('GPX 格式錯誤');
      let nodes = Array.from(xml.getElementsByTagName('trkpt'));
      if (!nodes.length) nodes = Array.from(xml.getElementsByTagName('rtept'));
      if (!nodes.length) nodes = Array.from(xml.getElementsByTagName('wpt'));
      const parsed = nodes.map(n => [parseFloat(n.getAttribute('lat')), parseFloat(n.getAttribute('lon'))]);
      routePoints = compactRoute(parsed, 280);
      routeSuggestedName = file.name.replace(/\.gpx$/i, '');
      routeSource = 'gpx';
      if (routePoints.length < 2) throw new Error('GPX 內沒有足夠的路線點');
      setMode('route');
      openToolPanel('controlPanel','GPX 路線設定');
      renderRoute();
      fitRoute();
      toast('已匯入 ' + parsed.length + ' 點，裝置儲存使用 ' + routePoints.length + ' 點');
    } catch (e) {
      toast(e.message || '無法讀取 GPX', 3500);
    }
  };
  reader.onerror = () => toast('GPX 讀取失敗', 3000);
  reader.readAsText(file);
}

function routePosition(route, now) {
  if (!route || !Array.isArray(route.points) || route.points.length < 2) return null;
  const metrics = routeMetrics(route.points);
  if (!metrics.total) return null;
  const effectiveNow = route.status === 'paused' ? (Number(route.pausedAt) || now) : now;
  let travelled = Math.max(0, (effectiveNow - Number(route.startedAt || now))/1000) * (Number(route.speedKph)/3.6);
  let finished = false;
  if (route.loop) travelled %= metrics.total;
  else if (travelled >= metrics.total) { travelled = metrics.total; finished = true; }
  let cursor = travelled;
  for (let i=1; i<route.points.length; i++) {
    const length = metrics.segments[i-1];
    if (cursor <= length) {
      const ratio = length ? cursor/length : 0;
      const a = route.points[i-1], b = route.points[i];
      return {lat:a[0]+(b[0]-a[0])*ratio, lon:a[1]+(b[1]-a[1])*ratio, travelled, total:metrics.total, finished};
    }
    cursor -= length;
  }
  const p = route.points[route.points.length-1];
  return {lat:p[0],lon:p[1],travelled:metrics.total,total:metrics.total,finished:true};
}

function encodeRoute(points) {
  return points.map(p => p[0].toFixed(5) + ',' + p[1].toFixed(5)).join(';');
}

async function startRoute() {
  if (routePoints.length < 2) return toast('請在地圖加入至少兩個點，或匯入 GPX');
  const speed = parseFloat(document.getElementById('speedInput').value);
  if (!Number.isFinite(speed) || speed < 0.5 || speed > 300) return toast('速度請設定為 0.5～300 km/h');
  const points = compactRoute(routePoints, 280);
  const radius = parseInt(document.getElementById('radiusInput').value) || 0;
  const url = SAVE_API + '?action=route&speed=' + speed + '&loop=' + (document.getElementById('loopInput').checked ? '1' : '0') + '&randomRadius=' + radius + '&points=' + encodeRoute(points);
  const btn = document.getElementById('routeStartBtn');
  btn.disabled = true;
  btn.textContent = '寫入中...';
  showError(false);
  try {
    const response = await fetch(url, {method:'GET',mode:'cors',cache:'no-store'});
    const data = await response.json();
    if (!data.success) throw new Error(data.error || '路線寫入失敗');
    routePoints = points;
    activeRoute = data.route;
    activeLon = data.longitude;
    activeLat = data.latitude;
    renderWlocSwitch(true, true);
    document.getElementById('routePauseBtn').disabled = false;
    toast('路線已開始，關閉此頁後仍會依時間繼續');
    startRouteTimer();
    renderRoute();
    updateRouteStatus();
  } catch (e) {
    showError(true);
    toast(e.message || '路線寫入失敗，請檢查代理模組', 4000);
  } finally {
    btn.disabled = false;
    btn.textContent = '▶ 重新開始';
  }
}

async function toggleRoutePause() {
  if (!activeRoute) return toast('目前沒有生效中的路線');
  const action = activeRoute.status === 'paused' ? 'resume' : 'pause';
  try {
    const response = await fetch(SAVE_API + '?action=' + action, {method:'GET',mode:'cors',cache:'no-store'});
    const data = await response.json();
    if (!data.success) throw new Error(data.error || '更新失敗');
    activeRoute = data.route;
    updateRouteStatus();
    toast(action === 'pause' ? '路線已暫停' : '路線已繼續');
  } catch (e) { toast(e.message || '無法更新路線狀態', 3500); }
}

async function stopRoute() {
  if (!activeRoute) return toast('目前沒有生效中的路線');
  const pos = routePosition(activeRoute, Date.now());
  if (!pos) return toast('無法取得路線目前位置');
  activeRoute = null;
  setPos(pos.lat, pos.lon);
  await save();
  document.getElementById('routePauseBtn').disabled = true;
  document.getElementById('routeStartBtn').textContent = '▶ 開始';
  updateRouteStatus();
  toast('路線已停止並停留在目前位置');
}

function updateRouteStatus() {
  const hint = document.getElementById('routeHint');
  const pauseBtn = document.getElementById('routePauseBtn');
  if (!activeRoute) {
    document.getElementById('routeProgressBar').style.width = '0%';
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暫停';
    return;
  }
  const pos = routePosition(activeRoute, Date.now());
  if (!pos) return;
  // 路線進度由時間計算；同步移動藍色 WLOC 定位針，不必每秒重建整張地圖。
  activeLat = pos.lat;
  activeLon = pos.lon;
  if (googleMap) {
    if (!googleActiveMarker) {
      googleActiveMarker = new google.maps.Marker({
        position:{lat:activeLat,lng:activeLon}, map:googleMap, clickable:false, zIndex:20,
        title:'路線中的 WLOC 位置', icon:locationPinIcon('#007aff')
      });
    } else {
      googleActiveMarker.setPosition({lat:activeLat,lng:activeLon});
      googleActiveMarker.setMap(googleMap);
    }
  }
  const percent = pos.total ? Math.min(100, pos.travelled/pos.total*100) : 0;
  document.getElementById('routeProgressBar').style.width = percent.toFixed(2) + '%';
  pauseBtn.disabled = false;
  pauseBtn.textContent = activeRoute.status === 'paused' ? '繼續' : '暫停';
  hint.textContent = (activeRoute.status === 'paused' ? '已暫停 · ' : pos.finished ? '已到達終點 · ' : '移動中 · ') + formatDistance(pos.travelled) + ' / ' + formatDistance(pos.total) + ' · ' + Number(activeRoute.speedKph).toFixed(1) + ' km/h';
  if (liveWatchId === null) document.getElementById('floatingCoords').textContent = '路線 ' + activeLon.toFixed(6) + ', ' + activeLat.toFixed(6) + ' · ' + percent.toFixed(0) + '%';
}

function startRouteTimer() {
  if (routeTimer) clearInterval(routeTimer);
  routeTimer = setInterval(updateRouteStatus, 1000);
  updateRouteStatus();
}

document.getElementById('speedInput').addEventListener('input', renderRoute);

/* ---- Favorites (localStorage) ---- */
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch(e) { return []; }
}
function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function renderFavs() {
  const favs = getFavs();
  const el = document.getElementById('favList');
  const clearBtn = document.getElementById('clearAllBtn');
  clearBtn.style.display = favs.length ? '' : 'none';
  if (!favs.length) {
    el.innerHTML = '<div class="fav-empty">暫無收藏，選好位置後點選「收藏位置」</div>';
    return;
  }
  el.innerHTML = favs.map((f, i) => {
    const isActive = activeLon !== null && Math.abs(f.lon - activeLon) < 0.000001 && Math.abs(f.lat - activeLat) < 0.000001;
    return '<div class="fav-item" onclick="loadFav(' + i + ')">' +
      '<div class="fav-info">' +
        '<div class="fav-name">' + escHtml(f.name) + '<\\/div>' +
        '<div class="fav-coords">' + f.lon.toFixed(6) + ', ' + f.lat.toFixed(6) + '<\\/div>' +
        (isActive ? '<div class="fav-active">\\u2713 當前生效<\\/div>' : '') +
      '<\\/div>' +
      '<button class="fav-del" onclick="event.stopPropagation();delFav(' + i + ')" title="刪除">\\u00d7<\\/button>' +
    '<\\/div>';
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function addFav() {
  if (!selected) { toast('請先在地圖上選擇一個位置'); return; }
  document.getElementById('favModalCoords').textContent = lon.toFixed(6) + ', ' + lat.toFixed(6);
  document.getElementById('favNameInput').value = '';
  document.getElementById('favModal').classList.add('show');
  setTimeout(() => document.getElementById('favNameInput').focus(), 100);
}

function closeFavModal() {
  document.getElementById('favModal').classList.remove('show');
}

function confirmFav() {
  const name = document.getElementById('favNameInput').value.trim();
  if (!name) { toast('請輸入備註名稱'); return; }
  const favs = getFavs();
  favs.push({ name, lon, lat, time: new Date().toISOString() });
  saveFavs(favs);
  closeFavModal();
  renderFavs();
  toast('已收藏: ' + name);
}

function loadFav(i) {
  const favs = getFavs();
  if (!favs[i]) return;
  moveTo(favs[i].lat, favs[i].lon, 15);
  toast(favs[i].name + ' (' + favs[i].lon.toFixed(4) + ', ' + favs[i].lat.toFixed(4) + ')');
}

function delFav(i) {
  const favs = getFavs();
  if (!favs[i]) return;
  const name = favs[i].name;
  favs.splice(i, 1);
  saveFavs(favs);
  renderFavs();
  toast('已刪除: ' + name);
}

function clearAllFav() {
  if (!confirm('確定清空所有收藏？')) return;
  saveFavs([]);
  renderFavs();
  toast('已清空所有收藏');
}

/* ---- Active location query ---- */
function renderWlocSwitch(enabled, hasTarget) {
  wlocEnabled = !!enabled;
  document.getElementById('wlocSwitch').checked = wlocEnabled;
  document.getElementById('wlocSwitchText').textContent = wlocEnabled ? (hasTarget ? '已開啟，正在使用虛擬定位' : '已開啟，尚未設定位置') : '已關閉，使用真實定位';
}

async function toggleWloc(enabled) {
  const input = document.getElementById('wlocSwitch');
  input.disabled = true;
  try {
    const response = await fetch(SAVE_API + '?action=' + (enabled ? 'enable' : 'disable'), {method:'GET',mode:'cors',cache:'no-store'});
    const data = await response.json();
    if (!data.success) throw new Error(data.error || '切換失敗');
    activeRoute = data.route || activeRoute;
    renderWlocSwitch(data.enabled, !!(activeRoute || (activeLon !== null && activeLat !== null)));
    updateRouteStatus();
    document.getElementById('activeValue').textContent = data.enabled ? (activeRoute ? 'WLOC 已開啟 · 路線模式' : 'WLOC 已開啟') : 'WLOC 已關閉 · 使用真實定位';
    toast(data.enabled ? 'WLOC 已開啟' : 'WLOC 已關閉；請切換 iPhone 定位服務以重新取得真實位置');
  } catch (e) {
    renderWlocSwitch(!enabled, !!(activeRoute || activeLon !== null));
    showError(true);
    toast(e.message || '無法切換 WLOC', 3500);
  } finally {
    input.disabled = false;
  }
}

function queryActive() {
  const el = document.getElementById('activeValue');
  el.textContent = '查詢中...';
  fetch(SAVE_API + '?action=query', { method:'GET', mode:'cors', cache:'no-store' })
    .then(r => r.json())
    .then(d => {
      if (d.success && d.longitude && d.latitude) {
        activeLon = parseFloat(d.longitude);
        activeLat = parseFloat(d.latitude);
        activeRoute = d.route || null;
        renderWlocSwitch(d.enabled !== false, true);
        if (activeRoute && Array.isArray(activeRoute.points)) {
          routePoints = activeRoute.points;
          document.getElementById('speedInput').value = activeRoute.speedKph || 4.5;
          document.getElementById('loopInput').checked = !!activeRoute.loop;
          renderRoute();
          startRouteTimer();
        }
        const rr = d.randomRadius || 0;
        el.textContent = activeRoute ? '路線模式 · ' + (activeRoute.status === 'paused' ? '已暫停' : '移動中') + ' · ' + Number(activeRoute.speedKph).toFixed(1) + ' km/h' : '經度 ' + activeLon.toFixed(6) + '  緯度 ' + activeLat.toFixed(6) + (d.accuracy ? '  精度 ' + d.accuracy + 'm' : '') + (rr ? '  擾動 ' + rr + 'm' : '');
        document.getElementById('radiusInput').value = rr;
        renderFavs();
        renderMapObjects();
      } else {
        activeLon = null; activeLat = null;
        activeRoute = null;
        renderWlocSwitch(false, false);
        el.textContent = '無已儲存的座標';
        renderFavs();
        renderMapObjects();
      }
    })
    .catch(() => {
      el.textContent = '查詢失敗 (需要代理模組支援)';
    });
}

function clearActive() {
  if (!confirm('確定清除裝置上已儲存的座標？清除後將使用模組預設引數或停止修改定位。')) return;
  fetch(SAVE_API + '?action=clear', { method:'GET', mode:'cors', cache:'no-store' })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        activeLon = null; activeLat = null;
        activeRoute = null;
        renderWlocSwitch(false, false);
        updateRouteStatus();
        document.getElementById('activeValue').textContent = '已清除';
        renderFavs();
        renderMapObjects();
        toast('已清除裝置座標');
      } else { toast('清除失敗: ' + (d.error || ''), 3000); }
    })
    .catch(() => { toast('清除失敗 - 請檢查模組配置', 3000); });
}

/* ---- Save to device ---- */
async function save() {
  if (!selected) { toast('請先在地圖上選擇一個位置'); return false; }
  const btn = document.getElementById('saveBtn');
  btn.textContent = '儲存中...'; btn.disabled = true;
  showError(false);
  try {
    const radius = parseInt(document.getElementById('radiusInput').value) || 0;
    const r = await fetch(SAVE_API + '?lon=' + lon + '&lat=' + lat + '&acc=25&randomRadius=' + radius, {
      method: 'GET', mode: 'cors', cache: 'no-store'
    });
    const d = await r.json();
    if (d.success) {
      activeLon = lon; activeLat = lat;
      selected = false;
      renderWlocSwitch(true, true);
      btn.textContent = '\\u2713 已移動'; btn.className = 'btn btn-primary success';
      document.getElementById('status').textContent = '\\u2713 已寫入: ' + lon.toFixed(6) + ', ' + lat.toFixed(6) + ' \\u00b7 ' + new Date().toLocaleTimeString('zh-CN');
      document.getElementById('activeValue').textContent = '經度 ' + lon.toFixed(6) + '  緯度 ' + lat.toFixed(6) + '  精度 25m';
      renderFavs();
      renderMapObjects();
      toast('\\u2713 座標已寫入裝置，下次定位生效');
      setTimeout(() => { btn.textContent='確認移動'; btn.className='btn btn-primary'; btn.disabled=false; }, 2500);
      return true;
    } else {
      throw new Error(d.error || '寫入失敗');
    }
  } catch(e) {
    btn.textContent = '確認移動'; btn.className = 'btn btn-primary'; btn.disabled = false;
    showError(true);
    toast('\\u2717 儲存失敗 - 請檢查模組配置', 4000);
    return false;
  }
}

function setLiveButton(active) {
  const btn = document.getElementById('liveLocationBtn');
  btn.classList.toggle('live-active', active);
  btn.setAttribute('aria-pressed', String(active));
  btn.querySelector('small').textContent = active ? '追蹤中' : '定位';
}

function stopLiveLocation() {
  if (liveWatchId !== null) navigator.geolocation.clearWatch(liveWatchId);
  liveWatchId = null;
  setLiveButton(false);
  if (googleLiveMarker) { googleLiveMarker.setMap(null); googleLiveMarker = null; }
  if (googleLiveAccuracyCircle) { googleLiveAccuracyCircle.setMap(null); googleLiveAccuracyCircle = null; }
  toast('已停止即時定位追蹤');
}

function locateMe() {
  if (!navigator.geolocation) return toast('瀏覽器不支援定位');
  if (liveWatchId !== null) return stopLiveLocation();
  toast('正在取得 iPhone 即時系統定位...');
  setLiveButton(true);
  let firstFix = true;
  liveWatchId = navigator.geolocation.watchPosition(
    pos => {
      liveLat = pos.coords.latitude;
      liveLon = pos.coords.longitude;
      liveAccuracy = Number(pos.coords.accuracy) || 0;
      renderLiveLocation(firstFix);
      const gap = activeLat !== null && activeLon !== null ? distanceMeters([activeLat,activeLon],[liveLat,liveLon]) : null;
      document.getElementById('floatingCoords').textContent = '即時 ' + liveLon.toFixed(6) + ', ' + liveLat.toFixed(6) + (gap === null ? '' : ' · 距 WLOC ' + formatDistance(gap));
      if (firstFix) {
        toast(gap === null ? '已開始顯示即時系統定位' : '即時定位距 WLOC ' + formatDistance(gap), 3500);
        firstFix = false;
      }
    },
    err => {
      if (liveWatchId !== null) navigator.geolocation.clearWatch(liveWatchId);
      liveWatchId = null;
      setLiveButton(false);
      toast('即時定位失敗: ' + err.message, 3500);
    },
    { enableHighAccuracy:true, maximumAge:0, timeout:15000 }
  );
}

function parseMapUrl(text) {
  let m;
  m = text.match(/ll=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/@([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/(?:location|center)=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
  m = text.match(/(-?[0-9]+\\.[0-9]+)[,\\s]+(-?[0-9]+\\.[0-9]+)/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    // 緯度絕對值不超過 90, 經度可達 180: 按絕對值判斷誰是經度, 否則
    // -122.009 這類西經會被當成緯度 (-122 < 90 恆成立)。
    if (Math.abs(a) <= 90 && Math.abs(b) > 90) return { lat: a, lon: b };
    if (Math.abs(b) <= 90 && Math.abs(a) > 90) return { lat: b, lon: a };
    return { lat: a, lon: b };
  }
  return null;
}

// 含連結的輸入交給服務端 /api/parse: 瀏覽器讀不到跨域跳轉資訊，
// 因此由 Worker 解析 Google 地圖連結。
// 純座標文字本地直接解析 —— 它也是唯一不需要座標系換算的輸入, 免去一次往返。
async function parseUrl() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) return toast('請貼上地圖連結或座標');

  const low = input.toLowerCase();
  if (low.includes('http://') || low.includes('https://')) {
    toast('解析中...');
    let data;
    try {
      const r = await fetch('/api/parse?format=json&u=' + encodeURIComponent(input));
      data = await r.json();
    } catch (e) {
      toast('解析服務不可達', 3000);
      return;
    }
    if (!data || data.error || typeof data.lat !== 'number') {
      toast(data && data.error ? data.error : '無法解析座標，請檢查連結格式', 3000);
      return;
    }
    moveTo(data.lat, data.lon, 15);
    toast(data.name ? '已解析: ' + data.name : '已解析: ' + data.lon.toFixed(4) + ', ' + data.lat.toFixed(4));
    return;
  }

  const result = parseMapUrl(input);
  if (!result) { toast('無法解析座標，請檢查連結格式', 3000); return; }
  moveTo(result.lat, result.lon, 15);
  toast('已解析: ' + result.lon.toFixed(4) + ', ' + result.lat.toFixed(4));
}

async function searchPlace() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return toast('請輸入地名');
  if (!window.google || !google.maps) return toast('搜尋需要先設定並載入 Google 地圖');
  toast('搜尋中...');
  try {
    const geocoder = new google.maps.Geocoder();
    const result = await new Promise((resolve, reject) => geocoder.geocode({address:q}, (results, status) => status === 'OK' && results[0] ? resolve(results[0]) : reject(new Error(status))));
    const p = result.geometry.location;
    moveTo(p.lat(), p.lng(), 15);
    toast(result.formatted_address.slice(0, 40));
  } catch(e) { toast('搜尋失敗', 3000); }
}

document.addEventListener('paste', e => {
  const text = (e.clipboardData||window.clipboardData).getData('text');
  if (!text) return;
  if (!(text.includes('map') || text.includes('loc') || /[0-9]+\\.[0-9]+/.test(text))) return;
  const input = document.getElementById('urlInput');
  // 貼上目標本來就是這個輸入框時, 讓瀏覽器原生插入即可; 此處再賦一次值,
  // 原生插入會疊加在後面, 結果是同一段文字出現兩遍。
  if (e.target !== input) input.value = text;
  setTimeout(parseUrl, 200);
});
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') searchPlace(); });
document.getElementById('urlInput').addEventListener('keydown', e => { if(e.key==='Enter') parseUrl(); });
document.getElementById('favNameInput').addEventListener('keydown', e => { if(e.key==='Enter') confirmFav(); });
document.getElementById('routeNameInput').addEventListener('keydown', e => { if(e.key==='Enter') confirmSaveRoute(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeToolPanel(); });
document.querySelectorAll('.joy-btn').forEach(btn => {
  const start = e => { e.preventDefault(); startJoystick(Number(btn.dataset.bearing)); };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('contextmenu', e => e.preventDefault());
});
['pointerup','pointercancel','blur'].forEach(type => window.addEventListener(type, () => stopJoystick()));

renderFavs();
renderSavedRoutes();
initMap();
queryActive();
<\/script>
</body>
</html>`;
}
