// Counter Rush: the page. Loads the cha chaan teng theme (for its dish icons, Cantonese call-outs and
// the splash), then runs the day: input, sound, the phone, and the start and end cards.
import * as cct from '../themes/cct/index.js';
import { useTheme } from '../js/data.js';
import { showSplash } from '../js/splash.js';
import { sfx, unlockAudio, callOut, cycleSound, soundMode, startSizzle, stopSizzle } from '../js/sound.js';
import { iconURL } from '../js/art.js';
import { INGREDIENTS, BIN_ORDER, RECIPES, RECIPE_ORDER, APPLIANCES, DAY } from './recipes.js';
import * as S from './sim.js';
import { W, H, L, SEAT_X, inBox, drawFrame } from './draw.js';

useTheme({ ...cct, meta: { ...cct.meta, splash: { ...cct.meta.splash, board: '茶餐廳', word: 'COUNTER',
  tagZh: '快啲！客人等緊！', tag: 'Brew it, toast it, pull it, serve it. Four stools and one pair of hands.' } } });

const $ = id => document.getElementById(id);
const cv = $('stage'), c = cv.getContext('2d');
const debug = new URLSearchParams(location.search).has('debug');

let run = S.newRun();
let started = false, paused = false, phoneOpen = false, summaryShown = false;
const ui = { t: 0, drag: null, floats: [], hover: null, pulling: false };

// ---------- sizing: a 1280×720 stage, scaled to fit ----------
let scale = 1, ox = 0, oy = 0;
function resize(){
  const box = $('wrap').getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  scale = Math.min(box.width / W, box.height / H);
  const cw = Math.floor(W * scale), ch = Math.floor(H * scale);
  cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
  cv.width = Math.floor(cw * dpr); cv.height = Math.floor(ch * dpr);
  c.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
}
addEventListener('resize', resize);
const toStage = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; };

// ---------- messages ----------
let toastTimer = 0;
function say(msg, bad = true){
  if (!msg) return;
  const el = $('toast'); el.textContent = msg; el.hidden = false; el.classList.toggle('bad', bad);
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.hidden = true, 2200);
  if (bad) sfx.deny();
}
const float = (x, y, text, col) => ui.floats.push({ x, y, text, col, age: 0 });
const spotCentre = i => ({ x: L.spots[i].x + L.spots[i].w / 2, y: L.spots[i].y + 70 });

function handleEvents(){
  for (const e of run.events.splice(0)){
    switch (e.kind){
      case 'add': case 'load': sfx.queue(); break;
      case 'dish': sfx.ready(); { const p = spotCentre(e.spot); float(p.x, p.y - 30, RECIPES[e.dish].zh + '!', '#1d6b3f'); } break;
      case 'mess': sfx.waste(); { const p = spotCentre(e.spot); float(p.x, p.y - 30, e.why || 'Mess!', '#9e1f19'); } break;
      case 'ready': sfx.ready(); break;
      case 'out': sfx.clear(); break;
      case 'burnt': sfx.walkout(); { const b = L.apps[e.app]; float(b.x + b.w / 2, b.y + 40, e.why + '!', '#9e1f19'); } break;
      case 'serve': sfx.bell(); break;
      case 'pay': sfx.cash(); float(SEAT_X[e.seat], 200, `+$${e.price + e.tip}`, '#1d6b3f'); if (e.tip) float(SEAT_X[e.seat], 230, `tip $${e.tip}`, '#2e7d4f'); break;
      case 'walkout': sfx.walkout(); break;
      case 'arrive': sfx.door(); break;
      case 'order': { const n = {}; e.order.forEach(d => n[d] = (n[d] || 0) + 1); callOut(n); } break;
      case 'clear': sfx.clear(); break;
      case 'bin': sfx.waste(); if (e.cost) float(L.trash.x + 52, L.trash.y + 40, `-$${e.cost.toFixed(e.cost % 1 ? 1 : 0)}`, '#9e1f19'); break;
      case 'phone': sfx.queue(); break;
      case 'delivery': sfx.delivery(); { const b = L.bins.find(b => b.ing === e.ing); float(b.x + b.w / 2, b.y + 20, `+${INGREDIENTS[e.ing].pack}`, '#1d4f7a'); } break;
      case 'closing': say('11:00, closing time. Finish off the customers you have.', false); break;
      case 'over': setTimeout(showSummary, 900); break;
    }
  }
}

// ---------- input ----------
function hit(x, y){
  const bin = L.bins.find(b => inBox(b, x, y)); if (bin) return { bin };
  const spot = L.spots.find(b => inBox(b, x, y)); if (spot) return { spot: spot.i };
  const app = Object.values(L.apps).find(b => inBox(b, x, y)); if (app) return { app: app.key };
  if (inBox(L.trash, x, y)) return { trash: true };
  if (inBox(L.phone, x, y)) return { phone: true };
  const seat = L.seats.find(b => inBox(b, x, y)); if (seat) return { seat: seat.i };
  return {};
}
const playing = () => started && !paused && !run.over;

cv.addEventListener('pointerdown', e => {
  unlockAudio();
  if (!playing()) return;
  const p = toStage(e), h = hit(p.x, p.y);
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  if (h.bin) ui.drag = { ing: h.bin.ing, sx: p.x, sy: p.y, x: p.x, y: p.y };
  else if (h.spot != null){
    const sp = run.spots[h.spot];
    if (sp) ui.drag = { spot: h.spot, bag: sp, sx: p.x, sy: p.y, x: p.x, y: p.y };
    else S.selectSpot(run, h.spot);
  } else if (h.app){
    const a = run.apps[h.app];
    if (a.ruined) S.binAppliance(run, h.app);
    else if (h.app === 'kettle'){ if (a.part){ ui.pulling = true; startSizzle(); } else say('Drag tea leaves onto the kettle.', false); }
    else if (a.part) say(S.takeOut(run, h.app));
    else say(`Drag ${INGREDIENTS[APPLIANCES[h.app].takes].name.toLowerCase()} onto the ${APPLIANCES[h.app].name.toLowerCase()}.`, false);
  } else if (h.phone) openPhone();
  else if (h.seat != null){
    if (!S.clearSeat(run, h.seat) && run.seats[h.seat].cust?.state === 'wait') say('Drag a finished dish here to serve it.', false);
  }
});
cv.addEventListener('pointermove', e => {
  const p = toStage(e), h = hit(p.x, p.y);
  ui.hover = h.bin || (h.phone ? L.phone : null);
  cv.style.cursor = h.bin || h.phone || (h.spot != null && run.spots[h.spot]) || h.app || (h.seat != null && run.seats[h.seat].dirty.length) ? 'pointer' : 'default';
  const d = ui.drag;
  ui.dropSeat = ui.dropSpot = ui.dropApp = null; ui.dropTrash = false;
  if (!d) return;
  d.x = p.x; d.y = p.y;
  if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 6) d.moved = true;
  if (!d.moved) return;
  cv.style.cursor = 'grabbing';
  if (h.spot != null && h.spot !== d.spot) ui.dropSpot = h.spot;
  else if (h.app){ ui.dropApp = h.app; const a = run.apps[h.app], want = APPLIANCES[h.app].takes;
    ui.dropOk = !a.part && (d.ing ? d.ing === want : d.bag.parts.length === 1 && d.bag.parts[0] === want && !d.bag.mess); }
  else if (h.trash && d.bag) ui.dropTrash = true;
  else if (h.seat != null && d.bag){ ui.dropSeat = h.seat; const cu = run.seats[h.seat].cust, dish = S.spotDish(d.bag);
    ui.dropOk = !!(cu && cu.state === 'wait' && dish && cu.order.some((o, j) => o === dish && !cu.got[j])); }
});
function endPointer(e){
  if (ui.pulling){ ui.pulling = false; stopSizzle(); S.releasePull(run); }
  const d = ui.drag; ui.drag = null;
  ui.dropSeat = ui.dropSpot = ui.dropApp = null; ui.dropTrash = false;
  if (!d || !playing()) return;
  const p = toStage(e), h = hit(p.x, p.y);
  if (!d.moved){
    if (d.ing) say(S.addIngredient(run, d.ing));
    else S.selectSpot(run, d.spot);
    return;
  }
  if (d.ing){
    if (h.spot != null) say(S.addIngredient(run, d.ing, h.spot));
    else if (h.app) say(S.loadAppliance(run, h.app, { bin: d.ing }));
    return;
  }
  if (run.spots[d.spot] !== d.bag) return;      // it changed under us (it can't, but be safe)
  if (h.seat != null) say(S.serve(run, d.spot, h.seat));
  else if (h.spot != null) say(S.moveSpot(run, d.spot, h.spot));
  else if (h.app) say(S.loadAppliance(run, h.app, { spot: d.spot }));
  else if (h.trash) S.binSpot(run, d.spot);
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', endPointer);
cv.addEventListener('contextmenu', e => e.preventDefault());

addEventListener('keydown', e => {
  if (e.key === ' ' && started && !run.over && !phoneOpen){ e.preventDefault(); togglePause(); }
  else if (e.key === 'Escape' && phoneOpen) closePhone();
  else if ((e.key === 'p' || e.key === 'P') && playing()) phoneOpen ? closePhone() : openPhone();
  else if (['1', '2', '3'].includes(e.key) && playing()) S.selectSpot(run, +e.key - 1);
});

// ---------- the phone ----------
function openPhone(){
  phoneOpen = true; $('phone').hidden = false; renderPhone();
}
function closePhone(){ phoneOpen = false; $('phone').hidden = true; }
function renderPhone(){
  $('phoneList').innerHTML = BIN_ORDER.map(ing => {
    const I = INGREDIENTS[ing], coming = run.deliveries.find(d => d.ing === ing), n = run.stock[ing];
    const btn = express => { const cost = S.packPrice(ing, express), secs = express ? DAY.delivery.express : DAY.delivery.normal;
      return `<button type="button" data-ing="${ing}" data-express="${express ? 1 : ''}" ${coming || run.cash < cost ? 'disabled' : ''} class="${express ? 'express' : ''}">
        ${express ? 'Express' : 'Normal'} <b>$${cost}</b> <small>${secs}s</small></button>`; };
    return `<li class="${n <= 2 ? 'low' : ''}"><span class="zh">${I.zh}</span><span class="nm">${I.name}<small>${n} left · +${I.pack} a delivery</small></span>
      ${coming ? `<span class="coming">On its way: ${Math.ceil(coming.eta - run.t)}s</span>` : btn(false) + btn(true)}</li>`;
  }).join('');
  $('phoneCash').textContent = `$${Math.floor(run.cash)}`;
}
$('phoneList').addEventListener('click', e => {
  const b = e.target.closest('button[data-ing]'); if (!b) return;
  say(S.phoneOrder(run, b.dataset.ing, !!b.dataset.express)); renderPhone();
});
$('phoneClose').onclick = closePhone;
$('phone').addEventListener('pointerdown', e => { if (e.target.id === 'phone') closePhone(); });

// ---------- buttons ----------
function togglePause(){ paused = !paused; $('pauseBtn').textContent = paused ? 'Resume' : 'Pause'; $('pauseBtn').setAttribute('aria-pressed', paused); }
$('pauseBtn').onclick = () => { if (started && !run.over) togglePause(); };
const soundLabel = () => ({ all: 'Sound on', sfx: 'Voice off', off: 'Sound off' })[soundMode()];
$('soundBtn').textContent = soundLabel();
$('soundBtn').onclick = () => { unlockAudio(); cycleSound(); $('soundBtn').textContent = soundLabel(); };
$('recipesBtn').onclick = () => { if (started && !run.over && !paused) togglePause(); showCard('recipes'); };

// ---------- cards ----------
const recipeHTML = () => RECIPE_ORDER.map(r => { const R = RECIPES[r];
  return `<li><img src="${iconURL(r)}" alt=""><div><b><span class="zh">${R.zh}</span> ${R.name}</b> <em>$${R.price}</em>
    <ol>${R.steps.map(s => `<li>${s}</li>`).join('')}</ol></div></li>`; }).join('');
function showCard(kind){
  const card = $('cardBody');
  if (kind === 'intro' || kind === 'recipes'){
    card.innerHTML = `
      <h2><span class="zh">開工</span>${kind === 'intro' ? 'Morning shift at the counter' : 'Recipes'}</h2>
      ${kind === 'intro' ? `<p>Four stools, a kettle, a toaster and a noodle pot. Take $${DAY.target} before 11:00.</p>` : ''}
      <ul class="recipes">${recipeHTML()}</ul>
      <div class="how">
        <p><b>Build</b>: click an ingredient to put it on the highlighted spot (click a spot to pick it), or drag it onto any spot.
           Cooked steps: drag bread, noodles or tea leaves onto their appliance, and take them out in the <span class="g">green</span> part of the timer.
           Too early is undercooked, too late burns. Pull tea by <b>holding</b> the mouse on the kettle.</p>
        <p><b>Serve</b>: drag a finished dish up to the customer. When they've eaten, click their empty dishes to free the stool.
           A wrong mix is a mess: drag it to the bin (it costs you). Running low? Phone the supplier.</p>
      </div>
      <button type="button" class="go" id="cardGo">${kind === 'intro' ? 'Open the counter' : 'Back to work'}</button>`;
    $('cardGo').onclick = () => { $('card').hidden = true; if (!started){ started = true; unlockAudio(); } else if (paused) togglePause(); };
  }
  $('card').hidden = false;
  $('cardGo')?.focus();
}
function showSummary(){
  if (summaryShown) return; summaryShown = true;
  closePhone();
  const tk = S.takings(run), st = S.stars(run), hit = tk >= DAY.target, m = v => `$${Math.round(v)}`;
  if (hit) sfx.levelUp();
  $('cardBody').innerHTML = `
    <h2><span class="zh">收工</span>${hit ? 'Target hit!' : 'Closing time'}</h2>
    <p class="stars" aria-label="${st} of 3 stars">${'★'.repeat(st)}<span>${'★'.repeat(3 - st)}</span></p>
    <p class="big">${m(tk)} taken <small>of a $${DAY.target} target</small></p>
    <dl class="sum">
      <dt>Sales</dt><dd>${m(run.sales)}</dd>
      <dt>Tips</dt><dd>${m(run.tips)}</dd>
      <dt>Stock ordered</dt><dd class="neg">−${m(run.stockSpent)}</dd>
      <dt>Waste and messes</dt><dd class="neg">−${m(run.waste)}</dd>
      <dt>Profit for the morning</dt><dd><b>${m(S.net(run))}</b></dd>
    </dl>
    <dl class="sum small">
      <dt>Customers served</dt><dd>${run.served} of ${run.customers}</dd>
      <dt>Walked out</dt><dd>${run.walkouts}</dd>
      <dt>Messes</dt><dd>${run.messes}</dd>
      <dt>Burnt or stewed</dt><dd>${run.burnt}</dd>
    </dl>
    <div class="row"><button type="button" class="go" id="againBtn">Play again</button><a class="ghost" href="../#hongkong">Back to all restaurants</a></div>`;
  $('againBtn').onclick = () => { run = S.newRun(); summaryShown = false; paused = false; $('card').hidden = true; ui.floats = []; };
  $('card').hidden = false;
  $('againBtn').focus();
}

// ---------- the loop ----------
let last = performance.now(), phoneTick = 0;
function frame(now){
  // small steps, so a slow frame doesn't skip a timer's green window; a long gap (a hidden tab) is dropped
  const dt = Math.min(.25, (now - last) / 1000); last = now;
  ui.t += dt;
  if (playing()){
    for (let left = dt; left > 1e-6 && !run.over; left -= .05){
      const step = Math.min(.05, left);
      S.tick(run, step, SEAT_X);
      if (ui.pulling){ const err = S.holdPull(run, step); if (err || !run.apps.kettle.part){ ui.pulling = false; stopSizzle(); say(err); } }
    }
    handleEvents();
    if (phoneOpen && (phoneTick += dt) > .25){ phoneTick = 0; renderPhone(); }
  }
  for (const f of ui.floats) f.age += dt;
  ui.floats = ui.floats.filter(f => f.age < 1.6);
  drawFrame(c, run, { ...ui, paused: paused && $('card').hidden, flashBin: null });
  requestAnimationFrame(frame);
}

resize();
requestAnimationFrame(frame);
if (debug){
  window.cr = { get run(){ return run; }, S, ff(secs){ for (let i = 0; i < secs * 20; i++) S.tick(run, .05, SEAT_X); handleEvents(); } };
  showCard('intro');
} else showSplash(() => showCard('intro'));
