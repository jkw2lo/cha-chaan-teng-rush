// Counter Rush drawing: the side-on counter, on a fixed 1280×720 stage that the page scales to fit.
// Top: stools and customers against the back wall. Middle: the counter. Bottom: the prep area.
// Finished dishes use the cha chaan teng theme's icons (themes/cct/art.js), so they match the main game.
import { TAU, HAN, iconCanvas } from '../js/art.js';
import { INGREDIENTS, PARTS, APPLIANCES, STATIONS, VESSEL_NAME, RECIPES, RECIPE_STATION, DAY, candidates, finished, missing, rawInput, vesselOf, partZh } from './recipes.js';
import { spotDish, takings } from './sim.js';
import { phrase } from '../themes/cct/index.js';
import { ENDLESS, opensOn } from './levels.js';

export const W = 1280, H = 820;
const HUD = 48, COUNTER_Y = 296, PREP_Y = 372;
export const SEAT_X = [230, 500, 770, 1040];
const DOOR = { x: 1156, y: 132, w: 104 }, CLOCK = { x: 1208, y: 76 };

// ---------- layout: every clickable/droppable box ----------
// Each station is a column of three steps: bins (top), appliance or bun cabinet (middle), plate (bottom).
const COL_W = 268, COL_GAP = 10, HEAD_Y = 378, HEAD_H = 20, BIN_Y = 404, BIN_H = 70, MID_Y = 482, MID_H = 154, SPOT_Y = 646, SPOT_H = 164;
const stations = STATIONS.map((st, i) => {
  const x = 16 + i * (COL_W + COL_GAP), n = st.bins.length, bw = Math.min(104, (COL_W - 16 - (n - 1) * 8) / n), x0 = x + (COL_W - (n * bw + (n - 1) * 8)) / 2;
  return { ...st, i, x, w: COL_W,
    bins: st.bins.map((ing, k) => ({ ing, st: i, x: x0 + k * (bw + 8), y: BIN_Y, w: bw, h: BIN_H })),
    mid: { key: st.app, st: i, x: x + 8, y: MID_Y, w: COL_W - 16, h: MID_H },
    spot: { i, x: x + 8, y: SPOT_Y, w: COL_W - 16, h: SPOT_H } };
});
const UX = 16 + 4 * (COL_W + COL_GAP), UW = W - 16 - UX;
export const L = {
  seats: SEAT_X.map((x, i) => ({ i, x: x - 125, y: HUD, w: 250, h: PREP_Y - HUD, cx: x })),
  stations,
  bins: stations.flatMap(s => s.bins),
  spots: stations.map(s => s.spot),
  apps: Object.fromEntries(stations.filter(s => s.app).map(s => [s.app, s.mid])),
  cabinet: stations.find(s => s.cabinet).mid,
  phone: { x: UX, y: BIN_Y, w: UW, h: 122 },
  deliv: { x: UX, y: BIN_Y + 130, w: UW, h: MID_Y + MID_H - BIN_Y - 130 },
  trash: { x: UX, y: SPOT_Y, w: UW, h: SPOT_H },
};
export const inBox = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

// ---------- small helpers ----------
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
function text(c, s, x, y, font, col, align = 'center', base = 'middle'){
  c.font = font; c.fillStyle = col; c.textAlign = align; c.textBaseline = base; c.fillText(s, x, y);
}
const SANS = 'Karla, system-ui, sans-serif', SLAB = '"Zilla Slab", Georgia, serif';
function seeded(n){ let x = (n % 2147483646) + 1; return () => (x = x * 16807 % 2147483647) / 2147483647; }

// ---------- ingredients and parts ----------
function can(c, cx, cy, r, body, band, glyph){
  c.fillStyle = body; rr(c, cx - r * .5, cy - r * .6, r, r * 1.25, r * .12); c.fill();
  c.fillStyle = band; c.fillRect(cx - r * .5, cy - r * .22, r, r * .5);
  c.fillStyle = '#d7dbe0'; c.beginPath(); c.ellipse(cx, cy - r * .6, r * .5, r * .12, 0, 0, TAU); c.fill();
  text(c, glyph, cx, cy + r * .04, `900 ${r * .38}px ${HAN}`, body);
}
function butterSlab(c, cx, cy, r){
  c.fillStyle = '#f6d970'; c.strokeStyle = '#d4af37'; c.lineWidth = r * .05;
  c.beginPath(); c.moveTo(cx - r * .5, cy - r * .1); c.lineTo(cx + r * .4, cy - r * .22); c.lineTo(cx + r * .5, cy + r * .08); c.lineTo(cx - r * .4, cy + r * .2); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fff3b8'; c.beginPath(); c.moveTo(cx - r * .5, cy - r * .1); c.lineTo(cx + r * .4, cy - r * .22); c.lineTo(cx + r * .36, cy - r * .28); c.lineTo(cx - r * .54, cy - r * .16); c.closePath(); c.fill();
}
function slice(c, cx, cy, r, crust, crumb){
  c.fillStyle = crust; rr(c, cx - r * .48, cy - r * .5, r * .96, r * .92, r * .28); c.fill();
  c.fillStyle = crumb; rr(c, cx - r * .38, cy - r * .4, r * .76, r * .72, r * .2); c.fill();
}
function friedEgg(c, cx, cy, r){
  c.fillStyle = '#fffdf5'; c.beginPath();
  for (let k = 0; k <= 12; k++){ const a = k / 12 * TAU, q = r * (.44 + .06 * Math.sin(k * 2.3)); c.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * .7); }
  c.fill(); c.strokeStyle = '#e8dcc0'; c.lineWidth = r * .03; c.stroke();
  c.fillStyle = '#f5a623'; c.beginPath(); c.arc(cx + r * .05, cy - r * .04, r * .16, 0, TAU); c.fill();
}
function luncheon(c, cx, cy, r){
  for (const [dx, a] of [[-.14, -.15], [.14, .12]]){
    c.save(); c.translate(cx + dx * r, cy); c.rotate(a);
    c.fillStyle = '#e59a8f'; c.strokeStyle = '#c4625a'; c.lineWidth = r * .04;
    c.fillRect(-r * .26, -r * .16, r * .52, r * .32); c.strokeRect(-r * .26, -r * .16, r * .52, r * .32);
    c.fillStyle = 'rgba(160,70,50,.35)'; c.fillRect(-r * .26, r * .06, r * .52, r * .1);
    c.restore();
  }
}
function noodleBlock(c, cx, cy, r){
  c.fillStyle = '#f1d489'; rr(c, cx - r * .5, cy - r * .32, r, r * .64, r * .1); c.fill();
  c.strokeStyle = '#c99a2e'; c.lineWidth = r * .05;
  for (let i = 0; i < 4; i++){ c.beginPath(); const y = cy - r * .2 + i * r * .13; c.moveTo(cx - r * .44, y); for (let k = 1; k <= 8; k++) c.lineTo(cx - r * .44 + k * r * .11, y + (k % 2 ? r * .05 : -r * .05)); c.stroke(); }
}
function teaLeaves(c, cx, cy, r){
  c.fillStyle = '#3d2a1a';
  const rnd = seeded(7);
  for (let i = 0; i < 26; i++){ const a = rnd() * TAU, d = rnd() * r * .42; c.beginPath(); c.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .45, r * .07, r * .035, a, 0, TAU); c.fill(); }
}
// the picture on each bin (and on a spot, for loose parts)
export function drawIngredient(c, ing, cx, cy, r){
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  if (ing === 'tea'){ can(c, cx, cy, r * 1.1, '#6b1d16', '#e8c45a', '茶'); }
  else if (ing === 'milk'){ can(c, cx, cy, r, '#1f1f1f', '#f4f1ea', '奶'); }
  else if (ing === 'condensed'){ can(c, cx, cy, r, '#2f6fa8', '#f4f1ea', '煉'); }
  else if (ing === 'bun'){ c.drawImage(iconCanvas('bun', 96), cx - r, cy - r, r * 2, r * 2); }
  else if (ing === 'butter'){ butterSlab(c, cx, cy, r * 1.3); }
  else if (ing === 'bread'){ slice(c, cx, cy, r * 1.2, '#c49a5c', '#fbf0d6'); }
  else if (ing === 'noodles'){ noodleBlock(c, cx, cy, r * 1.3); }
  else if (ing === 'luncheon'){ c.fillStyle = '#2f5aa8'; rr(c, cx - r * .6, cy - r * .1, r * 1.2, r * .62, r * .08); c.fill(); text(c, '午餐肉', cx, cy + r * .21, `900 ${r * .26}px ${HAN}`, '#ffd23f'); luncheon(c, cx, cy - r * .28, r * .9); }
  else if (ing === 'egg'){ friedEgg(c, cx, cy, r * 1.3); }
  c.restore();
}

// ---------- vessels and dishes in progress ----------
function plate(c, cx, cy, r){
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(cx, cy + r * .1, r * .95, r * .3, 0, 0, TAU); c.fill();
  c.fillStyle = '#fbfaf5'; c.strokeStyle = '#c9c2b3'; c.lineWidth = r * .04; c.beginPath(); c.ellipse(cx, cy, r * .95, r * .3, 0, 0, TAU); c.fill(); c.stroke();
  c.strokeStyle = '#3f7fae'; c.lineWidth = r * .03; c.beginPath(); c.ellipse(cx, cy, r * .8, r * .24, 0, 0, TAU); c.stroke();
}
function cup(c, cx, cy, r, fill){
  c.fillStyle = '#f4f1ea'; c.strokeStyle = '#b9b1a0'; c.lineWidth = r * .05;
  c.beginPath(); c.ellipse(cx, cy + r * .55, r * .8, r * .2, 0, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.arc(cx + r * .56, cy + r * .1, r * .2, -Math.PI / 2, Math.PI / 2); c.lineWidth = r * .1; c.strokeStyle = '#fff'; c.stroke();
  c.lineWidth = r * .05; c.strokeStyle = '#b9b1a0';
  c.beginPath(); c.moveTo(cx - r * .58, cy - r * .2); c.lineTo(cx + r * .58, cy - r * .2); c.lineTo(cx + r * .4, cy + r * .5); c.lineTo(cx - r * .4, cy + r * .5); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.stroke();
  c.beginPath(); c.ellipse(cx, cy - r * .2, r * .56, r * .15, 0, 0, TAU); c.fillStyle = fill || '#e9e4d8'; c.fill(); c.stroke();
}
function bowl(c, cx, cy, r, inside){
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(cx, cy + r * .55, r * .7, r * .16, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(cx, cy - r * .15, r * .82, r * .3, 0, 0, TAU); c.fillStyle = '#e9d9b0'; c.fill();
  if (inside){ c.save(); c.clip(); inside(); c.restore(); }
  c.beginPath(); c.moveTo(cx - r * .82, cy - r * .15); c.quadraticCurveTo(cx - r * .78, cy + r * .5, cx, cy + r * .52); c.quadraticCurveTo(cx + r * .78, cy + r * .5, cx + r * .82, cy - r * .15);
  c.ellipse(cx, cy - r * .15, r * .82, r * .3, 0, 0, Math.PI); c.closePath(); c.fillStyle = '#fbfaf5'; c.fill();
  c.strokeStyle = '#3f7fae'; c.lineWidth = r * .05; c.beginPath(); c.moveTo(cx - r * .7, cy + r * .12); c.quadraticCurveTo(cx, cy + r * .32, cx + r * .7, cy + r * .12); c.stroke();
  c.strokeStyle = '#c9c2b3'; c.lineWidth = r * .04; c.beginPath(); c.ellipse(cx, cy - r * .15, r * .82, r * .3, 0, 0, TAU); c.stroke();
}
function noodlesIn(c, cx, cy, r){
  c.strokeStyle = '#f0cc6a'; c.lineWidth = r * .07;
  for (let i = 0; i < 5; i++){ c.beginPath(); const y = cy - r * .22 + i * r * .06; c.moveTo(cx - r * .7, y); for (let k = 1; k <= 10; k++) c.lineTo(cx - r * .7 + k * r * .14, y + Math.sin(k * 1.7 + i) * r * .04); c.stroke(); }
}
export const FLIGHT = .45;       // seconds for a dish to fly from its plate to the customer
// a clean, empty cup, plate or bowl (the outline on an empty station)
function drawEmptyClean(c, vessel, cx, cy, r){
  if (vessel === 'cup') cup(c, cx, cy, r, '#f4f1ea');
  else if (vessel === 'bowl') bowl(c, cx, cy, r);
  else plate(c, cx, cy + r * .3, r);
}
// empty dishes left on the counter
export function drawEmpty(c, vessel, cx, cy, r){
  c.save();
  if (vessel === 'cup'){ cup(c, cx, cy, r, '#d9c3a6'); }
  else if (vessel === 'bowl'){ bowl(c, cx, cy, r, () => { c.fillStyle = 'rgba(200,160,90,.5)'; c.beginPath(); c.ellipse(cx, cy - r * .1, r * .5, r * .12, 0, 0, TAU); c.fill(); }); }
  else { plate(c, cx, cy + r * .3, r); c.fillStyle = '#c98d3e'; for (const [dx, dy] of [[-.3, .25], [.1, .32], [.3, .22], [-.05, .38]]){ c.beginPath(); c.arc(cx + dx * r, cy + dy * r, r * .04, 0, TAU); c.fill(); } }
  c.restore();
}

// a bag of parts: a finished dish, a mess, or something on its way
export function drawBag(c, parts, mess, cx, cy, r){
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  const dish = !mess && finished(parts);
  if (dish){ c.drawImage(iconCanvas(dish, 128), cx - r * 1.15, cy - r * 1.2, r * 2.3, r * 2.3); c.restore(); return; }
  if (mess){ drawMess(c, parts, mess, cx, cy, r); c.restore(); return; }
  if (rawInput(parts)){
    if (parts[0] === 'tea'){ c.fillStyle = '#c9cfd4'; c.beginPath(); c.ellipse(cx, cy + r * .3, r * .7, r * .22, 0, 0, TAU); c.fill(); teaLeaves(c, cx, cy + r * .22, r * 1.3); }
    else { c.fillStyle = '#b98b55'; rr(c, cx - r * .9, cy + r * .1, r * 1.8, r * .4, r * .08); c.fill(); drawIngredient(c, parts[0], cx, cy - r * .05, r * .7); }
    c.restore(); return;
  }
  const v = vesselOf(parts), has = p => parts.includes(p);
  if (v === 'cup'){
    cup(c, cx, cy, r, has('brewTea') ? (has('milk') ? '#b8743f' : '#5a2e14') : has('milk') ? '#f7f1e2' : null);
  } else if (v === 'bowl'){
    bowl(c, cx, cy, r, () => {
      if (has('boiled')){ c.fillStyle = 'rgba(214,170,90,.55)'; c.fillRect(cx - r, cy - r * .5, r * 2, r); noodlesIn(c, cx, cy, r); }
      if (has('luncheon')) luncheon(c, cx - r * .2, cy - r * .22, r * .7);
      if (has('egg')) friedEgg(c, cx + r * .3, cy - r * .22, r * .6);
    });
  } else {
    plate(c, cx, cy + r * .35, r);
    if (has('toast')) slice(c, cx, cy + r * .12, r * .95, '#9a5a1e', '#e9a84a');
    if (has('bun')) c.drawImage(iconCanvas('bun', 96), cx - r * .8, cy - r * .75, r * 1.6, r * 1.6);
    if (has('butter')) butterSlab(c, cx + (has('bun') ? r * .05 : 0), cy + (has('bun') ? r * .02 : r * .05), r * .75);
    if (has('condensed')){ c.strokeStyle = '#fff8e8'; c.lineWidth = r * .08; c.beginPath(); c.moveTo(cx - r * .4, cy); c.bezierCurveTo(cx - r * .2, cy - r * .25, cx, cy + r * .25, cx + r * .2, cy); c.bezierCurveTo(cx + r * .3, cy - r * .1, cx + r * .35, cy + r * .2, cx + r * .45, cy + r * .1); c.stroke(); }
  }
  c.restore();
}

// a mess looks like what went wrong with it
function stink(c, cx, cy, r){
  c.strokeStyle = 'rgba(110,150,60,.75)'; c.lineWidth = r * .05;
  for (const dx of [-.3, 0, .3]){ c.beginPath(); c.moveTo(cx + dx * r, cy); for (let k = 1; k <= 6; k++) c.lineTo(cx + dx * r + Math.sin(k * 1.6) * r * .07, cy - k * r * .09); c.stroke(); }
}
function badge(c, x, y, r){
  c.fillStyle = '#c8372d'; c.beginPath(); c.arc(x, y, r * .2, 0, TAU); c.fill();
  c.strokeStyle = '#fff'; c.lineWidth = r * .06; c.beginPath(); c.moveTo(x - r * .08, y - r * .08); c.lineTo(x + r * .08, y + r * .08); c.moveTo(x + r * .08, y - r * .08); c.lineTo(x - r * .08, y + r * .08); c.stroke();
}
function partSprite(c, p, x, y, r){
  if (p === 'brewTea') cup(c, x, y, r * .5, '#5a2e14');
  else if (p === 'toast') slice(c, x, y, r * .5, '#9a5a1e', '#e9a84a');
  else if (p === 'boiled'){ c.strokeStyle = '#f0cc6a'; c.lineWidth = r * .06; for (let i = 0; i < 4; i++){ c.beginPath(); c.moveTo(x - r * .3, y + i * r * .06 - r * .1); for (let k = 1; k <= 6; k++) c.lineTo(x - r * .3 + k * r * .1, y + i * r * .06 - r * .1 + Math.sin(k * 1.7 + i) * r * .05); c.stroke(); } }
  else drawIngredient(c, p, x, y, r * .38);
}
function drawMess(c, parts, mess, cx, cy, r){
  if (mess === 'Weak tea'){ cup(c, cx, cy, r, '#d9b98a'); text(c, '?', cx + r * .7, cy - r * .5, `900 ${r * .5}px ${SLAB}`, '#9e1f19'); return; }
  if (mess === 'Pale toast'){ plate(c, cx, cy + r * .35, r); slice(c, cx, cy + r * .1, r * .95, '#d8c49a', '#fbf2dc'); text(c, '?', cx + r * .7, cy - r * .5, `900 ${r * .5}px ${SLAB}`, '#9e1f19'); return; }
  if (mess === 'Hard noodles'){ bowl(c, cx, cy, r, () => { c.fillStyle = 'rgba(214,170,90,.45)'; c.fillRect(cx - r, cy - r * .5, r * 2, r); noodleBlock(c, cx, cy - r * .2, r * .8); }); text(c, '?', cx + r * .8, cy - r * .5, `900 ${r * .5}px ${SLAB}`, '#9e1f19'); return; }
  // a wrong mix: everything that went in, in a heap, going off
  plate(c, cx, cy + r * .35, r);
  const rnd = seeded(parts.join('').length * 17 + parts.length);
  parts.forEach((p, i) => {
    const a = i / parts.length * TAU + rnd(), d = parts.length > 1 ? r * .32 : 0;
    c.save(); c.translate(cx + Math.cos(a) * d, cy + r * .12 + Math.sin(a) * d * .4); c.rotate((rnd() - .5) * .9);
    partSprite(c, p, 0, 0, r); c.restore();
  });
  stink(c, cx, cy - r * .35, r);
  badge(c, cx + r * .8, cy - r * .55, r);
}

// ---------- people ----------
const SKIN = ['#f1c7a0', '#e0ac7e', '#c98e62', '#f4d3b5', '#b87a50'];
const HAIR = ['#1b1512', '#2b211b', '#3a2c22', '#5c5c5c', '#9a9a9a'];
const OUTFITS = [
  { shirt: '#f4f4f0', tie: '#2f4f8a', name: 'office' },
  { shirt: '#e56b5d', floral: '#ffd1c9', name: 'auntie' },
  { shirt: '#fbfbf6', tie: '#1f5a3a', name: 'student' },
  { shirt: '#f28c28', vest: '#e8e23b', name: 'worker' },
  { shirt: '#eef0f2', singlet: true, name: 'uncle' },
  { shirt: '#6f8cae', name: 'casual' },
  { shirt: '#2f3e5c', blouse: '#fbfbf6', name: 'ol' },
  { shirt: '#3f9a5a', cap: '#c8372d', name: 'delivery' },
  { shirt: '#fbfbf6', pinafore: '#2f5aa8', name: 'schoolgirl' },
];
export function drawPerson(c, look, x, yBase, mood, t, eating, walking){
  const rnd = seeded(look);
  const skin = SKIN[Math.floor(rnd() * SKIN.length)], o = OUTFITS[Math.floor(rnd() * OUTFITS.length)];
  const old = o.name === 'uncle' || (o.name === 'auntie' && rnd() < .5);
  const hair = old ? HAIR[3 + Math.floor(rnd() * 2)] : HAIR[Math.floor(rnd() * 3)];
  const bob = eating ? Math.sin(t * 9) * 2.5 : 0;
  const headY = yBase - 118 + bob;
  c.save();
  // body
  const bodyPath = () => { c.beginPath(); c.moveTo(x - 50, yBase); c.lineTo(x - 44, yBase - 70); c.quadraticCurveTo(x - 40, yBase - 88, x - 18, yBase - 92); c.lineTo(x + 18, yBase - 92);
    c.quadraticCurveTo(x + 40, yBase - 88, x + 44, yBase - 70); c.lineTo(x + 50, yBase); c.closePath(); };
  c.fillStyle = o.shirt; bodyPath(); c.fill();
  if (o.singlet){ c.fillStyle = skin; c.beginPath(); c.moveTo(x - 44, yBase - 70); c.quadraticCurveTo(x - 40, yBase - 88, x - 18, yBase - 92); c.lineTo(x - 26, yBase - 60); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x + 44, yBase - 70); c.quadraticCurveTo(x + 40, yBase - 88, x + 18, yBase - 92); c.lineTo(x + 26, yBase - 60); c.closePath(); c.fill(); }
  if (o.floral){ c.fillStyle = o.floral; const r2 = seeded(look + 3); for (let i = 0; i < 12; i++){ c.beginPath(); c.arc(x - 38 + r2() * 76, yBase - 80 + r2() * 76, 4, 0, TAU); c.fill(); } }
  if (o.vest){ c.fillStyle = o.vest; c.fillRect(x - 42, yBase - 62, 20, 62); c.fillRect(x + 22, yBase - 62, 20, 62); c.fillStyle = '#d0d0d0'; c.fillRect(x - 42, yBase - 30, 20, 5); c.fillRect(x + 22, yBase - 30, 20, 5); }
  if (o.blouse){ c.fillStyle = o.blouse; c.beginPath(); c.moveTo(x - 14, yBase - 92); c.lineTo(x + 14, yBase - 92); c.lineTo(x, yBase - 52); c.closePath(); c.fill(); }
  if (o.pinafore){ c.fillStyle = o.pinafore; c.fillRect(x - 34, yBase - 58, 68, 58); c.fillRect(x - 26, yBase - 92, 9, 36); c.fillRect(x + 17, yBase - 92, 9, 36); }
  if (o.tie){ c.fillStyle = o.tie; c.beginPath(); c.moveTo(x - 5, yBase - 90); c.lineTo(x + 5, yBase - 90); c.lineTo(x + 7, yBase - 40); c.lineTo(x, yBase - 32); c.lineTo(x - 7, yBase - 40); c.closePath(); c.fill(); }
  // light from the fluorescent tubes up and to the left
  c.save(); bodyPath(); c.clip();
  const bl = c.createLinearGradient(x - 50, 0, x + 50, 0); bl.addColorStop(0, 'rgba(255,255,255,.14)'); bl.addColorStop(.5, 'rgba(255,255,255,0)'); bl.addColorStop(1, 'rgba(0,0,0,.16)');
  c.fillStyle = bl; c.fillRect(x - 52, yBase - 95, 104, 96); c.restore();
  // a collar on shirts
  if (['office', 'student', 'casual', 'delivery'].includes(o.name)){
    c.fillStyle = o.name === 'casual' || o.name === 'delivery' ? 'rgba(0,0,0,.14)' : '#ffffff';
    c.beginPath(); c.moveTo(x - 16, yBase - 93); c.lineTo(x - 2, yBase - 80); c.lineTo(x - 12, yBase - 76); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x + 16, yBase - 93); c.lineTo(x + 2, yBase - 80); c.lineTo(x + 12, yBase - 76); c.closePath(); c.fill();
  }
  // neck, ears and head
  c.fillStyle = skin; c.fillRect(x - 9, headY + 26, 18, 16);
  c.fillStyle = 'rgba(80,40,20,.14)'; c.fillRect(x - 9, headY + 26, 18, 7);
  c.fillStyle = skin; for (const ex of [-29, 29]){ c.beginPath(); c.ellipse(x + ex, headY + 4, 6, 9, 0, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(120,60,40,.18)'; for (const ex of [-29, 29]){ c.beginPath(); c.ellipse(x + ex, headY + 4, 3, 5, 0, 0, TAU); c.fill(); }
  c.fillStyle = skin; c.beginPath(); c.ellipse(x, headY, 30, 34, 0, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.ellipse(x, headY, 30, 34, 0, 0, TAU); c.clip();
  c.fillStyle = 'rgba(90,40,20,.1)'; c.beginPath(); c.ellipse(x + 16, headY + 6, 22, 36, 0, 0, TAU); c.fill(); c.restore();
  // hair
  c.fillStyle = hair;
  if (o.name === 'auntie'){ for (let i = 0; i < 9; i++){ c.beginPath(); c.arc(x - 28 + i * 7, headY - 26 + Math.abs(i - 4) * 2.5, 11, 0, TAU); c.fill(); } }
  else if (old && o.name === 'uncle'){ c.beginPath(); c.ellipse(x, headY - 24, 26, 10, 0, Math.PI, 0); c.fill(); c.fillRect(x - 31, headY - 18, 6, 18); c.fillRect(x + 25, headY - 18, 6, 18); }
  else if (o.name === 'student' && rnd() < .5){ c.beginPath(); c.ellipse(x, headY - 12, 33, 28, 0, Math.PI * 1.02, -.02); c.fill(); c.fillRect(x - 33, headY - 12, 10, 34); c.fillRect(x + 23, headY - 12, 10, 34); }
  else if (o.name === 'ol'){ c.beginPath(); c.ellipse(x, headY - 8, 34, 30, 0, Math.PI * 1.02, -.02); c.fill(); c.fillRect(x - 34, headY - 8, 12, 30); c.fillRect(x + 22, headY - 8, 12, 30); }
  else if (o.name === 'schoolgirl'){ c.beginPath(); c.ellipse(x, headY - 14, 32, 24, 0, Math.PI * 1.05, -.05); c.fill(); c.beginPath(); c.ellipse(x + 30, headY + 4, 9, 22, -.3, 0, TAU); c.fill(); c.fillStyle = '#c8372d'; c.fillRect(x + 22, headY - 16, 10, 6); }
  else { c.beginPath(); c.ellipse(x, headY - 14, 31, 24, 0, Math.PI * 1.05, -.05); c.fill(); }
  if (o.cap){ c.fillStyle = o.cap; c.beginPath(); c.ellipse(x, headY - 20, 31, 18, 0, Math.PI, 0); c.fill(); c.fillRect(x - 4, headY - 22, 44, 6); }
  if (o.name === 'worker'){ c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(x, headY - 22, 33, 20, 0, Math.PI, 0); c.fill(); c.fillRect(x - 38, headY - 24, 76, 5); }
  // face: cheeks, brows and a nose, then the eyes and mouth
  c.fillStyle = `rgba(230,110,100,${mood === 'happy' || eating ? .3 : .16})`;
  for (const cx2 of [-17, 17]){ c.beginPath(); c.ellipse(x + cx2, headY + 13, 6, 4, 0, 0, TAU); c.fill(); }
  if (mood !== 'angry'){
    c.strokeStyle = hair; c.lineWidth = 2.2; c.lineCap = 'round';
    const lift = mood === 'cross' ? 2 : 0;
    c.beginPath(); c.moveTo(x - 15, headY - 7 + lift); c.lineTo(x - 6, headY - 8); c.moveTo(x + 15, headY - 7 + lift); c.lineTo(x + 6, headY - 8); c.stroke();
  }
  c.strokeStyle = 'rgba(120,60,40,.45)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x + 1, headY + 3); c.quadraticCurveTo(x + 4, headY + 9, x, headY + 10); c.stroke();
  c.fillStyle = '#231d18';
  const eyeY = headY + 2;
  if (mood === 'angry'){ c.lineWidth = 2.5; c.strokeStyle = '#231d18'; c.beginPath(); c.moveTo(x - 16, eyeY - 9); c.lineTo(x - 5, eyeY - 5); c.moveTo(x + 16, eyeY - 9); c.lineTo(x + 5, eyeY - 5); c.stroke(); }
  if (eating){ c.lineWidth = 2.5; c.strokeStyle = '#231d18'; c.beginPath(); c.arc(x - 10, eyeY + 2, 5, Math.PI * 1.1, Math.PI * 1.9); c.arc(x + 10, eyeY + 2, 5, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  else { c.beginPath(); c.arc(x - 10, eyeY, 3, 0, TAU); c.arc(x + 10, eyeY, 3, 0, TAU); c.fill(); }
  if (old){ c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.arc(x - 10, eyeY, 8, 0, TAU); c.moveTo(x + 18, eyeY); c.arc(x + 10, eyeY, 8, 0, TAU); c.moveTo(x - 2, eyeY); c.lineTo(x + 2, eyeY); c.stroke(); }
  c.strokeStyle = '#7a3b2e'; c.lineWidth = 2.5; c.beginPath();
  const my = headY + 16;
  if (mood === 'happy' || eating) c.arc(x, my - 4, 8, .2 * Math.PI, .8 * Math.PI);
  else if (mood === 'cross' || mood === 'angry') c.arc(x, my + 6, 7, 1.2 * Math.PI, 1.8 * Math.PI);
  else { c.moveTo(x - 6, my); c.lineTo(x + 6, my); }
  c.stroke();
  if (mood === 'angry'){ c.fillStyle = 'rgba(210,60,40,.25)'; c.beginPath(); c.ellipse(x, headY + 8, 26, 16, 0, 0, TAU); c.fill(); }
  if (walking){
    // arms swinging at their sides
    const sw = Math.sin(t * 10) * 8;
    c.fillStyle = o.singlet ? skin : o.shirt;
    c.beginPath(); c.ellipse(x - 48, yBase - 50 + sw, 10, 26, .12, 0, TAU); c.ellipse(x + 48, yBase - 50 - sw, 10, 26, -.12, 0, TAU); c.fill();
    c.fillStyle = skin; c.beginPath(); c.arc(x - 50, yBase - 24 + sw, 8, 0, TAU); c.arc(x + 50, yBase - 24 - sw, 8, 0, TAU); c.fill();
  } else {
    // arms resting on the counter
    c.fillStyle = o.singlet ? skin : o.shirt;
    c.beginPath(); c.ellipse(x - 44, yBase - 8, 14, 10, 0, 0, TAU); c.ellipse(x + 44, yBase - 8, 14, 10, 0, 0, TAU); c.fill();
    c.fillStyle = skin; c.beginPath(); c.ellipse(x - 30, yBase - 4, 11, 7, 0, 0, TAU); c.ellipse(x + 30, yBase - 4, 11, 7, 0, 0, TAU); c.fill();
  }
  c.restore();
}

// ---------- the room ----------
let bg = null;
function drawRoom(c){
  // back wall: mint tiles over a green dado, the classic cha chaan teng
  c.fillStyle = '#d3e4d4'; c.fillRect(0, HUD, W, COUNTER_Y - HUD);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1;
  for (let y = HUD + 18; y < 220; y += 22){ c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (let x = 0; x < W; x += 22){ c.beginPath(); c.moveTo(x, HUD); c.lineTo(x, 220); c.stroke(); }
  c.fillStyle = '#efe6cf'; c.fillRect(0, 216, W, 8);
  c.fillStyle = '#2f6f5e'; c.fillRect(0, 224, W, COUNTER_Y - 224);
  c.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 40) c.fillRect(x, 224, 2, COUNTER_Y - 224);
  // hanging price boards between the seats
  const boards = [['熱奶茶', 18], ['菠蘿油', 16], ['奶油多', 18], ['餐蛋麵', 34]];
  [95, 365, 635, 905].forEach((x, i) => {
    const [zh, p] = boards[i], bx = x, by = 64;
    c.strokeStyle = '#5a3a24'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + 12, HUD); c.lineTo(bx + 12, by); c.moveTo(bx + 38, HUD); c.lineTo(bx + 38, by); c.stroke();
    c.fillStyle = '#c8372d'; rr(c, bx, by, 50, 132, 4); c.fill();
    c.strokeStyle = '#f2d27a'; c.lineWidth = 2; rr(c, bx + 3, by + 3, 44, 126, 3); c.stroke();
    [...zh].forEach((ch, k) => text(c, ch, bx + 25, by + 22 + k * 26, `900 21px ${HAN}`, '#fff3d6'));
    text(c, `$${p}`, bx + 25, by + 116, `700 15px ${SLAB}`, '#f2d27a');
  });
  // the wall clock, over the door
  c.fillStyle = '#fbf6ea'; c.beginPath(); c.arc(CLOCK.x, CLOCK.y, 24, 0, TAU); c.fill(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#231d18'; for (let k = 0; k < 12; k++){ const a = k / 12 * TAU; c.fillRect(CLOCK.x + Math.sin(a) * 19 - 1, CLOCK.y - Math.cos(a) * 19 - 1, 2, 2); }
  // the doorway: a dark recess the glass door swings in
  c.fillStyle = '#5a3a24'; c.fillRect(DOOR.x - 8, DOOR.y - 8, DOOR.w + 16, COUNTER_Y - DOOR.y + 8);
  c.fillStyle = '#26303a'; c.fillRect(DOOR.x, DOOR.y, DOOR.w, COUNTER_Y - DOOR.y);
  c.fillStyle = '#c8372d'; rr(c, DOOR.x - 10, DOOR.y - 30, DOOR.w + 20, 22, 3); c.fill();
  text(c, '歡迎光臨', DOOR.x + DOOR.w / 2, DOOR.y - 19, `900 14px ${HAN}`, '#f2d27a');
  // stools, behind the counter: chrome rim and red vinyl
  for (const x of SEAT_X){
    c.fillStyle = '#9aa3a9'; rr(c, x - 38, COUNTER_Y - 10, 76, 12, 6); c.fill();
    c.fillStyle = '#b3261e'; rr(c, x - 35, COUNTER_Y - 18, 70, 12, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,.3)'; rr(c, x - 26, COUNTER_Y - 16, 34, 3, 2); c.fill();
  }
  // the counter: formica top, a wooden front with a red kick strip
  c.fillStyle = '#e9e1cc'; c.fillRect(0, COUNTER_Y, W, 40);
  c.fillStyle = '#f7f2e3'; c.fillRect(0, COUNTER_Y, W, 5);
  c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = 0; x < W; x += 9) c.fillRect(x, COUNTER_Y + 8 + (x * 7) % 26, 3, 2);
  c.fillStyle = '#8a5a3a'; c.fillRect(0, COUNTER_Y + 40, W, PREP_Y - COUNTER_Y - 40);
  c.fillStyle = '#6f4630'; for (let x = 0; x < W; x += 64) c.fillRect(x, COUNTER_Y + 40, 3, PREP_Y - COUNTER_Y - 40);
  c.fillStyle = '#c8372d'; c.fillRect(0, PREP_Y - 6, W, 6);
  // what lives on every cha chaan teng counter, between the stools
  condiments(c, 365, 'sugar'); condiments(c, 635, 'sauce'); condiments(c, 905, 'sugar'); condiments(c, 95, 'sauce');
  // our side of the counter: a white-tiled backsplash behind the ingredients, a steel bench below
  const bs = MID_Y - 6;
  c.fillStyle = '#eef0ec'; c.fillRect(0, PREP_Y, W, bs - PREP_Y);
  c.strokeStyle = 'rgba(150,160,158,.45)'; c.lineWidth = 1;
  for (let y = PREP_Y + 13, row = 0; y < bs; y += 13, row++){
    c.beginPath(); c.moveTo(0, y + .5); c.lineTo(W, y + .5); c.stroke();
    for (let x = (row % 2) * 13; x < W; x += 26){ c.beginPath(); c.moveTo(x + .5, y - 13); c.lineTo(x + .5, y); c.stroke(); }
  }
  const sh = c.createLinearGradient(0, PREP_Y, 0, PREP_Y + 14); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = sh; c.fillRect(0, PREP_Y, W, 14);                       // the counter's shadow on the tiles
  const g = c.createLinearGradient(0, bs, 0, H); g.addColorStop(0, '#c9d0d4'); g.addColorStop(.06, '#b3bbc0'); g.addColorStop(1, '#8f989e');
  c.fillStyle = g; c.fillRect(0, bs, W, H - bs);
  c.fillStyle = 'rgba(255,255,255,.07)'; for (let y = bs + 6; y < H; y += 4) c.fillRect(0, y, W, 1);
  c.fillStyle = '#e8ecee'; c.fillRect(0, bs, W, 2);                    // the bench's front lip
  // each station: an enamel sign on top, a faint lane down the bench, arrows through its three steps
  for (const st of [...stations, { x: UX, w: UW, zh: '入貨', name: 'Supplies', color: '#5d4a3a' }]){
    enamel(c, st.x + 4, HEAD_Y, st.w - 8, HEAD_H, st.color, st.zh, st.name);
    if (!st.bins) continue;
    c.fillStyle = 'rgba(255,255,255,.1)'; rr(c, st.x, bs + 4, st.w, H - bs - 8, 10); c.fill();
    for (const y of [MID_Y - 3, SPOT_Y - 5]){
      c.fillStyle = st.color; c.beginPath(); c.moveTo(st.x + st.w / 2 - 9, y - 4); c.lineTo(st.x + st.w / 2 + 9, y - 4); c.lineTo(st.x + st.w / 2, y + 5); c.closePath(); c.fill();
    }
  }
  // fluorescent tubes along the top of the wall
  for (const x of [230, 770]){
    c.fillStyle = '#dfe4e2'; rr(c, x - 110, HUD + 2, 220, 9, 4); c.fill();
    c.fillStyle = '#ffffff'; rr(c, x - 104, HUD + 4, 208, 4, 2); c.fill();
  }
  const glow = c.createLinearGradient(0, HUD, 0, 220); glow.addColorStop(0, 'rgba(255,255,240,.28)'); glow.addColorStop(1, 'rgba(255,255,240,0)');
  c.fillStyle = glow; c.fillRect(0, HUD, W, 172);
}
// an enamel sign: coloured plate, white keyline, white lettering
function enamel(c, x, y, w, h, col, zh, en){
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, x + 1, y + 2, w, h, 5); c.fill();
  c.fillStyle = col; rr(c, x, y, w, h, 5); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.2; rr(c, x + 2.5, y + 2.5, w - 5, h - 5, 3); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.14)'; rr(c, x + 3, y + 3, w - 6, (h - 6) / 2, 2); c.fill();
  c.font = `900 13px ${HAN}`; const zw = c.measureText(zh).width;
  c.font = `700 11px ${SANS}`; const ew = c.measureText(en.toUpperCase()).width;
  const x0 = x + w / 2 - (zw + 8 + ew) / 2;
  text(c, zh, x0, y + h / 2 + .5, `900 13px ${HAN}`, '#fff', 'left');
  c.save(); c.font = `700 11px ${SANS}`; c.fillStyle = '#fff'; c.textAlign = 'left'; c.textBaseline = 'middle';
  if ('letterSpacing' in c) c.letterSpacing = '1px';
  c.fillText(en.toUpperCase(), x0 + zw + 8, y + h / 2 + .5); c.restore();
}
function condiments(c, x, kind){
  const base = COUNTER_Y + 22;
  c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x, base + 2, 40, 5, 0, 0, TAU); c.fill();
  if (kind === 'sugar'){
    // glass sugar pourer with a steel cap, and a box of tissues
    c.fillStyle = 'rgba(220,235,240,.85)'; rr(c, x - 30, base - 34, 22, 34, 4); c.fill();
    c.fillStyle = '#fbfaf5'; c.fillRect(x - 28, base - 20, 18, 18);
    c.fillStyle = '#b9c1c6'; c.beginPath(); c.moveTo(x - 32, base - 34); c.lineTo(x - 6, base - 34); c.lineTo(x - 14, base - 44); c.lineTo(x - 24, base - 44); c.closePath(); c.fill();
    c.fillStyle = '#e8d6a8'; rr(c, x - 2, base - 18, 34, 18, 2); c.fill();
    c.fillStyle = '#c8372d'; c.fillRect(x - 2, base - 12, 34, 4);
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 8, base - 18); c.quadraticCurveTo(x + 15, base - 30, x + 22, base - 18); c.fill();
  } else {
    // soy sauce, Worcestershire (喼汁) and a pot of toothpicks
    c.fillStyle = '#3a1d10'; rr(c, x - 30, base - 30, 13, 30, 3); c.fill(); c.fillRect(x - 27, base - 40, 7, 10);
    c.fillStyle = '#c8372d'; c.fillRect(x - 30, base - 20, 13, 7);
    c.fillStyle = '#5a2a14'; rr(c, x - 12, base - 26, 13, 26, 3); c.fill(); c.fillRect(x - 9, base - 34, 7, 8);
    c.fillStyle = '#f2d27a'; c.fillRect(x - 12, base - 16, 13, 6);
    c.fillStyle = '#6fa8c9'; rr(c, x + 8, base - 16, 16, 16, 3); c.fill();
    c.strokeStyle = '#e8d6a8'; c.lineWidth = 1.5; for (let i = 0; i < 5; i++){ c.beginPath(); c.moveTo(x + 11 + i * 2.5, base - 16); c.lineTo(x + 10 + i * 3, base - 26); c.stroke(); }
  }
}
function drawDoor(c, run, t){
  // the glass door swings open while someone's walking through it
  const near = [...run.seats.map(s => s.cust).filter(Boolean), ...run.walkers].some(p => (p.state === 'arrive' || p.state === 'leave') && p.x > DOOR.x - 40);
  doorOpen += ((near ? 1 : 0) - doorOpen) * .15;
  const w = DOOR.w * (1 - .7 * doorOpen), h = COUNTER_Y - DOOR.y;
  c.fillStyle = '#b3261e'; c.fillRect(DOOR.x + DOOR.w - w, DOOR.y, w, h);
  c.fillStyle = 'rgba(170,215,230,.75)'; c.fillRect(DOOR.x + DOOR.w - w + 7, DOOR.y + 7, w - 14, h - 7);
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(DOOR.x + DOOR.w - w + 12, DOOR.y + 10); c.lineTo(DOOR.x + DOOR.w - w + 12 + w * .3, DOOR.y + 10); c.lineTo(DOOR.x + DOOR.w - w + 12, DOOR.y + 70); c.fill();
  if (w > 50){ c.fillStyle = '#f2d27a'; rr(c, DOOR.x + DOOR.w - w + w / 2 - 20, DOOR.y + 70, 40, 20, 3); c.fill(); text(c, '推 PUSH', DOOR.x + DOOR.w - w / 2, DOOR.y + 80, `700 10px ${SANS}`, '#2a221c'); }
  c.fillStyle = '#d7dbe0'; c.fillRect(DOOR.x + DOOR.w - w + 6, DOOR.y + 100, 4, 40);
}
let doorOpen = 0;
function background(){
  if (bg) return bg;
  bg = document.createElement('canvas'); bg.width = W * 2; bg.height = H * 2;
  const c = bg.getContext('2d'); c.scale(2, 2); drawRoom(c);
  return bg;
}

// ---------- the stage ----------
function clock(c, t){
  // the day runs from 07:00 to 11:00 (breakfast) on the wall clock
  const mins = 7 * 60 + Math.min(1, t / DAY.seconds) * 240;
  const h = (mins / 60) % 12, m = mins % 60;
  c.strokeStyle = '#231d18'; c.lineCap = 'round';
  const { x, y } = CLOCK;
  c.lineWidth = 3.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(h / 12 * TAU) * 11, y - Math.cos(h / 12 * TAU) * 11); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(m / 60 * TAU) * 18, y - Math.cos(m / 60 * TAU) * 18); c.stroke();
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(Math.floor(mins % 60)).padStart(2, '0')}`;
}
function hud(c, run, time){
  c.fillStyle = '#15302a'; c.fillRect(0, 0, W, HUD);
  c.fillStyle = '#9e1f19'; rr(c, 12, 8, 150, 32, 4); c.fill(); c.strokeStyle = '#f2d27a'; c.lineWidth = 2; rr(c, 13, 9, 148, 30, 4); c.stroke();
  text(c, '茶餐廳', 58, 25, `900 18px ${HAN}`, '#f2d27a'); text(c, 'Counter', 124, 25, `700 16px ${SLAB}`, '#fff');
  const tk = takings(run), diff = run.cfgLabel.split(' ').pop();
  if (run.endless){
    // Do or Die: the level, the strikes left, and how far to the next level
    text(c, `搏命 Level ${run.level}`, 190, 25, `900 20px ${HAN}`, '#ffd23f', 'left');
    for (let k = 0; k < run.strikes; k++){
      const x = 350 + k * 26, gone = k < run.walkouts;
      c.fillStyle = gone ? '#c8372d' : 'rgba(255,255,255,.14)'; c.beginPath(); c.arc(x, 24, 10, 0, TAU); c.fill();
      text(c, gone ? '✗' : '', x, 25, `700 13px ${SANS}`, '#fff');
    }
    text(c, `walkouts · ${diff}`, 350 + run.strikes * 26 - 6, 25, `500 13px ${SANS}`, '#cfd8d2', 'left');
    const from = run.level > 1 ? ENDLESS.mark(run.level - 1) : 0, tf = Math.min(1, (tk - from) / (run.nextMark - from));
    text(c, 'Next level', 680, 25, `700 12px ${SANS}`, '#9fb4aa', 'left');
    c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, 760, 16, 200, 16, 8); c.fill();
    c.fillStyle = '#ffd23f'; rr(c, 760, 16, Math.max(16, 200 * tf), 16, 8); c.fill();
    text(c, `$${tk} / $${run.nextMark}`, 860, 25, `700 12px ${SANS}`, tf > .55 ? '#2a221c' : '#fff');
  } else {
    // the day: clock, time left, and the takings target
    const f = Math.min(1, run.t / DAY.seconds);
    text(c, time, 190, 25, `700 22px ${SLAB}`, '#fff', 'left');
    c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, 262, 18, 180, 12, 6); c.fill();
    c.fillStyle = run.closed ? '#c8372d' : '#f2d27a'; rr(c, 262, 18, Math.max(12, 180 * f), 12, 6); c.fill();
    text(c, `${run.closed ? 'Closing up' : `Day ${run.cfg.day}`} · ${diff}`, 452, 25, `700 13px ${SANS}`, '#cfd8d2', 'left');
    const tf = Math.min(1, tk / run.target);
    text(c, 'Takings', 700, 25, `700 12px ${SANS}`, '#9fb4aa', 'left');
    c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, 760, 16, 200, 16, 8); c.fill();
    c.fillStyle = tk >= run.target ? '#2e9e5b' : '#e39b2d'; rr(c, 760, 16, Math.max(16, 200 * tf), 16, 8); c.fill();
    text(c, `$${tk} / $${run.target}`, 860, 25, `700 12px ${SANS}`, '#fff');
  }
  text(c, 'Cash', 1010, 25, `700 12px ${SANS}`, '#9fb4aa', 'left');
  text(c, `${run.cash < 0 ? '−$' : '$'}${Math.abs(Math.floor(run.cash))}`, 1046, 25, `700 22px ${SLAB}`, run.cash < 0 ? '#ff8a7a' : '#fff', 'left');
}

function bubble(c, cust, x, t){
  const n = cust.order.length, bw = 30 + n * 70, bh = 96, bx = x - bw / 2, by = 52;
  c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, bx + 2, by + 4, bw, bh, 12); c.fill();
  c.fillStyle = '#fffdf6'; rr(c, bx, by, bw, bh, 12); c.fill();
  c.beginPath(); c.moveTo(x - 10, by + bh); c.lineTo(x + 6, by + bh + 12); c.lineTo(x + 10, by + bh); c.fill();
  cust.order.forEach((d, j) => {
    const ix = bx + 15 + j * 70 + 35;
    c.globalAlpha = cust.got[j] ? .35 : 1;
    c.drawImage(iconCanvas(d, 128), ix - 28, by + 6, 56, 56);
    c.globalAlpha = 1;
    text(c, RECIPES[d].zh, ix, by + 74, `900 14px ${HAN}`, '#2a221c');
    if (cust.got[j]){ c.strokeStyle = '#2e9e5b'; c.lineWidth = 5; c.beginPath(); c.moveTo(ix - 12, by + 34); c.lineTo(ix - 2, by + 44); c.lineTo(ix + 16, by + 22); c.stroke(); }
  });
  // patience
  const f = Math.max(0, cust.patience / cust.max), px = bx + 10, pw = bw - 20;
  c.fillStyle = '#e4dccb'; rr(c, px, by + bh - 12, pw, 6, 3); c.fill();
  c.fillStyle = f > .5 ? '#2e9e5b' : f > .25 ? '#e39b2d' : '#c8372d';
  if (f <= .25 && Math.sin(t * 12) > 0) c.fillStyle = '#ff5a4d';
  rr(c, px, by + bh - 12, Math.max(6, pw * f), 6, 3); c.fill();
}

function timerBar(c, a, def, x, y, w, t){
  const h = 12, span = def.burn;
  c.fillStyle = '#5d656c'; rr(c, x, y, w, h, 6); c.fill();
  c.save(); rr(c, x, y, w, h, 6); c.clip();
  c.fillStyle = '#8f989e'; c.fillRect(x, y, w * def.ready / span, h);
  c.fillStyle = '#2e9e5b'; c.fillRect(x + w * def.ready / span, y, w * (1 - def.ready / span), h);
  const warn = (def.burn - def.ready) * .35;
  c.fillStyle = '#e39b2d'; c.fillRect(x + w * (span - warn) / span, y, w * warn / span, h);
  c.restore();
  if (a.part){
    const px = x + w * Math.min(1, a.t / span);
    c.fillStyle = '#fff'; c.strokeStyle = '#231d18'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(px, y - 3); c.lineTo(px + 6, y - 10); c.lineTo(px - 6, y - 10); c.closePath(); c.fill(); c.stroke();
    c.fillRect(px - 1.5, y - 2, 3, h + 4);
  }
}
function appliance(c, key, a, box, t, run, pulling){
  const def = { ...APPLIANCES[key], ...run.timing[key] }, { x, y, w, h } = box, cx = x + w / 2;
  const ready = a.part && !a.ruined && a.t >= def.ready, late = ready && a.t >= def.burn - (def.burn - def.ready) * .35;
  stovePlate(c, box);
  if (ready){ c.strokeStyle = late && Math.sin(t * 14) > 0 ? '#ff5a4d' : '#2e9e5b'; c.lineWidth = 3; rr(c, x + 1.5, y + 1.5, w - 3, h - 3, 10); c.stroke(); }
  // the art is drawn in a 210-wide frame and scaled into the box
  const s = .74;
  c.save(); c.translate(cx - 105 * s, y + 24 - 36 * s); c.scale(s, s);
  applianceArt(c, key, a, def, t, pulling);
  c.restore();
  label(c, def.zh, def.name.split(' ')[0] === 'Kettle' ? 'Kettle' : def.name, x, y);
  timerBar(c, a, def, x + 12, y + h - 16, w - 24, t);
  let hint = '';
  if (a.ruined) hint = `${def.late}! Click to bin`;
  else if (!a.part) hint = key === 'kettle' ? 'Click tea leaves ↑' : key === 'toaster' ? 'Click bread ↑' : 'Click noodles ↑';
  else if (a.t < def.ready) hint = key === 'kettle' ? 'Brewing…' : key === 'toaster' ? 'Toasting…' : 'Boiling…';
  else hint = key === 'kettle' ? 'Ready: hold to pull ↓' : 'Ready: click to take out ↓';
  const hcol = a.ruined ? '#9e1f19' : ready ? '#1d6b3f' : '#3a4448';
  c.fillStyle = 'rgba(255,255,255,.82)'; rr(c, x + 12, y + h - 40, w - 24, 18, 9); c.fill();
  text(c, hint, cx, y + h - 31, `700 12px ${SANS}`, hcol);
}
function label(c, zh, en, x, y){
  c.font = `900 15px ${HAN}`; const zw = c.measureText(zh).width;
  c.font = `700 12px ${SANS}`; const nw = c.measureText(en).width;
  c.fillStyle = 'rgba(233,236,238,.9)'; rr(c, x + 5, y + 5, zw + nw + 22, 21, 10); c.fill();
  text(c, zh, x + 12, y + 15.5, `900 15px ${HAN}`, '#2a221c', 'left');
  text(c, en, x + 18 + zw, y + 15.5, `700 12px ${SANS}`, '#3a4448', 'left');
}
function applianceArt(c, key, a, def, t, pulling){
  const x = 0, y = 0, cx = 105;
  const heat = a.part && !a.ruined;
  if (key === 'kettle'){
    // burner
    c.fillStyle = '#3b3f44'; rr(c, x + 18, y + 132, 104, 16, 4); c.fill();
    if (heat){ c.fillStyle = '#4f8cff'; for (let i = 0; i < 7; i++){ const fx = x + 30 + i * 13, fh = 6 + 3 * Math.sin(t * 20 + i); c.beginPath(); c.moveTo(fx - 4, y + 132); c.lineTo(fx, y + 132 - fh); c.lineTo(fx + 4, y + 132); c.fill(); } }
    // big aluminium kettle
    const kg = c.createLinearGradient(x + 26, 0, x + 114, 0); kg.addColorStop(0, '#9aa3a9'); kg.addColorStop(.4, '#e3e7ea'); kg.addColorStop(1, '#8a9398');
    c.fillStyle = kg; rr(c, x + 26, y + 58, 88, 74, 10); c.fill();
    c.fillStyle = '#7d868d'; rr(c, x + 22, y + 52, 96, 10, 4); c.fill();
    c.strokeStyle = '#7d868d'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 114, y + 76); c.quadraticCurveTo(x + 140, y + 70, x + 146, y + 52); c.stroke();
    c.strokeStyle = '#231d18'; c.lineWidth = 5; c.beginPath(); c.arc(x + 70, y + 52, 26, Math.PI, 0); c.stroke();
    // the sock on its stand
    c.strokeStyle = '#5d656c'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 150, y + 148); c.lineTo(x + 150, y + 40); c.lineTo(x + 180, y + 40); c.stroke();
    c.strokeStyle = '#6b6f73'; c.lineWidth = 2; c.beginPath(); c.arc(x + 180, y + 52, 12, 0, TAU); c.stroke();
    c.fillStyle = a.part ? '#b07a45' : '#efe3c8'; c.beginPath(); c.moveTo(x + 168, y + 52); c.quadraticCurveTo(x + 172, y + 100, x + 180, y + 104); c.quadraticCurveTo(x + 188, y + 100, x + 192, y + 52); c.closePath(); c.fill();
    cup(c, x + 180, y + 130, 18, '#e9e4d8');
    if (a.pull > 0){ const f = Math.min(1, a.pull / def.pull); c.fillStyle = '#5a2e14'; c.beginPath(); c.ellipse(x + 180, y + 126.4, 10 * f, 2.7 * f, 0, 0, TAU); c.fill(); }
    if (pulling && a.part){
      // tea arcing from the kettle, through the sock, into the cup
      c.strokeStyle = 'rgba(120,60,20,.9)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 146, y + 52); c.quadraticCurveTo(x + 168, y + 10, x + 180, y + 50); c.stroke();
      c.lineWidth = 3; c.beginPath(); c.moveTo(x + 180, y + 104); c.lineTo(x + 180, y + 122); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.arc(cx, y + 92, 34, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, a.pull / def.pull)); c.stroke();
    }
    if (heat) steam(c, x + 70, y + 40, t, a.t >= def.ready);
  } else if (key === 'toaster'){
    const tx = x + 40, ty = y + 70;
    const tg = c.createLinearGradient(tx, 0, tx + 130, 0); tg.addColorStop(0, '#8a9398'); tg.addColorStop(.5, '#e8ecef'); tg.addColorStop(1, '#7d868d');
    // bread peeking out of the slots, browning as it goes
    if (a.part){
      const k = Math.min(1, a.t / def.burn), col = a.ruined ? '#2b2018' : k < def.ready / def.burn ? '#f0dcae' : k < .8 ? '#d99a4a' : '#8a4a1e';
      const up = a.t >= def.ready && !a.ruined ? 22 : 4;
      for (const sx of [tx + 22, tx + 74]){ c.fillStyle = col; rr(c, sx, ty - up, 36, 30, 8); c.fill(); }
    }
    c.fillStyle = tg; rr(c, tx, ty, 130, 78, 16); c.fill();
    c.fillStyle = '#3b3f44'; rr(c, tx + 18, ty + 4, 42, 8, 3); c.fill(); rr(c, tx + 70, ty + 4, 42, 8, 3); c.fill();
    c.fillStyle = heat ? '#ff7a3d' : '#5d656c'; rr(c, tx + 136, ty + (a.part ? 50 : 16), 16, 10, 3); c.fill();
    c.fillStyle = '#5d656c'; c.fillRect(tx + 130, ty + 14, 6, 50);
    if (heat){ c.fillStyle = 'rgba(255,120,40,.35)'; rr(c, tx + 18, ty + 4, 94, 8, 3); c.fill(); }
    if (a.ruined) smoke(c, tx + 65, ty - 10, t);
  } else if (key === 'pot'){
    c.fillStyle = '#3b3f44'; rr(c, x + 40, y + 132, 130, 16, 4); c.fill();
    if (heat){ c.fillStyle = '#4f8cff'; for (let i = 0; i < 9; i++){ const fx = x + 52 + i * 13, fh = 6 + 3 * Math.sin(t * 18 + i); c.beginPath(); c.moveTo(fx - 4, y + 132); c.lineTo(fx, y + 132 - fh); c.lineTo(fx + 4, y + 132); c.fill(); } }
    const pg = c.createLinearGradient(x + 44, 0, x + 166, 0); pg.addColorStop(0, '#7d868d'); pg.addColorStop(.45, '#d8dde0'); pg.addColorStop(1, '#6f787e');
    c.fillStyle = pg; rr(c, x + 44, y + 66, 122, 66, 8); c.fill();
    c.fillStyle = '#5d656c'; c.fillRect(x + 30, y + 76, 16, 6); c.fillRect(x + 164, y + 76, 16, 6);
    c.fillStyle = '#9cc3d0'; c.beginPath(); c.ellipse(x + 105, y + 66, 61, 12, 0, 0, TAU); c.fill();
    if (a.part){
      const soft = a.t >= def.ready;
      if (!soft){ c.save(); c.beginPath(); c.ellipse(x + 105, y + 66, 58, 10, 0, 0, TAU); c.clip(); noodleBlock(c, x + 105, y + 64, 44); c.restore(); }
      else { c.strokeStyle = a.ruined ? '#d8c89a' : '#f0cc6a'; c.lineWidth = 3; for (let i = 0; i < 4; i++){ c.beginPath(); c.moveTo(x + 62, y + 60 + i * 4); for (let k = 1; k <= 12; k++) c.lineTo(x + 62 + k * 7, y + 60 + i * 4 + Math.sin(k * 1.3 + i + t * 3) * 3); c.stroke(); } }
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++){ const bx = x + 60 + ((i * 37 + t * 60) % 90), by = y + 64 + Math.sin(t * 7 + i) * 3; c.beginPath(); c.arc(bx, by, 2.5, 0, TAU); c.fill(); }
      steam(c, x + 105, y + 50, t, soft);
    }
  }
  if (a.ruined){ smoke(c, cx, y + 70, t); }
  if (a.ruined){ smoke(c, cx, y + 70, t); }
}
// the bun cabinet: a glass case of pineapple buns; click it for one
function cabinet(c, box, n, t){
  const { x, y, w, h } = box, cx = x + w / 2;
  stovePlate(c, box);
  const gx = cx - 90, gy = y + 30, gw = 180, gh = 72;
  c.fillStyle = '#8a5a3a'; rr(c, gx - 6, gy + gh - 4, gw + 12, 16, 4); c.fill();
  c.fillStyle = 'rgba(200,230,240,.35)'; rr(c, gx, gy, gw, gh, 6); c.fill();
  c.fillStyle = '#e8e2d0'; c.fillRect(gx + 6, gy + 40, gw - 12, 3);
  const shown = Math.min(n, 8);
  for (let k = 0; k < shown; k++){
    const row = k < 4 ? 1 : 0, col = k % 4;
    c.drawImage(iconCanvas('bun', 96), gx + 12 + col * 41, gy + (row ? 44 : 4), 36, 36);
  }
  c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(gx + 8, gy + 4); c.lineTo(gx + 40, gy + 4); c.lineTo(gx + 8, gy + 60); c.fill();
  c.strokeStyle = '#c9a57a'; c.lineWidth = 3; rr(c, gx, gy, gw, gh, 6); c.stroke();
  label(c, '麵包櫃', 'Bun cabinet', x, y);
  badge2(c, x + w - 16, y + 16, n);
  c.fillStyle = 'rgba(255,255,255,.82)'; rr(c, x + 12, y + h - 40, w - 24, 18, 9); c.fill();
  text(c, n ? 'Click for a bun ↓' : 'Sold out: phone for more', cx, y + h - 31, `700 12px ${SANS}`, n ? '#3a4448' : '#9e1f19');
}
function badge2(c, x, y, n){
  c.fillStyle = n === 0 ? '#8a8f96' : n <= 2 ? '#c8372d' : '#15302a'; c.beginPath(); c.arc(x, y, 12, 0, TAU); c.fill();
  text(c, String(n), x, y + 1, `700 12px ${SANS}`, '#fff');
}
function steam(c, x, y, t, strong){
  c.strokeStyle = strong ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.45)'; c.lineWidth = 3;
  for (let i = 0; i < (strong ? 3 : 2); i++){
    const dx = (i - 1) * 14, p = (t * .8 + i * .33) % 1;
    c.globalAlpha = 1 - p; c.beginPath(); c.moveTo(x + dx, y - p * 30); c.bezierCurveTo(x + dx - 8, y - 10 - p * 30, x + dx + 8, y - 18 - p * 30, x + dx, y - 28 - p * 30); c.stroke();
  }
  c.globalAlpha = 1;
}
function smoke(c, x, y, t){
  for (let i = 0; i < 5; i++){
    const p = (t * .6 + i * .2) % 1;
    c.fillStyle = `rgba(40,40,40,${.55 * (1 - p)})`; c.beginPath(); c.arc(x + Math.sin(i * 2 + t) * 10, y - p * 60, 10 + p * 16, 0, TAU); c.fill();
  }
}

// ---------- prep-area pieces ----------
// a steel pan of an ingredient, heaped up to how much is left
function pan(c, b, n, hover){
  const x = b.x, y = b.y, w = b.w, h = 44;
  const rim = c.createLinearGradient(0, y, 0, y + h); rim.addColorStop(0, hover ? '#f4f6f7' : '#e1e5e8'); rim.addColorStop(1, '#a9b1b6');
  c.fillStyle = 'rgba(0,0,0,.18)'; rr(c, x + 1, y + 3, w, h, 7); c.fill();
  c.fillStyle = rim; rr(c, x, y, w, h, 7); c.fill();
  const well = c.createLinearGradient(0, y + 5, 0, y + h - 4); well.addColorStop(0, '#59626a'); well.addColorStop(1, '#8a939a');
  c.fillStyle = well; rr(c, x + 5, y + 5, w - 10, h - 10, 4); c.fill();
  const k = n <= 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : 3, cx = x + w / 2, cy = y + h / 2 + 1;
  const spots = [[[0, 0]], [[-.2, 0], [.2, 0]], [[-.26, .05], [0, -.04], [.26, .05]]][k - 1] || [];
  c.save(); rr(c, x + 5, y + 5, w - 10, h - 10, 4); c.clip();
  for (const [dx, dy] of spots) drawIngredient(c, b.ing, cx + dx * (w - 10), cy + dy * h, 14);
  c.restore();
  if (!k) text(c, '冇貨', cx, cy, `900 13px ${HAN}`, '#ffb3a8');
  c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, x + 3, y + 2, w - 6, 2, 1); c.fill();
}
// the stainless plate an appliance (or the bun cabinet) stands on
function stovePlate(c, b){
  const g = c.createLinearGradient(0, b.y, 0, b.y + b.h); g.addColorStop(0, '#c3cacf'); g.addColorStop(1, '#9aa3a9');
  c.fillStyle = 'rgba(0,0,0,.16)'; rr(c, b.x + 1, b.y + 3, b.w, b.h, 11); c.fill();
  c.fillStyle = g; rr(c, b.x, b.y, b.w, b.h, 11); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; rr(c, b.x + .5, b.y + .5, b.w - 1, b.h - 1, 11); c.stroke();
  c.fillStyle = '#7d868d'; for (const [sx, sy] of [[8, 8], [b.w - 8, 8], [8, b.h - 8], [b.w - 8, b.h - 8]]){ c.beginPath(); c.arc(b.x + sx, b.y + sy, 2, 0, TAU); c.fill(); }
}
// a wooden chopping board for each station's plate
const grainCache = new Map();
function board(c, b, i){
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, b.x + 2, b.y + 4, b.w, b.h, 14); c.fill();
  const g = c.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h); g.addColorStop(0, '#dcb383'); g.addColorStop(1, '#c0915e');
  c.fillStyle = g; rr(c, b.x, b.y, b.w, b.h, 14); c.fill();
  c.save(); rr(c, b.x, b.y, b.w, b.h, 14); c.clip();
  const rnd = seeded(97 + i * 13);
  c.strokeStyle = 'rgba(120,72,30,.18)'; c.lineWidth = 1.2;
  for (let k = 0; k < 14; k++){
    const y0 = b.y + 6 + k * (b.h - 12) / 13 + rnd() * 4, amp = 2 + rnd() * 3, ph = rnd() * 6;
    c.beginPath(); c.moveTo(b.x, y0);
    for (let x = 0; x <= b.w; x += 12) c.lineTo(b.x + x, y0 + Math.sin(x / 30 + ph) * amp);
    c.stroke();
  }
  c.fillStyle = 'rgba(120,72,30,.22)'; c.beginPath(); c.ellipse(b.x + 30 + rnd() * (b.w - 60), b.y + 30 + rnd() * 60, 7, 4, 0, 0, TAU); c.fill();   // a knot
  c.restore();
  c.strokeStyle = '#9a6a3a'; c.lineWidth = 2; rr(c, b.x + 1, b.y + 1, b.w - 2, b.h - 2, 13); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.18)'; rr(c, b.x + 6, b.y + 3, b.w - 12, 3, 2); c.fill();
  c.fillStyle = '#8a5a30'; c.beginPath(); c.ellipse(b.x + b.w - 16, b.y + 14, 6, 4, 0, 0, TAU); c.fill();                            // the hanging hole
}
let vig = null;
function vignette(c){
  if (!vig){ vig = c.createRadialGradient(W / 2, H * .55, H * .45, W / 2, H * .55, H * 1.05); vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(10,20,15,.28)'); }
  return vig;
}

const partShort = p => (INGREDIENTS[p]?.short || PARTS[p]?.name || p).toLowerCase();
// what a plate is heading towards; only the dishes its own station makes
function spotHint(sp, i){
  if (!sp) return ['', ''];
  if (sp.mess) return [sp.mess, 'Drag to the bin'];
  if (rawInput(sp.parts)) return [`${partZh(sp.parts[0])} ${INGREDIENTS[sp.parts[0]].name}`, sp.parts[0] === 'tea' ? '→ into the kettle' : sp.parts[0] === 'bread' ? '→ into the toaster' : '→ into the pot'];
  const dish = finished(sp.parts);
  if (dish) return [`${RECIPES[dish].zh} ready`, 'Waiting for someone to order it'];
  const cs = candidates(sp.parts).filter(r => RECIPE_STATION[r] === i);
  if (cs.length === 1){ const m = missing(sp.parts, cs[0]); return [`→ ${RECIPES[cs[0]].zh}`, '+ ' + m.map(p => `${partZh(p)} ${partShort(p)}`).join(' + ')]; }
  return [cs.map(r => RECIPES[r].zh).join(' or '), ''];
}

function speech(c, cu, x, age){
  if (!cu.said) cu.said = phrase(Object.fromEntries(cu.order.reduce((m, d) => m.set(d, (m.get(d) || 0) + 1), new Map())));
  const a = Math.min(1, age * 4, (3.2 - age) * 3);
  c.save(); c.globalAlpha = a;
  c.font = `900 15px ${HAN}`; const w1 = c.measureText(cu.said.zh).width;
  c.font = `italic 500 11px ${SANS}`; const w2 = c.measureText(cu.said.jp).width;
  // to the right of their head, unless that runs into the door
  const w = Math.max(w1, w2) + 20, left = x + 38 + w > DOOR.x - 12, bx = left ? x - 38 - w : x + 38, by = COUNTER_Y - 146;
  c.fillStyle = '#15302a'; rr(c, bx, by, w, 42, 10); c.fill();
  const tx = left ? bx + w : bx, d = left ? -1 : 1;
  c.beginPath(); c.moveTo(tx + 4 * d, by + 30); c.lineTo(tx - 8 * d, by + 40); c.lineTo(tx + 14 * d, by + 36); c.fill();
  text(c, cu.said.zh, bx + 10, by + 14, `900 15px ${HAN}`, '#fff', 'left');
  text(c, cu.said.jp, bx + 10, by + 31, `italic 500 11px ${SANS}`, '#f2d27a', 'left');
  c.restore();
}
function dropTargets(c, t){
  c.save(); c.setLineDash([10, 7]); c.lineDashOffset = -t * 30; c.strokeStyle = 'rgba(200,55,45,.9)'; c.lineWidth = 3;
  const b = L.trash; rr(c, b.x + 3, b.y + 3, b.w - 6, b.h - 6, 12); c.stroke(); c.restore();
}

// ---------- one frame ----------
// ui: { t, drag: { bag|ing, x, y }, hover, pulling, floats: [{x, y, text, col, age}], flashBin }
export function drawFrame(c, run, ui){
  const t = ui.t;
  c.drawImage(background(), 0, 0, W, H);
  const time = clock(c, run.t);
  hud(c, run, time);

  drawDoor(c, run, t);
  // price boards for dishes that aren't on today's menu are covered over
  ['hotTea', 'butterBun', 'condensedToast', 'noodleSpam'].forEach((r, i) => {
    if (run.menu.includes(r)) return;
    const bx = [95, 365, 635, 905][i];
    c.fillStyle = 'rgba(40,46,44,.72)'; rr(c, bx - 1, 63, 52, 134, 4); c.fill();
    c.fillStyle = '#f4ecd8'; rr(c, bx - 6, 118, 62, 22, 3); c.fill();
    text(c, '未有', bx + 25, 129.5, `900 13px ${HAN}`, '#9e1f19');
  });
  // customers and what's in front of them
  const people = [];
  run.seats.forEach((s, i) => { if (s.cust) people.push({ c: s.cust, i }); });
  for (const w of run.walkers) people.push({ c: w, i: w.seat, walking: true });
  for (const p of people){
    const cu = p.c, x = cu.x ?? SEAT_X[p.i];
    const moving = cu.state === 'arrive' || cu.state === 'leave';
    const f = cu.patience / cu.max;
    const mood = cu.state === 'leave' ? (cu.happy ? 'happy' : 'angry') : cu.state === 'eat' ? 'happy' : f > .5 ? 'ok' : f > .25 ? 'cross' : 'angry';
    c.globalAlpha = Math.max(.1, Math.min(1, (DOOR.x + 74 - x) / 60));     // fading through the doorway
    const sg = c.createRadialGradient(x + 16, COUNTER_Y - 70, 10, x + 16, COUNTER_Y - 70, 95);
    sg.addColorStop(0, 'rgba(20,40,30,.2)'); sg.addColorStop(1, 'rgba(20,40,30,0)');
    c.fillStyle = sg; c.fillRect(x - 80, COUNTER_Y - 170, 200, 170);         // a soft shadow on the wall behind them
    drawPerson(c, cu.look, x, COUNTER_Y + (moving ? Math.abs(Math.sin(t * 10)) * -4 : 0), mood, t, cu.state === 'eat', moving);
    c.globalAlpha = 1;
    if (cu.state === 'leave' && !cu.happy){ text(c, '唔等喇！', x, COUNTER_Y - 170, `900 18px ${HAN}`, '#9e1f19'); }
  }
  run.seats.forEach((s, i) => {
    const x = SEAT_X[i], cu = s.cust;
    if (cu && cu.state === 'wait'){ bubble(c, cu, x, t); if (run.t - cu.saidAt < 3.2) speech(c, cu, x, run.t - cu.saidAt); }
    // served dishes sit on the counter in front of the customer
    if (cu && (cu.state === 'wait' || cu.state === 'eat')){
      const served = cu.order.filter((d, j) => cu.got[j]);
      served.forEach((d, j) => {
        const dx = x + (j - (served.length - 1) / 2) * 64;
        if (ui.flights.some(f => f.seat === i && f.dish === d)) return;     // still in the air
        if (cu.state === 'eat' && cu.eat > 1.5) drawEmpty(c, RECIPES[d].vessel, dx, COUNTER_Y + 12, 26);
        else { c.drawImage(iconCanvas(d, 128), dx - 30, COUNTER_Y - 18, 60, 60); if (d === 'hotTea') steam(c, dx, COUNTER_Y - 14, t + j, false); }
      });
      if (cu.state === 'eat'){ c.fillStyle = 'rgba(255,255,255,.9)'; rr(c, x - 40, COUNTER_Y - 200, 80, 26, 13); c.fill(); text(c, '好味！', x, COUNTER_Y - 187, `900 15px ${HAN}`, '#2e7d4f'); }
    }
    if (s.dirty.length){
      s.dirty.forEach((v, j) => drawEmpty(c, v, x + (j - (s.dirty.length - 1) / 2) * 64, COUNTER_Y + 12, 26));
      const pulse = .6 + .4 * Math.sin(t * 5);
      c.fillStyle = `rgba(242,210,122,${pulse})`; rr(c, x - 62, COUNTER_Y - 30, 124, 24, 12); c.fill();
      text(c, 'Click to clear 收碟', x, COUNTER_Y - 18, `700 12px ${SANS}`, '#2a221c');
    }
  });

  // bins, on top of each station
  for (const b of L.bins){
    const n = run.stock[b.ing], coming = run.deliveries.find(d => d.ing === b.ing), cx = b.x + b.w / 2;
    pan(c, b, n, ui.hover === b);
    // a strip of masking tape with the name on it
    c.save(); c.translate(cx, b.y + 58); c.rotate(-.025);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-b.w / 2 + 3, -8, b.w - 6, 19);
    c.fillStyle = '#f1e4ba'; c.beginPath(); c.moveTo(-b.w / 2 + 3, -9);
    for (let k = 0; k <= 6; k++) c.lineTo(-b.w / 2 + 3 + k * (b.w - 6) / 6, -9 + (k % 2) * 1.2);
    for (let k = 6; k >= 0; k--) c.lineTo(-b.w / 2 + 3 + k * (b.w - 6) / 6, 9 - (k % 2) * 1.2);
    c.fill();
    // Chinese name and a short English one, shrunk to fit the tape (the English goes if it still won't)
    const room = b.w - 12, zh = INGREDIENTS[b.ing].zh, en = INGREDIENTS[b.ing].short;
    c.font = `900 12px ${HAN}`; const zw = c.measureText(zh).width;
    let ef = 9, ew; do { c.font = `700 ${ef}px ${SANS}`; ew = c.measureText(en).width; } while (zw + 4 + ew > room && --ef >= 7.5);
    const showEn = zw + 4 + ew <= room, tw = showEn ? zw + 4 + ew : zw;
    text(c, zh, -tw / 2, .5, `900 12px ${HAN}`, '#2a221c', 'left');
    if (showEn) text(c, en, -tw / 2 + zw + 4, 1, `700 ${ef}px ${SANS}`, '#5a4a38', 'left');
    c.restore();
    badge2(c, b.x + b.w - 9, b.y + 9, n);
    if (coming){ c.fillStyle = coming.express ? '#e39b2d' : '#3f7fae'; rr(c, b.x + 3, b.y + 3, 40, 15, 7); c.fill(); text(c, `🚚${Math.ceil(coming.eta - run.t)}s`, b.x + 23, b.y + 11, `700 9.5px ${SANS}`, '#fff'); }
  }
  // the middle step: appliances and the bun cabinet
  for (const st of stations){
    if (st.app) appliance(c, st.app, run.apps[st.app], st.mid, t, run, ui.pulling && st.app === 'kettle');
    else cabinet(c, st.mid, run.stock[st.cabinet], t);
    if (ui.hover === st.mid){ c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; rr(c, st.mid.x + 1, st.mid.y + 1, st.mid.w - 2, st.mid.h - 2, 10); c.stroke(); }
  }
  // the bottom step: each station's own cup, plate or bowl
  run.spots.forEach((sp, i) => {
    const b = L.spots[i], cx = b.x + b.w / 2, st = stations[i];
    board(c, b, i);
    const dragging = ui.drag && ui.drag.spot === i && ui.drag.moved;
    if (sp && !dragging){ drawBag(c, sp.parts, sp.mess, cx, b.y + 62, 42); if (!sp.mess && sp.parts.includes('brewTea')) steam(c, cx, b.y + 32, t + i, false); }
    if (!sp){
      // an empty cup, plate or bowl waiting to be built on
      c.globalAlpha = .4; drawEmptyClean(c, st.vessel, cx, b.y + 66, 38); c.globalAlpha = 1;
      const [zh, en] = VESSEL_NAME[st.vessel];
      text(c, `${zh} ${en}: click ingredients above`, cx, b.y + b.h - 18, `700 11.5px ${SANS}`, 'rgba(42,34,28,.65)');
    }
    const [h1, h2] = dragging ? ['', ''] : spotHint(sp, i);
    if (h1){ c.fillStyle = sp.mess ? 'rgba(158,31,25,.9)' : spotDish(sp) ? 'rgba(29,107,63,.92)' : 'rgba(21,48,42,.82)'; rr(c, b.x + 8, b.y + b.h - 44, b.w - 16, 38, 7); c.fill();
      text(c, h1, cx, b.y + b.h - 33, `900 13px ${HAN}`, '#fff'); if (h2) text(c, h2, cx, b.y + b.h - 16, `700 11px ${SANS}`, '#f2d27a'); }
  });
  // the phone, deliveries and the bin, in the last column
  { const p = L.phone, low = Object.values(run.stock).some(n => n <= 2), px = p.x + p.w / 2, py = p.y + 42;
    c.fillStyle = ui.hover === p ? '#f6d4c9' : '#efe6cf'; rr(c, p.x, p.y, p.w, p.h, 10); c.fill();
    if (low && Math.sin(t * 6) > 0){ c.strokeStyle = '#c8372d'; c.lineWidth = 3; rr(c, p.x, p.y, p.w, p.h, 10); c.stroke(); }
    c.fillStyle = '#b3261e'; c.beginPath(); c.moveTo(px - 36, py + 22); c.lineTo(px - 26, py - 8); c.lineTo(px + 26, py - 8); c.lineTo(px + 36, py + 22); c.closePath(); c.fill();
    c.fillStyle = '#8f1a14'; rr(c, px - 42, py - 26, 84, 16, 8); c.fill();
    c.fillStyle = '#f4ecd8'; c.beginPath(); c.arc(px, py + 8, 13, 0, TAU); c.fill();
    c.fillStyle = '#b3261e'; for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; c.beginPath(); c.arc(px + Math.cos(a) * 8, py + 8 + Math.sin(a) * 8, 2, 0, TAU); c.fill(); }
    text(c, '入貨', px, p.y + 88, `900 16px ${HAN}`, '#2a221c'); text(c, 'Phone the supplier', px, p.y + 105, `500 10.5px ${SANS}`, '#4a5458'); }
  { const b = L.deliv; let y = b.y + 12;
    c.fillStyle = 'rgba(255,255,255,.2)'; rr(c, b.x, b.y, b.w, b.h, 10); c.fill();
    text(c, '送貨中 On the way', b.x + 8, y, `700 11px ${SANS}`, '#2a3438', 'left');
    if (!run.deliveries.length) text(c, 'Nothing ordered', b.x + 8, y + 20, `500 11px ${SANS}`, '#4a5458', 'left');
    for (const d of run.deliveries.slice(0, 5)){ y += 20; const f = 1 - (d.eta - run.t) / d.total;
      text(c, `${INGREDIENTS[d.ing].zh}${d.express ? '⚡' : ''}`, b.x + 8, y, `900 12px ${HAN}`, '#2a221c', 'left');
      c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, b.x + 70, y - 4, b.w - 78, 8, 4); c.fill(); c.fillStyle = d.express ? '#e39b2d' : '#3f7fae'; rr(c, b.x + 70, y - 4, Math.max(8, (b.w - 78) * f), 8, 4); c.fill(); } }
  { const b = L.trash, hot = ui.dropTrash, cx = b.x + b.w / 2;
    c.fillStyle = hot ? '#f6d4c9' : 'rgba(40,50,56,.14)'; rr(c, b.x, b.y, b.w, b.h, 10); c.fill();
    c.fillStyle = '#5d656c'; rr(c, cx - 32, b.y + 50, 64, 80, 6); c.fill();
    c.fillStyle = '#7d868d'; rr(c, cx - 36, b.y + (hot ? 30 : 40), 72, 12, 5); c.fill();
    c.fillStyle = '#4a5156'; for (let i = 0; i < 3; i++) c.fillRect(cx - 18 + i * 16, b.y + 60, 4, 60);
    text(c, '垃圾 Bin', cx, b.y + 18, `900 15px ${HAN}`, '#2a221c'); text(c, 'Drag a plate here to toss it', cx, b.y + b.h - 16, `500 10.5px ${SANS}`, '#3a4448'); }

  // stations that aren't open yet are behind a roller shutter
  for (const st of stations){
    if (run.open.includes(st.i)) continue;
    const y0 = PREP_Y + 8, h = H - PREP_Y - 12;
    c.save(); rr(c, st.x, y0, st.w, h, 12); c.clip();
    c.fillStyle = '#8f969d'; c.fillRect(st.x, y0, st.w, h);
    for (let y = y0; y < y0 + h; y += 13){ c.fillStyle = '#a9b0b6'; c.fillRect(st.x, y, st.w, 8); c.fillStyle = '#6f767d'; c.fillRect(st.x, y + 8, st.w, 2); }
    c.restore();
    const cx = st.x + st.w / 2, cy = y0 + h / 2;
    c.fillStyle = '#9e1f19'; rr(c, cx - 86, cy - 44, 172, 88, 8); c.fill();
    c.strokeStyle = '#f2d27a'; c.lineWidth = 2; rr(c, cx - 82, cy - 40, 164, 80, 6); c.stroke();
    text(c, `${st.zh} ${st.name}`, cx, cy - 18, `900 17px ${HAN}`, '#f2d27a');
    text(c, `Opens on Day ${opensOn(st.id)}`, cx, cy + 6, `700 14px ${SANS}`, '#fff');
    text(c, '未開 Not open yet', cx, cy + 26, `500 12px ${SANS}`, '#f4ecd8');
  }
  // while dragging, show where it can go
  if (ui.drag && ui.drag.moved) dropTargets(c, t);
  // dishes on their way from the plate to the customer
  for (const f of ui.flights){
    const p = Math.min(1, f.age / FLIGHT), e = 1 - (1 - p) * (1 - p);
    const x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e - Math.sin(p * Math.PI) * 60;
    c.drawImage(iconCanvas(f.dish, 128), x - 30, y - 30, 60, 60);
  }
  // coins flying from the counter to the till
  for (const k of ui.coins){
    if (k.age < 0) continue;
    const p = Math.min(1, k.age / .8), e = p * p;
    const x = k.x + (1060 - k.x) * e, y = COUNTER_Y - 10 + (24 - COUNTER_Y + 10) * e - Math.sin(p * Math.PI) * 80;
    c.fillStyle = '#e3b23c'; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill();
    c.strokeStyle = '#a8801c'; c.lineWidth = 1.5; c.stroke();
    text(c, '$', x, y + .5, `700 9px ${SANS}`, '#7a5a10');
  }
  // floating numbers
  for (const f of ui.floats){
    c.globalAlpha = Math.max(0, 1 - f.age / 1.6);
    text(c, f.text, f.x, f.y - f.age * 40, `700 20px ${SLAB}`, f.col);
    c.globalAlpha = 1;
  }
  // what's being dragged
  if (ui.drag && ui.drag.moved){
    c.globalAlpha = .92;
    if (ui.drag.bag) drawBag(c, ui.drag.bag.parts, ui.drag.bag.mess, ui.drag.x, ui.drag.y, 40);
    c.globalAlpha = 1;
  }
  c.fillStyle = vignette(c); c.fillRect(0, HUD, W, H - HUD);
  if (ui.paused){ c.fillStyle = 'rgba(12,16,36,.55)'; c.fillRect(0, 0, W, H); text(c, 'Paused', W / 2, H / 2 - 10, `700 48px ${SLAB}`, '#fff'); text(c, 'Space or the Pause button to carry on', W / 2, H / 2 + 30, `500 16px ${SANS}`, '#e0e6e2'); }
}
