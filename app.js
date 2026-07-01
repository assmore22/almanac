import { makeReader, write, connectWallet, activeAccount, balanceOf, short, toGen, GEN, fmtErr }
  from "./shared/genlayer-lite.js";

const CONTRACT = "0xe113fF6B307F8EbB1977Ba51747CE73CD6fF9dA8";
const { read } = makeReader(CONTRACT);
const F_PENDING = 0, F_VERIFIED = 1, F_DISPUTED = 2;
const STLABEL = ["Pending", "Verified", "Disputed"];
const FCLS = ["fb-pending", "fb-verified", "fb-disputed"];
let account = null, facts = [];
const $ = (id) => document.getElementById(id);
const esc = (s) => (s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

$("contractLink").textContent = "Contract " + short(CONTRACT) + " \u2197";

function toast(msg, kind = "", title = "almanac") {
  const el = document.createElement("div"); el.className = "toast " + kind;
  el.innerHTML = `<span class="tt">${title}</span>`; el.appendChild(document.createTextNode(msg));
  $("log").appendChild(el); setTimeout(() => el.remove(), kind === "err" ? 15000 : 5000);
}

async function refreshWallet() {
  account = await activeAccount();
  const slot = $("walletslot");
  if (account) { let bal = 0n; try { bal = await balanceOf(account); } catch (_) {} slot.innerHTML = `<span class="mono" style="font-size:13px;color:var(--grey)">${short(account)} \u00b7 ${toGen(bal)} GEN</span>`; }
  else { slot.innerHTML = `<button class="btn ghost sm" id="connectBtn">Connect</button>`; $("connectBtn").onclick = doConnect; }
}
async function doConnect() { try { account = await connectWallet(); toast("Connected on Bradbury.", "ok"); await refreshWallet(); } catch (e) { toast(fmtErr(e), "err"); } }
async function ensureWallet() { if (!account) account = await connectWallet(); await refreshWallet(); }

async function load() {
  try {
    const count = Number(await read("get_fact_count"));
    const out = [];
    for (let i = 0; i < count; i++) out.push({ id: i, ...(await read("get_fact", [i])) });
    facts = out; renderList();
    $("fCount").textContent = count + (count === 1 ? " entry" : " entries");
    $("stTotal").textContent = count;
    $("stVerified").textContent = out.filter((f) => Number(f.status) === F_VERIFIED).length;
    $("stDisputed").textContent = out.filter((f) => Number(f.status) === F_DISPUTED).length;
  } catch (e) { $("factList").innerHTML = `<div class="f-empty">Could not reach the chain. ${fmtErr(e)}</div>`; }
}

function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (_) { return u; } }

function renderList() {
  const el = $("factList");
  if (!facts.length) { el.innerHTML = `<div class="f-empty">No entries yet. Add the first fact.</div>`; return; }
  el.innerHTML = "";
  [...facts].reverse().forEach((f) => {
    const st = Number(f.status);
    const card = document.createElement("div"); card.className = "fact";
    card.innerHTML = `
      <div class="fact-top"><span class="fbadge ${FCLS[st]}">${STLABEL[st]}</span><span class="fchecks">${f.checks} check${Number(f.checks) === 1 ? "" : "s"}</span></div>
      <div class="fact-stmt">${esc(f.statement)}</div>
      <div class="fact-foot"><i class="ph-bold ph-link-simple"></i> ${esc(host(f.source_url))}</div>`;
    card.onclick = () => openDetail(f.id);
    el.appendChild(card);
  });
}

function openDrawer() { $("scrim").classList.add("on"); $("drawer").classList.add("on"); }
function closeDrawer() { $("scrim").classList.remove("on"); $("drawer").classList.remove("on"); }

function openNew() {
  const c = $("nStmt");
  if (c) { c.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => c.focus(), 320); }
}

function openDetail(id) {
  const f = facts.find((x) => x.id === id); if (!f) return;
  const st = Number(f.status);
  $("drawerTitle").textContent = "Entry #" + id;
  let verdict = "";
  if (st === F_VERIFIED) verdict = `<div class="verdict-box vb-ok"><b>Verified.</b> ${f.rationale ? esc(f.rationale) : "The source supports this statement."}</div>`;
  if (st === F_DISPUTED) verdict = `<div class="verdict-box vb-no"><b>Disputed.</b> ${f.rationale ? esc(f.rationale) : "The source does not support this statement."}</div>`;
  const label = st === F_PENDING ? "Run AI verification" : "Re-check against the source";
  $("drawerBody").innerHTML = `
    <div class="d-stmt">${esc(f.statement)}</div>
    ${verdict}
    <div class="kv"><span class="k">Source</span><span class="v"><a href="${esc(f.source_url)}" target="_blank" rel="noopener">${esc(host(f.source_url))} \u2197</a></span></div>
    <div class="kv"><span class="k">Author</span><span class="v mono">${short(f.author)}</span></div>
    <div class="kv"><span class="k">Status</span><span class="v">${STLABEL[st]}</span></div>
    <div class="kv"><span class="k">Checks</span><span class="v mono">${f.checks}</span></div>
    <button class="btn primary block" id="verifyBtn"><i class="ph-bold ph-magnifying-glass"></i> ${label}</button>
    <div class="hint" style="text-align:center;margin-top:8px">Validators read the source and agree. Calls a real LLM.</div>`;
  openDrawer();
  $("verifyBtn").onclick = () => doVerify(id);
}

async function doCreate() {
  const stmt = $("nStmt").value.trim(), url = $("nUrl").value.trim();
  if (!stmt) return toast("State the fact.", "err");
  if (!url) return toast("Cite a source URL.", "err");
  const btn = $("createBtn"); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> adding';
  try { await ensureWallet(); await write(CONTRACT, "submit_fact", [stmt, url]); toast("Added to the record.", "ok"); $("nStmt").value = ""; $("nUrl").value = ""; await load(); }
  catch (e) { toast(fmtErr(e), "err"); }
  btn.disabled = false; btn.innerHTML = '<i class="ph-bold ph-plus"></i> Add to the record';
}
async function doVerify(id) {
  if (!confirm("Run verification? Validators read the source and agree whether it supports the statement. Calls a real LLM.")) return;
  const btn = $("verifyBtn"); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> validators reading';
  try { await ensureWallet(); toast("Validators reading the source\u2026", "", "verify"); await write(CONTRACT, "verify", [id]); toast("Checked on-chain.", "ok"); closeDrawer(); await load(); }
  catch (e) { toast(fmtErr(e), "err"); if (btn) { btn.disabled = false; btn.textContent = "Run verification"; } }
}

$("heroPostBtn").onclick = openNew;
$("ctaPostBtn").onclick = openNew;
$("navPostBtn").onclick = openNew;
$("refreshBtn").onclick = load;
$("closeDrawer").onclick = closeDrawer;
$("scrim").onclick = closeDrawer;
const _cb = $("connectBtn"); if (_cb) _cb.onclick = doConnect;
const _create = $("createBtn"); if (_create) _create.onclick = doCreate;
if (window.ethereum) window.ethereum.on?.("accountsChanged", refreshWallet);

refreshWallet();
load();

// ====== knowledge graph (Three.js, teal on paper) ======
(function graph() {
  const canvas = $("graphCanvas"); if (!canvas || !window.THREE) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 16);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  function resize() { const w = canvas.clientWidth, h = canvas.clientHeight || 500; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  const TEAL = 0x0f7d6b;
  const grp = new THREE.Group(); scene.add(grp);
  const N = 22; const nodes = [];
  const nodeMat = new THREE.MeshBasicMaterial({ color: TEAL });
  const nodeGeo = new THREE.SphereGeometry(0.12, 10, 10);
  for (let i = 0; i < N; i++) {
    const v = new THREE.Vector3((Math.random() - .5) * 18, (Math.random() - .5) * 11, (Math.random() - .5) * 6);
    const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(v); grp.add(m); nodes.push(v);
  }
  for (let i = 0; i < N; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < N; j++) {
      if (a.distanceTo(nodes[j]) < 5.2) {
        const g = new THREE.BufferGeometry().setFromPoints([a, nodes[j]]);
        grp.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: .14 })));
      }
    }
  }
  resize(); addEventListener("resize", resize);
  let running = true;
  const vis = new IntersectionObserver((es) => { running = es[0].isIntersecting; if (running) loop(); }, { threshold: 0 });
  vis.observe(canvas);
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    grp.rotation.y += 0.0014; grp.rotation.x = Math.sin(Date.now() * 0.0002) * 0.12;
    renderer.render(scene, camera);
  }
  loop();
})();
