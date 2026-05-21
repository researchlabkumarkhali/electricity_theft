// ============================================================
//  THEFT DETECTION DASHBOARD
//  Project: electricity-theft-global
//  Firebase Region: asia-southeast1
// ============================================================

// ── FIREBASE CONFIG ──────────────────────────────────────────
// Your actual Firebase credentials — hardcoded
const FIREBASE_CONFIG = {
  apiKey     : "AIzaSyAjK-vMFWR9nIqB773z4PZ5-W534eMe8EU",
  authDomain : "electricity-theft-global.firebaseapp.com",
  databaseURL: "https://electricity-theft-global-default-rtdb" +
               ".asia-southeast1.firebasedatabase.app",
  projectId  : "electricity-theft-global",
  appId      : "1:397589064142:web:f9082342e1472aa89fa39f"
};

// Firebase REST API base URL
const FB_BASE =
  "https://electricity-theft-global-default-rtdb" +
  ".asia-southeast1.firebasedatabase.app";

// Firebase API Key for auth
const FB_KEY = "AIzaSyAjK-vMFWR9nIqB773z4PZ5-W534eMe8EU";

// Build fetch URL for a meter
function fbURL(meterID) {
  return `${FB_BASE}/meters/${meterID}.json?auth=${FB_KEY}`;
}

// ── USER SETTINGS (from localStorage) ───────────────────────
const C = {
  meterID : ls("meterID") || "METER-001",
  refMs   : +ls("refMs")  || 2000,
  thPct   : +ls("thPct")  || 15,
  wnPct   : +ls("wnPct")  || 8,
  sndOn   : ls("sndOn")   !== "0",
};

// ── CHART DATA ───────────────────────────────────────────────
const N = 100;
let txH = new Array(N).fill(0);
let rxH = new Array(N).fill(0);
let dfH = new Array(N).fill(0);

// ── STATE ────────────────────────────────────────────────────
let paused    = false;
let fails     = 0;
let prevTheft = false;
let timer     = null;
let lastData  = null;
let updates   = 0;

// ── BOOT ────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  loadUI();
  setMeterUI(C.meterID);
  log("Dashboard ready — Project: electricity-theft-global",
      "i");
  log("Firebase Region: asia-southeast1", "i");
  log("Watching meter: " + C.meterID, "i");
  startTimer();
});

// ── START TIMER ──────────────────────────────────────────────
function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(pull, C.refMs);
  pull();
}

// ── FETCH FROM FIREBASE ──────────────────────────────────────
async function pull() {
  if (paused) return;

  const url = fbURL(C.meterID);
  const t0  = Date.now();

  try {
    const res  = await fetch(url, { cache: "no-store" });
    const ping = Date.now() - t0;
    setText("ping", ping);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const d = await res.json();

    if (!d || typeof d !== "object") {
      setConn("wait");
      setBanner("off",
        `⏳ Firebase connected — waiting for ESP32 ` +
        `data on meter <b>${C.meterID}</b>`);
      return;
    }

    fails    = 0;
    lastData = new Date();
    updates++;
    id("offBar").classList.remove("show");
    setConn("on");
    render(d);

  } catch (e) {
    fails++;
    console.error("[Firebase]", e.message);
    setConn("err", e.message);

    if (fails >= 3) {
      id("offBar").classList.add("show");
      setText("offTime",
        lastData ? lastData.toLocaleTimeString() : "Never");
      if (fails === 3)
        log("Firebase error: " + e.message, "w");
    }
  }
}

// ── CONNECTION UI ────────────────────────────────────────────
function setConn(state, msg) {
  const dot  = id("dot");
  const conn = id("connTxt");
  const fbt  = id("fbTxt");

  switch (state) {
    case "on":
      dot.className    = "dot dot-g";
      conn.textContent = `Live ✓ (${updates} updates)`;
      fbt.textContent  = "Connected ✓";
      fbt.style.color  = "#00ff88";
      setText("lastUp", new Date().toLocaleTimeString());
      break;
    case "err":
      dot.className    = "dot dot-r";
      conn.textContent = `Error (${fails} fails)`;
      fbt.textContent  = "FAILED";
      fbt.style.color  = "#ff6b6b";
      if (fails >= 3)
        setBanner("off",
          "⚠️ Firebase connection lost — retrying...");
      break;
    case "wait":
      dot.className    = "dot dot-y";
      conn.textContent = "Connected — no ESP32 data yet";
      fbt.textContent  = "No Data Yet";
      fbt.style.color  = "#f5a623";
      break;
  }
}

// ── SET BANNER ───────────────────────────────────────────────
function setBanner(type, html) {
  const el = id("banner");
  el.className = "banner b-" + type;
  el.innerHTML = html;
}

// ── RENDER DATA ──────────────────────────────────────────────
function render(d) {
  const tx      = sf(d.tx);
  const rx      = sf(d.rx);
  const txpk    = sf(d.txpeak);
  const rxpk    = sf(d.rxpeak);
  const lossA   = sf(d.lossamps);
  const lossW   = sf(d.losswatts);
  const lossP   = sf(d.losspct);
  const energy  = sf(d.energylost);
  const alerts  = si(d.alerts);
  const ttime   = si(d.thefttime);
  const uptime  = si(d.uptime);
  const mname   = d.metername || C.meterID;
  const theft   = d.theft === true || d.theft === "true";

  if (mname !== C.meterID) setMeterUI(mname);

  let diff = tx - rx;
  let pct  = tx > 0.5 ? (diff / tx * 100) : 0;
  if (diff < 0) diff = 0;
  if (pct  < 0) pct  = 0;

  // ── Gauges ───────────────────────────────────────────
  setText("txA", tx.toFixed(2));
  setText("rxA", rx.toFixed(2));
  setText("txW", (tx * 12).toFixed(1));
  setText("rxW", (rx * 12).toFixed(1));
  setText("dfA", diff.toFixed(2));
  setText("dfP", pct.toFixed(1));

  const mx = Math.max(tx, rx, 0.1);
  setBar("txBar", (tx   / mx) * 100);
  setBar("rxBar", (rx   / mx) * 100);
  setBar("dfBar", Math.min((pct / 50) * 100, 100));

  // ── Stats ────────────────────────────────────────────
  setText("txPow",   (tx * 12).toFixed(1));
  setText("rxPow",   (rx * 12).toFixed(1));
  setText("powLoss", (diff * 12).toFixed(1));
  setText("txPk",    txpk.toFixed(2));
  setText("rxPk",    rxpk.toFixed(2));
  let eff = tx > 0.5
    ? Math.min(100, Math.max(0, (rx / tx) * 100))
    : 100;
  setText("eff", eff.toFixed(1));

  // ── Uptime ───────────────────────────────────────────
  const s = Math.floor(uptime / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  setText("ut", `${h}h ${m % 60}m ${s % 60}s`);

  // ── Status + Banner ───────────────────────────────────
  const st  = id("stTxt");
  const tdB = id("tdBox");

  if (theft) {
    setBanner("theft",
      `🚨 THEFT DETECTED at <b>${C.meterID}</b>!` +
      `<span class="big">` +
      `${lossA.toFixed(2)}A STOLEN ` +
      `(${lossP.toFixed(1)}%)</span>` +
      `${lossW.toFixed(1)}W being lost right now!`);
    st.style.color = "#ff6b6b";
    st.innerHTML   = "THEFT 🚨";
    tdB.classList.add("show");

    setText("tdA",  lossA.toFixed(2));
    setText("tdW",  lossW.toFixed(1));
    setText("tdP",  lossP.toFixed(1) + "%");
    setText("tdE",  energy.toFixed(3));
    setText("tdAl", alerts);
    setText("tdMeter", C.meterID);

    const ts = Math.floor(ttime / 1000);
    const tm = Math.floor(ts / 60);
    setText("tdD",
      tm > 0 ? `${tm}m ${ts % 60}s` : `${ts}s`);

    if (!prevTheft) {
      log(
        `🚨 THEFT at ${C.meterID}! ` +
        `${lossA.toFixed(2)}A ` +
        `(${lossP.toFixed(1)}%) ` +
        `${lossW.toFixed(1)}W`,
        "t"
      );
      toast(`🚨 THEFT at ${C.meterID}!`, 5000, "r");
      playSound();
    }

  } else if (tx > 0.5 && pct > C.wnPct) {
    setBanner("warn",
      `⚠️ SUSPICIOUS at <b>${C.meterID}</b> — ` +
      `${pct.toFixed(1)}% difference detected`);
    st.style.color = "#f5a623";
    st.innerHTML   = "WATCH ⚠️";
    tdB.classList.remove("show");
    if (prevTheft) {
      log(`✅ Cleared at ${C.meterID}`, "o");
      toast("✅ Back to normal", 3000, "g");
    }

  } else {
    setBanner("safe",
      `✅ SYSTEM NORMAL — <b>${C.meterID}</b> — No theft`);
    st.style.color = "#00ff88";
    st.innerHTML   = "SAFE ✅";
    tdB.classList.remove("show");
    if (prevTheft) {
      log(`✅ Cleared at ${C.meterID}`, "o");
      toast("✅ Back to normal", 3000, "g");
    }
  }

  prevTheft = theft;

  // ── Chart ────────────────────────────────────────────
  txH.push(tx); rxH.push(rx); dfH.push(diff);
  if (txH.length > N) txH.shift();
  if (rxH.length > N) rxH.shift();
  if (dfH.length > N) dfH.shift();
  chart();
}

// ── DRAW CHART ───────────────────────────────────────────────
function chart() {
  const cv = id("ch");
  const cx = cv.getContext("2d");
  const pr = cv.parentElement.getBoundingClientRect();
  cv.width  = pr.width;
  cv.height = pr.height;

  const W  = cv.width, H = cv.height;
  const p  = { l: 44, r: 12, t: 14, b: 20 };
  const cw = W - p.l - p.r;
  const ch = H - p.t - p.b;

  cx.clearRect(0, 0, W, H);

  let mx = Math.max(...txH, ...rxH, 1);
  mx = Math.ceil(mx * 1.3);

  cx.font = "9px sans-serif";
  cx.textAlign = "right";
  for (let i = 0; i <= 5; i++) {
    const y = p.t + ch * i / 5;
    const v = mx - mx * i / 5;
    cx.strokeStyle = "rgba(255,255,255,.04)";
    cx.lineWidth   = 1;
    cx.beginPath();
    cx.moveTo(p.l, y);
    cx.lineTo(W - p.r, y);
    cx.stroke();
    cx.fillStyle = "#3a4a6a";
    cx.fillText(v.toFixed(1), p.l - 5, y + 3);
  }

  function ln(arr, col, lw) {
    if (!arr.length) return;
    cx.strokeStyle = col;
    cx.lineWidth   = lw;
    cx.lineJoin    = "round";
    cx.lineCap     = "round";
    cx.beginPath();
    const step = cw / (N - 1);
    arr.forEach((v, i) => {
      const x = p.l + i * step;
      const y = p.t + ch *
        Math.max(0, Math.min(1, 1 - v / mx));
      i === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    });
    cx.stroke();
  }

  // Fill under diff area
  const step = cw / (N - 1), by = p.t + ch;
  cx.beginPath();
  cx.moveTo(p.l, by);
  dfH.forEach((v, i) => {
    cx.lineTo(
      p.l + i * step,
      p.t + ch * Math.max(0, Math.min(1,
        1 - Math.max(0, v) / mx))
    );
  });
  cx.lineTo(p.l + (dfH.length - 1) * step, by);
  cx.closePath();
  cx.fillStyle = "rgba(255,107,107,.1)";
  cx.fill();

  ln(txH, "#00d2ff",              2.5);
  ln(rxH, "#00ff88",              2.5);
  ln(dfH, "rgba(255,107,107,.7)", 1.8);
}

// ── METER UI ─────────────────────────────────────────────────
function setMeterUI(name) {
  C.meterID = name;
  setText("meterName",  name);
  setText("tdMeter",    name);
  setText("ftM",        name);
  id("rxLabel").textContent =
    `${name} · Energy Meter (30A)`;
  id("meterID").value = name;
  document.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("active",
      c.textContent.trim() === name);
  });
}

// ── SETTINGS ─────────────────────────────────────────────────
function loadUI() {
  id("meterID").value = C.meterID;
  id("thPct").value   = C.thPct;
  id("wnPct").value   = C.wnPct;
  id("sndOn").value   = C.sndOn ? "1" : "0";
  id("refMs").value   = C.refMs;
  setText("ftT",  C.thPct + "%");
  setText("ftR",  C.refMs / 1000 + "s");
  setText("ftM",  C.meterID);
}

function swMeter() {
  const n = id("meterID").value.trim();
  if (!n) { toast("❌ Enter meter ID", 2000, "r"); return; }
  lss("meterID", n);
  setMeterUI(n);
  txH = new Array(N).fill(0);
  rxH = new Array(N).fill(0);
  dfH = new Array(N).fill(0);
  prevTheft = false;
  updates   = 0;
  log("Switched to " + n, "i");
  toast("🔄 Watching: " + n);
  pull();
}

function qm(n) {
  id("meterID").value = n;
  swMeter();
}

function saveAlerts() {
  C.thPct = +id("thPct").value || 15;
  C.wnPct = +id("wnPct").value || 8;
  C.sndOn = id("sndOn").value === "1";
  lss("thPct", C.thPct);
  lss("wnPct", C.wnPct);
  lss("sndOn", C.sndOn ? "1" : "0");
  setText("ftT", C.thPct + "%");
  toast("✅ Saved", 2000, "g");
  log("Alert settings saved", "i");
}

function saveRef() {
  C.refMs = +id("refMs").value || 2000;
  lss("refMs", C.refMs);
  setText("ftR", C.refMs / 1000 + "s");
  startTimer();
  toast("✅ Refresh: " + C.refMs / 1000 + "s", 2000, "g");
}

function openSettings() {
  id("sp").classList.add("show");
  id("sp").scrollIntoView({ behavior: "smooth" });
}

function toggleSP() {
  id("sp").classList.toggle("show");
}

// ── CONTROLS ─────────────────────────────────────────────────
function tog() {
  paused = !paused;
  id("pl").textContent = paused ? "▶ Resume" : "⏸ Pause";
  toast(paused ? "⏸ Paused" : "▶ Resumed");
  if (!paused) pull();
}

function refresh() {
  toast("🔄 Refreshing...");
  pull();
}

function clearLog() {
  id("logBox").innerHTML =
    `<div class="li2">Log cleared — ` +
    new Date().toLocaleTimeString() +
    `</div>`;
}

// ── SOUND ────────────────────────────────────────────────────
function playSound() {
  if (!C.sndOn) return;
  try {
    const ctx = new (window.AudioContext ||
                     window.webkitAudioContext)();
    [0, 0.3, 0.6].forEach(t => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = "square";
      o.frequency.setValueAtTime(880, ctx.currentTime + t);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(
        0.001, ctx.currentTime + t + 0.25);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.25);
    });
  } catch (e) {
    console.warn("Audio unavailable");
  }
}

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, ms = 2500, type = "") {
  const el = id("toast");
  el.textContent = msg;
  el.className   = "toast";
  if (type === "r") el.classList.add("tr");
  if (type === "g") el.classList.add("tg");
  if (type === "y") el.classList.add("ty");
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), ms);
}

// ── LOG ──────────────────────────────────────────────────────
function log(msg, type = "o") {
  const lb  = id("logBox");
  const now = new Date().toLocaleTimeString();
  const div = document.createElement("div");
  const map = { t:"lt", o:"lo", w:"lw", i:"li2" };
  div.className   = map[type] || "lo";
  div.textContent = `[${now}] ${msg}`;
  lb.insertBefore(div, lb.firstChild);
  while (lb.children.length > 80)
    lb.removeChild(lb.lastChild);
}

// ── HELPERS ──────────────────────────────────────────────────
function id(x)     { return document.getElementById(x); }
function setText(x, v) {
  const e = id(x);
  if (e) e.textContent = String(v);
}
function setBar(x, p) {
  const e = id(x);
  if (e) e.style.width =
    Math.min(100, Math.max(0, p)) + "%";
}
function sf(v) {
  const f = parseFloat(v);
  return isNaN(f) ? 0 : f;
}
function si(v) {
  const i = parseInt(v);
  return isNaN(i) ? 0 : i;
}
function ls(k)     { return localStorage.getItem(k); }
function lss(k, v) { localStorage.setItem(k, v); }

window.addEventListener("resize", chart);
