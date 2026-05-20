<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Electricity Theft Detection</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#060612;
  color:#fff;min-height:100vh}
.bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;
  background:
    radial-gradient(ellipse at 20% 50%,
      rgba(0,100,255,.06) 0%,transparent 50%),
    radial-gradient(ellipse at 80% 30%,
      rgba(255,0,80,.04) 0%,transparent 50%)}
.wr{position:relative;z-index:1;padding:10px;
  max-width:960px;margin:0 auto}
.hd{text-align:center;padding:18px 8px 10px}
.hd h1{font-size:1.6em;font-weight:800;margin-bottom:4px}
.meter-badge{display:inline-block;
  background:rgba(0,210,255,.08);
  border:1px solid rgba(0,210,255,.2);
  color:#00d2ff;padding:4px 14px;border-radius:20px;
  font-size:.82em;font-weight:700;
  letter-spacing:1px;margin:6px 4px}
.cloud-badge{display:inline-block;
  background:rgba(0,255,136,.06);
  border:1px solid rgba(0,255,136,.15);
  color:#00ff88;padding:4px 12px;
  border-radius:20px;font-size:.75em;margin:6px 4px}
.dot{display:inline-block;width:7px;height:7px;
  border-radius:50%;margin-right:5px;
  animation:bl 1.5s infinite}
.dot-g{background:#00ff88}
.dot-r{background:#ff4444}
.dot-y{background:#f5a623}
@keyframes bl{0%,100%{opacity:1}50%{opacity:.3}}
.cs{display:flex;align-items:center;justify-content:center;
  gap:14px;margin:6px 0;font-size:.75em;
  color:#4a5a7a;flex-wrap:wrap}
.ci{display:flex;align-items:center;gap:4px}
.sb{color:#4a5a7a;font-size:.8em;margin-top:4px}
.banner{padding:16px;border-radius:12px;margin:10px 0;
  text-align:center;font-weight:700;
  font-size:1em;transition:all .5s}
.b-safe{background:rgba(0,255,136,.08);
  border:1px solid rgba(0,255,136,.2);color:#00ff88}
.b-warn{background:rgba(245,166,35,.08);
  border:1px solid rgba(245,166,35,.2);
  color:#f5a623;animation:pw 2s infinite}
.b-theft{background:rgba(255,50,50,.12);
  border:2px solid rgba(255,50,50,.4);
  color:#ff4444;animation:pt 1s infinite}
.b-off{background:rgba(80,80,100,.08);
  border:1px solid rgba(80,80,100,.2);color:#6a7a9a}
@keyframes pw{0%,100%{opacity:1}50%{opacity:.7}}
@keyframes pt{
  0%,100%{opacity:1;box-shadow:0 0 20px rgba(255,0,0,.3)}
  50%{opacity:.8;box-shadow:0 0 40px rgba(255,0,0,.5)}}
.banner .big{font-size:1.8em;display:block;margin:5px 0}
.ob{display:none;background:rgba(255,80,80,.08);
  border:1px solid rgba(255,80,80,.2);
  border-radius:8px;padding:8px 14px;
  text-align:center;font-size:.8em;
  color:#ff6b6b;margin:6px 0}
.ob.show{display:block}
.sb2{background:rgba(245,166,35,.08);
  border:1px solid rgba(245,166,35,.2);
  border-radius:8px;padding:10px 14px;
  text-align:center;font-size:.82em;
  color:#f5a623;margin:8px 0;display:none}
.sb2.show{display:block}
.gauges{display:flex;justify-content:center;
  gap:20px;margin:15px 0;flex-wrap:wrap}
.gb{text-align:center;flex:1;min-width:200px;max-width:300px;
  background:rgba(255,255,255,.02);
  border:1px solid rgba(255,255,255,.05);
  border-radius:14px;padding:15px}
.gb h3{font-size:.75em;color:#4a5a7a;
  text-transform:uppercase;
  letter-spacing:1.5px;margin-bottom:8px}
.gb .gv{font-size:2.4em;font-weight:800}
.gb .gu{font-size:.35em;color:#4a5a7a;font-weight:400}
.g-tx{border-color:rgba(0,210,255,.15)}.g-tx .gv{color:#00d2ff}
.g-rx{border-color:rgba(0,255,136,.15)}.g-rx .gv{color:#00ff88}
.g-df{border-color:rgba(255,107,107,.15)}.g-df .gv{color:#ff6b6b}
.gb-bar{height:6px;border-radius:3px;
  background:rgba(255,255,255,.05);
  margin-top:10px;overflow:hidden}
.gb-fill{height:100%;border-radius:3px;transition:width .5s}
.b-tx{background:linear-gradient(90deg,#00d2ff,#0088ff)}
.b-rx{background:linear-gradient(90deg,#00ff88,#00cc6a)}
.b-df{background:linear-gradient(90deg,#f5a623,#ff6b6b)}
.g{display:grid;grid-template-columns:repeat(4,1fr);
  gap:10px;margin:14px 0}
.cd{background:rgba(255,255,255,.025);
  border:1px solid rgba(255,255,255,.05);
  border-radius:12px;padding:14px 10px;
  text-align:center;transition:all .3s;
  position:relative;overflow:hidden}
.cd::before{content:'';position:absolute;
  top:0;left:0;right:0;height:2px}
.cd:nth-child(1)::before{background:#00d2ff}
.cd:nth-child(2)::before{background:#00ff88}
.cd:nth-child(3)::before{background:#ff6b6b}
.cd:nth-child(4)::before{background:#f5a623}
.cd:nth-child(5)::before{background:#bd93f9}
.cd:nth-child(6)::before{background:#ff79c6}
.cd:nth-child(7)::before{background:#00d2ff}
.cd:nth-child(8)::before{background:#ff6b6b}
.cd:hover{transform:translateY(-2px);
  box-shadow:0 5px 20px rgba(0,0,0,.25)}
.cd .lb{font-size:.62em;color:#4a5a7a;
  text-transform:uppercase;
  letter-spacing:1px;margin-bottom:5px}
.cd .vl{font-size:1.5em;font-weight:700}
.cd .vl .sm{font-size:.38em;color:#4a5a7a;font-weight:400}
.v1{color:#00d2ff}.v2{color:#00ff88}.v3{color:#ff6b6b}
.v4{color:#f5a623}.v5{color:#bd93f9}.v6{color:#ff79c6}
.v7{color:#00d2ff}.v8{color:#ff6b6b}
.td-box{background:rgba(255,50,50,.05);
  border:1px solid rgba(255,50,50,.12);
  border-radius:12px;padding:15px;
  margin:12px 0;display:none}
.td-box.show{display:block}
.td-box h3{color:#ff6b6b;font-size:.85em;
  margin-bottom:10px;text-transform:uppercase;
  letter-spacing:1px}
.td-grid{display:grid;
  grid-template-columns:repeat(3,1fr);gap:10px}
.td-item{text-align:center;padding:10px;
  background:rgba(0,0,0,.2);border-radius:8px}
.td-item .tv{font-size:1.6em;font-weight:700;color:#ff6b6b}
.td-item .tl{font-size:.7em;color:#5a6a8a;margin-top:3px}
.cb{background:rgba(255,255,255,.02);
  border:1px solid rgba(255,255,255,.05);
  border-radius:12px;padding:14px;margin:12px 0}
.cb .lb{font-size:.7em;color:#4a5a7a;
  text-transform:uppercase;
  letter-spacing:1.5px;margin-bottom:8px}
.ca{width:100%;height:220px;
  background:rgba(0,0,0,.2);
  border-radius:8px;overflow:hidden}
canvas{width:100%!important;height:100%!important}
.legend{display:flex;gap:15px;justify-content:center;
  margin-top:8px;font-size:.75em}
.li{display:flex;align-items:center;gap:4px;color:#5a6a8a}
.ld{width:10px;height:3px;border-radius:2px}
.ld-tx{background:#00d2ff}
.ld-rx{background:#00ff88}
.ld-df{background:#ff6b6b}
.log{background:rgba(0,0,0,.2);
  border:1px solid rgba(255,255,255,.05);
  border-radius:10px;padding:12px;margin:12px 0;
  max-height:160px;overflow-y:auto;
  font-family:monospace;font-size:.75em;
  color:#5a6a8a;line-height:1.8}
.log .lt{color:#ff6b6b}
.log .lo{color:#00ff88}
.log .lw{color:#f5a623}
.log .li2{color:#00d2ff}
.bt{display:flex;gap:8px;justify-content:center;
  margin:14px 0;flex-wrap:wrap}
.bn{padding:9px 18px;border-radius:8px;cursor:pointer;
  font-size:.82em;font-weight:600;
  border:1px solid rgba(0,210,255,.25);
  background:rgba(0,210,255,.06);
  color:#00d2ff;transition:all .3s}
.bn:hover{background:rgba(0,210,255,.15);transform:scale(1.03)}
.bn:active{transform:scale(.97)}
.b-r{border-color:rgba(255,80,80,.25);
  background:rgba(255,80,80,.06);color:#ff6b6b}
.b-r:hover{background:rgba(255,80,80,.15)}
.b-g{border-color:rgba(0,255,136,.25);
  background:rgba(0,255,136,.06);color:#00ff88}
.b-g:hover{background:rgba(0,255,136,.15)}
.b-y{border-color:rgba(245,166,35,.25);
  background:rgba(245,166,35,.06);color:#f5a623}
.b-y:hover{background:rgba(245,166,35,.15)}
.sp{background:rgba(255,255,255,.02);
  border:1px solid rgba(255,255,255,.05);
  border-radius:12px;padding:16px;
  margin:12px 0;display:none}
.sp.show{display:block}
.sp h3{font-size:.85em;color:#00d2ff;
  margin-bottom:14px;text-transform:uppercase;
  letter-spacing:1.5px}
.ss{margin-bottom:14px;padding-bottom:12px;
  border-bottom:1px solid rgba(255,255,255,.04)}
.ss:last-child{border-bottom:none;margin-bottom:0}
.ss h4{font-size:.72em;color:#5a6a8a;
  margin-bottom:8px;text-transform:uppercase;
  letter-spacing:1px}
.sr{display:flex;align-items:center;
  justify-content:space-between;
  padding:7px 0;font-size:.85em}
.sr label{color:#8892b0;flex:1}
.sr input,.sr select{
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);
  color:#fff;padding:6px 10px;
  border-radius:6px;width:200px;
  font-size:.88em;outline:none}
.sr input:focus,.sr select:focus{
  border-color:rgba(0,210,255,.4)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chip{padding:5px 12px;border-radius:16px;
  font-size:.78em;cursor:pointer;
  border:1px solid rgba(0,210,255,.2);
  background:rgba(0,210,255,.05);
  color:#00d2ff;transition:all .2s}
.chip:hover{background:rgba(0,210,255,.15)}
.chip.active{background:rgba(0,210,255,.2);
  border-color:#00d2ff;font-weight:700}
.ft{display:flex;flex-wrap:wrap;gap:6px;
  justify-content:center;padding:10px;
  color:#3a4a6a;font-size:.7em;
  border-top:1px solid rgba(255,255,255,.03);
  margin-top:10px}
.ft span{color:#5a6a8a}
.toast{position:fixed;top:15px;left:50%;
  transform:translateX(-50%) translateY(-100px);
  background:rgba(0,180,255,.12);
  border:1px solid rgba(0,180,255,.25);
  backdrop-filter:blur(15px);
  padding:10px 22px;border-radius:10px;
  color:#00d2ff;font-size:.85em;font-weight:600;
  transition:transform .4s cubic-bezier(.68,-.55,.27,1.55);
  z-index:999}
.toast.show{transform:translateX(-50%) translateY(0)}
.tr{background:rgba(255,50,50,.12);
  border-color:rgba(255,50,50,.25);color:#ff6b6b}
.tg{background:rgba(0,255,136,.12);
  border-color:rgba(0,255,136,.25);color:#00ff88}
.ty{background:rgba(245,166,35,.12);
  border-color:rgba(245,166,35,.25);color:#f5a623}
@media(max-width:600px){
  .g{grid-template-columns:repeat(2,1fr)}
  .gauges{flex-direction:column;align-items:center}
  .td-grid{grid-template-columns:repeat(2,1fr)}
  .hd h1{font-size:1.3em}
  .cs{gap:8px}
  .sr{flex-direction:column;align-items:flex-start;gap:5px}
  .sr input,.sr select{width:100%}
}
</style>
</head>
<body>
<div class="bg"></div>
<div class="wr">

<!-- HEADER -->
<div class="hd">
  <h1>🔒 Electricity Theft Detection</h1>
  <div>
    <span class="meter-badge">
      ⚡ Meter: <span id="meterName">---</span>
    </span>
    <span class="cloud-badge">☁️ Firebase Live</span>
  </div>
  <div class="cs">
    <div class="ci">
      <span class="dot dot-y" id="dot"></span>
      <span id="connTxt">Connecting...</span>
    </div>
    <div class="ci">🕐 <span id="lastUp">--:--:--</span></div>
    <div class="ci">
      ☁️ <span id="fbTxt" style="color:#f5a623">Connecting</span>
    </div>
    <div class="ci">📶 <span id="ping">--</span>ms</div>
  </div>
  <div class="sb">
    12V DC &bull; TX:ACS712-5A &bull;
    RX:ACS712-30A (Energy Meter) &bull; Firebase RT
  </div>
</div>

<!-- SETUP BAR -->
<div class="sb2" id="setupBar">
  ⚙️ Firebase not configured —
  <b style="cursor:pointer;text-decoration:underline"
     onclick="openSettings()">Open Settings</b>
  and enter your Firebase URL
</div>

<!-- OFFLINE BAR -->
<div class="ob" id="offBar">
  ⚠️ Connection lost — retrying...
  Last data: <span id="offTime">--</span>
</div>

<!-- BANNER -->
<div id="banner" class="banner b-off">
  ☁️ Connecting to Firebase...
</div>

<!-- GAUGES -->
<div class="gauges">
  <div class="gb g-tx">
    <h3>📤 TX Side (Source · 5A)</h3>
    <div class="gv"><span id="txA">0.00</span>
      <span class="gu"> A</span></div>
    <div style="color:#4a5a7a;font-size:.75em;margin-top:3px">
      <span id="txW">0.0</span> W
    </div>
    <div class="gb-bar">
      <div class="gb-fill b-tx" id="txBar"
           style="width:0%"></div>
    </div>
  </div>
  <div class="gb g-df">
    <h3>⚠️ Difference (Loss)</h3>
    <div class="gv"><span id="dfA">0.00</span>
      <span class="gu"> A</span></div>
    <div style="color:#4a5a7a;font-size:.75em;margin-top:3px">
      <span id="dfP">0.0</span>% loss
    </div>
    <div class="gb-bar">
      <div class="gb-fill b-df" id="dfBar"
           style="width:0%"></div>
    </div>
  </div>
  <div class="gb g-rx">
    <h3>📥 <span id="rxLabel">Energy Meter · 30A</span></h3>
    <div class="gv"><span id="rxA">0.00</span>
      <span class="gu"> A</span></div>
    <div style="color:#4a5a7a;font-size:.75em;margin-top:3px">
      <span id="rxW">0.0</span> W
    </div>
    <div class="gb-bar">
      <div class="gb-fill b-rx" id="rxBar"
           style="width:0%"></div>
    </div>
  </div>
</div>

<!-- THEFT DETAIL -->
<div id="tdBox" class="td-box">
  <h3>🚨 Theft Detected at
    <span id="tdMeter">---</span>
  </h3>
  <div class="td-grid">
    <div class="td-item">
      <div class="tv" id="tdA">0.00</div>
      <div class="tl">Amps Stolen</div>
    </div>
    <div class="td-item">
      <div class="tv" id="tdW">0.0</div>
      <div class="tl">Watts Lost</div>
    </div>
    <div class="td-item">
      <div class="tv" id="tdP">0.0%</div>
      <div class="tl">Loss %</div>
    </div>
    <div class="td-item">
      <div class="tv" id="tdE">0.000</div>
      <div class="tl">Total Wh Stolen</div>
    </div>
    <div class="td-item">
      <div class="tv" id="tdD">0s</div>
      <div class="tl">Duration</div>
    </div>
    <div class="td-item">
      <div class="tv" id="tdAl">0</div>
      <div class="tl">Total Alerts</div>
    </div>
  </div>
</div>

<!-- STATS GRID -->
<div class="g">
  <div class="cd">
    <div class="lb">TX Power</div>
    <div class="vl v1">
      <span id="txPow">0.0</span>
      <span class="sm"> W</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">Meter Power</div>
    <div class="vl v2">
      <span id="rxPow">0.0</span>
      <span class="sm"> W</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">Power Loss</div>
    <div class="vl v3">
      <span id="powLoss">0.0</span>
      <span class="sm"> W</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">Efficiency</div>
    <div class="vl v4">
      <span id="eff">---</span>
      <span class="sm"> %</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">TX Peak</div>
    <div class="vl v5">
      <span id="txPk">0.00</span>
      <span class="sm"> A</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">Meter Peak</div>
    <div class="vl v6">
      <span id="rxPk">0.00</span>
      <span class="sm"> A</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">System Voltage</div>
    <div class="vl v7">12.0
      <span class="sm"> V DC</span>
    </div>
  </div>
  <div class="cd">
    <div class="lb">Status</div>
    <div class="vl" id="stTxt"
         style="color:#f5a623;font-size:1.1em">
      WAIT ⏳
    </div>
  </div>
</div>

<!-- CHART -->
<div class="cb">
  <div class="lb">
    📈 TX vs Energy Meter — Real-time (Firebase)
  </div>
  <div class="ca"><canvas id="ch"></canvas></div>
  <div class="legend">
    <div class="li">
      <div class="ld ld-tx"></div>TX Source
    </div>
    <div class="li">
      <div class="ld ld-rx"></div>Energy Meter
    </div>
    <div class="li">
      <div class="ld ld-df"></div>Difference
    </div>
  </div>
</div>

<!-- LOG -->
<div class="cb">
  <div class="lb">📋 Event Log</div>
  <div class="log" id="logBox">
    <div class="li2">Dashboard loaded — Connecting...</div>
  </div>
</div>

<!-- BUTTONS -->
<div class="bt">
  <button class="bn"   onclick="toggleSP()">⚙️ Settings</button>
  <button class="bn"   onclick="tog()">
    <span id="pl">⏸ Pause</span>
  </button>
  <button class="bn b-g" onclick="refresh()">🔄 Refresh</button>
  <button class="bn b-r" onclick="clearLog()">🗑️ Clear Log</button>
</div>

<!-- SETTINGS PANEL -->
<div id="sp" class="sp">
  <h3>⚙️ Settings</h3>

  <!-- Firebase -->
  <div class="ss">
    <h4>🔥 Firebase</h4>
    <div class="sr">
      <label>Database URL</label>
      <input type="text" id="fbURL"
        placeholder="https://xxx-default-rtdb.firebaseio.com">
    </div>
    <div class="sr">
      <label>Secret Key</label>
      <input type="password" id="fbSecret"
        placeholder="Your secret key">
    </div>
    <div class="sr">
      <label></label>
      <button class="bn b-g" onclick="saveFB()"
              style="width:160px;padding:7px">
        💾 Save &amp; Connect
      </button>
    </div>
    <div class="sr" style="font-size:.78em">
      <label>Status</label>
      <span id="fbSt" style="color:#5a6a8a">
        Not configured
      </span>
    </div>
  </div>

  <!-- Meter -->
  <div class="ss">
    <h4>⚡ Meter</h4>
    <div class="sr">
      <label>Meter ID</label>
      <input type="text" id="meterID"
        placeholder="e.g. METER-001" maxlength="20">
    </div>
    <div style="padding:6px 0">
      <div style="font-size:.75em;color:#5a6a8a;
                  margin-bottom:6px">Quick:</div>
      <div class="chips" id="chips">
        <div class="chip active"
             onclick="qm('METER-001')">METER-001</div>
        <div class="chip"
             onclick="qm('METER-002')">METER-002</div>
        <div class="chip"
             onclick="qm('METER-003')">METER-003</div>
        <div class="chip"
             onclick="qm('ZONE-A-M1')">ZONE-A-M1</div>
        <div class="chip"
             onclick="qm('ZONE-B-M1')">ZONE-B-M1</div>
      </div>
    </div>
    <div class="sr">
      <label></label>
      <button class="bn b-g" onclick="swMeter()"
              style="width:160px;padding:7px">
        🔄 Switch Meter
      </button>
    </div>
  </div>

  <!-- Alerts -->
  <div class="ss">
    <h4>🔔 Alerts</h4>
    <div class="sr">
      <label>Theft Threshold (%)</label>
      <input type="number" id="thPct"
             value="15" min="5" max="50">
    </div>
    <div class="sr">
      <label>Warning Threshold (%)</label>
      <input type="number" id="wnPct"
             value="8" min="3" max="30">
    </div>
    <div class="sr">
      <label>Sound Alert</label>
      <select id="sndOn">
        <option value="1">Enabled</option>
        <option value="0">Disabled</option>
      </select>
    </div>
    <div class="sr">
      <label></label>
      <button class="bn" onclick="saveAlerts()"
              style="width:160px;padding:7px">
        💾 Save
      </button>
    </div>
  </div>

  <!-- Refresh -->
  <div class="ss">
    <h4>🔄 Refresh Rate</h4>
    <div class="sr">
      <label>Interval</label>
      <select id="refMs">
        <option value="1000">1 second</option>
        <option value="2000" selected>2 seconds</option>
        <option value="5000">5 seconds</option>
        <option value="10000">10 seconds</option>
      </select>
    </div>
    <div class="sr">
      <label></label>
      <button class="bn" onclick="saveRef()"
              style="width:160px;padding:7px">
        💾 Apply
      </button>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="ft">
  TX:<span>ACS712-5A</span>&nbsp;|&nbsp;
  RX:<span>ACS712-30A</span>&nbsp;|&nbsp;
  Meter:<span id="ftM">---</span>&nbsp;|&nbsp;
  Threshold:<span id="ftT">15%</span>&nbsp;|&nbsp;
  Refresh:<span id="ftR">2s</span>&nbsp;|&nbsp;
  Uptime:<span id="ut">--</span>
</div>

</div>
<div id="toast" class="toast"></div>
<script src="app.js"></script>
</body>
</html>