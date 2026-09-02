import { GCJ_BROWSER_JS } from "./gcj-browser.js";

export function getPageHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WLOC 虚拟定位</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="WLOC">
<!-- 内联图标: 没有它浏览器每次加载都会去要 /favicon.ico 并拿到 404 -->
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ctext y='26' font-size='26'%3E%F0%9F%93%8D%3C/text%3E%3C/svg%3E">
<!-- integrity 为 Leaflet 官方在 leafletjs.com/download.html 公布的 SRI 值,
     可自行核对。CDN 被篡改时浏览器会拒绝执行, 下面的 typeof L 检查会给出提示。 -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="anonymous"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="anonymous"><\/script>
<style>
:root { --blue:#007aff; --green:#34c759; --red:#ff3b30; --gray:#8e8e93; --bg:#f2f2f7; --orange:#ff9500; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,system-ui,"SF Pro","Helvetica Neue",sans-serif; background:var(--bg); }
#map { height:50vh; width:100%; min-height:250px; }
.panel { padding:16px; max-width:600px; margin:0 auto; }
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
.layer-switch { position:absolute; top:10px; right:10px; z-index:1000; display:flex; gap:4px; background:rgba(255,255,255,.92); border-radius:8px; padding:4px; box-shadow:0 2px 8px rgba(0,0,0,.15); }
.layer-btn { border:none; background:transparent; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:500; color:#333; cursor:pointer; transition:all .15s; white-space:nowrap; }
.layer-btn.active { background:var(--blue); color:#fff; }
.layer-btn:active { transform:scale(.95); }
.mode-tabs { display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:4px; background:var(--bg); border-radius:10px; margin-bottom:12px; }
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
@media(max-width:480px) { #map { height:44vh; } .panel { padding:12px; } .layer-btn { padding:5px 7px; font-size:11px; } }
</style>
</head>
<body>
<div style="position:relative">
<div id="map"></div>
<div class="layer-switch">
  <button class="layer-btn active" data-layer="satellite" onclick="switchLayer('satellite')">卫星</button>
  <button class="layer-btn" data-layer="wgs84" onclick="switchLayer('wgs84')">WGS84</button>
  <button class="layer-btn" data-layer="amap" onclick="switchLayer('amap')" title="高德为 GCJ-02 偏移图源，选点已自动换算回 WGS84">高德</button>
  <button class="layer-btn" data-layer="voyager" onclick="switchLayer('voyager')">彩色</button>
  <button class="layer-btn" data-layer="standard" onclick="switchLayer('standard')">标准</button>
  <button class="layer-btn" data-layer="dark" onclick="switchLayer('dark')">暗色</button>
</div>
</div>
<div class="panel">
  <div class="error-banner" id="errorBanner">
    <b>模块未生效</b>
    请检查以下配置：<br>
    1. 已安装并启用 WLOC 定位模块<br>
    2. MITM 已开启且信任证书<br>
    3. MITM 主机名包含 gs-loc.apple.com<br>
    4. 当前网络已走代理
  </div>
  <div class="card">
    <div class="master-switch">
      <div><strong>WLOC 虛擬定位</strong><small id="wlocSwitchText">查詢目前狀態...</small></div>
      <label class="switch" aria-label="WLOC 虛擬定位開關"><input id="wlocSwitch" type="checkbox" onchange="toggleWloc(this.checked)" /><span></span></label>
    </div>
    <div class="mode-tabs" role="tablist" aria-label="定位模式">
      <button class="mode-tab active" id="pointTab" onclick="setMode('point')">單點定位</button>
      <button class="mode-tab" id="routeTab" onclick="setMode('route')">路線移動</button>
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
        <label><input id="loopInput" type="checkbox" /> 完成後循環</label>
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
  <div class="card">
    <h3>选择目标位置</h3>
    <div class="coords" id="coords">点击地图或使用下方工具选择位置</div>
    <div class="input-row" style="margin-top:10px">
      <label style="font-size:13px;color:var(--gray);display:flex;align-items:center;gap:6px;white-space:nowrap">扰动半径(米)
        <input id="radiusInput" type="number" min="0" max="5000" step="1" value="0" style="width:80px;flex:none" />
      </label>
      <span style="font-size:11px;color:var(--gray);line-height:1.3">每次定位在目标点周围随机偏移，0=关闭</span>
    </div>
    <div class="row">
      <button class="btn btn-primary" id="saveBtn" onclick="save()">储存到设备</button>
      <button class="btn btn-secondary" onclick="addFav()">收藏位置</button>
      <button class="btn btn-secondary" onclick="locateMe()">当前位置</button>
    </div>
  </div>
  <div class="card">
    <div class="fav-header">
      <h3>已儲存的單點座標</h3>
      <button class="btn btn-sm btn-secondary" onclick="clearAllFav()" id="clearAllBtn" style="display:none">清空全部</button>
    </div>
    <div id="favList" class="fav-list"></div>
  </div>
  <div class="card">
    <h3>当前生效坐标</h3>
    <div class="active-loc" id="activeLoc">
      <div class="label">设备持久化数据 (wloc_settings)</div>
      <div class="value" id="activeValue">查询中...</div>
    </div>
    <div class="row">
      <button class="btn btn-sm btn-secondary" onclick="queryActive()">刷新</button>
      <button class="btn btn-sm btn-danger" onclick="clearActive()">清除数据</button>
    </div>
  </div>
  <div class="card">
    <h3>粘贴地图链接</h3>
    <div class="input-row">
      <input id="urlInput" placeholder="Apple/Google/高德地图链接 或 经纬度" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="parseUrl()">解析</button>
    </div>
    <div style="font-size:11px;color:var(--gray);margin-top:6px">支持 Apple Maps · Google Maps · 高德 · 百度 · 坐标文本</div>
  </div>
  <div class="card">
    <h3>搜索地点</h3>
    <div class="input-row">
      <input id="searchInput" placeholder="输入地名（如: 上海外滩）" />
      <button class="btn btn-secondary" style="flex:none;min-width:56px" onclick="searchPlace()">搜索</button>
    </div>
  </div>
  <div class="status" id="status">选好位置后点击「储存到设备」写入代理工具</div>
</div>
<div class="toast" id="toast"></div>
<div class="modal-overlay" id="favModal">
  <div class="modal">
    <h3>收藏此位置</h3>
    <input id="favNameInput" placeholder="输入备注名称（如: 公司、家）" maxlength="30" />
    <div style="font-size:12px;color:var(--gray);margin-bottom:12px;text-align:center" id="favModalCoords"></div>
    <div class="modal-btns">
      <button class="btn btn-secondary" onclick="closeFavModal()">取消</button>
      <button class="btn btn-primary" onclick="confirmFav()">保存</button>
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
<script>
if (typeof L === 'undefined') {
  document.getElementById('map').innerHTML =
    '<div style="padding:24px;text-align:center;font-size:14px;color:#8e8e93;line-height:1.6">' +
    '地图库加载失败<br>unpkg.com 不可达, 请检查网络或代理后刷新<\\/div>';
  throw new Error('leaflet unavailable');
}
${GCJ_BROWSER_JS}
const SAVE_API = 'https://gs-loc.apple.com/wloc-settings/save';
const FAV_KEY = 'wloc_favorites';
const ROUTE_KEY = 'wloc_saved_routes';
// lat/lon 恒为 WGS84 —— 这是写进设备、也是 wloc 唯一认的坐标系。
// 底图可能是 GCJ-02 图源, 屏幕上的经纬度与它并不相等, 换算集中在 toDisplay/
// fromDisplay 两个函数里, 其它地方一律不碰。
let lat = 22.544577, lon = 113.94114;
let selected = false;
let activeLon = null, activeLat = null;
let layerIsGcj = false;
let mode = 'point';
let routePoints = [];
let routeLine = null;
let routeMarkers = [];
let activeRoute = null;
let routeTimer = null;
let routeSuggestedName = '';
let routeSource = 'manual';
let wlocEnabled = false;

// 高德瓦片画的是 GCJ-02 地物, 而 Leaflet 按 WGS84 算「像素 -> 经纬度」。所以在
// 高德图层上点中的那个读数, 其实是目标点的 GCJ-02 值; 不反算就直接存, 深圳一带
// 会偏 500 米左右 —— 对一个定位工具来说这是致命的。反过来, 要把一个 WGS84 点
// 画在高德图层上, 得先正算成 GCJ-02, 否则 marker 会落在错误的楼上。
function toDisplay(la, lo) { return layerIsGcj ? wgs84ToGcj02(la, lo) : { lat: la, lon: lo }; }
function fromDisplay(la, lo) { return layerIsGcj ? gcj02ToWgs84(la, lo) : { lat: la, lon: lo }; }

const map = L.map('map').setView([lat, lon], 13);
const tiles = {
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'ArcGIS'}),
  wgs84: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {maxZoom:19, attribution:'ArcGIS WGS84'}),
  standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'\\u00a9 OSM'}),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'\\u00a9 Carto'}),
  amap: L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {maxZoom:18, subdomains:'1234', attribution:'\\u00a9 高德'}),
  voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'\\u00a9 Carto'})
};
let currentLayer = tiles.satellite;
currentLayer.addTo(map);
function switchLayer(name) {
  map.removeLayer(currentLayer);
  currentLayer = tiles[name];
  currentLayer.addTo(map);
  layerIsGcj = (name === 'amap');
  // 底图坐标系变了, 同一个 WGS84 点对应的屏幕位置也就变了, marker 必须重摆,
  // 否则切换图层后它会停在旧图源的像素位置上, 看起来像是坐标被改掉了。
  const d = toDisplay(lat, lon);
  marker.setLatLng([d.lat, d.lon]);
  renderRoute();
  map.setView([d.lat, d.lon], map.getZoom());
  document.querySelectorAll('.layer-btn').forEach(b => b.classList.toggle('active', b.dataset.layer === name));
}
let marker = L.marker([lat, lon], {draggable:true}).addTo(map);

// 地图交互给出的都是「屏幕坐标系」的读数, 一律先过 fromDisplay 再进 setPos。
marker.on('dragend', e => { const p=e.target.getLatLng(); setPosFromDisplay(p.lat, p.lng); });
map.on('click', e => {
  if (mode === 'route') {
    const w = fromDisplay(e.latlng.lat, e.latlng.lng);
    routePoints.push([w.lat, w.lon]);
    routeSource = 'manual';
    renderRoute();
    return;
  }
  setPosFromDisplay(e.latlng.lat, e.latlng.lng);
});

function setPosFromDisplay(dLat, dLon) {
  const w = fromDisplay(dLat, dLon);
  setPos(w.lat, w.lon);
}

// 参数恒为 WGS84。
function setPos(newLat, newLon) {
  lat = newLat; lon = newLon; selected = true;
  const d = toDisplay(lat, lon);
  marker.setLatLng([d.lat, d.lon]);
  document.getElementById('coords').textContent = '经度 ' + lon.toFixed(6) + '  纬度 ' + lat.toFixed(6);
}

function moveTo(newLat, newLon, zoom) {
  setPos(newLat, newLon);
  const d = toDisplay(lat, lon);
  map.setView([d.lat, d.lon], zoom || 15);
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
  mode = nextMode === 'route' ? 'route' : 'point';
  document.getElementById('pointTab').classList.toggle('active', mode === 'point');
  document.getElementById('routeTab').classList.toggle('active', mode === 'route');
  document.getElementById('routePanel').classList.toggle('show', mode === 'route');
  marker.setOpacity(mode === 'point' ? 1 : 0);
  if (mode === 'route') toast('點擊地圖可依序加入路線節點');
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
  if (routeLine) map.removeLayer(routeLine);
  routeMarkers.forEach(m => map.removeLayer(m));
  routeMarkers = [];
  const display = routePoints.map(p => {
    const d = toDisplay(p[0], p[1]);
    return [d.lat, d.lon];
  });
  if (display.length > 1) routeLine = L.polyline(display, {color:'#007aff',weight:5,opacity:.88}).addTo(map);
  else routeLine = null;
  if (display.length && display.length <= 40) {
    const icon = L.divIcon({className:'route-node',iconSize:[14,14],iconAnchor:[7,7]});
    display.forEach((p, i) => {
      const m = L.marker(p, {icon, draggable:true}).addTo(map);
      m.on('dragend', e => {
        const pos = e.target.getLatLng();
        const w = fromDisplay(pos.lat, pos.lng);
        routePoints[i] = [w.lat, w.lon];
        renderRoute();
      });
      routeMarkers.push(m);
    });
  }
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
  const bounds = routeLine.getBounds();
  map.fitBounds(bounds, {padding:[24,24]});
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
  if (routeLine) map.fitBounds(routeLine.getBounds(), {padding:[24,24]});
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
      renderRoute();
      map.fitBounds(routeLine.getBounds(), {padding:[24,24]});
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
  const percent = pos.total ? Math.min(100, pos.travelled/pos.total*100) : 0;
  document.getElementById('routeProgressBar').style.width = percent.toFixed(2) + '%';
  pauseBtn.disabled = false;
  pauseBtn.textContent = activeRoute.status === 'paused' ? '繼續' : '暫停';
  hint.textContent = (activeRoute.status === 'paused' ? '已暫停 · ' : pos.finished ? '已到達終點 · ' : '移動中 · ') + formatDistance(pos.travelled) + ' / ' + formatDistance(pos.total) + ' · ' + Number(activeRoute.speedKph).toFixed(1) + ' km/h';
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
    el.innerHTML = '<div class="fav-empty">暂无收藏，选好位置后点击「收藏位置」</div>';
    return;
  }
  el.innerHTML = favs.map((f, i) => {
    const isActive = activeLon !== null && Math.abs(f.lon - activeLon) < 0.000001 && Math.abs(f.lat - activeLat) < 0.000001;
    return '<div class="fav-item" onclick="loadFav(' + i + ')">' +
      '<div class="fav-info">' +
        '<div class="fav-name">' + escHtml(f.name) + '<\\/div>' +
        '<div class="fav-coords">' + f.lon.toFixed(6) + ', ' + f.lat.toFixed(6) + '<\\/div>' +
        (isActive ? '<div class="fav-active">\\u2713 当前生效<\\/div>' : '') +
      '<\\/div>' +
      '<button class="fav-del" onclick="event.stopPropagation();delFav(' + i + ')" title="删除">\\u00d7<\\/button>' +
    '<\\/div>';
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function addFav() {
  if (!selected) { toast('请先在地图上选择一个位置'); return; }
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
  if (!name) { toast('请输入备注名称'); return; }
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
  toast('已删除: ' + name);
}

function clearAllFav() {
  if (!confirm('确定清空所有收藏？')) return;
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
  el.textContent = '查询中...';
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
        el.textContent = activeRoute ? '路線模式 · ' + (activeRoute.status === 'paused' ? '已暫停' : '移動中') + ' · ' + Number(activeRoute.speedKph).toFixed(1) + ' km/h' : '经度 ' + activeLon.toFixed(6) + '  纬度 ' + activeLat.toFixed(6) + (d.accuracy ? '  精度 ' + d.accuracy + 'm' : '') + (rr ? '  扰动 ' + rr + 'm' : '');
        document.getElementById('radiusInput').value = rr;
        renderFavs();
      } else {
        activeLon = null; activeLat = null;
        activeRoute = null;
        renderWlocSwitch(false, false);
        el.textContent = '无已保存的坐标';
        renderFavs();
      }
    })
    .catch(() => {
      el.textContent = '查询失败 (需要代理模块支持)';
    });
}

function clearActive() {
  if (!confirm('确定清除设备上已保存的坐标？清除后将使用模块默认参数或停止修改定位。')) return;
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
        toast('已清除设备坐标');
      } else { toast('清除失败: ' + (d.error || ''), 3000); }
    })
    .catch(() => { toast('清除失败 - 请检查模块配置', 3000); });
}

/* ---- Save to device ---- */
async function save() {
  if (!selected) { toast('请先在地图上选择一个位置'); return; }
  const btn = document.getElementById('saveBtn');
  btn.textContent = '储存中...'; btn.disabled = true;
  showError(false);
  try {
    const radius = parseInt(document.getElementById('radiusInput').value) || 0;
    const r = await fetch(SAVE_API + '?lon=' + lon + '&lat=' + lat + '&acc=25&randomRadius=' + radius, {
      method: 'GET', mode: 'cors', cache: 'no-store'
    });
    const d = await r.json();
    if (d.success) {
      activeLon = lon; activeLat = lat;
      renderWlocSwitch(true, true);
      btn.textContent = '\\u2713 已储存'; btn.className = 'btn btn-primary success';
      document.getElementById('status').textContent = '\\u2713 已写入: ' + lon.toFixed(6) + ', ' + lat.toFixed(6) + ' \\u00b7 ' + new Date().toLocaleTimeString('zh-CN');
      document.getElementById('activeValue').textContent = '经度 ' + lon.toFixed(6) + '  纬度 ' + lat.toFixed(6) + '  精度 25m';
      renderFavs();
      toast('\\u2713 坐标已写入设备，下次定位生效');
      setTimeout(() => { btn.textContent='储存到设备'; btn.className='btn btn-primary'; btn.disabled=false; }, 2500);
    } else {
      throw new Error(d.error || '写入失败');
    }
  } catch(e) {
    btn.textContent = '储存到设备'; btn.className = 'btn btn-primary'; btn.disabled = false;
    showError(true);
    toast('\\u2717 储存失败 - 请检查模块配置', 4000);
  }
}

function locateMe() {
  if (!navigator.geolocation) return toast('浏览器不支持定位');
  toast('获取位置中...');
  navigator.geolocation.getCurrentPosition(
    pos => { moveTo(pos.coords.latitude, pos.coords.longitude, 16); toast('已获取当前位置'); },
    err => toast('定位失败: ' + err.message, 3000),
    { enableHighAccuracy:true, timeout:10000 }
  );
}

function parseMapUrl(text) {
  let m;
  m = text.match(/ll=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/@([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  m = text.match(/lnglat=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
  m = text.match(/(?:location|center)=([0-9.-]+),([0-9.-]+)/);
  if (m) return { lat: parseFloat(m[2]), lon: parseFloat(m[1]) };
  m = text.match(/(-?[0-9]+\\.[0-9]+)[,\\s]+(-?[0-9]+\\.[0-9]+)/);
  if (m) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    // 纬度绝对值不超过 90, 经度可达 180: 按绝对值判断谁是经度, 否则
    // -122.009 这类西经会被当成纬度 (-122 < 90 恒成立)。
    if (Math.abs(a) <= 90 && Math.abs(b) > 90) return { lat: a, lon: b };
    if (Math.abs(b) <= 90 && Math.abs(a) > 90) return { lat: b, lon: a };
    return { lat: a, lon: b };
  }
  return null;
}

// 含链接的输入交给服务端 /api/parse: 浏览器读不到跨域 302 的 Location 头, 短链
// 只能由 worker 展开; 服务端还认 coordinate= 并按来源做 GCJ-02->WGS84 换算。
// 纯坐标文本本地直接解析 —— 它也是唯一不需要坐标系换算的输入, 免去一次往返。
async function parseUrl() {
  const input = document.getElementById('urlInput').value.trim();
  if (!input) return toast('请粘贴地图链接或坐标');

  const low = input.toLowerCase();
  if (low.includes('http://') || low.includes('https://')) {
    toast('解析中...');
    let data;
    try {
      const r = await fetch('/api/parse?format=json&u=' + encodeURIComponent(input));
      data = await r.json();
    } catch (e) {
      toast('解析服务不可达', 3000);
      return;
    }
    if (!data || data.error || typeof data.lat !== 'number') {
      toast(data && data.error ? data.error : '无法解析坐标，请检查链接格式', 3000);
      return;
    }
    moveTo(data.lat, data.lon, 15);
    toast(data.name ? '已解析: ' + data.name : '已解析: ' + data.lon.toFixed(4) + ', ' + data.lat.toFixed(4));
    return;
  }

  const result = parseMapUrl(input);
  if (!result) { toast('无法解析坐标，请检查链接格式', 3000); return; }
  moveTo(result.lat, result.lon, 15);
  toast('已解析: ' + result.lon.toFixed(4) + ', ' + result.lat.toFixed(4));
}

async function searchPlace() {
  const q = document.getElementById('searchInput').value.trim();
  if (!q) return toast('请输入地名');
  toast('搜索中...');
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q));
    const results = await r.json();
    if (!results.length) { toast('未找到: ' + q, 3000); return; }
    const p = results[0];
    moveTo(parseFloat(p.lat), parseFloat(p.lon), 15);
    toast(p.display_name.slice(0, 40));
  } catch(e) { toast('搜索失败', 3000); }
}

document.addEventListener('paste', e => {
  const text = (e.clipboardData||window.clipboardData).getData('text');
  if (!text) return;
  if (!(text.includes('map') || text.includes('loc') || text.includes('lnglat') || /[0-9]+\\.[0-9]+/.test(text))) return;
  const input = document.getElementById('urlInput');
  // 粘贴目标本来就是这个输入框时, 让浏览器原生插入即可; 此处再赋一次值,
  // 原生插入会叠加在后面, 结果是同一段文本出现两遍。
  if (e.target !== input) input.value = text;
  setTimeout(parseUrl, 200);
});
document.getElementById('searchInput').addEventListener('keydown', e => { if(e.key==='Enter') searchPlace(); });
document.getElementById('urlInput').addEventListener('keydown', e => { if(e.key==='Enter') parseUrl(); });
document.getElementById('favNameInput').addEventListener('keydown', e => { if(e.key==='Enter') confirmFav(); });
document.getElementById('routeNameInput').addEventListener('keydown', e => { if(e.key==='Enter') confirmSaveRoute(); });

renderFavs();
renderSavedRoutes();
queryActive();
<\/script>
</body>
</html>`;
}
