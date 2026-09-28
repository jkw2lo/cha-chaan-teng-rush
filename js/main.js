import { DECOR, APPLIANCES, MENU, INGREDIENTS, MENU_ORDER } from './data.js';
import { fresh, load, save, clearSave } from './state.js';
import { newRun, tick, clickStation, placeStockOrder, checkUnlocks, fmtMoney, itemReady, hasStation, maxed } from './sim.js';
import { draw, hitTest, billboardHit, invalidateStatic, viewCentre, computeView } from './render.js';
import { Iso } from './iso.js';
import * as A from './art.js';
import * as UI from './ui.js';
import * as Ed from './edit.js';
import { showSplash } from './splash.js';
import { sfx, unlockAudio, callOut, startSizzle, stopSizzle, cycleSound, soundMode, hasCantoneseVoice } from './sound.js';
import { buildSteps, runTour } from './tutorial.js';
import { DH, KW, KH, syncKitchen } from './world.js';

const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d'), stage = $('stage');

let S = null, R = null, phase = 'title';
const ui = { paused: false, speed: 1, edit: null, hover: null, cart: {}, drawerOpen: false, cam: { z: 1, x: 0, y: 0 } };
let frame = { iso: null, hits: [] }, cssW = 800, cssH = 600, dpr = 1;
let lastUI = 0, last = performance.now(), clock = 0;

window.addEventListener('pointerdown', unlockAudio, true);
window.addEventListener('keydown', unlockAudio, true);

// ---------- sizing ----------
function resize(){
  const r = stage.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cssW = Math.max(300, r.width); cssH = Math.max(260, r.height);
  canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
  canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px';
}
new ResizeObserver(resize).observe(stage);
resize();

// ---------- flow ----------
function toPrep(){
  phase = 'prep'; R = null;
  checkUnlocks(S, null);
  save(S);
  showBanner();
}
function showBanner(){
  const b = $('banner');
  if (phase !== 'prep' || ui.edit){ b.hidden = true; return; }
  const tips = [];
  if (!S.unlocked.includes('icedTea')) tips.push('No ice yet: order some to add 凍奶茶 iced milk tea to the menu.');
  if (!S.unlocked.includes('butterBun') && S.unlocked.includes('bun')) tips.push('Order butter to unlock 菠蘿油.');
  for (const m of MENU_ORDER) if (itemReady(S, m) && !S.unlocked.includes(m) && (MENU[m].level || 1) > 1){
    tips.push(hasStation(S, m) ? `Order ${Object.keys(MENU[m].recipe).filter(i => S.stock[i] <= 0).map(i => INGREDIENTS[i].name.toLowerCase()).join(', ')} to start selling ${MENU[m].zh}.` : `Buy a ${Object.values(APPLIANCES).find(a => a.makes === m && !a.pro).name.toLowerCase()} in the kitchen to start selling ${MENU[m].zh}.`);
  }
  const low = Object.entries(INGREDIENTS).filter(([k]) => S.stock[k] > 0 && S.stock[k] < 6).map(([, i]) => i.name.toLowerCase());
  if (low.length) tips.push(`Low on ${low.join(', ')}.`);
  b.innerHTML = `<div class="bmain"><p class="eyebrow">Day ${S.day} · before opening</p><h2>Get ready, then open the shutters</h2>
    ${tips.length ? `<ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>` : '<p>Stock is healthy. Rearrange or redecorate if you like.</p>'}</div>
    <div class="bgoals">${UI.goalsHTML(UI.previewGoals(S))}${maxed(S) ? `<label class="relax"><input type="checkbox" id="relaxToggle" ${S.relaxed ? 'checked' : ''}> Relaxed day: customers wait longer and walkouts don’t cost popularity</label>` : ''}</div>
    <button class="primary big" id="openBtn">Open for day ${S.day}</button>`;
  b.hidden = false;
  $('openBtn').onclick = openDay;
  const rt = $('relaxToggle'); if (rt) rt.onchange = () => { S.relaxed = rt.checked; save(S); };
}
function openDay(){
  if (ui.edit) endEdit();
  closeDrawer();
  save(S);
  R = newRun(S); phase = 'day'; ui.paused = false;
  $('banner').hidden = true;
}
function finishDay(){
  phase = 'summary';
  UI.modal(UI.summaryHTML(S, R));
  if (R.results && R.results.levelUp) sfx.levelUp(); else sfx.bell();
  S.history.push({ day: S.day, revenue: R.stats.revenue, tips: R.stats.tips, served: R.stats.served, walkouts: R.stats.walkouts });
}
function nextDay(){
  UI.closeModal();
  S.day++;
  toPrep();
}

// ---------- edit mode ----------
function beginEdit(room){
  if (phase === 'title' || phase === 'summary') return;
  if (phase === 'day'){ UI.flash('Rearranging happens between days. You can do it from the end-of-day summary.'); return; }
  closeDrawer();
  if (ui.edit && ui.edit.room === room){ endEdit(); return; }
  Ed.startEdit(ui, room);
  $('editor').hidden = false;
  $('editor').classList.toggle('right', room === 'kitchen');
  refreshEditor();
  showBanner();
}
function endEdit(){
  ui.edit = null; $('editor').hidden = true;
  if (phase === 'prep') save(S);
  showBanner();
}
function refreshEditor(){
  if (!ui.edit) return;
  UI.renderEditor(S, ui);
  for (const cv of $('editor').querySelectorAll('canvas[data-thumb]')) thumb(cv, cv.dataset.thumb);
}
function thumb(cv, type){
  const c = cv.getContext('2d'), kind = DECOR[type].kind;
  c.clearRect(0, 0, cv.width, cv.height);
  const iso = new Iso(c, 40, 60, kind === 'ceiling' ? 104 : kind === 'wall' ? 108 : 40);
  const it = { id: 0, type, x: 0, y: 0, dir: 'E' };
  if (kind === 'wall'){ iso.poly([[0, 0, .9], [1, 0, .9], [1, 0, 2], [0, 0, 2]], A.PAL.mint); A.drawWallItem(iso, it, 0, 9.3); }
  else if (kind === 'ceiling'){ A.drawCeiling(iso, { ...it }, 0.3); }
  else { iso.poly([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], 'rgba(0,0,0,.08)'); A.drawDecor(iso, it, 0); }
}
$('editor').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !ui.edit) return;
  let msg = null;
  if (b.dataset.done !== undefined) return endEdit();
  if (b.dataset.buy) return;                       // buying starts on pointerdown (drag or click-then-place)
  else if (b.dataset.floor) msg = Ed.useFloor(S, b.dataset.floor);
  else if (b.dataset.expand !== undefined){ msg = Ed.expand(S); if (!msg) UI.flash('The dining room is bigger. More seats, more customers.', 'good'); }
  else if (b.dataset.expandKitchen !== undefined){ msg = Ed.expandKitchen(S); if (!msg) UI.flash('The kitchen is bigger. Room for more stations.', 'good'); }
  else if (b.dataset.style) ui.edit.style = b.dataset.style;
  else if (b.dataset.cat) ui.edit.cat = b.dataset.cat;
  else if (b.dataset.rotate !== undefined) msg = Ed.rotate(S, R, ui);
  else if (b.dataset.cancel !== undefined) Ed.cancelPlacing(ui);
  else if (b.dataset.move !== undefined) msg = Ed.beginMove(S, ui, ui.edit.selected);
  else if (b.dataset.sell !== undefined){ const r = Ed.sell(S, ui); msg = r.msg || null; if (r.refund) UI.flash(`Sold for ${fmtMoney(r.refund)}.`); }
  if (msg) UI.flash(msg, 'bad');
  refreshEditor();
});

// ---------- restock drawer ----------
function openDrawer(){
  if (phase === 'title' || phase === 'summary') return;
  if (ui.edit) endEdit();
  ui.drawerOpen = true; ui.cart = {};
  $('drawer').hidden = false;
  UI.renderRestock(S, R, ui.cart, phase === 'day');
}
function closeDrawer(){ ui.drawerOpen = false; $('drawer').hidden = true; }
$('drawer').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.close !== undefined) return closeDrawer();
  if (b.dataset.inc) ui.cart[b.dataset.inc] = (ui.cart[b.dataset.inc] || 0) + 1;
  if (b.dataset.dec) ui.cart[b.dataset.dec] = Math.max(0, (ui.cart[b.dataset.dec] || 0) - 1);
  if (b.dataset.buy !== undefined){
    const r = placeStockOrder(S, R, ui.cart);
    if (!r.ok){ UI.flash(r.msg, 'bad'); return; }
    UI.flash(r.live ? `Order placed: ${fmtMoney(r.cost)}. Watch the inventory for arrival times.` : `Stock delivered: ${fmtMoney(r.cost)}.`, 'good');
    if (phase === 'prep'){ save(S); showBanner(); }
    if (phase === 'summary') UI.modal(UI.summaryHTML(S, R));
    return closeDrawer();
  }
  UI.renderRestock(S, R, ui.cart, phase === 'day');
});

// ---------- modal buttons ----------
$('modal').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.continue !== undefined){ UI.closeModal(); toPrep(); }
  if (b.dataset.new !== undefined){ clearSave(); S = fresh(); syncKitchen(S); UI.closeModal(); toPrep(); UI.flash('New game: back to day 1 with starter stock and $' + S.money + '.', 'good'); setTimeout(startTour, 350); }
  if (b.dataset.next !== undefined) nextDay();
  if (b.dataset.restock !== undefined){ nextDay(); openDrawer(); }
  if (b.dataset.edit){ nextDay(); beginEdit(b.dataset.edit); }
  if (b.dataset.confirmClose !== undefined){ UI.closeModal(); if (R && !R.closing){ R.closing = true; R.feed.unshift({ text: 'You pulled the shutters down early.', tone: 'warn', t: R.t }); } ui.paused = false; }
  if (b.dataset.cancelClose !== undefined){ UI.closeModal(); ui.paused = false; }
});

// ---------- camera: zoom and pan ----------
const ZMIN = 1, ZMAX = 2.6;
// Zoom to z, keeping the floor point under screen point (mx, my) where it is.
function zoomTo(z, mx = cssW / 2, my = cssH / 2){
  z = Math.max(ZMIN, Math.min(ZMAX, z));
  if (!frame.iso){ ui.cam.z = z; return; }
  if (ui.cam.z <= 1.001){ const c = viewCentre(cssW, cssH, S); ui.cam.x = c.x; ui.cam.y = c.y; }
  const [wx, wy] = frame.iso.unproject(mx, my);
  if (z <= 1.001){ ui.cam = { z: 1, x: 0, y: 0 }; return; }
  const s2 = frame.iso.s / ui.cam.z * z;                     // the zoomed cell size
  const d = (wx - wy) - (mx - cssW / 2) / s2, sum = (wx + wy) - (my - cssH / 2) * 2 / s2;
  ui.cam = clampCam({ z, x: (sum + d) / 2, y: (sum - d) / 2 });
}
function clampCam(c){
  return { ...c, x: Math.max(-1, Math.min(13, c.x)), y: Math.max(-2, Math.min(13, c.y)) };
}
function panBy(dx, dy){
  if (ui.cam.z <= 1.001) return;
  const s2 = frame.iso.s, d = (ui.cam.x - ui.cam.y) - dx / s2, sum = (ui.cam.x + ui.cam.y) - dy * 2 / s2;
  ui.cam = clampCam({ ...ui.cam, x: (sum + d) / 2, y: (sum - d) / 2 });
}
// Fit the whole kitchen: floor x 0..8, y 6..12, plus the icons floating ~2.4 cells above the back row.
function kitchenView(){
  const base = computeView(cssW, cssH, S).s;
  const lift = 2.4 * 2;                                   // height shows up as x+y on screen
  const sumLo = 0 + DH - lift, sumHi = KW + DH + KH, difLo = -(DH + KH), difHi = KW - DH;
  const hCells = (sumHi - sumLo) / 2, wCells = difHi - difLo;
  const z = Math.max(1, Math.min(2.2, (cssH - 90) / (hCells * base), (cssW - 60) / (wCells * base)));
  const sum = (sumLo + sumHi) / 2 + 30 / (base * z), dif = (difLo + difHi) / 2;   // nudge up a little for the bottom buttons
  ui.cam = { z, x: (sum + dif) / 2, y: (sum - dif) / 2 };
}
$('zoomIn').onclick = () => zoomTo(ui.cam.z * 1.25);
$('zoomOut').onclick = () => zoomTo(ui.cam.z / 1.25);
$('zoomKitchen').onclick = kitchenView;
$('zoomAll').onclick = () => { ui.cam = { z: 1, x: 0, y: 0 }; };
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const [x, y] = pointer(e);
  zoomTo(ui.cam.z * Math.exp(-e.deltaY * .0015), x, y);
}, { passive: false });
// drag on empty floor to pan (only when zoomed in)
let pan = null, justPanned = false;
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0 || ui.cam.z <= 1.001 || !frame.iso) return;
  const [x, y] = pointer(e);
  if (ui.edit && (ui.edit.ghostItem || pickEditable(x, y))) return;       // editing takes the drag
  if (!ui.edit && stationAt(x, y)) return;                                  // clicking a station cooks
  pan = { x: e.clientX, y: e.clientY, moved: false };
});
window.addEventListener('pointermove', e => {
  if (!pan) return;
  const dx = e.clientX - pan.x, dy = e.clientY - pan.y;
  if (!pan.moved && Math.hypot(dx, dy) < 5) return;
  pan.moved = true; canvas.classList.add('panning');
  panBy(dx, dy); pan.x = e.clientX; pan.y = e.clientY;
});
window.addEventListener('pointerup', () => {
  if (pan && pan.moved){ justPanned = true; setTimeout(() => { justPanned = false; }, 0); }
  pan = null; canvas.classList.remove('panning');
});

// ---------- walkthrough ----------
function kitchenRect(){
  const cr = canvas.getBoundingClientRect(), pts = [[0, DH, 0], [KW, DH, 0], [KW, DH + KH, 0], [0, DH + KH, 0], [0, DH, 2.7], [KW, DH, 2.7]].map(p => frame.iso.P(...p));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { left: cr.left + Math.min(...xs), top: cr.top + Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}
function startTour(){
  if (phase !== 'prep' || !frame.iso) return;
  if (ui.cam.z > 1.001){ ui.cam = { z: 1, x: 0, y: 0 }; requestAnimationFrame(() => requestAnimationFrame(startTour)); return; }
  if (ui.edit) endEdit();
  closeDrawer();
  runTour(buildSteps(kitchenRect));
}
$('tourBtn').onclick = () => { if (phase === 'prep') startTour(); else UI.flash('The tour runs before you open. Try it at the start of the next day.'); };

// ---------- top bar ----------
$('pauseBtn').onclick = () => { ui.paused = !ui.paused; };
$('speedBtn').onclick = () => { ui.speed = ui.speed >= 3 ? 1 : ui.speed + 1; };
$('restockBtn').onclick = () => ui.drawerOpen ? closeDrawer() : openDrawer();
$('restockBtn2').onclick = openDrawer;
// quick order: one pack straight from the inventory row (pointerdown so a re-render can't swallow the click)
$('inv').addEventListener('pointerdown', e => {
  const b = e.target.closest('button[data-quick]');
  if (!b || b.disabled || phase === 'title' || phase === 'summary') return;
  const k = b.dataset.quick, r = placeStockOrder(S, R, { [k]: 1 });
  if (!r.ok){ UI.flash(r.msg, 'bad'); return; }
  UI.flash(r.live ? `Ordered ${INGREDIENTS[k].pack} ${INGREDIENTS[k].name.toLowerCase()} for ${fmtMoney(r.cost)}. Arrives in ${INGREDIENTS[k].delivery}s.` : `${INGREDIENTS[k].pack} ${INGREDIENTS[k].name.toLowerCase()} delivered for ${fmtMoney(r.cost)}.`, 'good');
  if (phase === 'prep'){ save(S); showBanner(); }
});
$('kitchenBtn').onclick = () => beginEdit('kitchen');
$('diningBtn').onclick = () => beginEdit('dining');
$('closeBtn').onclick = () => {
  if (phase !== 'day' || !R || R.closing) return;
  ui.paused = true;
  UI.modal(`<div class="summary"><h2>Close early?</h2><p>No new customers will come in. Anyone already seated still gets served, then the day ends.</p>
    <div class="btns"><button data-cancel-close>Keep trading</button><button class="primary danger" data-confirm-close>Close the shop</button></div></div>`);
};

// ---------- canvas input ----------
function pointer(e){ const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function stationAt(x, y){
  if (!frame.iso) return null;
  const bb = billboardHit(frame.iso, S, x, y);
  if (bb) return bb;
  const h = hitTest(frame.hits.filter(h => h.kind === 'station'), x, y);
  return h ? S.kitchen.find(k => k.id === h.id) : null;
}
canvas.addEventListener('pointermove', e => {
  if (!S || !frame.iso) return;
  const [x, y] = pointer(e);
  if (ui.edit){
    if (ui.edit.ghostItem){ if (!drag) Ed.updateGhost(S, R, ui, frame.iso, x, y); canvas.style.cursor = ui.edit.ghost && ui.edit.ghost.ok ? 'copy' : 'not-allowed'; }
    else { const h = pickEditable(x, y); canvas.style.cursor = h ? 'grab' : 'default'; }
    return;
  }
  const st = stationAt(x, y);
  ui.hover = st ? st.id : null;
  canvas.style.cursor = st ? 'pointer' : 'default';
  const tip = $('tip');
  if (st){
    const ap = APPLIANCES[st.type], m = ap.makes && MENU[ap.makes];
    const locked = m && !S.unlocked.includes(ap.makes);
    tip.innerHTML = `<b>${ap.zh} ${ap.name}</b>${m ? `<span>Makes ${m.name.toLowerCase()} · ${Math.round(m.cook * ap.speed * 10) / 10}s · sells for ${fmtMoney(m.price)}</span>` : ''}
      ${locked ? `<span class="warn">Not on the menu yet. Order ${Object.keys(m.recipe).filter(i => S.stock[i] <= 0).map(i => INGREDIENTS[i].name.toLowerCase()).join(' and ')} to unlock.</span>` : ''}
      ${m && phase === 'day' ? '<span class="dim">Each click adds a job (up to 5). One more click clears them. Right-click clears.</span>' : ''}`;
    tip.style.left = Math.min(x + 16, cssW - 250) + 'px'; tip.style.top = Math.max(8, y - 10) + 'px';
    tip.hidden = false;
  } else tip.hidden = true;
});
canvas.addEventListener('pointerleave', () => { ui.hover = null; $('tip').hidden = true; });
function pickEditable(x, y){
  const kinds = ui.edit.room === 'kitchen' ? ['station'] : ['decor', 'wall'];
  return hitTest(frame.hits.filter(h => kinds.includes(h.kind)), x, y);
}
function handleClick(e, another){
  if (!S || !frame.iso || ui.edit || justPanned) return;   // edit mode uses the drag handlers below
  const [x, y] = pointer(e);
  const st = stationAt(x, y);
  if (!st) return;
  if (phase !== 'day'){ UI.flash(phase === 'prep' ? 'Open the shop first, then click stations to cook.' : 'The day is over.'); return; }
  const r = clickStation(S, R, st, another);
  if (r.added) sfx.queue(); else if (r.removed) sfx.clear(); else if (r.msg) sfx.deny();
  if (r.msg) UI.flash(r.msg, r.added || r.removed ? 'info' : 'bad');
}
canvas.addEventListener('click', e => handleClick(e, false));
canvas.addEventListener('contextmenu', e => { e.preventDefault(); handleClick(e, true); });

// ---------- drag and drop while editing ----------
// move: press on something in the room and drag it. buy: press on a catalogue card and drag it in.
// place: a card was clicked (not dragged), so the next click in the room drops it.
let drag = null;
function ghostAt(cx, cy){
  const r = canvas.getBoundingClientRect();
  if (document.elementFromPoint(cx, cy) === canvas) Ed.updateGhost(S, R, ui, frame.iso, cx - r.left, cy - r.top);
  else ui.edit.ghost = null;
}
$('editor').addEventListener('pointerdown', e => {
  const b = e.target.closest('button[data-buy]');
  if (!b || b.disabled || !ui.edit || e.button !== 0) return;
  e.preventDefault();
  const msg = Ed.beginBuy(S, ui, b.dataset.buy);
  if (msg){ UI.flash(msg, 'bad'); return; }
  drag = { mode: 'buy', x0: e.clientX, y0: e.clientY, moved: false };
  document.body.classList.add('dragging');
  refreshEditor();
});
canvas.addEventListener('pointerdown', e => {
  if (!ui.edit || !frame.iso || e.button !== 0) return;
  const [x, y] = pointer(e);
  if (ui.edit.ghostItem){ drag = { mode: 'place', x0: e.clientX, y0: e.clientY, moved: false }; return; }
  const h = pickEditable(x, y);
  ui.edit.selected = h ? h.id : null;
  if (h) drag = { mode: 'move', id: h.id, x0: e.clientX, y0: e.clientY, moved: false };
  refreshEditor();
});
window.addEventListener('pointermove', e => {
  if (!drag || !ui.edit) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6){
    drag.moved = true;
    if (drag.mode === 'move'){
      const msg = Ed.beginMove(S, ui, drag.id);
      if (msg){ UI.flash(msg, 'bad'); drag = null; return; }
      document.body.classList.add('dragging');
      refreshEditor();
    }
  }
  if (drag.moved || drag.mode === 'place') ghostAt(e.clientX, e.clientY);
});
window.addEventListener('pointerup', e => {
  const d = drag; drag = null;
  document.body.classList.remove('dragging');
  if (!d || !ui.edit) return;
  if (d.mode === 'move' && !d.moved) return;                       // a plain click just selects
  if (d.mode === 'buy' && !d.moved){ refreshEditor(); return; }     // clicked a card: click a spot next
  ghostAt(e.clientX, e.clientY);
  if (!ui.edit.ghost){                                              // dropped outside the room
    if (d.mode !== 'place') Ed.cancelPlacing(ui);
    if (d.mode === 'move') ui.edit.selected = d.id;
    refreshEditor(); return;
  }
  const msg = Ed.place(S, ui);
  if (msg){
    UI.flash(msg, 'bad');
    if (d.mode !== 'place'){ Ed.cancelPlacing(ui); if (d.mode === 'move') ui.edit.selected = d.id; }
  } else if (d.mode === 'buy') ui.edit.ghostItem = null;            // one drag, one purchase
  refreshEditor();
});

// ---------- floating Rotate / Sell bar above the selected item ----------
let barKey = '';
function updateItemBar(){
  const bar = $('itemBar'), E = ui.edit;
  const it = E && E.selected && !E.ghostItem && !drag ? Ed.findItem(S, E.room, E.selected) : null;
  if (!it || !frame.iso){ if (!bar.hidden){ bar.hidden = true; barKey = ''; } return; }
  const kitchen = E.room === 'kitchen', def = kitchen ? APPLIANCES[it.type] : DECOR[it.type];
  const kind = kitchen ? 'station' : def.kind;
  const z = kind === 'wall' ? 2.0 : kind === 'ceiling' ? 2.55 : kind === 'station' ? (def.makes ? 2.95 : 2.0) : 1.35;
  const [a, b] = kind === 'wall' && it.side === 'W' ? frame.iso.P(0, it.y + .5, z) : frame.iso.P(it.x + .5, kind === 'wall' ? 0 : it.y + .5, z);
  bar.style.left = `${Math.max(120, Math.min(cssW - 120, a))}px`; bar.style.top = `${Math.max(52, b - 6)}px`;
  const key = `${it.id}|${it.dir}|${Math.round(S.money)}`;
  if (key !== barKey){
    barKey = key;
    const rot = it.dir !== undefined && kind !== 'wall' && !def.fixed;
    bar.innerHTML = `<b>${def.name}</b>${rot ? '<button class="rot" data-act="rotate">Rotate<kbd>R</kbd></button>' : ''}${def.fixed ? '' : `<button class="danger" data-act="sell">Sell ${fmtMoney(Math.round((def.price || 0) * .5))}</button>`}<button data-act="close" aria-label="Deselect">×</button>`;
  }
  bar.hidden = false;
}
$('itemBar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !ui.edit) return;
  if (b.dataset.act === 'rotate'){ const m = Ed.rotate(S, R, ui); if (m) UI.flash(m, 'bad'); }
  if (b.dataset.act === 'sell'){ const r = Ed.sell(S, ui); if (r.msg) UI.flash(r.msg, 'bad'); if (r.refund) UI.flash(`Sold for ${fmtMoney(r.refund)}.`); }
  if (b.dataset.act === 'close') ui.edit.selected = null;
  refreshEditor();
});

window.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input, textarea')) return;
  if (e.key === 'Escape'){
    if (ui.edit && ui.edit.ghostItem){ drag = null; document.body.classList.remove('dragging'); Ed.cancelPlacing(ui); refreshEditor(); }
    else if (ui.edit && ui.edit.selected){ ui.edit.selected = null; refreshEditor(); }
    else if (ui.edit) endEdit();
    else if (ui.drawerOpen) closeDrawer();
  }
  if ((e.key === 'r' || e.key === 'R') && ui.edit){ const msg = Ed.rotate(S, R, ui); if (msg) UI.flash(msg, 'bad'); refreshEditor(); }
  if (e.key === ' ' && phase === 'day' && !ui.edit){ e.preventDefault(); ui.paused = !ui.paused; }
  if ((e.key === '+' || e.key === '=') && S) zoomTo(ui.cam.z * 1.25);
  if ((e.key === '-' || e.key === '_') && S) zoomTo(ui.cam.z / 1.25);
  if ((e.key === 'k' || e.key === 'K') && S && !ui.edit) kitchenView();
  if (e.key === '0' && S) ui.cam = { z: 1, x: 0, y: 0 };
});

// ---------- loop ----------
function loop(now){
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  if (S){
    const running = phase === 'day' && !ui.paused && !ui.edit && $('modal').hidden;
    if (running){
      const step = dt * ui.speed;
      clock += step;
      tick(S, R, step);
      playEvents();
      if (R.over) finishDay();
    } else { stopSizzle(); if (phase !== 'day') clock += dt; }
    frame = draw(ctx, cssW, cssH, dpr, S, R, ui, clock);
    updateItemBar();
    if (now - lastUI > 120){
      lastUI = now;
      UI.renderTop(S, R, phase, ui);
      UI.renderRail(S, R);
      UI.renderSide(S, R);
      UI.pumpToasts(R);
      if (ui.drawerOpen && phase === 'day') refreshDrawerTimers();
      if (ui.edit) refreshEditorCash();
    }
  }
  requestAnimationFrame(loop);
}
function refreshDrawerTimers(){ /* static drawer: nothing time-based to refresh */ }
let lastCash = null;
function refreshEditorCash(){ if (lastCash !== S.money){ lastCash = S.money; refreshEditor(); } }

// ---------- sound ----------
const HOT = new Set(['wok', 'wokPro', 'fryer', 'fryerPro', 'griddle', 'griddlePro', 'noodlePot', 'noodlePotPro', 'satayPot', 'satayPotPro']);
function playEvents(){
  const names = Object.fromEntries(Object.entries(MENU).map(([k, m]) => [k, m.zh]));
  for (const e of R.events.splice(0)){
    if (e.type === 'order') callOut(e.data, names);
    else if (e.type === 'out') sfx.bell();
    else if (sfx[e.type]) sfx[e.type]();
  }
  const cooking = R.avatar.phase === 'cook' && R.queue[0] && S.kitchen.find(k => k.id === R.queue[0].stationId);
  cooking && HOT.has(cooking.type) ? startSizzle() : stopSizzle();
}
function syncSoundBtn(){
  const m = soundMode();
  $('soundBtn').textContent = m === 'all' ? '♪ On' : m === 'sfx' ? '♪ No voice' : '♪ Off';
  $('soundBtn').title = m === 'all' ? (hasCantoneseVoice() ? 'Sound effects and Cantonese call-outs' : 'Sound effects (no Cantonese voice installed on this device)') : m === 'sfx' ? 'Sound effects only' : 'All sound off';
}
$('soundBtn').onclick = () => { cycleSound(); syncSoundBtn(); };
syncSoundBtn();

// ---------- debug hook: add ?debug to the URL ----------
if (new URLSearchParams(location.search).has('debug')){
  window.cct = {
    get S(){ return S; }, get R(){ return R; }, get ui(){ return ui; },
    cell(x, y, z = 0){ const [a, b] = frame.iso.P(x + .5, y + .5, z), r = canvas.getBoundingClientRect(); return [r.left + a, r.top + b]; },
    money(n){ S.money += n; },
    stars(n){ S.stars += n; },
    ff(sec){ for (let i = 0; i < sec * 10 && R && !R.over; i++) tick(S, R, .1); if (R && R.over) finishDay(); },
  };
}

// ---------- boot ----------
const saved = load();
S = saved || fresh();
syncKitchen(S);
if (new URLSearchParams(location.search).has('debug')) UI.modal(UI.titleHTML(!!saved));
else showSplash(() => UI.modal(UI.titleHTML(!!saved)));
requestAnimationFrame(loop);
if (document.fonts) document.fonts.ready.then(invalidateStatic);
