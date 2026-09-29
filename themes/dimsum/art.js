// Dim sum teahouse art: a lacquered 酒樓 dining room, bamboo steamers and a steamer trolley.
// Pieces the two restaurants share (cross-back chairs, the fish tank, the tart oven...) fall
// through to the cha chaan teng's drawings.
import { shade } from '../../js/iso.js';
import { APPLIANCES, MENU, THEME } from '../../js/data.js';
import { WALL_H, PARTITION_H, DH, KH, DIRS } from '../../js/world.js';
import { TAU, HAN, hash, PAL, counter, label, steam, legs, backRect, contactShadow, iconCanvas } from '../../js/art.js';
import * as cct from '../cct/art.js';

export const backs = ['banquetChair', 'crossChair', 'rattanChair', 'rosewoodChair', 'velvetBooth'];
export const lamps = ['palaceLantern', 'pendant', 'chandelier', 'ceilingFan', 'lanternString', 'bambooLamp', 'brassLamp'];

const BAMBOO = '#c9a26b', BAMBOO_DK = '#a8804a', BAMBOO_LT = '#dcbd87';
const LACQUER = '#7e1a16', LACQUER_DK = '#5a100d', GOLD = '#d9a93b', GOLD_LT = '#f2d27a', GOLD_DK = '#9a7424';
const ROSEWOOD = '#4a2016', ROSEWOOD_LT = '#6b3322', CLOTH = '#f6f2ea', SILK = '#b3261e';
const FRONT0 = -Math.PI / 4;                                   // the camera sees angles FRONT0 .. FRONT0 + PI of a circle


// ---------------- icons ----------------
// a bamboo steamer seen from slightly above, with the contents drawn by `fill`
function basket(c, cx, cy, r, fill){
  c.beginPath(); c.ellipse(cx, cy + r * .55, r * .92, r * .22, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
  c.fillStyle = BAMBOO_DK; c.beginPath(); c.ellipse(cx, cy + r * .28, r * .9, r * .34, 0, 0, TAU); c.fill();
  c.fillStyle = BAMBOO; c.fillRect(cx - r * .9, cy - r * .1, r * 1.8, r * .38);
  c.strokeStyle = BAMBOO_DK; c.lineWidth = r * .04;
  for (let i = -3; i <= 3; i++){ c.beginPath(); c.moveTo(cx + i * r * .24, cy - r * .08); c.lineTo(cx + i * r * .24, cy + r * .28); c.stroke(); }
  c.fillStyle = '#e8d3a3'; c.beginPath(); c.ellipse(cx, cy - r * .1, r * .9, r * .34, 0, 0, TAU); c.fill();
  c.strokeStyle = BAMBOO_DK; c.lineWidth = r * .06; c.stroke();
  c.save(); c.beginPath(); c.ellipse(cx, cy - r * .1, r * .84, r * .3, 0, 0, TAU); c.clip(); fill(); c.restore();
}
function plate(c, cx, cy, r, fill){
  c.beginPath(); c.ellipse(cx, cy + r * .42, r * .92, r * .24, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.14)'; c.fill();
  c.beginPath(); c.ellipse(cx, cy + r * .25, r * .92, r * .4, 0, 0, TAU); c.fillStyle = '#fbfaf5'; c.fill();
  c.strokeStyle = '#3f7fae'; c.lineWidth = r * .04; c.beginPath(); c.ellipse(cx, cy + r * .25, r * .8, r * .33, 0, 0, TAU); c.stroke();
  fill();
}
const dumpling = (c, x, y, s, col, pleat) => {
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, s, s * .72, 0, 0, TAU); c.fill();
  c.strokeStyle = pleat; c.lineWidth = s * .12;
  for (let k = -2; k <= 2; k++){ c.beginPath(); c.moveTo(x + k * s * .25, y - s * .55); c.lineTo(x + k * s * .2, y - s * .1); c.stroke(); }
};
export function icon(c, item, cx, cy, r){
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  if (item === 'puer'){
    c.beginPath(); c.ellipse(cx, cy + r * .6, r * .8, r * .18, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    c.fillStyle = '#7a4a2a'; c.beginPath(); c.ellipse(cx - r * .1, cy + r * .1, r * .55, r * .48, 0, 0, TAU); c.fill();
    c.fillStyle = '#8f5a34'; c.beginPath(); c.ellipse(cx - r * .1, cy - r * .3, r * .32, r * .1, 0, 0, TAU); c.fill();
    c.fillStyle = '#5a3620'; c.beginPath(); c.arc(cx - r * .1, cy - r * .42, r * .08, 0, TAU); c.fill();
    c.strokeStyle = '#7a4a2a'; c.lineWidth = r * .1; c.beginPath(); c.moveTo(cx + r * .4, cy); c.quadraticCurveTo(cx + r * .7, cy - r * .1, cx + r * .75, cy - r * .35); c.stroke();
    c.beginPath(); c.arc(cx - r * .7, cy + r * .05, r * .2, Math.PI * .5, Math.PI * 1.5); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(cx - r * .3, cy, r * .1, r * .22, -.3, 0, TAU); c.fill();
    c.fillStyle = '#fbfaf5'; c.beginPath(); c.ellipse(cx + r * .55, cy + r * .5, r * .22, r * .1, 0, 0, TAU); c.fill();
    c.fillStyle = '#6b3a1f'; c.beginPath(); c.ellipse(cx + r * .55, cy + r * .47, r * .15, r * .06, 0, 0, TAU); c.fill();
  } else if (item === 'harGow'){
    basket(c, cx, cy, r, () => { for (const [dx, dy] of [[-.35, -.12], [.05, -.2], [.4, -.08]]){ dumpling(c, cx + dx * r, cy + dy * r, r * .28, 'rgba(245,238,225,.95)', 'rgba(210,190,170,.8)'); c.fillStyle = 'rgba(240,140,120,.55)'; c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r + r * .02, r * .14, r * .08, 0, 0, TAU); c.fill(); } });
  } else if (item === 'siuMai'){
    basket(c, cx, cy, r, () => { for (const [dx, dy] of [[-.35, -.1], [.05, -.2], [.4, -.06]]){ c.fillStyle = '#f2d27a'; c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r, r * .24, r * .18, 0, 0, TAU); c.fill(); c.fillStyle = '#d98a6a'; c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r - r * .04, r * .17, r * .1, 0, 0, TAU); c.fill(); c.fillStyle = '#f07a2a'; c.beginPath(); c.arc(cx + dx * r, cy + dy * r - r * .07, r * .05, 0, TAU); c.fill(); } });
  } else if (item === 'charSiuBao' || item === 'custardBun'){
    basket(c, cx, cy, r, () => { for (const [dx, dy] of [[-.35, -.08], [.05, -.2], [.4, -.05]]){
      c.fillStyle = '#fbf7ee'; c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r, r * .27, r * .2, 0, 0, TAU); c.fill();
      if (item === 'charSiuBao'){ c.fillStyle = '#b3322a'; c.beginPath(); c.moveTo(cx + dx * r - r * .1, cy + dy * r - r * .06); c.lineTo(cx + dx * r + r * .1, cy + dy * r - r * .1); c.lineTo(cx + dx * r + r * .04, cy + dy * r + r * .04); c.closePath(); c.fill(); }
      else { c.fillStyle = '#f2b21e'; c.beginPath(); c.arc(cx + dx * r, cy + dy * r - r * .05, r * .05, 0, TAU); c.fill(); }
    } });
    if (item === 'custardBun'){ c.fillStyle = '#f2b21e'; c.beginPath(); c.moveTo(cx + r * .05, cy - r * .1); c.quadraticCurveTo(cx + r * .1, cy + r * .2, cx, cy + r * .3); c.quadraticCurveTo(cx - r * .06, cy + r * .1, cx + r * .05, cy - r * .1); c.fill(); }
  } else if (item === 'cheungFun'){
    plate(c, cx, cy, r, () => {
      for (const dy of [-.08, .12, .32]){ c.fillStyle = 'rgba(248,244,236,.97)'; c.beginPath(); c.roundRect(cx - r * .6, cy + dy * r - r * .1, r * 1.2, r * .2, r * .1); c.fill(); c.strokeStyle = 'rgba(200,190,175,.8)'; c.lineWidth = r * .03; c.stroke(); c.fillStyle = 'rgba(240,140,120,.5)'; c.fillRect(cx - r * .4, cy + dy * r - r * .03, r * .8, r * .05); }
      c.fillStyle = 'rgba(120,70,30,.55)'; c.beginPath(); c.ellipse(cx + r * .1, cy + r * .15, r * .5, r * .12, 0, 0, TAU); c.fill();
    });
  } else if (item === 'turnipCake'){
    plate(c, cx, cy, r, () => { for (const [dx, dy] of [[-.3, .1], [.1, .02], [.35, .28], [-.08, .34]]){ c.fillStyle = '#c98a3a'; c.beginPath(); c.roundRect(cx + dx * r - r * .17, cy + dy * r - r * .12, r * .34, r * .24, r * .04); c.fill(); c.fillStyle = '#ecc88a'; c.beginPath(); c.roundRect(cx + dx * r - r * .14, cy + dy * r - r * .1, r * .28, r * .14, r * .03); c.fill(); } });
  } else if (item === 'chickenFeet' || item === 'spareRibs'){
    plate(c, cx, cy, r, () => {
      if (item === 'chickenFeet'){ c.strokeStyle = '#b4532a'; c.lineWidth = r * .1; for (let i = 0; i < 4; i++){ const x0 = cx - r * .45 + i * r * .28, y0 = cy + r * .25; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + r * .1, y0 - r * .25); for (const a of [-.5, 0, .5]){ c.moveTo(x0 + r * .1, y0 - r * .25); c.lineTo(x0 + r * .1 + Math.sin(a) * r * .15, y0 - r * .4); } c.stroke(); } }
      else { for (const [dx, dy] of [[-.35, .15], [-.05, .05], [.25, .18], [0, .35], [.4, .02]]){ c.fillStyle = '#9a4a3a'; c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r, r * .15, r * .1, dx, 0, TAU); c.fill(); c.fillStyle = '#efe6d8'; c.beginPath(); c.arc(cx + dx * r + r * .08, cy + dy * r - r * .02, r * .035, 0, TAU); c.fill(); } }
      c.fillStyle = '#2b1f1a'; for (let i = 0; i < 6; i++) c.fillRect(cx - r * .4 + i * r * .16, cy + r * (i % 2 ? .1 : .3), r * .06, r * .05);
      c.fillStyle = '#d23b2f'; c.fillRect(cx + r * .15, cy + r * .08, r * .06, r * .06);
    });
  } else if (item === 'loMaiGai'){
    c.beginPath(); c.ellipse(cx, cy + r * .5, r * .85, r * .2, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    c.fillStyle = '#4f7a3a'; c.beginPath(); c.moveTo(cx - r * .8, cy + r * .3); c.quadraticCurveTo(cx - r * .7, cy - r * .5, cx, cy - r * .55); c.quadraticCurveTo(cx + r * .7, cy - r * .5, cx + r * .8, cy + r * .3); c.quadraticCurveTo(cx, cy + r * .55, cx - r * .8, cy + r * .3); c.fill();
    c.strokeStyle = '#6d9a4f'; c.lineWidth = r * .04; for (const a of [-.5, 0, .5]){ c.beginPath(); c.moveTo(cx, cy - r * .5); c.lineTo(cx + a * r, cy + r * .35); c.stroke(); }
    c.fillStyle = '#f4efe2'; c.beginPath(); c.ellipse(cx, cy - r * .1, r * .3, r * .2, 0, 0, TAU); c.fill();
    c.fillStyle = '#c49a5c'; c.beginPath(); c.arc(cx + r * .06, cy - r * .12, r * .08, 0, TAU); c.fill();
  } else if (item === 'springRoll'){
    plate(c, cx, cy, r, () => { for (const [dx, dy, a] of [[-.25, .1, -.3], [.1, .05, -.3], [-.05, .3, .2]]){ c.save(); c.translate(cx + dx * r, cy + dy * r); c.rotate(a); c.fillStyle = '#d98b2b'; c.beginPath(); c.roundRect(-r * .38, -r * .1, r * .76, r * .2, r * .1); c.fill(); c.fillStyle = 'rgba(255,230,160,.6)'; c.fillRect(-r * .3, -r * .07, r * .6, r * .04); c.restore(); } });
  } else if (item === 'soupDumpling'){
    c.beginPath(); c.ellipse(cx, cy + r * .55, r * .7, r * .16, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    c.fillStyle = '#fbfaf5'; c.beginPath(); c.moveTo(cx - r * .7, cy - r * .05); c.quadraticCurveTo(cx - r * .65, cy + r * .5, cx, cy + r * .52); c.quadraticCurveTo(cx + r * .65, cy + r * .5, cx + r * .7, cy - r * .05); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(cx, cy - r * .05, r * .7, r * .24, 0, 0, TAU); c.fillStyle = '#e8b85a'; c.fill();
    c.strokeStyle = '#c9c2b3'; c.lineWidth = r * .04; c.stroke();
    dumpling(c, cx, cy - r * .12, r * .34, '#f7f1e3', 'rgba(210,195,170,.9)');
    c.strokeStyle = '#3f7fae'; c.lineWidth = r * .05; c.beginPath(); c.moveTo(cx - r * .6, cy + r * .18); c.quadraticCurveTo(cx, cy + r * .36, cx + r * .6, cy + r * .18); c.stroke();
  } else {
    c.restore(); return cct.icon(c, item, cx, cy, r);             // egg tart and anything shared
  }
  c.restore();
}

// ---------------- small 3D helpers ----------------
// A point on a circle of radius r around (cx, cy) at height z, in screen space.
const ring = (iso, cx, cy, r, z, a) => iso.P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z);
// A line around the visible front half of a circle (rims, bands, piping).
function frontArc(iso, cx, cy, r, z, col, lw){
  const c = iso.ctx; c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
  for (let i = 0; i <= 18; i++){ const [a, b] = ring(iso, cx, cy, r, z, FRONT0 + Math.PI * i / 18); i ? c.lineTo(a, b) : c.moveTo(a, b); }
  c.stroke();
}
// One bamboo steamer basket: woven sides, two bound rims, and either a woven lid or an open top.
function basketTier(iso, cx, cy, r, z0, z1, lid){
  iso.cyl(cx, cy, r, z0, z1, BAMBOO, lid ? BAMBOO_LT : '#e8d3a3');
  const c = iso.ctx, n = Math.max(8, Math.round(r * 40));
  c.strokeStyle = 'rgba(120,78,34,.4)'; c.lineWidth = 1;
  for (let i = 1; i < n; i++){
    const a = FRONT0 + Math.PI * i / n, [x0, y0] = ring(iso, cx, cy, r, z0 + .02, a), [x1, y1] = ring(iso, cx, cy, r, z1 - .02, a);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  }
  const lw = Math.max(1, iso.s * .022);
  frontArc(iso, cx, cy, r, z0 + .018, BAMBOO_DK, lw);
  frontArc(iso, cx, cy, r, z1 - .018, BAMBOO_DK, lw);
  if (lid){                                               // woven lid: rings and a centre knot
    iso.ell(cx, cy, z1 + .001, r * .72, null, 'rgba(140,95,45,.55)');
    iso.ell(cx, cy, z1 + .001, r * .42, null, 'rgba(140,95,45,.55)');
    iso.ell(cx, cy, z1 + .002, r * .12, BAMBOO_DK);
  }
}
function steamerStack(iso, cx, cy, r, n, t, busy, lift = 0){
  iso.cyl(cx, cy, r + .05, .92, .99, '#3d4145', '#24272a');          // the wok of boiling water under the stack
  const h = .13;
  for (let i = 0; i < n; i++){
    const top = i === n - 1, z0 = .99 + i * h + (top ? lift : 0);
    basketTier(iso, cx, cy, r, z0, z0 + h - .01, top);
  }
  steam(iso, cx, cy, .99 + n * h + lift, t, busy ? 3 : 1);
}
// A squat glazed teapot sitting at (x, y, z); r is its radius in cells.
function teapot(iso, x, y, z, r, body, lid){
  const c = iso.ctx, [a, b] = iso.P(x, y, z), R = r * iso.s * 1.414;
  c.lineCap = 'round';
  c.strokeStyle = shade(body, .78); c.lineWidth = Math.max(1.5, R * .26);
  c.beginPath(); c.moveTo(a + R * .7, b - R * .5); c.quadraticCurveTo(a + R * 1.3, b - R * .55, a + R * 1.4, b - R * 1.1); c.stroke();
  c.lineWidth = Math.max(1.2, R * .17);
  c.beginPath(); c.arc(a - R * .98, b - R * .62, R * .36, Math.PI * .45, Math.PI * 1.55); c.stroke();
  c.lineCap = 'butt';
  c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(a + R * .1, b + R * .05, R * .95, R * .35, 0, 0, TAU); c.fill();
  const g = c.createRadialGradient(a - R * .35, b - R * .95, R * .1, a, b - R * .55, R * 1.15);
  g.addColorStop(0, shade(body, 1.45)); g.addColorStop(.55, body); g.addColorStop(1, shade(body, .66));
  c.fillStyle = g; c.beginPath(); c.ellipse(a, b - R * .58, R, R * .74, 0, 0, TAU); c.fill();
  c.fillStyle = shade(lid || body, .85); c.beginPath(); c.ellipse(a, b - R * 1.22, R * .5, R * .18, 0, 0, TAU); c.fill();
  c.fillStyle = shade(lid || body, 1.15); c.beginPath(); c.arc(a, b - R * 1.36, R * .14, 0, TAU); c.fill();
}
function blueWhitePot(iso, x, y, z, r){                    // a porcelain pot with a painted band
  teapot(iso, x, y, z, r, '#eef0ee', '#e8ebea');
  const c = iso.ctx, [a, b] = iso.P(x, y, z), R = r * iso.s * 1.414;
  c.strokeStyle = '#2d5da8'; c.lineWidth = Math.max(1, R * .1);
  c.beginPath(); c.ellipse(a, b - R * .58, R * .8, R * .3, 0, .15, Math.PI - .15); c.stroke();
  c.fillStyle = '#2d5da8'; for (const dx of [-.4, 0, .4]){ c.beginPath(); c.arc(a + dx * R, b - R * .42, R * .08, 0, TAU); c.fill(); }
}
function teacup(iso, x, y, z, r = .05, tea = '#8a4b22'){
  iso.cyl(x, y, r, z, z + r * 1.05, '#f7f4ec', tea);
  iso.ell(x, y, z + r * 1.05, r, null, 'rgba(45,93,168,.55)');
}
function chopsticks(iso, x, y, z, dx, dy, col = '#1f1a17'){
  const c = iso.ctx, [a0, b0] = iso.P(x - dy * .16 - dx * .02, y + dx * .16 - dy * .02, z), [a1, b1] = iso.P(x + dy * .16 - dx * .02, y - dx * .16 - dy * .02, z);
  const [p0, q0] = iso.P(x - dy * .16 + dx * .03, y + dx * .16 + dy * .03, z), [p1, q1] = iso.P(x + dy * .16 + dx * .03, y - dx * .16 + dy * .03, z);
  c.lineCap = 'round'; c.strokeStyle = col; c.lineWidth = Math.max(1.2, iso.s * .022);
  c.beginPath(); c.moveTo(a0, b0); c.lineTo(a1, b1); c.moveTo(p0, q0); c.lineTo(p1, q1); c.stroke();
  c.lineCap = 'butt';
  const [ra, rb] = iso.P(x - dy * .12, y + dx * .12, z);                         // the little porcelain rest
  c.fillStyle = '#f4f1ea'; c.beginPath(); c.ellipse(ra, rb, iso.s * .03, iso.s * .015, 0, 0, TAU); c.fill();
}
// Fret (回紋) border: a run of little squared spirals between u0 and u1 on a flat face.
function fret(c, u0, u1, v, h, col){
  c.strokeStyle = col; c.lineWidth = 1;
  for (let u = u0; u + h <= u1; u += h + 2){
    c.beginPath(); c.moveTo(u, v); c.lineTo(u, v - h); c.lineTo(u + h, v - h); c.lineTo(u + h, v - h * .25); c.lineTo(u + h * .35, v - h * .25); c.lineTo(u + h * .35, v - h * .65); c.lineTo(u + h * .7, v - h * .65); c.stroke();
  }
}
// A carved round medallion with a stylised 壽 lattice.
function roundel(c, u, v, r, col){
  c.strokeStyle = col; c.lineWidth = 1.4;
  c.beginPath(); c.arc(u, v, r, 0, TAU); c.stroke();
  c.beginPath(); c.arc(u, v, r * .72, 0, TAU); c.stroke();
  c.beginPath(); c.moveTo(u - r * .5, v - r * .3); c.lineTo(u + r * .5, v - r * .3); c.moveTo(u - r * .5, v + r * .3); c.lineTo(u + r * .5, v + r * .3);
  c.moveTo(u, v - r * .6); c.lineTo(u, v + r * .6); c.moveTo(u - r * .3, v - r * .3); c.lineTo(u - r * .3, v + r * .3); c.moveTo(u + r * .3, v - r * .3); c.lineTo(u + r * .3, v + r * .3); c.stroke();
}

// ---------------- the room ----------------
// Cream silk walls over a red lacquer dado, a gold fret band, and a dark cornice.
export function wallSegment(iso, [[ax, ay], [bx, by]], kitchen){
  if (kitchen) return false;                                     // the kitchen keeps its white tiles
  const side = ax === bx ? .92 : 1;                              // the side wall sits a touch in shadow
  iso.poly([[ax, ay, 1.02], [bx, by, 1.02], [bx, by, WALL_H], [ax, ay, WALL_H]], shade(PAL.mint, side));
  iso.poly([[ax, ay, 0], [bx, by, 0], [bx, by, .95], [ax, ay, .95]], shade(LACQUER, side));
  iso.poly([[ax, ay, .95], [bx, by, .95], [bx, by, 1.02], [ax, ay, 1.02]], shade(GOLD, side));
  iso.poly([[ax, ay, WALL_H - .13], [bx, by, WALL_H - .13], [bx, by, WALL_H], [ax, ay, WALL_H]], shade(LACQUER_DK, side));
  iso.poly([[ax, ay, WALL_H - .15], [bx, by, WALL_H - .15], [bx, by, WALL_H - .13], [ax, ay, WALL_H - .13]], shade(GOLD, side));
  iso.poly([[ax, ay, .02], [bx, by, .02], [bx, by, .06], [ax, ay, .06]], shade(GOLD_DK, side));   // skirting bead
  return true;
}
export function wallFace(face, x, y, iso){
  iso.onFace(face, x, y, c => {
    // dado: a sunk lacquer panel framed in gold, with a carved medallion
    const g = c.createLinearGradient(0, -88, 0, -12); g.addColorStop(0, 'rgba(0,0,0,.28)'); g.addColorStop(.25, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(0,0,0,.2)');
    c.fillStyle = g; c.fillRect(9, -88, 82, 76);
    c.strokeStyle = GOLD; c.lineWidth = 1.6; c.strokeRect(13, -84, 74, 68);
    c.strokeStyle = 'rgba(242,210,122,.35)'; c.lineWidth = 1; c.strokeRect(17, -80, 66, 60);
    roundel(c, 50, -50, 15, 'rgba(242,210,122,.85)');
    for (const [u, v, su, sv] of [[17, -80, 1, 1], [83, -80, -1, 1], [17, -20, 1, -1], [83, -20, -1, -1]]){   // corner frets
      c.beginPath(); c.moveTo(u, v + sv * 10); c.lineTo(u + su * 10, v + sv * 10); c.lineTo(u + su * 10, v); c.stroke();
    }
    fret(c, 3, 97, -95.8, 5, 'rgba(90,60,15,.75)');            // the fret band along the gold rail
    // upper wall: a faint woven damask in gold
    c.strokeStyle = 'rgba(176,132,52,.16)'; c.lineWidth = 1;
    for (let u = -100; u < 200; u += 25){ c.beginPath(); c.moveTo(u, -104); c.lineTo(u + 110, -214); c.moveTo(u + 110, -104); c.lineTo(u, -214); c.stroke(); }
    c.fillStyle = 'rgba(176,132,52,.2)';
    for (let u = 12.5; u < 100; u += 25) for (let v = -116.5; v > -214; v -= 25){ c.beginPath(); c.arc(u, v, 2.2, 0, TAU); c.fill(); }
    const sh = c.createLinearGradient(0, -225, 0, -196); sh.addColorStop(0, 'rgba(60,20,10,.22)'); sh.addColorStop(1, 'rgba(60,20,10,0)');
    c.fillStyle = sh; c.fillRect(0, -225, 100, 29);           // the cornice's shadow on the wall
  });
}
// Moon-gate lattice over the window glass (11..89 by -194..-102 on the wall face).
export function windowFrame(c){
  const u0 = 11, u1 = 89, v0 = -194, v1 = -102, cu = 50, cv = -148, R = 27;
  c.strokeStyle = ROSEWOOD; c.lineWidth = 2;
  const cut = (a0, a1, fixed, vertical) => {                   // draw a lattice line, leaving the moon open
    const d = vertical ? fixed - cu : fixed - cv;
    if (Math.abs(d) >= R){ c.beginPath(); vertical ? (c.moveTo(fixed, a0), c.lineTo(fixed, a1)) : (c.moveTo(a0, fixed), c.lineTo(a1, fixed)); c.stroke(); return; }
    const h = Math.sqrt(R * R - d * d), mid = vertical ? cv : cu;
    c.beginPath();
    if (vertical){ c.moveTo(fixed, a0); c.lineTo(fixed, mid - h); c.moveTo(fixed, mid + h); c.lineTo(fixed, a1); }
    else { c.moveTo(a0, fixed); c.lineTo(mid - h, fixed); c.moveTo(mid + h, fixed); c.lineTo(a1, fixed); }
    c.stroke();
  };
  for (let u = u0 + 9.75; u < u1; u += 9.75) cut(v0, v1, u, true);
  for (let v = v0 + 9.2; v < v1; v += 9.2) cut(u0, u1, v, false);
  c.lineWidth = 3.5; c.beginPath(); c.arc(cu, cv, R, 0, TAU); c.stroke();
  c.strokeStyle = GOLD; c.lineWidth = 1; c.beginPath(); c.arc(cu, cv, R + 2.2, 0, TAU); c.stroke();
  c.strokeStyle = ROSEWOOD; c.lineWidth = 6; c.strokeRect(u0 - 2, v0 - 2, u1 - u0 + 4, v1 - v0 + 4);
  c.strokeStyle = GOLD; c.lineWidth = 1; c.strokeRect(u0 - 5.5, v0 - 5.5, u1 - u0 + 11, v1 - v0 + 11);
  c.fillStyle = ROSEWOOD; c.fillRect(u0 - 8, v1 + 1, u1 - u0 + 16, 6);   // the sill
}
// Red lacquer pillars at the room's back corners, and a welcome plaque over the door.
export function room(iso, dw, door){
  for (const [px, py] of [[.15, .15], [dw - .15, .15]]){
    iso.cyl(px, py, .17, 0, .1, GOLD_DK, GOLD);
    iso.cyl(px, py, .14, .1, WALL_H - .2, LACQUER);
    for (const z of [.55, 1.35]) iso.cyl(px, py, .145, z, z + .05, GOLD, GOLD_LT);
    iso.cyl(px, py, .18, WALL_H - .2, WALL_H, GOLD_DK, GOLD);
  }
  iso.onFace('wallN', door, 0, c => {
    c.fillStyle = LACQUER; c.fillRect(14, -228, 72, 24);
    c.strokeStyle = GOLD; c.lineWidth = 1.5; c.strokeRect(17, -225, 66, 18);
    c.fillStyle = GOLD_LT; c.font = `900 12px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('歡迎光臨', 50, -215.5);
    c.fillStyle = GOLD_DK; c.fillRect(6, -196, 88, 4);            // the door head
  });
}
// The signboard: black lacquer, gilded characters, a red silk swag with a bow.
export function sign(c){
  const u0 = 22, u1 = 338, v0 = -238, h = 40, cu = (u0 + u1) / 2;
  c.fillStyle = 'rgba(40,15,8,.28)'; c.fillRect(u0 + 4, v0 + 5, u1 - u0, h);
  const g = c.createLinearGradient(0, v0, 0, v0 + h); g.addColorStop(0, '#2f1d14'); g.addColorStop(1, '#120a06');
  c.fillStyle = g; c.fillRect(u0, v0, u1 - u0, h);
  c.strokeStyle = GOLD; c.lineWidth = 3; c.strokeRect(u0 + 3, v0 + 3, u1 - u0 - 6, h - 6);
  c.strokeStyle = 'rgba(242,210,122,.5)'; c.lineWidth = 1; c.strokeRect(u0 + 7, v0 + 7, u1 - u0 - 14, h - 14);
  c.font = `900 26px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#3a2408'; c.fillText(THEME_SIGN(), cu + 1, v0 + h / 2 + 2);
  const tg = c.createLinearGradient(0, v0 + 8, 0, v0 + h - 8); tg.addColorStop(0, '#fff0b8'); tg.addColorStop(.5, GOLD_LT); tg.addColorStop(1, '#b8862e');
  c.fillStyle = tg; c.fillText(THEME_SIGN(), cu, v0 + h / 2 + 1);
  // swag: two scallops of red silk across the top, a bow in the middle, tails at the ends
  c.fillStyle = SILK; c.strokeStyle = '#7e1a16'; c.lineWidth = 1;
  for (const [a, b] of [[u0 - 4, cu], [cu, u1 + 4]]){
    c.beginPath(); c.moveTo(a, v0 - 2); c.quadraticCurveTo((a + b) / 2, v0 + 22, b, v0 - 2); c.quadraticCurveTo((a + b) / 2, v0 + 10, a, v0 - 2); c.fill(); c.stroke();
  }
  for (const s of [-1, 1]){
    c.beginPath(); c.moveTo(cu, v0); c.quadraticCurveTo(cu + s * 22, v0 - 16, cu + s * 26, v0 + 2); c.quadraticCurveTo(cu + s * 14, v0 + 8, cu, v0); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(cu, v0 + 2); c.lineTo(cu + s * 8, v0 + 26); c.lineTo(cu + s * 14, v0 + 22); c.closePath(); c.fill(); c.stroke();
    const e = s < 0 ? u0 - 4 : u1 + 4;
    c.beginPath(); c.moveTo(e, v0 - 2); c.lineTo(e - s * 3, v0 + 30); c.lineTo(e + s * 6, v0 + 26); c.closePath(); c.fill(); c.stroke();
  }
  c.fillStyle = '#d23b2f'; c.beginPath(); c.arc(cu, v0 + 1, 5, 0, TAU); c.fill(); c.stroke();
}
const THEME_SIGN = () => THEME.meta.sign;
// The half wall between the kitchen and the dining room: lacquer panels, rosewood cap.
export function partition(iso, x){
  const y0 = DH - .07, y1 = DH + .07;
  iso.box(x, y0, x + 1, y1, 0, PARTITION_H - .1, LACQUER, { topCol: LACQUER });
  iso.onFace('S', x, y1 - 1, c => {
    c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(8, -98, 84, 86);
    c.strokeStyle = GOLD; c.lineWidth = 1.5; c.strokeRect(12, -94, 76, 78);
    roundel(c, 50, -55, 16, 'rgba(242,210,122,.8)');
  });
  iso.box(x - .01, y0 - .04, x + 1.01, y1 + .04, PARTITION_H - .1, PARTITION_H, ROSEWOOD, { material: 'wood' });
  iso.onFace('S', x - .01, y1 + .04 - 1, c => { c.fillStyle = GOLD; c.fillRect(0, -(PARTITION_H - .1) * 100 - 2, 102, 2); });
}
// Kitchen side wall: a rack of spare steamer baskets, a hanging wok and cleavers.
export function kitchenWall(iso){
  iso.onFace('wallW', 0, DH + 1, c => {
    c.fillStyle = '#7a5230'; c.fillRect(-85, -150, 180, 6); c.fillStyle = '#5e3c24'; c.fillRect(-85, -144, 180, 3);
    for (let s = 0; s < 4; s++){                                // stacks of bamboo baskets on the shelf
      const u = -76 + s * 44, n = 3 + (s % 2);
      for (let i = 0; i < n; i++){
        const v = -150 - (i + 1) * 11;
        c.fillStyle = i === n - 1 ? BAMBOO_LT : BAMBOO; c.beginPath(); c.roundRect(u, v, 36, 10, 3); c.fill();
        c.strokeStyle = BAMBOO_DK; c.lineWidth = 1; c.stroke();
        c.strokeStyle = 'rgba(120,78,34,.4)'; for (let k = 4; k < 36; k += 4){ c.beginPath(); c.moveTo(u + k, v + 2); c.lineTo(u + k, v + 8); c.stroke(); }
      }
    }
  });
  iso.onFace('wallW', 0, DH + 4, c => {
    c.fillStyle = '#8a9096'; c.fillRect(-90, -186, 180, 4);
    c.fillStyle = '#2b2e31'; c.beginPath(); c.ellipse(-40, -140, 34, 30, 0, 0, TAU); c.fill();           // a big wok on its hook
    c.fillStyle = '#3d4145'; c.beginPath(); c.ellipse(-40, -142, 28, 24, 0, 0, TAU); c.fill();
    c.strokeStyle = '#8a9096'; c.lineWidth = 2; c.beginPath(); c.moveTo(-40, -182); c.lineTo(-40, -170); c.stroke();
    for (const u of [20, 44, 68]){                               // cleavers
      c.fillStyle = '#6b4526'; c.fillRect(u - 3, -182, 6, 16);
      c.fillStyle = '#b9c0c7'; c.beginPath(); c.moveTo(u - 10, -166); c.lineTo(u + 10, -166); c.lineTo(u + 10, -134); c.lineTo(u - 10, -130); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(u - 9, -164, 3, 30);
    }
  });
}

// ---------------- floors ----------------
const MOSAIC = ['.r..', 'ryr.', '.r..', '....'];
export function floor(iso, type, x, y){
  const cell = (fill, stroke) => iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], fill, stroke);
  if (type === 'boards'){
    // teak planks running into the room, with staggered joints and a little grain
    for (let i = 0; i < 4; i++){
      const a = x + i / 4, j = .2 + hash(x * 4 + i, y, 3) * .6;
      for (const [b0, b1, k] of [[y, y + j, 0], [y + j, y + 1, 1]]){
        const v = .86 + hash(x * 4 + i, y * 2 + k) * .2;
        iso.poly([[a, b0, 0], [a + .25, b0, 0], [a + .25, b1, 0], [a, b1, 0]], shade('#9a6a3e', v), 'rgba(55,32,18,.45)');
        for (const f of [.3, .7]){
          const off = (hash(i, k, x + y) - .5) * .06;
          iso.poly([[a + .25 * f + off, b0 + .04, .001], [a + .25 * f + off + .01, b1 - .04, .001]], null, 'rgba(70,40,20,.18)', 1);
        }
      }
    }
    iso.poly([[x, y, .001], [x + 1, y, .001], [x + 1, y + .5, .001], [x, y + .15, .001]], 'rgba(255,240,210,.05)');
  } else if (type === 'redCarpet'){
    cell(shade('#8f1a1a', .97 + hash(x, y) * .05), 'rgba(60,10,10,.18)');
    // corner scrolls meet their neighbours' to make full roundels across the room
    for (const [cx, cy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]){
      const pts = [];
      for (let i = 0; i <= 12; i++){ const a = i / 12 * TAU; pts.push([cx + Math.cos(a) * .2, cy + Math.sin(a) * .2, .001]); }
      const c = iso.ctx; c.save(); iso.path([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]]); c.clip();
      iso.poly(pts, 'rgba(120,20,18,.8)', 'rgba(230,180,80,.55)', 1);
      iso.poly(pts.map(([u, v]) => [cx + (u - cx) * .5, cy + (v - cy) * .5, .001]), null, 'rgba(230,180,80,.4)', 1);
      c.restore();
    }
    // a peony medallion in the middle
    for (let k = 0; k < 6; k++){
      const a = k / 6 * TAU, [p, q] = [x + .5 + Math.cos(a) * .13, y + .5 + Math.sin(a) * .13];
      iso.ell(p, q, .001, .07, 'rgba(210,70,60,.55)', 'rgba(230,180,80,.5)');
    }
    iso.ell(x + .5, y + .5, .002, .06, 'rgba(230,180,80,.75)');
    iso.poly([[x + .5, y + .22, .001], [x + .78, y + .5, .001], [x + .5, y + .78, .001], [x + .22, y + .5, .001]], null, 'rgba(230,180,80,.3)', 1);
  } else if (type === 'mosaic'){
    // 紙皮石: little cream tiles with red and gold flowers, the old teahouse floor
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
      const gx = x * 4 + i, gy = y * 4 + j, m = (x + y) % 2 ? '.' : MOSAIC[(gy % 4 + 4) % 4][(gx % 4 + 4) % 4];   // a flower every other tile
      const col = m === 'r' ? '#b3261e' : m === 'y' ? '#e0b23c' : shade((gx + gy) % 2 ? '#f1ece0' : '#e9e3d4', .97 + hash(gx, gy) * .05);
      const a = x + i / 4, b = y + j / 4;
      iso.poly([[a + .01, b + .01, 0], [a + .24, b + .01, 0], [a + .24, b + .24, 0], [a + .01, b + .24, 0]], col);
    }
    iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], null, 'rgba(120,110,95,.3)', 1);
  } else if (type === 'goldMarble'){
    // big polished tiles: creamy marble, gold veins, a strip of reflected light
    const g = iso.ctx, [p0, q0] = iso.P(x, y, 0), [p1, q1] = iso.P(x + 1, y + 1, 0);
    g.save(); iso.path([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]]); g.clip();
    const gr = g.createLinearGradient(p0, q0, p1, q1); gr.addColorStop(0, '#f4ecdc'); gr.addColorStop(1, shade('#e6dac2', .96 + hash(x, y) * .06));
    cell(gr);
    for (let k = 0; k < 2; k++){
      const s = hash(x, y, k), pts = [];
      for (let i = 0; i <= 8; i++){ const f = i / 8; pts.push([x + f, y + .15 + s * .7 + Math.sin(f * 5 + s * 9) * .08 + (k ? f * .2 : -f * .1), .001]); }
      iso.path(pts); g.strokeStyle = k ? 'rgba(170,130,60,.35)' : 'rgba(190,150,70,.55)'; g.lineWidth = k ? 1 : 1.4; g.stroke();
    }
    iso.poly([[x + .1, y, .002], [x + .35, y, .002], [x + .1, y + 1, .002], [x - .15, y + 1, .002]], 'rgba(255,255,255,.14)');
    g.restore();
    iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], null, 'rgba(185,145,60,.7)', 1);
  } else if (type === 'herringbone'){
    // oak blocks in a zigzag: columns of slanted blocks, alternating direction
    const g = iso.ctx; g.save(); iso.path([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]]); g.clip();
    for (let k = 0; k < 4; k++) for (let j = -2; j < 5; j++){
      const a = x + k * .25, b = y + j * .25, up = k % 2;
      const pts = up ? [[a, b, 0], [a + .25, b + .25, 0], [a + .25, b + .5, 0], [a, b + .25, 0]] : [[a, b + .25, 0], [a + .25, b, 0], [a + .25, b + .25, 0], [a, b + .5, 0]];
      iso.poly(pts, shade(up ? '#b9864e' : '#a8763f', .9 + hash(x * 4 + k, y * 8 + j) * .16), 'rgba(70,42,20,.35)');
    }
    g.restore();
  } else cct.floor(iso, type, x, y);
}

// ---------------- stations ----------------
// A stainless range with a coloured front panel (so each steamer reads at a glance).
function range(iso, x, y, col){
  iso.box(x + .05, y + .05, x + .95, y + .95, 0, .84, '#aeb6bd', { material: 'steel' });
  iso.box(x + .05, y + .05, x + .95, y + .95, .1, .72, col, { edge: false });
  iso.box(x + .01, y + .01, x + .99, y + .99, .84, .92, PAL.steel, { material: 'steel' });
  iso.box(x + .05, y + .05, x + .95, y + .95, 0, .1, '#3a3d40');           // kick plate
}
export function station(iso, st, t, busy){
  const { x, y } = st, ap = APPLIANCES[st.type], c = iso.ctx;
  switch (st.type){
    case 'teaStation': case 'teaStationPro': {
      counter(iso, x, y, ap.color);
      // the hot-water boiler: steel drum, sight glass, brass tap
      const bx = x + .34, by = y + .36, br = ap.pro ? .22 : .19;
      iso.cyl(bx, by, br, .92, 1.62, '#c9cfd4', '#dfe3e6');
      iso.cyl(bx, by, br * .45, 1.62, 1.7, '#9aa3ab');
      const [ga, gb] = ring(iso, bx, by, br, 1.05, Math.PI / 4), [gc, gd] = ring(iso, bx, by, br, 1.5, Math.PI / 4);
      c.strokeStyle = 'rgba(120,170,200,.85)'; c.lineWidth = Math.max(2, iso.s * .04); c.beginPath(); c.moveTo(ga, gb); c.lineTo(gc, gd); c.stroke();
      const [ta, tb] = ring(iso, bx, by, br + .03, 1.1, Math.PI / 4);
      c.fillStyle = '#c9a227'; c.beginPath(); c.roundRect(ta - 3, tb - 3, 7, 5, 2); c.fill();
      if (ap.pro){ iso.cyl(x + .74, y + .26, .14, .92, 1.4, '#c9cfd4', '#dfe3e6'); }
      // a tray of pots and cups on the front of the counter
      iso.box(x + .5, y + .52, x + .94, y + .94, .92, .95, '#6b3322', { material: 'wood' });
      teapot(iso, x + .64, y + .66, .95, .075, '#7a4a2a');
      blueWhitePot(iso, x + .82, y + .8, .95, .07);
      for (const [dx, dy] of [[.6, .86], [.72, .9]]) teacup(iso, x + dx, y + dy, .95, .04);
      for (const [dx, col] of [[.12, '#b3261e'], [.2, '#2f6f5e']]) iso.cyl(x + dx, y + .82, .05, .92, 1.08, col, shade(col, 1.2));
      steam(iso, bx, by, 1.75, t, busy ? 3 : 1);
      label(iso, st, '普洱', ap.color);
      break;
    }
    case 'hgSteamer': case 'hgSteamerPro': case 'smSteamer': case 'smSteamerPro': case 'baoSteamer': case 'baoSteamerPro':
    case 'feetSteamer': case 'feetSteamerPro': case 'ribSteamer': case 'ribSteamerPro': case 'loMaiSteamer': case 'loMaiSteamerPro':
    case 'custardSteamer': case 'custardSteamerPro': {
      range(iso, x, y, ap.color);
      const lift = busy ? Math.max(0, Math.sin(t * 2.2)) * .06 : 0;       // the lid lifts to check on things
      if (ap.pro){
        steamerStack(iso, x + .3, y + .32, .2, 4, t, busy, 0);
        steamerStack(iso, x + .68, y + .66, .2, 4, t, busy, lift);
      } else steamerStack(iso, x + .47, y + .47, .29, 3, t, busy, lift);
      label(iso, st, ap.zh, ap.color);
      break;
    }
    case 'cheungFunTray': case 'cheungFunPro': {
      range(iso, x, y, ap.color);
      const top = ap.pro ? 1.55 : 1.34;
      iso.box(x + .1, y + .12, x + .9, y + .88, .92, top, '#c3cad0', { material: 'steel' });
      const rows = ap.pro ? [-148, -122] : [-126];
      iso.onFace('S', x, y - .12, cc => {
        for (const v of rows){
          cc.fillStyle = '#9aa3ab'; cc.fillRect(14, v, 72, 18); cc.fillStyle = '#e1e5e8'; cc.fillRect(14, v, 72, 3);
          cc.fillStyle = '#5d656c'; cc.fillRect(40, v + 8, 20, 4);
        }
      });
      if (busy){                                                    // a drawer slides out: a sheet of rice roll on the tray
        const out = .12 + Math.max(0, Math.sin(t * 1.6)) * .08;
        iso.box(x + .16, y + .88, x + .84, y + .88 + out, top - .22, top - .18, '#b9c0c7', { material: 'steel' });
        iso.box(x + .22, y + .88, x + .78, y + .88 + out - .02, top - .18, top - .16, '#f8f4ec');
      }
      steam(iso, x + .5, y + .5, top + .05, t, busy ? 3 : 1);
      label(iso, st, '腸粉', ap.color);
      break;
    }
    case 'turnipPan': case 'turnipPanPro': {
      range(iso, x, y, ap.color);
      iso.box(x + .08, y + .1, x + .92, y + .9, .92, .98, '#1f2226', { material: 'steel' });
      const n = ap.pro ? 6 : 4;
      for (let i = 0; i < n; i++){
        const u = x + .16 + (i % 3) * .24, v = y + .2 + Math.floor(i / 3) * .3;
        iso.box(u, v, u + .18, v + .22, .98, 1.04, busy ? '#d9993a' : '#c98a3a', { topCol: busy ? '#e8b25a' : '#d9a052' });
        iso.poly([[u + .03, v + .05, 1.041], [u + .15, v + .05, 1.041], [u + .15, v + .08, 1.041], [u + .03, v + .08, 1.041]], 'rgba(120,60,20,.35)');
      }
      iso.box(x + .74, y + .7, x + .9, y + .74, .98, 1.0, '#9aa3ab');       // the spatula
      if (busy) steam(iso, x + .5, y + .5, 1.08, t, 2);
      label(iso, st, '蘿蔔糕', ap.color);
      break;
    }
    case 'rollFryer': case 'rollFryerPro': {
      range(iso, x, y, ap.color);
      iso.box(x + .12, y + .14, x + .88, y + .86, .92, 1.1, '#9aa3ab', { material: 'steel' });
      const oil = c.createLinearGradient(...iso.P(x + .18, y + .2, 1.1), ...iso.P(x + .82, y + .8, 1.1));
      oil.addColorStop(0, busy ? '#f0b24a' : '#c98a36'); oil.addColorStop(1, busy ? '#c98224' : '#a86e28');
      iso.poly([[x + .18, y + .2, 1.1], [x + .82, y + .2, 1.1], [x + .82, y + .8, 1.1], [x + .18, y + .8, 1.1]], oil);
      for (const dx of [.3, .46, .62]){
        const bob = busy ? Math.sin(t * 6 + dx * 9) * .01 : 0;
        iso.box(x + dx - .05, y + .3, x + dx + .05, y + .7, 1.1 + bob, 1.15 + bob, '#d98b2b', { topCol: '#e8a347' });
      }
      if (busy) for (let i = 0; i < 6; i++){ const [a, b] = iso.P(x + .25 + hash(i, 1) * .5, y + .25 + hash(i, 2) * .5, 1.11); c.fillStyle = 'rgba(255,240,200,.7)'; c.beginPath(); c.arc(a, b, 1.5 + Math.sin(t * 9 + i) * .8, 0, TAU); c.fill(); }
      iso.box(x + .8, y + .45, x + .96, y + .5, 1.12, 1.16, '#2b2b2b');      // basket handle
      label(iso, st, '春卷', ap.color);
      break;
    }
    case 'soupPot': case 'soupPotPro': {
      range(iso, x, y, ap.color);
      const pots = ap.pro ? [[.3, .32, .2], [.7, .36, .17]] : [[.4, .4, .25]];
      for (const [dx, dy, r] of pots){
        iso.cyl(x + dx, y + dy, r, .92, 1.36, '#c9cfd4', '#b9c0c7');
        iso.cyl(x + dx, y + dy, r * .95, 1.36, 1.39, '#aeb6bd', '#c9cfd4');
        iso.cyl(x + dx, y + dy, .03, 1.39, 1.44, '#2b2b2b');
        steam(iso, x + dx, y + dy, 1.45, t, busy ? 2 : 1);
      }
      for (const [dx, dy] of [[.66, .8], [.84, .72], [.82, .9]]){             // soup cups waiting to be filled
        iso.cyl(x + dx, y + dy, .07, .92, 1.0, '#fbfaf5', '#e8b85a');
        iso.ell(x + dx, y + dy, 1.0, .07, null, 'rgba(45,93,168,.6)');
      }
      label(iso, st, '灌湯餃', ap.color);
      break;
    }
    case 'pass': {
      // the steamer trolley, parked at the hatch between rounds
      trolleyBody(iso, x + .5, y + .5, .4, t, 3, false, 'N', false);
      label(iso, st, '點心車', '#8f1a14');
      break;
    }
    case 'shelf': {
      // a wire rack: sacks of flour at the bottom, spare baskets, jars of sauce, boxes of wrappers
      const sh = [.08, .62, 1.14, 1.66];
      for (const [px, py] of [[.1, .12], [.9, .12], [.1, .88], [.9, .88]]) iso.box(x + px - .02, y + py - .02, x + px + .02, y + py + .02, 0, 1.72, '#9aa3ab', { edge: false });
      for (const z of sh) iso.box(x + .08, y + .1, x + .92, y + .9, z, z + .03, '#c3cad0', { material: 'steel' });
      for (const [dx, col] of [[.28, '#e8dcc0'], [.66, '#ddd0b0']]){                      // flour sacks
        iso.box(x + dx - .17, y + .28, x + dx + .17, y + .74, .11, .5, col, { topCol: shade(col, 1.05) });
        iso.onFace('S', x + dx - .17, y + .74 - 1, cc => { cc.fillStyle = '#b3261e'; cc.font = `900 11px ${HAN}`; cc.textAlign = 'center'; cc.fillText('麵粉', 17, -26); });
      }
      for (const dx of [.3, .66]) for (let k = 0; k < 3; k++) basketTier(iso, x + dx, y + .5, .15, .65 + k * .1, .74 + k * .1, k === 2);
      for (const [dx, dy, col] of [[.22, .4, '#3a1d12'], [.42, .6, '#b3261e'], [.62, .38, '#3a1d12'], [.78, .62, '#c98a2a']]){
        iso.cyl(x + dx, y + dy, .07, 1.17, 1.4, col, shade(col, 1.2));
        iso.cyl(x + dx, y + dy, .035, 1.4, 1.45, '#d23b2f');
      }
      for (const [dx, col] of [[.3, '#f1ece0'], [.68, '#e8d9b0']]) iso.box(x + dx - .15, y + .3, x + dx + .15, y + .7, 1.69, 1.86, col, { topCol: shade(col, 1.05) });
      break;
    }
    default: cct.station(iso, st, t, busy);                        // tart oven
  }
}
// The steamer trolley: a steel cart on castors, a steam well, stacks of baskets and a push bar.
function trolleyBody(iso, cx, cy, hw, t, stacks, moving, face = 'S', plaque = true){
  const c = iso.ctx;
  contactShadow(iso, cx - hw, cy - hw, cx + hw, cy + hw, .22);
  for (const [ox, oy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){
    const wx = cx + ox * (hw - .06), wy = cy + oy * (hw - .06);
    iso.cyl(wx, wy, .045, 0, .09, '#2b2b2b', '#555');
    iso.box(wx - .012, wy - .012, wx + .012, wy + .012, .09, .16, '#8a9096', { edge: false });
  }
  iso.box(cx - hw, cy - hw, cx + hw, cy + hw, .16, .78, '#b9c0c7', { material: 'steel' });
  if (plaque) iso.onFace('S', cx - hw, cy + hw - 1, cc => {         // a red enamel plaque on the side
    const w = hw * 200;
    cc.fillStyle = '#b3261e'; cc.fillRect(w * .18, -66, w * .64, 22);
    cc.strokeStyle = GOLD; cc.lineWidth = 1.2; cc.strokeRect(w * .18 + 2, -64, w * .64 - 4, 18);
    cc.fillStyle = GOLD_LT; cc.font = `900 12px ${HAN}`; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText('點心', w * .5, -55);
    cc.fillStyle = 'rgba(0,0,0,.18)'; cc.fillRect(4, -30, w - 8, 2);
  });
  iso.box(cx - hw - .01, cy - hw - .01, cx + hw + .01, cy + hw + .01, .78, .84, '#d7dde2', { material: 'steel' });
  iso.box(cx - hw + .05, cy - hw + .05, cx + hw - .05, cy + hw - .05, .84, .845, '#2f3336');
  const spots = stacks === 1 ? [[0, 0]] : stacks === 2 ? [[-.13, -.1], [.13, .1]] : [[-.16, -.12], [.14, -.14], [0, .15]];
  const r = stacks === 1 ? .2 : .13;
  spots.forEach(([ox, oy], i) => {
    const n = 2 + ((i + 1) % 2);
    for (let k = 0; k < n; k++) basketTier(iso, cx + ox * hw / .4, cy + oy * hw / .4, r, .845 + k * .1, .845 + k * .1 + .09, k === n - 1);
  });
  steam(iso, cx, cy, .845 + .3, t, moving ? 2 : 1);
  // the push bar on the side the waiter holds
  const [dx, dy] = DIRS[face] || [0, 1], bx = cx - dx * (hw + .05), by = cy - dy * (hw + .05), px = -dy, py = dx;
  for (const s of [-1, 1]){ const [a, b] = iso.P(bx + px * s * hw * .8, by + py * s * hw * .8, .78), [a2, b2] = iso.P(bx + px * s * hw * .8, by + py * s * hw * .8, 1.02); c.strokeStyle = '#9aa3ab'; c.lineWidth = Math.max(1.5, iso.s * .03); c.beginPath(); c.moveTo(a, b); c.lineTo(a2, b2); c.stroke(); }
  const [h0, k0] = iso.P(bx - px * hw * .8, by - py * hw * .8, 1.02), [h1, k1] = iso.P(bx + px * hw * .8, by + py * hw * .8, 1.02);
  c.strokeStyle = '#d7dde2'; c.lineWidth = Math.max(2, iso.s * .045); c.lineCap = 'round'; c.beginPath(); c.moveTo(h0, k0); c.lineTo(h1, k1); c.stroke(); c.lineCap = 'butt';
}
// On the floor: pushed ahead of the waiter.
export function trolley(iso, x, y, face, t){
  const [dx, dy] = DIRS[face] || [0, 1];
  trolleyBody(iso, x + dx * .44, y + dy * .44, .24, t, 2, true, face);
}

// ---------------- at the table ----------------
// Baskets and plates set down in front of the customer, a cup of tea, chopsticks on a rest.
export function serve(iso, items, tx, ty, dx, dy, prog){
  const g = iso.ctx, n = items.length;
  items.forEach((it, i) => {
    const off = (i - (n - 1) / 2) * .26;
    const fx = tx + .5 - dx * .12 + (dy ? off : 0), fy = ty + .5 - dy * .12 + (dx ? off : 0);
    const [a, b] = iso.P(fx, fy, .78), sz = iso.s * .44, k = 1 - prog * .45;
    g.save(); g.globalAlpha = .45 + .55 * k;
    g.drawImage(iconCanvas(it), a - sz * k / 2, b - sz * .82 * k, sz * k, sz * k);
    g.restore();
  });
  const cx = tx + .5 - dx * .36, cy = ty + .5 - dy * .36;
  chopsticks(iso, cx + (dy ? .16 : 0), cy + (dx ? .16 : 0), .78, dx, dy);
  teacup(iso, cx - (dy ? .2 : 0), cy - (dx ? .2 : 0), .78, .045);
}

// ---------------- furniture ----------------
// Tea for the table: a pot and a few cups at the back of the top, out of the way of the food.
function teaSet(iso, x, y, z, pot = '#7a4a2a'){
  pot === 'blue' ? blueWhitePot(iso, x + .3, y + .3, z, .075) : teapot(iso, x + .3, y + .3, z, .075, pot);
  for (const [dx, dy] of [[.5, .24], [.22, .5]]) teacup(iso, x + dx, y + dy, z, .04);
}
export function decor(iso, it, t, part){
  const { x, y } = it, doBase = part !== 'back', doBack = part !== 'base', c = iso.ctx;
  switch (it.type){
    case 'roundTable': {
      if (!doBase) return;
      // a starched white cloth to the floor, a glass lazy susan, condiments and a teapot
      iso.cyl(x + .5, y + .5, .47, .04, .74, CLOTH, '#fbf9f4');
      c.strokeStyle = 'rgba(160,150,135,.35)'; c.lineWidth = 1;
      for (let i = 1; i < 9; i++){ const a = FRONT0 + Math.PI * i / 9, [p, q] = ring(iso, x + .5, y + .5, .47, .08, a), [p2, q2] = ring(iso, x + .5, y + .5, .47, .7, a); c.beginPath(); c.moveTo(p, q); c.lineTo(p2, q2); c.stroke(); }
      frontArc(iso, x + .5, y + .5, .47, .1, 'rgba(179,38,30,.5)', Math.max(1, iso.s * .03));
      iso.cyl(x + .5, y + .5, .24, .74, .765, 'rgba(200,225,235,.55)', 'rgba(215,235,242,.65)');
      iso.ell(x + .5, y + .5, .766, .23, null, 'rgba(255,255,255,.7)');
      for (const [dx, dy, col] of [[.62, .42, '#3a1d12'], [.44, .62, '#c8372d']]){ iso.cyl(x + dx, y + dy, .045, .765, .79, '#fbfaf5', col); }
      blueWhitePot(iso, x + .42, y + .4, .765, .075);
      break;
    }
    case 'woodRound': {
      if (!doBase) return;
      // a pedestal on a cross foot, a grained top with a darker edge, and the house teapot
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) iso.box(x + .5 + Math.min(0, dx * .3) - .03, y + .5 + Math.min(0, dy * .3) - .03, x + .5 + Math.max(0, dx * .3) + .03, y + .5 + Math.max(0, dy * .3) + .03, 0, .06, '#4a2e1c', { edge: false });
      iso.cyl(x + .5, y + .5, .06, .06, .68, '#5e3c24');
      iso.cyl(x + .5, y + .5, .45, .68, .74, '#7a4e2e', '#a8743f');
      iso.ell(x + .5, y + .5, .741, .36, null, 'rgba(90,55,25,.3)');
      iso.ell(x + .5, y + .5, .741, .24, null, 'rgba(90,55,25,.22)');
      iso.poly([[x + .25, y + .32, .742], [x + .6, y + .2, .742], [x + .66, y + .26, .742], [x + .3, y + .38, .742]], 'rgba(255,240,210,.12)');
      teaSet(iso, x, y, .74);
      break;
    }
    case 'marbleTable':
      if (!doBase) return;
      cct.decor(iso, it, t, part);
      teaSet(iso, x + .02, y + .02, .77, 'blue');
      break;
    case 'banquetChair': {
      // a wedding-banquet chair: a fitted red cover falling to the floor, a gold sash tied in a bow
      const [dx, dy] = DIRS[it.dir], px = Math.abs(dy), py = Math.abs(dx);          // px/py: 1 along the chair's width
      if (doBase){
        iso.box(x + .24, y + .24, x + .76, y + .76, .02, .44, SILK, { topCol: '#c8372d' });
        iso.box(x + .235, y + .235, x + .765, y + .765, 0, .05, shade(SILK, .8), { edge: false });   // the hem
        iso.box(x + .22, y + .22, x + .78, y + .78, .44, .5, '#c8372d', { topCol: '#d6463a' });      // the cushion
        c.strokeStyle = 'rgba(60,0,0,.22)'; c.lineWidth = 1;
        for (const f of [.36, .5, .64]){
          for (const [a, b, a2, b2] of [[x + f, y + .76, x + f, y + .76], [x + .76, y + f, x + .76, y + f]]){
            const [p, q] = iso.P(a, b, .06), [p2, q2] = iso.P(a2, b2, .42); c.beginPath(); c.moveTo(p, q); c.lineTo(p2, q2); c.stroke();
          }
        }
      }
      if (doBack){
        const [a, b, c2, d] = backRect(it, x, y, .07);
        const a0 = a + px * .1, c0 = c2 - px * .1, b0 = b + py * .1, d0 = d - py * .1;   // narrower than the seat
        iso.box(a0, b0, c0, d0, .5, 1.12, SILK, { topCol: '#c8372d' });
        iso.box(a0 - .006, b0 - .006, c0 + .006, d0 + .006, .72, .8, GOLD, { topCol: GOLD_LT });
        const bx = (a0 + c0) / 2 - dx * .05, by = (b0 + d0) / 2 - dy * .05, [p, q] = iso.P(bx, by, .76), k = iso.s;
        c.fillStyle = GOLD_LT; c.strokeStyle = GOLD_DK; c.lineWidth = 1;
        for (const sd of [-1, 1]){ c.beginPath(); c.ellipse(p + sd * k * .06, q - k * .01, k * .06, k * .035, sd * .4, 0, TAU); c.fill(); c.stroke(); }
        c.beginPath(); c.moveTo(p - k * .02, q); c.lineTo(p - k * .05, q + k * .17); c.lineTo(p - k * .005, q + k * .15); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(p + k * .02, q); c.lineTo(p + k * .045, q + k * .19); c.lineTo(p + k * .08, q + k * .15); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.arc(p, q, k * .026, 0, TAU); c.fill(); c.stroke();
      }
      break;
    }
    case 'woodStool': {
      if (!doBase) return;
      for (const [a, b2] of [[.3, .3], [.7, .3], [.3, .7], [.7, .7]]){
        const [p, q] = iso.P(x + a + (a - .5) * .12, y + b2 + (b2 - .5) * .12, 0), [p2, q2] = iso.P(x + a, y + b2, .4);
        c.strokeStyle = '#4a2e1c'; c.lineWidth = Math.max(2, iso.s * .045); c.beginPath(); c.moveTo(p, q); c.lineTo(p2, q2); c.stroke();
      }
      iso.ell(x + .5, y + .5, .16, .22, null, '#5e3c24');                  // the stretcher ring
      iso.cyl(x + .5, y + .5, .23, .38, .45, '#8a5a34', '#b07a4a');
      iso.ell(x + .5, y + .5, .451, .14, null, 'rgba(90,55,25,.3)');
      break;
    }
    case 'rosewoodChair': {
      // 酸枝椅: dark rosewood, arms, a carved splat with a medallion
      if (doBase){
        legs(iso, x, y, .2, .42, ROSEWOOD);
        iso.box(x + .15, y + .15, x + .85, y + .85, .42, .49, ROSEWOOD_LT, { material: 'wood' });
        const [dx, dy] = DIRS[it.dir];
        for (const s of [-1, 1]){                                      // arms along the two open sides
          const ax = x + .5 + (dy ? s * .32 : 0), ay = y + .5 + (dx ? s * .32 : 0);
          const x0 = dy ? ax - .03 : x + .18, x1 = dy ? ax + .03 : x + .82, y0 = dx ? ay - .03 : y + .18, y1 = dx ? ay + .03 : y + .82;
          iso.box(x0, y0, x1, y1, .72, .76, ROSEWOOD, { material: 'wood' });
          iso.box(x0 + (dy ? 0 : .3), y0 + (dx ? 0 : .3), x1 - (dy ? 0 : .3), y1 - (dx ? 0 : .3), .49, .72, ROSEWOOD, { edge: false });
        }
      }
      if (doBack){
        const [a, b, c2, d] = backRect(it, x, y, .05);
        iso.box(a, b, c2, d, .49, 1.12, ROSEWOOD, { material: 'wood' });
        iso.box(a - .01, b - .01, c2 + .01, d + .01, 1.08, 1.14, ROSEWOOD_LT, { material: 'wood' });
        const [p, q] = iso.P((a + c2) / 2, (b + d) / 2, .84);
        c.strokeStyle = 'rgba(217,169,59,.7)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(p, q, iso.s * .1, iso.s * .1, 0, 0, TAU); c.stroke();
      }
      break;
    }
    case 'velvetBooth': {
      if (doBase){ iso.box(x + .06, y + .06, x + .94, y + .94, 0, .12, '#2b2b2b'); iso.box(x + .08, y + .08, x + .92, y + .92, .12, .44, '#1f5a4a', { topCol: '#2a7560' }); }
      if (doBack){
        const [a, b, c2, d] = backRect(it, x, y, .2);
        iso.box(a, b, c2, d, .12, 1.05, '#1f5a4a', { topCol: '#2a7560' });
        const along = it.dir === 'E' || it.dir === 'W';               // tufting buttons on the cushion face
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++){
          const f = .2 + i * .3, px = along ? (a + c2) / 2 : a + (c2 - a) * f, py = along ? b + (d - b) * f : (b + d) / 2, [p, q] = iso.P(px, py, .58 + j * .26);
          c.fillStyle = 'rgba(10,40,32,.6)'; c.beginPath(); c.arc(p, q, Math.max(1, iso.s * .018), 0, TAU); c.fill();
        }
        iso.box(a - .005, b - .005, c2 + .005, d + .005, 1.05, 1.08, '#c9a227', { edge: false });
      }
      break;
    }
    case 'foldScreen': {
      // four lacquer panels in gold frames, painted with plum blossom and mountains
      for (let i = 0; i < 4; i++){
        const x0 = x + .04 + i * .235, zig = i % 2 ? .06 : 0;
        iso.box(x0, y + .42 + zig, x0 + .225, y + .48 + zig, .04, 1.62, '#1c1410', { topCol: GOLD });
        iso.box(x0 + .03, y + .42 + zig, x0 + .06, y + .48 + zig, 0, .04, GOLD_DK, { edge: false });
        iso.onFace('S', x0, y + .48 + zig - 1, cc => {
          cc.strokeStyle = GOLD; cc.lineWidth = 1.6; cc.strokeRect(2.5, -156, 17.5, 148);
          cc.fillStyle = 'rgba(217,169,59,.35)'; cc.beginPath(); cc.moveTo(3, -40); cc.lineTo(8 + i * 2, -70 - i * 6); cc.lineTo(20, -48); cc.lineTo(20, -10); cc.lineTo(3, -10); cc.fill();
          cc.strokeStyle = '#5a3a24'; cc.lineWidth = 1.2; cc.beginPath(); cc.moveTo(4, -130 + i * 8); cc.quadraticCurveTo(12, -110, 18, -120 + i * 4); cc.stroke();
          cc.fillStyle = '#f0a5b8'; for (let k = 0; k < 4; k++){ cc.beginPath(); cc.arc(6 + ((k * 7 + i * 3) % 12), -126 + k * 5 + i * 2, 1.8, 0, TAU); cc.fill(); }
          if (i === 1){ cc.fillStyle = '#f4f1ea'; cc.beginPath(); cc.ellipse(12, -92, 4, 2, -.3, 0, TAU); cc.fill(); cc.strokeStyle = '#f4f1ea'; cc.beginPath(); cc.moveTo(12, -92); cc.lineTo(13, -100); cc.stroke(); }
        });
      }
      break;
    }
    case 'teapotShelf': {
      iso.box(x + .08, y + .2, x + .92, y + .8, 0, 1.6, ROSEWOOD, { material: 'wood' });
      iso.onFace('S', x + .08, y + .8 - 1, cc => {
        cc.fillStyle = '#2a120c'; cc.fillRect(4, -152, 76, 146);
        cc.fillStyle = ROSEWOOD_LT; for (const v of [-42, -84, -126]) cc.fillRect(4, v, 76, 5);
        const pots = [['#7a4a2a', 0], ['#2d5da8', 1], ['#8f5a34', 0], ['#b3261e', 0], ['#f1efe9', 1], ['#3f7a5a', 0]];
        pots.forEach(([col, bw], i) => {
          const u = 18 + (i % 3) * 24, v = -52 - Math.floor(i / 3) * 42;
          cc.fillStyle = col; cc.beginPath(); cc.ellipse(u, v, 9, 8, 0, 0, TAU); cc.fill();
          cc.strokeStyle = col; cc.lineWidth = 2.5; cc.beginPath(); cc.moveTo(u + 8, v - 2); cc.lineTo(u + 13, v - 7); cc.stroke();
          cc.beginPath(); cc.arc(u - 9, v, 4, Math.PI * .5, Math.PI * 1.5); cc.stroke();
          cc.fillStyle = shade(col, 1.2); cc.fillRect(u - 3, v - 10, 6, 3);
          if (bw){ cc.strokeStyle = '#2d5da8'; cc.lineWidth = 1; cc.beginPath(); cc.ellipse(u, v, 6, 3, 0, 0, Math.PI); cc.stroke(); }
          cc.fillStyle = 'rgba(255,255,255,.3)'; cc.fillRect(u - 5, v - 5, 2, 5);
        });
        for (let i = 0; i < 3; i++){ cc.fillStyle = ['#e8d9b0', '#d9c28f', '#efe4c8'][i]; cc.beginPath(); cc.ellipse(20 + i * 22, -134, 9, 4, 0, 0, TAU); cc.fill(); cc.fillStyle = '#b3261e'; cc.fillRect(17 + i * 22, -136, 6, 3); }   // pu-erh cakes
      });
      break;
    }
    case 'porcelainVase': {
      iso.box(x + .26, y + .26, x + .74, y + .74, 0, .28, ROSEWOOD, { material: 'wood' });
      const prof = [[.28, .36, .12], [.36, .6, .19], [.6, .82, .21], [.82, .98, .15], [.98, 1.14, .08], [1.14, 1.2, .1]];
      for (const [z0, z1, r] of prof) iso.cyl(x + .5, y + .5, r, z0, z1, '#f2f1ec', '#e6e7e3');
      frontArc(iso, x + .5, y + .5, .205, .72, '#2d5da8', Math.max(2, iso.s * .05));
      frontArc(iso, x + .5, y + .5, .21, .66, '#2d5da8', 1);
      frontArc(iso, x + .5, y + .5, .15, .9, '#2d5da8', 1.2);
      for (let i = 1; i < 6; i++){ const [p, q] = ring(iso, x + .5, y + .5, .2, .48, FRONT0 + Math.PI * i / 6); c.fillStyle = '#2d5da8'; c.beginPath(); c.arc(p, q, Math.max(1.5, iso.s * .03), 0, TAU); c.fill(); }
      break;
    }
    case 'bonsai': {
      // a slim rosewood stand, a shallow glazed tray, a twisted juniper
      legs(iso, x, y, .3, .5, ROSEWOOD);
      iso.box(x + .26, y + .26, x + .74, y + .74, .5, .56, ROSEWOOD_LT, { material: 'wood' });
      iso.box(x + .32, y + .36, x + .68, y + .64, .56, .63, '#2f6f8f', { topCol: '#5c4630' });
      const [r0, s0] = iso.P(x + .45, y + .5, .63), k = iso.s;
      c.strokeStyle = '#5a4030'; c.lineCap = 'round'; c.lineWidth = Math.max(3, k * .07);
      c.beginPath(); c.moveTo(r0, s0); c.bezierCurveTo(r0 - k * .2, s0 - k * .25, r0 + k * .2, s0 - k * .4, r0 - k * .05, s0 - k * .62); c.stroke();
      c.lineWidth = Math.max(2, k * .035); c.beginPath(); c.moveTo(r0 + k * .02, s0 - k * .35); c.quadraticCurveTo(r0 + k * .2, s0 - k * .4, r0 + k * .3, s0 - k * .36); c.stroke();
      c.lineCap = 'butt';
      for (const [dx, dy, rr, col] of [[-.05, -.66, .2, '#3f7d45'], [.28, -.4, .15, '#4f914f'], [-.2, -.48, .13, '#57a05c'], [.08, -.78, .12, '#57a05c']]){
        c.fillStyle = col; c.beginPath(); c.ellipse(r0 + dx * k, s0 + dy * k, rr * k, rr * k * .45, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(r0 + dx * k - rr * k * .2, s0 + dy * k - rr * k * .12, rr * k * .5, rr * k * .18, 0, 0, TAU); c.fill();
      }
      iso.ell(x + .6, y + .56, .631, .04, '#8a8f93');
      break;
    }
    case 'teaCabinet': {
      iso.box(x + .06, y + .18, x + .94, y + .82, 0, 1.75, '#6b3a22', { material: 'wood' });
      iso.onFace('S', x + .06, y + .82 - 1, cc => {
        cc.fillStyle = '#3a1d12'; cc.fillRect(4, -168, 80, 160);
        for (let r = 0; r < 4; r++){
          cc.fillStyle = '#8a5a34'; cc.fillRect(4, -130 + r * 38, 80, 4);
          for (let i = 0; i < 4; i++){
            const u = 9 + i * 19, v = -160 + r * 38, col = ['#b3261e', '#2f6f5e', '#c9a227', '#2d5da8'][(i + r) % 4];
            cc.fillStyle = col; cc.fillRect(u, v, 14, 28); cc.fillStyle = 'rgba(255,255,255,.25)'; cc.fillRect(u + 2, v + 2, 3, 24);
            cc.fillStyle = '#f4ecd8'; cc.fillRect(u + 3, v + 9, 8, 11);
            cc.fillStyle = shade(col, .7); cc.fillRect(u - 1, v - 3, 16, 4);
          }
        }
      });
      iso.onFace('E', x + .94 - 1, y + .18, cc => { cc.fillStyle = 'rgba(0,0,0,.08)'; cc.fillRect(0, -175, 64, 175); });
      break;
    }
    case 'koiPond': {
      // a low stone pond: carp circling under lily pads
      iso.box(x + .04, y + .04, x + .96, y + .96, 0, .3, '#8a8f8a', { topCol: '#a9ada6' });
      const wg = c.createLinearGradient(...iso.P(x + .1, y + .1, .26), ...iso.P(x + .9, y + .9, .26));
      wg.addColorStop(0, '#2f6f78'); wg.addColorStop(1, '#1f4f5a');
      iso.poly([[x + .12, y + .12, .26], [x + .88, y + .12, .26], [x + .88, y + .88, .26], [x + .12, y + .88, .26]], wg);
      for (let i = 0; i < 3; i++){
        const a = t * (.45 + i * .12) + i * 2.1, fx = x + .5 + Math.cos(a) * .24, fy = y + .5 + Math.sin(a) * .24, [p, q] = iso.P(fx, fy, .261);
        const k = iso.s, [p2, q2] = iso.P(fx - Math.sin(a) * .1, fy + Math.cos(a) * .1, .261);   // heading: along the circle
        c.save(); c.translate(p, q); c.rotate(Math.atan2(q2 - q, p2 - p));
        c.fillStyle = ['#ff7a2a', '#f4f1ea', '#e8b030'][i]; c.beginPath(); c.ellipse(0, 0, k * .09, k * .035, 0, 0, TAU); c.fill();
        if (i === 1){ c.fillStyle = '#e8432a'; c.beginPath(); c.arc(k * .03, 0, k * .02, 0, TAU); c.fill(); }
        c.beginPath(); c.moveTo(-k * .08, 0); c.lineTo(-k * .13, -k * .035); c.lineTo(-k * .13, k * .035); c.fill();
        c.restore();
      }
      for (const [dx, dy, r] of [[.28, .3, .09], [.7, .66, .08], [.62, .28, .06]]){
        iso.ell(x + dx, y + dy, .262, r, '#4f8f45');
        const [p, q] = iso.P(x + dx, y + dy, .262); c.strokeStyle = '#2f6a35'; c.beginPath(); c.moveTo(p, q); c.lineTo(p + r * iso.s, q - r * iso.s * .2); c.stroke();
      }
      const [lp, lq] = iso.P(x + .28, y + .3, .27); c.fillStyle = '#f5b8c8'; c.beginPath(); c.arc(lp, lq - 2, iso.s * .035, 0, TAU); c.fill();
      iso.box(x + .72, y + .14, x + .9, y + .34, .26, .5, '#7d827d', { topCol: '#9a9f9a' });
      for (let i = 0; i < 2; i++){ const ph = (t * .4 + i * .5) % 1, [p, q] = iso.P(x + .5, y + .5, .262); c.strokeStyle = `rgba(255,255,255,${(.4 * (1 - ph)).toFixed(3)})`; c.beginPath(); c.ellipse(p, q, iso.s * .4 * ph, iso.s * .2 * ph, 0, 0, TAU); c.stroke(); }
      break;
    }
    default: cct.decor(iso, it, t, part);
  }
}

// ---------------- lights ----------------
export function ceiling(iso, it, t){
  const c = iso.ctx, cx = it.x + .5, cy = it.y + .5, k = iso.s;
  const [ta, tb] = iso.P(cx, cy, WALL_H + .3);
  const glow = (a, b, r, col) => { const g = c.createRadialGradient(a, b, 1, a, b, r); g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, '0)')); c.fillStyle = g; c.beginPath(); c.arc(a, b, r, 0, TAU); c.fill(); };
  if (it.type === 'palaceLantern'){
    // 宮燈: a six-sided rosewood lantern with painted silk panels and red tassels
    const [la, lb] = iso.P(cx, cy, 1.8), w = k * .3, h = k * .44, sway = Math.sin(t * 1.3 + it.x) * k * .01;
    c.strokeStyle = GOLD_DK; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ta, tb); c.lineTo(la + sway, lb - h / 2 - 6); c.stroke();
    glow(la, lb, k * .95, 'rgba(255,120,80,.32)');
    const L = la + sway;
    c.fillStyle = ROSEWOOD; c.beginPath(); c.ellipse(L, lb - h / 2, w * .75, w * .2, 0, 0, TAU); c.fill();
    const body = c.createLinearGradient(L - w, 0, L + w, 0); body.addColorStop(0, '#9a1b14'); body.addColorStop(.45, '#ff6a4a'); body.addColorStop(1, '#8a1812');
    c.fillStyle = body; c.beginPath(); c.moveTo(L - w * .75, lb - h / 2); c.lineTo(L + w * .75, lb - h / 2); c.lineTo(L + w, lb); c.lineTo(L + w * .75, lb + h / 2); c.lineTo(L - w * .75, lb + h / 2); c.lineTo(L - w, lb); c.closePath(); c.fill();
    c.strokeStyle = ROSEWOOD; c.lineWidth = 2; c.stroke();
    c.lineWidth = 1.5; for (const f of [-.38, .38]){ c.beginPath(); c.moveTo(L + f * w * 1.6, lb - h / 2); c.lineTo(L + f * w * 2.1, lb); c.lineTo(L + f * w * 1.6, lb + h / 2); c.stroke(); }
    c.fillStyle = 'rgba(255,230,170,.8)'; c.font = `900 ${Math.max(8, k * .2)}px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('福', L, lb + 1);
    c.fillStyle = ROSEWOOD; c.beginPath(); c.ellipse(L, lb + h / 2, w * .75, w * .2, 0, 0, TAU); c.fill();
    c.strokeStyle = '#d23b2f'; c.lineWidth = 2;
    for (const f of [-1, -.35, .35, 1]){ const tx = L + f * w * .8; c.beginPath(); c.moveTo(tx, lb + h / 2); c.lineTo(tx + Math.sin(t * 2 + f * 3) * 1.5, lb + h / 2 + k * .28); c.stroke(); c.fillStyle = GOLD; c.fillRect(tx - 1.5, lb + h / 2 + 2, 3, 3); }
  } else if (it.type === 'lanternString'){
    // a sagging cord across the room with little round lanterns
    const [a0, b0] = iso.P(it.x + .02, it.y + .5, 2.25), [a1, b1] = iso.P(it.x + .98, it.y + .5, 2.25);
    const at = f => [a0 + (a1 - a0) * f, b0 + (b1 - b0) * f + Math.sin(f * Math.PI) * k * .3];
    c.strokeStyle = '#3a2418'; c.lineWidth = 1.2; c.beginPath();
    for (let i = 0; i <= 12; i++){ const [p, q] = at(i / 12); i ? c.lineTo(p, q) : c.moveTo(p, q); } c.stroke();
    for (const f of [.15, .38, .62, .85]){
      const [p, q] = at(f), sw = Math.sin(t * 1.6 + f * 7) * 1.2, r = k * .1, ly = q + k * .16;
      c.strokeStyle = '#3a2418'; c.beginPath(); c.moveTo(p, q); c.lineTo(p + sw, ly - r); c.stroke();
      glow(p + sw, ly, k * .35, 'rgba(255,110,70,.28)');
      const g = c.createRadialGradient(p + sw - r * .3, ly - r * .3, 1, p + sw, ly, r * 1.1); g.addColorStop(0, '#ff8a5a'); g.addColorStop(1, '#a8150f');
      c.fillStyle = g; c.beginPath(); c.ellipse(p + sw, ly, r, r * .85, 0, 0, TAU); c.fill();
      c.fillStyle = GOLD; c.fillRect(p + sw - r * .45, ly - r * .95, r * .9, r * .2); c.fillRect(p + sw - r * .45, ly + r * .75, r * .9, r * .2);
      c.strokeStyle = '#d23b2f'; c.beginPath(); c.moveTo(p + sw, ly + r * .95); c.lineTo(p + sw, ly + r * 1.8); c.stroke();
    }
  } else if (it.type === 'bambooLamp'){
    const [la, lb] = iso.P(cx, cy, 1.95), w = k * .34;
    c.strokeStyle = '#3a2418'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ta, tb); c.lineTo(la, lb - w * .55); c.stroke();
    glow(la, lb + w * .3, k * 1.1, 'rgba(255,205,130,.42)');
    c.fillStyle = '#c9a26b'; c.beginPath(); c.moveTo(la - w, lb + w * .25); c.quadraticCurveTo(la - w, lb - w * .6, la, lb - w * .6); c.quadraticCurveTo(la + w, lb - w * .6, la + w, lb + w * .25); c.closePath(); c.fill();
    c.save(); c.clip(); c.strokeStyle = 'rgba(110,70,30,.55)'; c.lineWidth = 1;
    for (let i = -6; i <= 6; i++){ c.beginPath(); c.moveTo(la + i * w / 6, lb + w * .3); c.quadraticCurveTo(la + i * w / 9, lb - w * .2, la, lb - w * .62); c.stroke(); }
    for (let j = 0; j < 4; j++){ c.beginPath(); c.ellipse(la, lb + w * .25 - j * w * .2, w * (1 - j * .14), w * .25, 0, 0, Math.PI); c.stroke(); }
    c.restore();
    c.fillStyle = '#ffe2a6'; c.beginPath(); c.ellipse(la, lb + w * .25, w * .95, w * .24, 0, 0, TAU); c.fill();
  } else if (it.type === 'brassLamp'){
    for (const [dx, dy, z, r] of [[-.16, -.08, 1.9, .12], [.14, -.12, 1.72, .1], [.02, .16, 1.82, .11]]){
      const [p, q] = iso.P(cx + dx, cy + dy, z), [p0, q0] = iso.P(cx + dx, cy + dy, WALL_H + .3), rr = r * k;
      c.strokeStyle = '#2b2b2b'; c.lineWidth = 1; c.beginPath(); c.moveTo(p0, q0); c.lineTo(p, q - rr); c.stroke();
      glow(p, q, k * .7, 'rgba(255,215,150,.35)');
      const g = c.createRadialGradient(p - rr * .35, q - rr * .35, 1, p, q, rr); g.addColorStop(0, '#fff6dc'); g.addColorStop(.6, '#f2cf86'); g.addColorStop(1, '#b8862e');
      c.fillStyle = g; c.beginPath(); c.arc(p, q, rr, 0, TAU); c.fill();
      c.fillStyle = '#9a7424'; c.beginPath(); c.ellipse(p, q - rr * .92, rr * .4, rr * .14, 0, 0, TAU); c.fill();
    }
  } else cct.ceiling(iso, it, t);
}

// ---------------- on the walls ----------------
// Drawn on a flat 100-unit face; the usable panel is roughly u 4..96, v -198..-100.
export function wallItem(c, w, t, hour, day){
  if (w.type === 'doubleHappy'){
    c.fillStyle = '#6a1410'; c.fillRect(12, -196, 76, 92);
    c.fillStyle = '#b3261e'; c.fillRect(16, -192, 68, 84);
    c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(19, -189, 62, 78);
    for (const [u, v] of [[19, -189], [81, -189], [19, -111], [81, -111]]){ c.fillStyle = GOLD; c.beginPath(); c.arc(u, v, 3, 0, TAU); c.fill(); }
    const g = c.createLinearGradient(0, -176, 0, -124); g.addColorStop(0, '#fff0b8'); g.addColorStop(1, '#c99a2e');
    c.fillStyle = g; c.font = `900 46px ${HAN}`; c.fillText('囍', 50, -148);
  } else if (w.type === 'teaMenu'){
    c.fillStyle = '#4a2016'; c.fillRect(4, -198, 92, 96);
    c.fillStyle = '#6b3322'; c.fillRect(8, -194, 84, 88);
    c.fillStyle = GOLD_LT; c.font = `900 9px ${HAN}`; c.fillText('點 心', 50, -187);
    const words = ['蝦餃', '燒賣', '叉燒包', '腸粉', '鳳爪'], prices = ['十四', '十三', '十二', '十七', '十二'];
    words.forEach((wd, i) => {
      const u = 13 + i * 16.5;
      c.fillStyle = '#f4ecd8'; c.fillRect(u, -180, 14, 70);
      c.fillStyle = '#b3261e'; c.font = `700 10px ${HAN}`; [...wd].forEach((ch, j) => c.fillText(ch, u + 7, -171 + j * 12));
      c.fillStyle = '#231d18'; c.font = `700 7px ${HAN}`; c.fillText(prices[i], u + 7, -116);
    });
  } else if (w.type === 'couplets'){
    // 對聯: a banner across the top and a strip down each side
    c.fillStyle = '#b3261e'; c.fillRect(22, -198, 56, 16); c.fillRect(8, -176, 16, 78); c.fillRect(76, -176, 16, 78);
    c.strokeStyle = GOLD; c.lineWidth = 1; c.strokeRect(23.5, -196.5, 53, 13); c.strokeRect(9.5, -174.5, 13, 75); c.strokeRect(77.5, -174.5, 13, 75);
    c.fillStyle = GOLD_LT; c.font = `900 10px ${HAN}`;
    [...'吉祥如意'].forEach((ch, i) => c.fillText(ch, 30.5 + i * 13, -190));
    [...'花開富貴'].forEach((ch, i) => c.fillText(ch, 84, -164 + i * 18));
    [...'竹報平安'].forEach((ch, i) => c.fillText(ch, 16, -164 + i * 18));
    c.fillStyle = '#d23b2f'; c.save(); c.translate(50, -140); c.rotate(Math.PI / 4); c.fillRect(-14, -14, 28, 28); c.restore();
    c.fillStyle = GOLD_LT; c.font = `900 18px ${HAN}`; c.fillText('福', 50, -139);
  } else if (w.type === 'calligraphy'){
    // a hanging scroll: brocade mount, rollers, one big brushed 茶 and a red seal
    c.strokeStyle = '#3a2418'; c.lineWidth = 1; c.beginPath(); c.moveTo(38, -206); c.lineTo(50, -214); c.lineTo(62, -206); c.stroke();
    c.fillStyle = '#6b8a7a'; c.fillRect(30, -204, 40, 104);
    c.fillStyle = '#f3ecdc'; c.fillRect(34, -190, 32, 80);
    c.fillStyle = '#3a2418'; c.fillRect(26, -206, 48, 4); c.fillRect(26, -101, 48, 5);
    c.fillStyle = '#c9a227'; c.fillRect(24, -206, 3, 4); c.fillRect(73, -206, 3, 4); c.fillRect(24, -101, 3, 5); c.fillRect(73, -101, 3, 5);
    c.fillStyle = '#1b1612'; c.font = `900 30px ${HAN}`; c.fillText('茶', 50, -158);
    c.font = `700 7px ${HAN}`; [...'一盅兩件'].forEach((ch, i) => c.fillText(ch, 60, -134 + i * 8));
    c.fillStyle = '#c8372d'; c.fillRect(38, -124, 7, 7);
  } else if (w.type === 'latticePanel'){
    // a carved rosewood window panel, lit softly from behind
    const g = c.createRadialGradient(50, -150, 4, 50, -150, 50); g.addColorStop(0, '#ffe6b0'); g.addColorStop(1, '#c98a4a');
    c.fillStyle = ROSEWOOD; c.fillRect(8, -198, 84, 96);
    c.fillStyle = g; c.fillRect(14, -192, 72, 84);
    c.strokeStyle = ROSEWOOD; c.lineWidth = 2.4;
    for (let u = 14; u <= 86; u += 12){ c.beginPath(); c.moveTo(u, -192); c.lineTo(u, -108); c.stroke(); }
    for (let v = -192; v <= -108; v += 12){ c.beginPath(); c.moveTo(14, v); c.lineTo(86, v); c.stroke(); }
    for (let u = 20; u < 86; u += 24) for (let v = -186; v < -108; v += 24){ c.beginPath(); c.moveTo(u, v); c.lineTo(u + 12, v + 12); c.moveTo(u + 12, v); c.lineTo(u, v + 12); c.stroke(); }
    c.fillStyle = ROSEWOOD; c.beginPath(); c.arc(50, -150, 15, 0, TAU); c.fill();
    c.strokeStyle = GOLD; c.lineWidth = 1.2; c.beginPath(); c.arc(50, -150, 11, 0, TAU); c.stroke();
    c.fillStyle = GOLD_LT; c.font = `900 12px ${HAN}`; c.fillText('壽', 50, -149);
    c.strokeStyle = GOLD_DK; c.lineWidth = 1; c.strokeRect(10, -196, 80, 92);
  } else if (w.type === 'greenWall'){
    c.fillStyle = '#1f2a24'; c.fillRect(6, -198, 88, 96);
    const greens = ['#2f6a35', '#3f7d45', '#4f914f', '#6fb35a', '#57a05c'];
    for (let i = 0; i < 70; i++){
      const u = 10 + ((i * 37) % 80), v = -194 + ((i * 53) % 88), a = (i * 1.7) % TAU;
      c.fillStyle = greens[i % greens.length]; c.beginPath(); c.ellipse(u, v, 7, 3.5, a, 0, TAU); c.fill();
    }
    c.fillStyle = 'rgba(245,184,200,.9)'; for (const [u, v] of [[24, -170], [70, -130], [52, -182], [34, -120]]){ c.beginPath(); c.arc(u, v, 2.4, 0, TAU); c.fill(); }
    c.strokeStyle = '#c9a227'; c.lineWidth = 2; c.strokeRect(6, -198, 88, 96);
  } else if (w.type === 'neonSign'){
    c.fillStyle = '#141a18'; c.fillRect(8, -186, 84, 76);
    c.shadowBlur = 12; c.lineWidth = 2.5;
    c.shadowColor = '#56d6ff'; c.strokeStyle = '#8fe6ff';
    c.beginPath(); c.ellipse(50, -166, 16, 10, 0, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(66, -168); c.quadraticCurveTo(76, -170, 78, -180); c.stroke();
    c.beginPath(); c.arc(34, -166, 5, Math.PI * .5, Math.PI * 1.5); c.stroke();
    c.beginPath(); c.moveTo(46, -177); c.lineTo(54, -177); c.stroke();
    c.shadowColor = '#ff4fa3'; c.fillStyle = '#ff8cc6'; c.font = `900 24px ${HAN}`; c.fillText('飲茶', 50, -129);
    c.shadowBlur = 0;
  } else if (w.type === 'dragonMural'){
    // 龍鳳呈祥: a gilded dragon and phoenix chasing a flaming pearl, carved on red lacquer
    c.fillStyle = '#5a100d'; c.fillRect(2, -200, 96, 100);
    c.fillStyle = '#8f1a14'; c.fillRect(6, -196, 88, 92);
    c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(9, -193, 82, 86);
    const gold = c.createLinearGradient(0, -190, 0, -110); gold.addColorStop(0, '#fff0b8'); gold.addColorStop(1, '#b8862e');
    c.strokeStyle = gold; c.lineCap = 'round';
    c.lineWidth = 6; c.beginPath(); c.moveTo(16, -118); c.bezierCurveTo(22, -170, 40, -120, 46, -160); c.bezierCurveTo(50, -185, 34, -186, 38, -172); c.stroke();
    c.lineWidth = 1; c.strokeStyle = '#8f1a14'; for (let i = 0; i < 9; i++){ const f = i / 9, u = 16 + f * 28, v = -118 - Math.sin(f * 3) * 40; c.beginPath(); c.arc(u, v, 2.2, 0, Math.PI); c.stroke(); }
    c.fillStyle = gold; c.beginPath(); c.ellipse(40, -176, 7, 5, -.6, 0, TAU); c.fill();
    c.strokeStyle = gold; c.lineWidth = 1.4; c.beginPath(); c.moveTo(36, -180); c.lineTo(30, -188); c.moveTo(42, -181); c.lineTo(44, -190); c.stroke();
    c.fillStyle = gold; c.beginPath(); c.moveTo(84, -122); c.quadraticCurveTo(64, -140, 66, -168); c.quadraticCurveTo(76, -170, 74, -150); c.quadraticCurveTo(80, -138, 84, -122); c.fill();
    c.lineWidth = 2; for (const [du, dv] of [[-18, 6], [-12, 12], [-4, 14]]){ c.beginPath(); c.moveTo(84, -122); c.quadraticCurveTo(84 + du, -110 + dv, 76 + du, -106 + dv); c.stroke(); }
    c.beginPath(); c.arc(68, -172, 4, 0, TAU); c.fill();
    c.lineCap = 'butt';
    const pg = c.createRadialGradient(56, -150, 1, 56, -150, 9); pg.addColorStop(0, '#fff6dc'); pg.addColorStop(.5, '#ffb347'); pg.addColorStop(1, 'rgba(255,90,40,0)');
    c.fillStyle = pg; c.beginPath(); c.arc(56, -150, 9, 0, TAU); c.fill();
    c.fillStyle = GOLD_LT; c.font = `900 11px ${HAN}`; c.fillText('龍鳳呈祥', 50, -113);
  } else return cct.wallItem(c, w, t, hour, day);
}
