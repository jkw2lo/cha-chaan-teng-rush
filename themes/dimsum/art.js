// Dim sum teahouse art. Pieces the two restaurants share (chairs, lamps, birdcage, tart oven...)
// fall through to the cha chaan teng's drawings.
import { shade } from '../../js/iso.js';
import { APPLIANCES } from '../../js/data.js';
import { WALL_H } from '../../js/world.js';
import { TAU, HAN, hash, counter, label, steam, legs, backRect } from '../../js/art.js';
import * as cct from '../cct/art.js';

export const backs = ['banquetChair', 'crossChair', 'rattanChair'];
export const lamps = ['palaceLantern', 'pendant', 'chandelier', 'ceilingFan'];

const BAMBOO = '#c9a26b', BAMBOO_DK = '#a8804a';

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

// ---------------- floors ----------------
export function floor(iso, type, x, y){
  if (type === 'redCarpet'){
    iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], shade('#8f1a1a', .96 + hash(x, y) * .06), 'rgba(60,10,10,.25)');
    iso.poly([[x + .5, y + .15, .001], [x + .85, y + .5, .001], [x + .5, y + .85, .001], [x + .15, y + .5, .001]], null, 'rgba(230,180,80,.55)', 1.2);
    iso.ell(x + .5, y + .5, .001, .05, 'rgba(230,180,80,.6)');
  } else if (type === 'boards'){
    for (let i = 0; i < 4; i++){
      const a = x + i / 4;
      iso.poly([[a, y, 0], [a + .25, y, 0], [a + .25, y + 1, 0], [a, y + 1, 0]], shade('#9a6a3e', .9 + hash(x * 4 + i, y) * .14), 'rgba(60,35,20,.35)');
    }
  } else cct.floor(iso, type, x, y);
}

// ---------------- stations ----------------
function steamerStack(iso, x, y, n, t, busy){
  iso.ell(x + .45, y + .45, .93, .34, '#2a2a2a');
  for (let i = 0; i < n; i++) iso.cyl(x + .45, y + .45, .3, .95 + i * .15, 1.09 + i * .15, BAMBOO, i === n - 1 ? BAMBOO_DK : undefined);
  const c = iso.ctx;
  for (let i = 0; i < n; i++){ const [a, b] = iso.P(x + .45, y + .45 + .3, 1.02 + i * .15); c.strokeStyle = 'rgba(120,80,40,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(a - iso.s * .3, b - iso.s * .12); c.lineTo(a + iso.s * .3, b + iso.s * .02); c.stroke(); }
  steam(iso, x + .45, y + .45, 1.1 + n * .15, t, busy ? 3 : 1);
}
export function station(iso, st, t, busy){
  const { x, y } = st, ap = APPLIANCES[st.type], c = iso.ctx;
  switch (st.type){
    case 'teaStation': case 'teaStationPro': {
      counter(iso, x, y, ap.color);
      iso.cyl(x + .36, y + .38, ap.pro ? .2 : .18, .92, 1.5, '#c9cfd4');
      if (ap.pro) iso.cyl(x + .72, y + .3, .14, .92, 1.35, '#c9cfd4');
      for (const [dx, dy] of [[.72, .72], [.42, .78]]){ iso.cyl(x + dx, y + dy, .09, .92, 1.06, '#7a4a2a', '#8f5a34'); }
      steam(iso, x + .36, y + .38, 1.6, t, busy ? 3 : 1);
      label(iso, st, '普洱', ap.color);
      break;
    }
    case 'hgSteamer': case 'hgSteamerPro': case 'smSteamer': case 'smSteamerPro': case 'baoSteamer': case 'baoSteamerPro':
    case 'feetSteamer': case 'feetSteamerPro': case 'ribSteamer': case 'ribSteamerPro': case 'loMaiSteamer': case 'loMaiSteamerPro':
    case 'custardSteamer': case 'custardSteamerPro': {
      counter(iso, x, y, ap.color);
      steamerStack(iso, x, y, ap.pro ? 4 : 3, t, busy);
      label(iso, st, ap.zh, ap.color);
      break;
    }
    case 'cheungFunTray': case 'cheungFunPro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .12, y + .14, x + .88, y + .86, .92, ap.pro ? 1.5 : 1.3, '#b9c0c7', { material: 'steel' });
      iso.onFace('S', x, y, cc => { const rows = ap.pro ? [-142, -118] : [-120]; for (const v of rows){ cc.fillStyle = '#8f979e'; cc.fillRect(16, v, 68, 14); cc.fillStyle = '#d0d4d8'; cc.fillRect(40, v + 5, 20, 4); } });
      steam(iso, x + .5, y + .5, ap.pro ? 1.55 : 1.35, t, busy ? 3 : 1);
      label(iso, st, '腸粉', ap.color);
      break;
    }
    case 'turnipPan': case 'turnipPanPro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .08, y + .1, x + .92, y + .9, .92, .98, '#1f2226', { material: 'steel' });
      const n = ap.pro ? 6 : 4;
      for (let i = 0; i < n; i++) iso.box(x + .16 + (i % 3) * .24, y + .2 + Math.floor(i / 3) * .3, x + .34 + (i % 3) * .24, y + .42 + Math.floor(i / 3) * .3, .98, 1.03, busy ? '#d9993a' : '#c98a3a');
      if (busy) steam(iso, x + .5, y + .5, 1.05, t, 2);
      label(iso, st, '蘿蔔糕', ap.color);
      break;
    }
    case 'rollFryer': case 'rollFryerPro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .14, y + .16, x + .86, y + .84, .92, 1.12, '#9aa3ab', { material: 'steel' });
      iso.box(x + .2, y + .22, x + .8, y + .78, 1.1, 1.12, busy ? '#e0a040' : '#c98a36', { shine: false });
      for (const dx of [.32, .5, .68]) iso.box(x + dx - .05, y + .3, x + dx + .05, y + .7, 1.12, 1.16, '#d98b2b');
      if (busy) steam(iso, x + .5, y + .5, 1.2, t, 2);
      label(iso, st, '春卷', ap.color);
      break;
    }
    case 'soupPot': case 'soupPotPro': {
      counter(iso, x, y, ap.color);
      iso.cyl(x + .42, y + .44, ap.pro ? .3 : .26, .92, 1.34, '#c9cfd4');
      iso.cyl(x + .42, y + .44, .08, 1.34, 1.4, '#9aa3ab');
      if (ap.pro) iso.cyl(x + .78, y + .3, .14, .92, 1.2, '#c9cfd4');
      for (let i = 0; i < 3; i++) iso.cyl(x + .78, y + .78, .09, .92 + i * .05, .96 + i * .05, '#fbfaf5');
      steam(iso, x + .42, y + .44, 1.45, t, busy ? 3 : 1);
      label(iso, st, '灌湯餃', ap.color);
      break;
    }
    case 'pass': {
      // the trolley, parked at the hatch
      counter(iso, x, y, '#9aa4ab');
      for (let i = 0; i < 2; i++) iso.cyl(x + .3, y + .35, .16, .92 + i * .1, 1.0 + i * .1, BAMBOO, i ? BAMBOO_DK : undefined);
      iso.cyl(x + .72, y + .7, .14, .92, 1.0, BAMBOO, BAMBOO_DK);
      for (const px of [.06, .94]) iso.box(x + px - .03, y + .05, x + px + .03, y + .11, .92, 1.4, '#6f787f');
      iso.box(x + .03, y + .03, x + .97, y + .13, 1.38, 1.44, '#6f787f', { material: 'steel' });
      label(iso, st, '點心車', '#8f1a14');
      break;
    }
    default: cct.station(iso, st, t, busy);                        // tart oven, stock shelf
  }
}

// ---------------- furniture ----------------
export function decor(iso, it, t, part){
  const { x, y } = it, doBase = part !== 'back', doBack = part !== 'base';
  switch (it.type){
    case 'roundTable': case 'woodRound': {
      if (!doBase) return;
      const wood = it.type === 'woodRound';
      iso.ell(x + .5, y + .5, 0, .2, wood ? '#4a2e1c' : '#6a1414');
      iso.cyl(x + .5, y + .5, .05, 0, .7, wood ? '#6b4526' : '#8a1c16');
      iso.cyl(x + .5, y + .5, .46, .66, .74, wood ? '#9a6a3e' : '#f6f2ea', wood ? '#b07a4a' : '#fbf9f4');
      if (!wood){
        iso.cyl(x + .5, y + .5, .24, .74, .77, 'rgba(200,225,235,.55)', 'rgba(215,235,242,.7)');   // the lazy susan
        const c = iso.ctx; c.strokeStyle = 'rgba(200,40,30,.5)'; c.lineWidth = 1.2;
        const [a, b] = iso.P(x + .5, y + .5, .74); c.beginPath(); c.ellipse(a, b, iso.s * .46 * 1.414, iso.s * .46 * .707, 0, 0, TAU); c.stroke();
      }
      break;
    }
    case 'banquetChair':
      if (doBase){ legs(iso, x, y, .26, .42, '#c9a227'); iso.box(x + .2, y + .2, x + .8, y + .8, .42, .5, '#b3261e'); }
      if (doBack){ const [a, b, c2, d] = backRect(it, x, y, .07); iso.box(a, b, c2, d, .5, 1.05, '#b3261e', { topCol: '#c9a227' }); }
      break;
    case 'woodStool':
      if (!doBase) return;
      for (const [a, b2] of [[.35, .35], [.65, .35], [.35, .65], [.65, .65]]) iso.box(x + a - .025, y + b2 - .025, x + a + .025, y + b2 + .025, 0, .4, '#5e3c24', { edge: false });
      iso.cyl(x + .5, y + .5, .2, .38, .45, '#9a6a3e', '#b07a4a');
      break;
    case 'foldScreen': {
      for (let i = 0; i < 3; i++){
        const x0 = x + .08 + i * .28;
        iso.box(x0, y + .42, x0 + .26, y + .5, 0, 1.6, '#6a1414', { topCol: '#c9a227' });
      }
      iso.onFace('S', x, y - .5, c => { c.strokeStyle = '#e8c35a'; c.lineWidth = 2; for (let i = 0; i < 3; i++){ c.strokeRect(12 + i * 28, -150, 22, 120); c.beginPath(); c.arc(23 + i * 28, -95, 7, 0, TAU); c.stroke(); } });
      break;
    }
    case 'teapotShelf':
      iso.box(x + .08, y + .2, x + .92, y + .8, 0, 1.5, '#6b4526', { material: 'wood' });
      iso.onFace('S', x, y - .2, c => {
        c.fillStyle = '#4a2e1c'; for (const v of [-50, -95, -140]) c.fillRect(8, v, 84, 4);
        const pots = ['#7a4a2a', '#2d5da8', '#8f5a34', '#b3261e', '#7a4a2a', '#3f7a5a'];
        pots.forEach((col, i) => { const u = 20 + (i % 3) * 28, v = -60 - Math.floor(i / 3) * 45; c.fillStyle = col; c.beginPath(); c.ellipse(u, v, 9, 8, 0, 0, TAU); c.fill(); c.fillRect(u + 8, v - 4, 5, 2); });
      });
      break;
    default: cct.decor(iso, it, t, part);
  }
}
export function ceiling(iso, it, t){
  if (it.type !== 'palaceLantern') return cct.ceiling(iso, it, t);
  const c = iso.ctx, cx = it.x + .5, cy = it.y + .5;
  const [ta, tb] = iso.P(cx, cy, WALL_H + .3), [la, lb] = iso.P(cx, cy, 1.85), w = iso.s * .28, h = iso.s * .42;
  c.strokeStyle = '#c9a227'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ta, tb); c.lineTo(la, lb - h / 2); c.stroke();
  const glow = c.createRadialGradient(la, lb, 1, la, lb, iso.s * .9); glow.addColorStop(0, 'rgba(255,120,80,.35)'); glow.addColorStop(1, 'rgba(255,120,80,0)');
  c.fillStyle = glow; c.beginPath(); c.arc(la, lb, iso.s * .9, 0, TAU); c.fill();
  c.fillStyle = '#c8211a'; c.beginPath(); c.moveTo(la - w * .6, lb - h / 2); c.lineTo(la + w * .6, lb - h / 2); c.lineTo(la + w, lb); c.lineTo(la + w * .6, lb + h / 2); c.lineTo(la - w * .6, lb + h / 2); c.lineTo(la - w, lb); c.closePath(); c.fill();
  c.strokeStyle = '#e8c35a'; c.lineWidth = 2; c.stroke();
  c.beginPath(); c.moveTo(la, lb - h / 2); c.lineTo(la, lb + h / 2); c.stroke();
  c.fillStyle = '#ffd89a'; c.beginPath(); c.ellipse(la, lb, w * .3, h * .3, 0, 0, TAU); c.fill();
  c.strokeStyle = '#c8211a'; c.lineWidth = 2; for (const dx of [-4, 0, 4]){ c.beginPath(); c.moveTo(la + dx, lb + h / 2); c.lineTo(la + dx + Math.sin(t * 2 + dx) * 1.5, lb + h / 2 + iso.s * .25); c.stroke(); }
}
export function wallItem(c, w, t, hour, day){
  if (w.type === 'doubleHappy'){
    c.fillStyle = '#b3261e'; c.fillRect(14, -192, 72, 86);
    c.strokeStyle = '#e8c35a'; c.lineWidth = 2; c.strokeRect(18, -188, 64, 78);
    c.fillStyle = '#f2d27a'; c.font = `900 44px ${HAN}`; c.fillText('囍', 50, -148);
  } else if (w.type === 'teaMenu'){
    c.fillStyle = '#6b4526'; c.fillRect(6, -194, 88, 90);
    const words = ['蝦餃', '燒賣', '叉燒包', '腸粉', '鳳爪'];
    words.forEach((wd, i) => { const u = 12 + i * 16.5; c.fillStyle = '#f4ecd8'; c.fillRect(u, -188, 14, 76); c.fillStyle = '#b3261e'; c.font = `700 10px ${HAN}`; [...wd].forEach((ch, j) => c.fillText(ch, u + 7, -176 + j * 12)); });
  } else return cct.wallItem(c, w, t, hour, day);
}
