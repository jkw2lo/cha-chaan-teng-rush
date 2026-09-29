// Counter Rush drawing: the side-on counter, on a fixed 1280×720 stage that the page scales to fit.
// Top: stools and customers against the back wall. Middle: the counter. Bottom: the prep area.
// Finished dishes use the cha chaan teng theme's icons (themes/cct/art.js), so they match the main game.
import { TAU, HAN, iconCanvas } from '../js/art.js';
import { INGREDIENTS, APPLIANCES, APPLIANCE_ORDER, BIN_ORDER, RECIPES, DAY, candidates, finished, missing, rawInput, vesselOf, partZh } from './recipes.js';
import { spotDish, takings } from './sim.js';

export const W = 1280, H = 720;
const HUD = 48, COUNTER_Y = 296, PREP_Y = 372;
export const SEAT_X = [230, 500, 770, 1040];

// ---------- layout: every clickable/droppable box ----------
export const L = {
  seats: SEAT_X.map((x, i) => ({ i, x: x - 125, y: HUD, w: 250, h: PREP_Y - HUD, cx: x })),
  bins: BIN_ORDER.map((ing, i) => ({ ing, x: 16 + i * 100, y: 390, w: 92, h: 112 })),
  phone: { x: 928, y: 390, w: 120, h: 112 },
  trash: { x: 16, y: 522, w: 104, h: 186 },
  spots: Array.from({ length: DAY.spots }, (_, i) => ({ i, x: 136 + i * 152, y: 522, w: 142, h: 186 })),
  apps: Object.fromEntries(APPLIANCE_ORDER.map((k, i) => [k, { key: k, x: 606 + i * 224, y: 522, w: 210, h: 186 }])),
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
  if (mess){
    plate(c, cx, cy + r * .35, r);
    const rnd = seeded(parts.length * 31 + mess.length);
    c.fillStyle = mess.startsWith('Burnt') || mess.startsWith('Stewed') ? '#2b2018' : '#8a6a3a';
    c.beginPath();
    for (let k = 0; k <= 14; k++){ const a = k / 14 * TAU, q = r * (.35 + rnd() * .22); c.lineTo(cx + Math.cos(a) * q, cy + r * .2 + Math.sin(a) * q * .45); }
    c.fill();
    c.fillStyle = 'rgba(120,200,90,.55)'; for (let i = 0; i < 4; i++){ c.beginPath(); c.arc(cx + (rnd() - .5) * r, cy + r * .1 + (rnd() - .5) * r * .3, r * .06, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(90,90,90,.6)'; c.lineWidth = r * .05;
    for (const dx of [-.2, .15]){ c.beginPath(); c.moveTo(cx + dx * r, cy - r * .1); c.bezierCurveTo(cx + (dx - .15) * r, cy - r * .35, cx + (dx + .15) * r, cy - r * .45, cx + dx * r, cy - r * .7); c.stroke(); }
    c.restore(); return;
  }
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
];
export function drawPerson(c, look, x, yBase, mood, t, eating){
  const rnd = seeded(look);
  const skin = SKIN[Math.floor(rnd() * SKIN.length)], o = OUTFITS[Math.floor(rnd() * OUTFITS.length)];
  const old = o.name === 'uncle' || (o.name === 'auntie' && rnd() < .5);
  const hair = old ? HAIR[3 + Math.floor(rnd() * 2)] : HAIR[Math.floor(rnd() * 3)];
  const bob = eating ? Math.sin(t * 9) * 2.5 : 0;
  const headY = yBase - 118 + bob;
  c.save();
  // body
  c.fillStyle = o.shirt;
  c.beginPath(); c.moveTo(x - 50, yBase); c.lineTo(x - 44, yBase - 70); c.quadraticCurveTo(x - 40, yBase - 88, x - 18, yBase - 92); c.lineTo(x + 18, yBase - 92);
  c.quadraticCurveTo(x + 40, yBase - 88, x + 44, yBase - 70); c.lineTo(x + 50, yBase); c.closePath(); c.fill();
  if (o.singlet){ c.fillStyle = skin; c.beginPath(); c.moveTo(x - 44, yBase - 70); c.quadraticCurveTo(x - 40, yBase - 88, x - 18, yBase - 92); c.lineTo(x - 26, yBase - 60); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(x + 44, yBase - 70); c.quadraticCurveTo(x + 40, yBase - 88, x + 18, yBase - 92); c.lineTo(x + 26, yBase - 60); c.closePath(); c.fill(); }
  if (o.floral){ c.fillStyle = o.floral; const r2 = seeded(look + 3); for (let i = 0; i < 12; i++){ c.beginPath(); c.arc(x - 38 + r2() * 76, yBase - 80 + r2() * 76, 4, 0, TAU); c.fill(); } }
  if (o.vest){ c.fillStyle = o.vest; c.fillRect(x - 42, yBase - 62, 20, 62); c.fillRect(x + 22, yBase - 62, 20, 62); c.fillStyle = '#d0d0d0'; c.fillRect(x - 42, yBase - 30, 20, 5); c.fillRect(x + 22, yBase - 30, 20, 5); }
  if (o.tie){ c.fillStyle = o.tie; c.beginPath(); c.moveTo(x - 5, yBase - 90); c.lineTo(x + 5, yBase - 90); c.lineTo(x + 7, yBase - 40); c.lineTo(x, yBase - 32); c.lineTo(x - 7, yBase - 40); c.closePath(); c.fill(); }
  // neck and head
  c.fillStyle = skin; c.fillRect(x - 9, headY + 26, 18, 16);
  c.beginPath(); c.ellipse(x, headY, 30, 34, 0, 0, TAU); c.fill();
  // hair
  c.fillStyle = hair;
  if (o.name === 'auntie'){ for (let i = 0; i < 9; i++){ c.beginPath(); c.arc(x - 28 + i * 7, headY - 26 + Math.abs(i - 4) * 2.5, 11, 0, TAU); c.fill(); } }
  else if (old && o.name === 'uncle'){ c.beginPath(); c.ellipse(x, headY - 24, 26, 10, 0, Math.PI, 0); c.fill(); c.fillRect(x - 31, headY - 18, 6, 18); c.fillRect(x + 25, headY - 18, 6, 18); }
  else if (o.name === 'student' && rnd() < .5){ c.beginPath(); c.ellipse(x, headY - 12, 33, 28, 0, Math.PI * 1.02, -.02); c.fill(); c.fillRect(x - 33, headY - 12, 10, 34); c.fillRect(x + 23, headY - 12, 10, 34); }
  else { c.beginPath(); c.ellipse(x, headY - 14, 31, 24, 0, Math.PI * 1.05, -.05); c.fill(); }
  if (o.name === 'worker'){ c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(x, headY - 22, 33, 20, 0, Math.PI, 0); c.fill(); c.fillRect(x - 38, headY - 24, 76, 5); }
  // face
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
  // arms resting on the counter
  c.fillStyle = o.singlet ? skin : o.shirt;
  c.beginPath(); c.ellipse(x - 44, yBase - 8, 14, 10, 0, 0, TAU); c.ellipse(x + 44, yBase - 8, 14, 10, 0, 0, TAU); c.fill();
  c.fillStyle = skin; c.beginPath(); c.ellipse(x - 30, yBase - 4, 11, 7, 0, 0, TAU); c.ellipse(x + 30, yBase - 4, 11, 7, 0, 0, TAU); c.fill();
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
  // a wall clock and a fan at the right
  c.fillStyle = '#fbf6ea'; c.beginPath(); c.arc(1200, 120, 34, 0, TAU); c.fill(); c.strokeStyle = '#8a5a3a'; c.lineWidth = 5; c.stroke();
  // stools, behind the counter
  for (const x of SEAT_X){
    c.fillStyle = '#b3261e'; rr(c, x - 36, COUNTER_Y - 14, 72, 16, 8); c.fill();
  }
  // the counter: formica top, a wooden front with a red kick strip
  c.fillStyle = '#e9e1cc'; c.fillRect(0, COUNTER_Y, W, 40);
  c.fillStyle = '#f7f2e3'; c.fillRect(0, COUNTER_Y, W, 5);
  c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = 0; x < W; x += 9) c.fillRect(x, COUNTER_Y + 8 + (x * 7) % 26, 3, 2);
  c.fillStyle = '#8a5a3a'; c.fillRect(0, COUNTER_Y + 40, W, PREP_Y - COUNTER_Y - 40);
  c.fillStyle = '#6f4630'; for (let x = 0; x < W; x += 64) c.fillRect(x, COUNTER_Y + 40, 3, PREP_Y - COUNTER_Y - 40);
  c.fillStyle = '#c8372d'; c.fillRect(0, PREP_Y - 6, W, 6);
  // the prep area: brushed steel
  const g = c.createLinearGradient(0, PREP_Y, 0, H); g.addColorStop(0, '#b9c1c6'); g.addColorStop(1, '#97a0a6');
  c.fillStyle = g; c.fillRect(0, PREP_Y, W, H - PREP_Y);
  c.fillStyle = 'rgba(255,255,255,.08)'; for (let y = PREP_Y + 4; y < H; y += 5) c.fillRect(0, y, W, 1);
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, 512, W, 3);
}
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
  c.lineWidth = 4; c.beginPath(); c.moveTo(1200, 120); c.lineTo(1200 + Math.sin(h / 12 * TAU) * 17, 120 - Math.cos(h / 12 * TAU) * 17); c.stroke();
  c.lineWidth = 2.5; c.beginPath(); c.moveTo(1200, 120); c.lineTo(1200 + Math.sin(m / 60 * TAU) * 26, 120 - Math.cos(m / 60 * TAU) * 26); c.stroke();
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(Math.floor(mins % 60)).padStart(2, '0')}`;
}
function hud(c, run, time){
  c.fillStyle = '#15302a'; c.fillRect(0, 0, W, HUD);
  c.fillStyle = '#9e1f19'; rr(c, 12, 8, 150, 32, 4); c.fill(); c.strokeStyle = '#f2d27a'; c.lineWidth = 2; rr(c, 13, 9, 148, 30, 4); c.stroke();
  text(c, '茶餐廳', 58, 25, `900 18px ${HAN}`, '#f2d27a'); text(c, 'Counter', 124, 25, `700 16px ${SLAB}`, '#fff');
  // day bar
  const f = Math.min(1, run.t / DAY.seconds);
  text(c, time, 190, 25, `700 22px ${SLAB}`, '#fff', 'left');
  c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, 262, 18, 220, 12, 6); c.fill();
  c.fillStyle = run.closed ? '#c8372d' : '#f2d27a'; rr(c, 262, 18, Math.max(12, 220 * f), 12, 6); c.fill();
  text(c, run.closed ? 'Closed: finishing up' : 'Open till 11:00', 492, 25, `500 13px ${SANS}`, '#cfd8d2', 'left');
  // takings vs target
  const tk = takings(run), tf = Math.min(1, tk / DAY.target);
  text(c, 'Takings', 700, 25, `700 12px ${SANS}`, '#9fb4aa', 'left');
  c.fillStyle = 'rgba(255,255,255,.12)'; rr(c, 760, 16, 200, 16, 8); c.fill();
  c.fillStyle = tk >= DAY.target ? '#2e9e5b' : '#e39b2d'; rr(c, 760, 16, Math.max(16, 200 * tf), 16, 8); c.fill();
  text(c, `$${tk} / $${DAY.target}`, 860, 25, `700 12px ${SANS}`, '#fff');
  text(c, 'Cash', 1010, 25, `700 12px ${SANS}`, '#9fb4aa', 'left');
  text(c, `$${Math.floor(run.cash)}`, 1046, 25, `700 22px ${SLAB}`, run.cash < 0 ? '#ff8a7a' : '#fff', 'left');
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
  c.fillStyle = '#e39b2d'; c.fillRect(x + w * (span - 2.5) / span, y, w * 2.5 / span, h);
  c.restore();
  if (a.part){
    const px = x + w * Math.min(1, a.t / span);
    c.fillStyle = '#fff'; c.strokeStyle = '#231d18'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(px, y - 3); c.lineTo(px + 6, y - 10); c.lineTo(px - 6, y - 10); c.closePath(); c.fill(); c.stroke();
    c.fillRect(px - 1.5, y - 2, 3, h + 4);
  }
}
function appliance(c, key, a, box, t, run, pulling){
  const def = APPLIANCES[key], { x, y, w, h } = box, cx = x + w / 2;
  const ready = a.part && !a.ruined && a.t >= def.ready, late = ready && a.t >= def.burn - 2.5;
  // mat and label
  c.fillStyle = 'rgba(40,50,56,.18)'; rr(c, x, y, w, h, 10); c.fill();
  if (ready){ c.strokeStyle = late && Math.sin(t * 14) > 0 ? '#ff5a4d' : '#2e9e5b'; c.lineWidth = 3; rr(c, x + 1.5, y + 1.5, w - 3, h - 3, 10); c.stroke(); }
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
    cup(c, x + 180, y + 130, 18, a.pull > 0 ? '#5a2e14' : '#e9e4d8');
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
      const up = a.t < 0.25 ? 18 : 6;
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
  // the label goes on top, so steam and smoke don't cover it
  c.font = `900 16px ${HAN}`; const zw = c.measureText(def.zh).width;
  c.font = `700 12px ${SANS}`; const nw = c.measureText(def.name).width;
  c.fillStyle = 'rgba(233,236,238,.88)'; rr(c, x + 5, y + 5, zw + nw + 22, 22, 11); c.fill();
  text(c, def.zh, x + 12, y + 16, `900 16px ${HAN}`, '#2a221c', 'left');
  text(c, def.name, x + 18 + zw, y + 16, `700 12px ${SANS}`, '#3a4448', 'left');
  timerBar(c, a, def, x + 14, y + h - 22, w - 28, t);
  // what to do next
  let hint = '';
  if (a.ruined) hint = `${def.late}! Click to bin`;
  else if (!a.part) hint = key === 'kettle' ? 'Drop tea leaves here' : key === 'toaster' ? 'Drop bread here' : 'Drop noodles here';
  else if (a.t < def.ready) hint = key === 'kettle' ? 'Brewing…' : key === 'toaster' ? 'Toasting…' : 'Boiling…';
  else hint = key === 'kettle' ? 'Ready: hold to pull!' : 'Ready: click to take out';
  const hcol = a.ruined ? '#9e1f19' : ready ? '#1d6b3f' : '#3a4448';
  c.fillStyle = 'rgba(255,255,255,.75)'; rr(c, x + 14, y + h - 44, w - 28, 18, 9); c.fill();
  text(c, hint, cx, y + h - 35, `700 12px ${SANS}`, hcol);
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

function spotHint(sp){
  if (!sp) return ['', ''];
  if (sp.mess) return [sp.mess, 'Drag to the bin'];
  if (rawInput(sp.parts)) return [`${partZh(sp.parts[0])} ${INGREDIENTS[sp.parts[0]].name}`, sp.parts[0] === 'tea' ? '→ into the kettle' : sp.parts[0] === 'bread' ? '→ into the toaster' : '→ into the pot'];
  const dish = finished(sp.parts);
  if (dish) return [`${RECIPES[dish].zh} ready`, 'Drag to the customer'];
  const cs = candidates(sp.parts);
  if (cs.length === 1){ const m = missing(sp.parts, cs[0]); return [`→ ${RECIPES[cs[0]].zh}`, '+ ' + m.map(partZh).join(' + ')]; }
  return [cs.map(r => RECIPES[r].zh).join(' or '), ''];
}

// ---------- one frame ----------
// ui: { t, drag: { bag|ing, x, y }, hover, pulling, floats: [{x, y, text, col, age}], flashBin }
export function drawFrame(c, run, ui){
  const t = ui.t;
  c.drawImage(background(), 0, 0, W, H);
  const time = clock(c, run.t);
  hud(c, run, time);

  // customers and what's in front of them
  const people = [];
  run.seats.forEach((s, i) => { if (s.cust) people.push({ c: s.cust, i }); });
  for (const w of run.walkers) people.push({ c: w, i: w.seat, walking: true });
  for (const p of people){
    const cu = p.c, x = cu.x ?? SEAT_X[p.i];
    const moving = cu.state === 'arrive' || cu.state === 'leave';
    const f = cu.patience / cu.max;
    const mood = cu.state === 'leave' ? (cu.happy ? 'happy' : 'angry') : cu.state === 'eat' ? 'happy' : f > .5 ? 'ok' : f > .25 ? 'cross' : 'angry';
    drawPerson(c, cu.look, x, COUNTER_Y + (moving ? Math.abs(Math.sin(t * 10)) * -4 : 0), mood, t, cu.state === 'eat');
    if (cu.state === 'leave' && !cu.happy){ text(c, '唔等喇！', x, COUNTER_Y - 170, `900 18px ${HAN}`, '#9e1f19'); }
  }
  run.seats.forEach((s, i) => {
    const x = SEAT_X[i], cu = s.cust;
    if (cu && cu.state === 'wait') bubble(c, cu, x, t);
    // served dishes sit on the counter in front of the customer
    if (cu && (cu.state === 'wait' || cu.state === 'eat')){
      const served = cu.order.filter((d, j) => cu.got[j]);
      served.forEach((d, j) => {
        const dx = x + (j - (served.length - 1) / 2) * 64;
        if (cu.state === 'eat' && cu.eat > 1.5) drawEmpty(c, RECIPES[d].vessel, dx, COUNTER_Y + 12, 26);
        else c.drawImage(iconCanvas(d, 128), dx - 30, COUNTER_Y - 18, 60, 60);
      });
      if (cu.state === 'eat'){ c.fillStyle = 'rgba(255,255,255,.9)'; rr(c, x - 40, COUNTER_Y - 200, 80, 26, 13); c.fill(); text(c, '好味！', x, COUNTER_Y - 187, `900 15px ${HAN}`, '#2e7d4f'); }
    }
    if (s.dirty.length){
      s.dirty.forEach((v, j) => drawEmpty(c, v, x + (j - (s.dirty.length - 1) / 2) * 64, COUNTER_Y + 12, 26));
      const pulse = .6 + .4 * Math.sin(t * 5);
      c.fillStyle = `rgba(242,210,122,${pulse})`; rr(c, x - 62, COUNTER_Y - 30, 124, 24, 12); c.fill();
      text(c, 'Click to clear 收碟', x, COUNTER_Y - 18, `700 12px ${SANS}`, '#2a221c');
    }
    // drop highlight
    if (ui.dropSeat === i){ c.strokeStyle = ui.dropOk ? '#2e9e5b' : '#c8372d'; c.lineWidth = 4; rr(c, L.seats[i].x + 6, HUD + 6, L.seats[i].w - 12, PREP_Y - HUD - 12, 14); c.stroke(); }
  });

  // bins
  for (const b of L.bins){
    const n = run.stock[b.ing], coming = run.deliveries.find(d => d.ing === b.ing);
    c.fillStyle = ui.hover === b ? '#e8ecef' : '#d8dde0'; rr(c, b.x, b.y, b.w, b.h, 10); c.fill();
    c.fillStyle = '#6f787e'; rr(c, b.x + 6, b.y + 6, b.w - 12, 62, 8); c.fill();
    c.globalAlpha = n > 0 ? 1 : .3; drawIngredient(c, b.ing, b.x + b.w / 2, b.y + 38, 24); c.globalAlpha = 1;
    text(c, INGREDIENTS[b.ing].zh, b.x + b.w / 2, b.y + 82, `900 15px ${HAN}`, '#2a221c');
    text(c, INGREDIENTS[b.ing].name, b.x + b.w / 2, b.y + 99, `500 10.5px ${SANS}`, '#4a5458');
    const bc = n === 0 ? '#8a8f96' : n <= 2 ? '#c8372d' : '#15302a';
    c.fillStyle = bc; c.beginPath(); c.arc(b.x + b.w - 12, b.y + 12, 13, 0, TAU); c.fill();
    text(c, String(n), b.x + b.w - 12, b.y + 13, `700 13px ${SANS}`, '#fff');
    if (coming){ c.fillStyle = coming.express ? '#e39b2d' : '#3f7fae'; rr(c, b.x + 4, b.y + 4, 44, 16, 8); c.fill(); text(c, `🚚${Math.ceil(coming.eta - run.t)}s`, b.x + 26, b.y + 12.5, `700 10px ${SANS}`, '#fff'); }
    if (ui.flashBin === b.ing){ c.strokeStyle = '#c8372d'; c.lineWidth = 3; rr(c, b.x, b.y, b.w, b.h, 10); c.stroke(); }
  }
  // the phone
  { const p = L.phone, low = Object.values(run.stock).some(n => n <= 2);
    c.fillStyle = ui.hover === p ? '#f6d4c9' : '#efe6cf'; rr(c, p.x, p.y, p.w, p.h, 10); c.fill();
    if (low && Math.sin(t * 6) > 0){ c.strokeStyle = '#c8372d'; c.lineWidth = 3; rr(c, p.x, p.y, p.w, p.h, 10); c.stroke(); }
    const px = p.x + p.w / 2, py = p.y + 44;
    c.fillStyle = '#b3261e'; c.beginPath(); c.moveTo(px - 36, py + 22); c.lineTo(px - 26, py - 8); c.lineTo(px + 26, py - 8); c.lineTo(px + 36, py + 22); c.closePath(); c.fill();
    c.fillStyle = '#8f1a14'; rr(c, px - 42, py - 26, 84, 16, 8); c.fill();
    c.fillStyle = '#f4ecd8'; c.beginPath(); c.arc(px, py + 8, 13, 0, TAU); c.fill();
    c.fillStyle = '#b3261e'; for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; c.beginPath(); c.arc(px + Math.cos(a) * 8, py + 8 + Math.sin(a) * 8, 2, 0, TAU); c.fill(); }
    text(c, '入貨', px, p.y + 84, `900 16px ${HAN}`, '#2a221c'); text(c, 'Phone the supplier', px, p.y + 100, `500 10.5px ${SANS}`, '#4a5458'); }
  // deliveries on the way
  { let y = 400; text(c, '送貨中 On the way', 1062, y, `700 12px ${SANS}`, '#2a3438', 'left');
    if (!run.deliveries.length) text(c, 'Nothing ordered', 1062, y + 20, `500 12px ${SANS}`, '#4a5458', 'left');
    for (const d of run.deliveries){ y += 20; const f = 1 - (d.eta - run.t) / d.total;
      text(c, `${INGREDIENTS[d.ing].zh}${d.express ? ' ⚡' : ''}`, 1062, y, `900 13px ${HAN}`, '#2a221c', 'left');
      c.fillStyle = 'rgba(0,0,0,.15)'; rr(c, 1140, y - 5, 110, 10, 5); c.fill(); c.fillStyle = d.express ? '#e39b2d' : '#3f7fae'; rr(c, 1140, y - 5, Math.max(10, 110 * f), 10, 5); c.fill(); } }

  // trash
  { const b = L.trash, hot = ui.dropTrash;
    c.fillStyle = hot ? '#f6d4c9' : 'rgba(40,50,56,.18)'; rr(c, b.x, b.y, b.w, b.h, 10); c.fill();
    const cx = b.x + b.w / 2;
    c.fillStyle = '#5d656c'; rr(c, cx - 32, b.y + 62, 64, 84, 6); c.fill();
    c.fillStyle = '#7d868d'; rr(c, cx - 36, b.y + (hot ? 42 : 52), 72, 12, 5); c.fill();
    c.fillStyle = '#4a5156'; for (let i = 0; i < 3; i++) c.fillRect(cx - 18 + i * 16, b.y + 72, 4, 64);
    text(c, '垃圾', cx, b.y + 18, `900 16px ${HAN}`, '#2a221c'); text(c, 'Bin: drag here', cx, b.y + 164, `500 11px ${SANS}`, '#3a4448'); }

  // work surface
  run.spots.forEach((sp, i) => {
    const b = L.spots[i], active = run.active === i, cx = b.x + b.w / 2;
    c.fillStyle = '#c9a57a'; rr(c, b.x, b.y + 22, b.w, b.h - 22, 10); c.fill();
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let k = 0; k < 6; k++) c.fillRect(b.x + 6, b.y + 32 + k * 26, b.w - 12, 2);
    text(c, active ? `▶ Spot ${i + 1}` : `Spot ${i + 1}`, b.x + 8, b.y + 10, `700 12px ${SANS}`, active ? '#15302a' : '#4a5458', 'left');
    if (active){ c.strokeStyle = '#f2d27a'; c.lineWidth = 4; rr(c, b.x + 2, b.y + 24, b.w - 4, b.h - 26, 9); c.stroke(); }
    if (ui.dropSpot === i){ c.strokeStyle = '#2e9e5b'; c.lineWidth = 4; rr(c, b.x + 2, b.y + 24, b.w - 4, b.h - 26, 9); c.stroke(); }
    if (sp && !(ui.drag && ui.drag.spot === i)) drawBag(c, sp.parts, sp.mess, cx, b.y + 88, 44);
    const [h1, h2] = ui.drag && ui.drag.spot === i ? ['', ''] : spotHint(sp);
    if (h1){ c.fillStyle = sp.mess ? 'rgba(158,31,25,.9)' : spotDish(sp) ? 'rgba(29,107,63,.92)' : 'rgba(21,48,42,.82)'; rr(c, b.x + 6, b.y + 142, b.w - 12, 38, 7); c.fill();
      text(c, h1, cx, b.y + 153, `900 13px ${HAN}`, '#fff'); if (h2) text(c, h2, cx, b.y + 170, `700 11px ${SANS}`, '#f2d27a'); }
    else if (!sp) text(c, active ? 'Ingredients go here' : 'Empty', cx, b.y + 110, `500 12px ${SANS}`, 'rgba(42,34,28,.6)');
  });

  // appliances
  for (const k of APPLIANCE_ORDER){
    appliance(c, k, run.apps[k], L.apps[k], t, run, ui.pulling && k === 'kettle');
    if (ui.dropApp === k){ const b = L.apps[k]; c.strokeStyle = ui.dropOk ? '#2e9e5b' : '#c8372d'; c.lineWidth = 4; rr(c, b.x + 2, b.y + 2, b.w - 4, b.h - 4, 10); c.stroke(); }
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
    if (ui.drag.ing) drawIngredient(c, ui.drag.ing, ui.drag.x, ui.drag.y, 26);
    else if (ui.drag.bag) drawBag(c, ui.drag.bag.parts, ui.drag.bag.mess, ui.drag.x, ui.drag.y, 40);
    c.globalAlpha = 1;
  }
  if (ui.paused){ c.fillStyle = 'rgba(12,16,36,.55)'; c.fillRect(0, 0, W, H); text(c, 'Paused', W / 2, H / 2 - 10, `700 48px ${SLAB}`, '#fff'); text(c, 'Space or the Pause button to carry on', W / 2, H / 2 + 30, `500 16px ${SANS}`, '#e0e6e2'); }
}
