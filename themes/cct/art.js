// Cha chaan teng art: dish icons, stations, furniture, lamps and wall pieces.
// Shared drawing (people, walls, light, helpers) lives in js/art.js.
import { shade } from '../../js/iso.js';
import { APPLIANCES, DECOR } from '../../js/data.js';
import { WALL_H } from '../../js/world.js';
import { TAU, HAN, HAN_SANS, hash, PAL, counter, label, steam, legs, backRect, iconCanvas } from '../../js/art.js';

// seats with a backrest (drawn in two parts so customers sit between them)
export const backs = ['boothSeat', 'crossChair', 'metalChair', 'rattanChair', 'timberBench'];
// ceiling pieces that throw a pool of light on the floor
export const lamps = ['pendant', 'globeLamp', 'ceilingFan', 'chandelier'];

// ---------------- menu icons (screen space) ----------------
function bunDome(c, cx, cy, rx, ry){
  c.save();
  c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); c.lineTo(cx + rx, cy); c.ellipse(cx, cy, rx, ry * .28, 0, 0, Math.PI); c.closePath();
  c.fillStyle = '#c98323'; c.fill();
  c.clip();
  const step = rx * .36;
  for (let i = -4; i <= 4; i++) for (let j = -3; j <= 2; j++){
    const px = cx + (i + (j % 2 ? .5 : 0)) * step, py = cy + j * step * .62;
    c.beginPath(); c.moveTo(px, py - step * .3); c.lineTo(px + step * .42, py); c.lineTo(px, py + step * .3); c.lineTo(px - step * .42, py); c.closePath();
    c.fillStyle = '#f3c25a'; c.fill();
  }
  c.restore();
  c.beginPath(); c.ellipse(cx, cy, rx, ry * .28, 0, 0, Math.PI); c.strokeStyle = '#a8661b'; c.lineWidth = Math.max(1, rx * .06); c.stroke();
}
export function icon(c, item, cx, cy, r){
  c.save(); c.lineJoin = 'round'; c.lineCap = 'round';
  if (item === 'hotTea'){
    c.fillStyle = '#f4f1ea'; c.strokeStyle = '#b9b1a0'; c.lineWidth = r * .06;
    c.beginPath(); c.ellipse(cx, cy + r * .55, r * .82, r * .22, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.arc(cx + r * .56, cy + r * .1, r * .2, -Math.PI / 2, Math.PI / 2); c.lineWidth = r * .1; c.strokeStyle = '#fff'; c.stroke();
    c.lineWidth = r * .06; c.strokeStyle = '#b9b1a0';
    c.beginPath(); c.moveTo(cx - r * .58, cy - r * .2); c.lineTo(cx + r * .58, cy - r * .2); c.lineTo(cx + r * .4, cy + r * .5); c.lineTo(cx - r * .4, cy + r * .5); c.closePath();
    c.fillStyle = '#ffffff'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(cx, cy - r * .2, r * .56, r * .15, 0, 0, TAU); c.fillStyle = '#b8743f'; c.fill(); c.stroke();
    c.strokeStyle = 'rgba(150,150,150,.8)'; c.lineWidth = r * .07;
    for (const dx of [-.18, .18]){ c.beginPath(); c.moveTo(cx + dx * r, cy - r * .42); c.bezierCurveTo(cx + (dx - .15) * r, cy - r * .6, cx + (dx + .15) * r, cy - r * .72, cx + dx * r, cy - r * .92); c.stroke(); }
  } else if (item === 'icedTea'){
    const x0 = cx - r * .38, x1 = cx + r * .38, y0 = cy - r * .72, y1 = cy + r * .82;
    c.strokeStyle = '#d23b2f'; c.lineWidth = r * .09; c.beginPath(); c.moveTo(cx + r * .08, cy - r * .1); c.lineTo(cx + r * .32, y0 - r * .28); c.stroke();
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1 - r * .06, y1); c.lineTo(x0 + r * .06, y1); c.closePath();
    c.fillStyle = 'rgba(220,240,248,.9)'; c.fill();
    c.save(); c.clip();
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#d9a877'); g.addColorStop(1, '#b5773f');
    c.fillStyle = g; c.fillRect(x0, y0 + r * .22, x1 - x0, y1 - y0);
    c.fillStyle = 'rgba(255,255,255,.88)';
    for (const [dx, dy, a] of [[-.16, -.34, .3], [.14, -.28, -.2], [-.02, -.08, .5]]){
      c.save(); c.translate(cx + dx * r, cy + dy * r); c.rotate(a); c.fillRect(-r * .13, -r * .13, r * .26, r * .26); c.restore();
    }
    c.restore();
    c.strokeStyle = '#7fb0c6'; c.lineWidth = r * .07;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1 - r * .06, y1); c.lineTo(x0 + r * .06, y1); c.closePath(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = r * .06; c.beginPath(); c.moveTo(x0 + r * .12, y0 + r * .3); c.lineTo(x0 + r * .16, y1 - r * .2); c.stroke();
  } else if (item === 'bun'){
    c.beginPath(); c.ellipse(cx, cy + r * .42, r * .86, r * .2, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    bunDome(c, cx, cy + r * .3, r * .86, r * .78);
  } else if (item === 'butterBun'){
    c.beginPath(); c.ellipse(cx, cy + r * .55, r * .86, r * .2, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    c.beginPath(); c.ellipse(cx, cy + r * .42, r * .84, r * .24, 0, 0, TAU); c.fillStyle = '#e8b35a'; c.fill();
    c.fillStyle = '#fbe389'; c.strokeStyle = '#d9b43a'; c.lineWidth = r * .05;
    c.beginPath(); c.moveTo(cx - r * .62, cy + r * .12); c.lineTo(cx + r * .5, cy + r * .02); c.lineTo(cx + r * .62, cy + r * .3); c.lineTo(cx - r * .5, cy + r * .42); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#fff4c2'; c.beginPath(); c.moveTo(cx - r * .62, cy + r * .12); c.lineTo(cx + r * .5, cy + r * .02); c.lineTo(cx + r * .44, cy - r * .04); c.lineTo(cx - r * .66, cy + r * .06); c.closePath(); c.fill();
    bunDome(c, cx, cy + r * .02, r * .8, r * .66);
  } else if (item === 'condensedToast'){
    // two thick slices, butter melting, condensed milk drizzled over
    for (const [dx, dy] of [[-.12, .12], [.1, -.06]]){
      const x0 = cx + dx * r - r * .5, y0 = cy + dy * r - r * .42, w = r, h = r * .84;
      c.fillStyle = '#b9772f'; c.beginPath(); c.roundRect(x0, y0, w, h, r * .22); c.fill();
      c.fillStyle = '#f0c46f'; c.beginPath(); c.roundRect(x0 + r * .07, y0 + r * .07, w - r * .14, h - r * .14, r * .16); c.fill();
    }
    c.fillStyle = '#fbe389'; c.beginPath(); c.roundRect(cx - r * .08, cy - r * .3, r * .3, r * .22, r * .05); c.fill();
    c.strokeStyle = '#fff8e8'; c.lineWidth = r * .09; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - r * .45, cy - r * .1); c.bezierCurveTo(cx - r * .2, cy - r * .35, cx, cy + r * .2, cx + r * .2, cy - r * .05); c.bezierCurveTo(cx + r * .35, cy - r * .2, cx + r * .4, cy + r * .2, cx + r * .5, cy + r * .1); c.stroke();
  } else if (item === 'frenchToast'){
    c.beginPath(); c.ellipse(cx, cy + r * .5, r * .9, r * .22, 0, 0, TAU); c.fillStyle = '#f4f1ea'; c.fill(); c.strokeStyle = '#c9c2b3'; c.lineWidth = r * .05; c.stroke();
    c.fillStyle = '#9a5a1e'; c.beginPath(); c.roundRect(cx - r * .62, cy - r * .1, r * 1.24, r * .55, r * .18); c.fill();
    c.fillStyle = '#d98b2b'; c.beginPath(); c.roundRect(cx - r * .62, cy - r * .32, r * 1.24, r * .5, r * .2); c.fill();
    c.fillStyle = '#eaa84a'; c.beginPath(); c.roundRect(cx - r * .54, cy - r * .28, r * 1.08, r * .36, r * .16); c.fill();
    c.fillStyle = '#fbe389'; c.beginPath(); c.roundRect(cx - r * .14, cy - r * .5, r * .3, r * .24, r * .05); c.fill();
    c.fillStyle = 'rgba(168,100,28,.85)'; c.beginPath(); c.moveTo(cx - r * .3, cy - r * .3); c.quadraticCurveTo(cx - r * .32, cy + r * .1, cx - r * .24, cy + r * .3); c.lineTo(cx - r * .16, cy + r * .3); c.quadraticCurveTo(cx - r * .18, cy, cx - r * .12, cy - r * .3); c.fill();
  } else if (item === 'noodleSpam' || item === 'satayBeef'){
    bowl(c, cx, cy, r, () => {
      c.strokeStyle = '#f0cc6a'; c.lineWidth = r * .07;
      for (let i = 0; i < 5; i++){ c.beginPath(); const y = cy - r * .12 + i * r * .06; c.moveTo(cx - r * .55, y); for (let k = 1; k <= 8; k++) c.lineTo(cx - r * .55 + k * r * .14, y + Math.sin(k * 1.7 + i) * r * .04); c.stroke(); }
      if (item === 'noodleSpam'){
        c.fillStyle = '#e59a8f'; c.strokeStyle = '#c4625a'; c.lineWidth = r * .03;
        for (const [dx, a] of [[-.25, -.2], [.05, .15]]){ c.save(); c.translate(cx + dx * r, cy - r * .2); c.rotate(a); c.fillRect(-r * .18, -r * .1, r * .36, r * .2); c.strokeRect(-r * .18, -r * .1, r * .36, r * .2); c.restore(); }
        c.fillStyle = '#fffdf5'; c.beginPath(); c.ellipse(cx + r * .3, cy - r * .22, r * .22, r * .15, .3, 0, TAU); c.fill();
        c.fillStyle = '#f5a623'; c.beginPath(); c.arc(cx + r * .3, cy - r * .22, r * .08, 0, TAU); c.fill();
      } else {
        c.fillStyle = '#8a3f1e'; for (const [dx, dy] of [[-.3, -.22], [0, -.28], [.28, -.2], [.12, -.1]]){ c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r, r * .16, r * .08, dx, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(214,120,40,.55)'; c.beginPath(); c.ellipse(cx, cy - r * .18, r * .45, r * .12, 0, 0, TAU); c.fill();
        c.fillStyle = '#5fb04a'; for (let i = 0; i < 6; i++) c.fillRect(cx - r * .4 + i * r * .15, cy - r * .3 + (i % 2) * r * .08, r * .05, r * .05);
      }
    });
  } else if (item === 'lemonTea'){
    const x0 = cx - r * .38, x1 = cx + r * .38, y0 = cy - r * .72, y1 = cy + r * .82;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1 - r * .06, y1); c.lineTo(x0 + r * .06, y1); c.closePath();
    c.fillStyle = 'rgba(220,240,248,.9)'; c.fill(); c.save(); c.clip();
    c.fillStyle = '#c9772c'; c.fillRect(x0, y0 + r * .2, x1 - x0, y1 - y0);
    c.fillStyle = 'rgba(255,255,255,.85)'; for (const [dx, dy] of [[-.15, -.35], [.14, -.25]]) c.fillRect(cx + dx * r - r * .12, cy + dy * r - r * .12, r * .24, r * .24);
    for (const [dx, dy] of [[-.05, .15], [.1, .45]]){ c.fillStyle = '#f6e04b'; c.beginPath(); c.arc(cx + dx * r, cy + dy * r, r * .2, 0, TAU); c.fill(); c.strokeStyle = '#fff7b8'; c.lineWidth = r * .03; for (let k = 0; k < 6; k++){ const a = k * Math.PI / 3; c.beginPath(); c.moveTo(cx + dx * r, cy + dy * r); c.lineTo(cx + dx * r + Math.cos(a) * r * .18, cy + dy * r + Math.sin(a) * r * .18); c.stroke(); } }
    c.restore();
    c.strokeStyle = '#7fb0c6'; c.lineWidth = r * .07; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(x1 - r * .06, y1); c.lineTo(x0 + r * .06, y1); c.closePath(); c.stroke();
    c.fillStyle = '#f6e04b'; c.beginPath(); c.arc(x1, y0 + r * .05, r * .22, Math.PI * .5, Math.PI * 1.5); c.fill();
  } else if (item === 'yuenyeung'){
    icon(c, 'hotTea', cx, cy, r);
    c.save(); c.beginPath(); c.ellipse(cx, cy - r * .2, r * .56, r * .15, 0, 0, TAU); c.clip();
    c.fillStyle = '#5a3620'; c.fillRect(cx, cy - r * .4, r, r * .4); c.restore();
    c.fillStyle = '#5a3620'; c.beginPath(); c.ellipse(cx - r * .7, cy + r * .6, r * .09, r * .06, .5, 0, TAU); c.fill();
  } else if (item === 'porkchopBun'){
    c.beginPath(); c.ellipse(cx, cy + r * .5, r * .86, r * .2, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    c.beginPath(); c.ellipse(cx, cy + r * .38, r * .84, r * .26, 0, 0, TAU); c.fillStyle = '#e8b35a'; c.fill();
    c.fillStyle = '#9a5a2a'; c.beginPath(); c.moveTo(cx - r * .72, cy + r * .12); c.quadraticCurveTo(cx, cy - r * .1, cx + r * .76, cy + r * .1); c.lineTo(cx + r * .7, cy + r * .32); c.quadraticCurveTo(cx, cy + r * .2, cx - r * .66, cy + r * .34); c.closePath(); c.fill();
    c.strokeStyle = '#6f3e1a'; c.lineWidth = r * .04; for (let i = -2; i <= 2; i++){ c.beginPath(); c.moveTo(cx + i * r * .22 - r * .08, cy + r * .08); c.lineTo(cx + i * r * .22 + r * .08, cy + r * .24); c.stroke(); }
    bunDome(c, cx, cy + r * .02, r * .8, r * .62);
  } else if (item === 'eggTart'){
    c.beginPath(); c.ellipse(cx, cy + r * .45, r * .85, r * .22, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
    c.fillStyle = '#d9a152'; c.beginPath();
    for (let k = 0; k <= 24; k++){ const a = k / 24 * TAU, rr = r * (.8 + (k % 2) * .06); const px = cx + Math.cos(a) * rr, py = cy + r * .1 + Math.sin(a) * rr * .45; k ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath(); c.fill();
    c.fillStyle = '#b87a2e'; c.beginPath(); c.ellipse(cx, cy + r * .28, r * .72, r * .3, 0, 0, Math.PI); c.fill();
    const g = c.createRadialGradient(cx - r * .2, cy - r * .05, r * .05, cx, cy + r * .05, r * .65);
    g.addColorStop(0, '#fff3a0'); g.addColorStop(1, '#f2c21e');
    c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy + r * .05, r * .64, r * .28, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(cx - r * .22, cy - r * .02, r * .16, r * .05, -.2, 0, TAU); c.fill();
  } else if (item === 'beefChowFun'){
    c.fillStyle = '#fbfaf5'; c.strokeStyle = '#c9c2b3'; c.lineWidth = r * .05;
    c.beginPath(); c.ellipse(cx, cy + r * .25, r * .92, r * .42, 0, 0, TAU); c.fill(); c.stroke();
    c.lineCap = 'round';
    for (let i = 0; i < 7; i++){ c.strokeStyle = i % 2 ? '#b8743a' : '#9a5a26'; c.lineWidth = r * .13; c.beginPath(); c.moveTo(cx - r * .55 + i * r * .08, cy + r * .1 + (i % 3) * r * .06); c.quadraticCurveTo(cx, cy - r * .1 + i * r * .04, cx + r * .5 - i * r * .05, cy + r * .3 - (i % 2) * r * .1); c.stroke(); }
    c.fillStyle = '#6a2e1a'; for (const [dx, dy] of [[-.25, .05], [.2, .15], [0, .3]]){ c.beginPath(); c.ellipse(cx + dx * r, cy + dy * r, r * .14, r * .07, dx * 2, 0, TAU); c.fill(); }
    c.strokeStyle = '#f5f0e0'; c.lineWidth = r * .04; for (let i = 0; i < 5; i++){ c.beginPath(); c.moveTo(cx - r * .4 + i * r * .2, cy + r * .02); c.lineTo(cx - r * .32 + i * r * .2, cy + r * .2); c.stroke(); }
    c.fillStyle = '#5fb04a'; for (let i = 0; i < 5; i++) c.fillRect(cx - r * .35 + i * r * .17, cy + r * (i % 2 ? .1 : .22), r * .06, r * .06);
    c.lineCap = 'butt';
  }
  c.restore();
}
function bowl(c, cx, cy, r, fill){
  c.beginPath(); c.ellipse(cx, cy + r * .55, r * .7, r * .16, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill();
  c.beginPath(); c.ellipse(cx, cy - r * .15, r * .82, r * .3, 0, 0, TAU); c.fillStyle = '#e9d9b0'; c.fill();
  c.save(); c.clip(); fill(); c.restore();
  c.beginPath(); c.moveTo(cx - r * .82, cy - r * .15); c.quadraticCurveTo(cx - r * .78, cy + r * .5, cx, cy + r * .52); c.quadraticCurveTo(cx + r * .78, cy + r * .5, cx + r * .82, cy - r * .15);
  c.ellipse(cx, cy - r * .15, r * .82, r * .3, 0, 0, Math.PI); c.closePath(); c.fillStyle = '#fbfaf5'; c.fill();
  c.strokeStyle = '#3f7fae'; c.lineWidth = r * .05; c.beginPath(); c.moveTo(cx - r * .7, cy + r * .12); c.quadraticCurveTo(cx, cy + r * .32, cx + r * .7, cy + r * .12); c.stroke();
  c.strokeStyle = '#c9c2b3'; c.lineWidth = r * .04; c.beginPath(); c.ellipse(cx, cy - r * .15, r * .82, r * .3, 0, 0, TAU); c.stroke();
}

// ---------------- floors ----------------
const MOSAIC = ['..g.', '.gyg', '..g.', '....'];
export function floor(iso, type, x, y){
  if (type === 'whiteTiles'){
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){
      const a = x + i / 2, b = y + j / 2, v = .97 + hash(x * 2 + i, y * 2 + j) * .05;
      iso.poly([[a, b, 0], [a + .5, b, 0], [a + .5, b + .5, 0], [a, b + .5, 0]], shade('#f1efe9', v), '#c4bdb0');
      iso.poly([[a + .05, b + .05, 0], [a + .28, b + .05, 0], [a + .05, b + .28, 0]], 'rgba(255,255,255,.35)');
    }
  } else if (type === 'mosaic'){
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
      const gx = x * 4 + i, gy = y * 4 + j, m = MOSAIC[(gy % 4 + 4) % 4][(gx % 4 + 4) % 4];
      const col = m === 'g' ? '#4f917a' : m === 'y' ? '#d9b44a' : ((gx + gy) % 2 ? '#eef0e6' : '#e6e9dd');
      const a = x + i / 4, b = y + j / 4;
      iso.poly([[a, b, 0], [a + .25, b, 0], [a + .25, b + .25, 0], [a, b + .25, 0]], col, 'rgba(120,120,110,.25)');
    }
  } else if (type === 'terrazzo'){
    iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], '#e2ded5', 'rgba(150,140,130,.25)');
    const cols = ['#9aa39c', '#c96f4f', '#6f7f8f', '#d9b56f', '#ffffff'];
    for (let k = 0; k < 14; k++){
      const px = x + .06 + hash(x, y, k) * .88, py = y + .06 + hash(y, x, k + 9) * .88;
      iso.ell(px, py, 0, .012 + hash(x, k, y) * .025, cols[k % cols.length]);
    }
  } else {
    const v = .95 + hash(x, y) * .08;
    iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], shade('#bdb6a8', v), 'rgba(90,85,75,.25)');
    for (let k = 0; k < 6; k++) iso.ell(x + .1 + hash(x, y, k) * .8, y + .1 + hash(y, x, k + 3) * .8, 0, .01 + hash(k, x, y) * .015, `rgba(${k % 2 ? '255,255,255' : '60,55,48'},.18)`);
  }
}


// ---------------- stations ----------------
export function station(iso, st, t, busy){
  const { x, y } = st, ap = APPLIANCES[st.type], c = iso.ctx;
  switch (st.type){
    case 'hotTea': case 'hotTeaPro': {
      counter(iso, x, y, ap.color);
      const metal = ap.pro ? '#c7793f' : '#cfd6db';
      iso.cyl(x + .4, y + .42, .2, .92, 1.55, metal);
      iso.cyl(x + .4, y + .42, .205, 1.16, 1.24, PAL.red);
      iso.cyl(x + .4, y + .42, .08, 1.55, 1.62, shade(metal, .8));
      iso.box(x + .56, y + .56, x + .64, y + .64, 1.0, 1.08, shade(metal, .7));
      // the "silk stocking" strainer over a pulling pot
      iso.cyl(x + .76, y + .3, .1, .92, 1.08, '#b9c0c7');
      const [sa, sb] = iso.P(x + .76, y + .3, 1.42), [sc, sd] = iso.P(x + .76, y + .3, 1.12);
      c.fillStyle = '#9a6a3f'; c.beginPath(); c.moveTo(sa - iso.s * .09, sb); c.lineTo(sa + iso.s * .09, sb); c.lineTo(sc, sd); c.closePath(); c.fill();
      c.strokeStyle = '#555'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(sa, sb, iso.s * .09, iso.s * .035, 0, 0, TAU); c.stroke();
      if (busy){ c.strokeStyle = '#8a5a30'; c.lineWidth = Math.max(1.5, iso.s * .03); c.beginPath(); c.moveTo(sc, sd); c.lineTo(sc, sd + iso.s * .1); c.stroke(); }
      for (let i = 0; i < 3; i++) iso.cyl(x + .74, y + .76, .075, .92 + i * .05, .96 + i * .05, '#ffffff');
      steam(iso, x + .4, y + .42, 1.65, t, busy ? 3 : 1);
      label(iso, st, '熱奶茶', ap.color);
      break;
    }
    case 'icedTea': case 'icedTeaPro': {
      counter(iso, x, y, ap.color);
      const tub = ap.pro ? .28 : .2;
      iso.cyl(x + .38, y + .4, tub, .92, 1.2, '#b8c6cf', '#eaf6fb');
      for (const [dx, dy] of [[-.07, -.05], [.06, .02], [-.02, .08], [.08, -.08]]) iso.box(x + .38 + dx - .04, y + .4 + dy - .04, x + .38 + dx + .04, y + .4 + dy + .04, 1.2, 1.26, '#ffffff', { edge: 'rgba(120,170,190,.5)' });
      for (const [gx, gy] of [[.8, .26], [.8, .52], [.8, .78]]){
        iso.cyl(x + gx, y + gy, .07, .92, 1.24, '#c9955e', '#f4f8fa');
        iso.box(x + gx - .04, y + gy - .04, x + gx + .03, y + gy + .03, 1.2, 1.26, '#ffffff', { edge: 'rgba(120,170,190,.5)' });
      }
      const [ha, hb] = iso.P(x + .38, y + .4, 1.22), [hc, hd] = iso.P(x + .52, y + .28, 1.45);
      c.strokeStyle = '#9aa3ab'; c.lineWidth = Math.max(2, iso.s * .04); c.beginPath(); c.moveTo(ha, hb); c.lineTo(hc, hd); c.stroke();
      label(iso, st, '凍奶茶', ap.color);
      break;
    }
    case 'bun': case 'bunPro': {
      counter(iso, x, y, ap.color);
      if (ap.pro){
        iso.box(x + .1, y + .1, x + .9, y + .9, .92, 1.62, '#3b3f44');
        iso.onFace('S', x, y, cc => { for (const v of [-150, -125]){ cc.fillStyle = busy ? '#ffb347' : '#b86d2b'; cc.fillRect(22, v, 56, 14); } });
        iso.onFace('E', x, y, cc => { cc.fillStyle = '#2a2d31'; cc.fillRect(10, -155, 80, 50); });
      } else {
        for (const [dx, dy] of [[.3, .3], [.62, .32], [.35, .64], [.66, .66]]){ iso.ell(x + dx, y + dy, .95, .13, '#c98323'); iso.ell(x + dx, y + dy, .99, .1, '#f0b44a'); }
        iso.box(x + .14, y + .14, x + .86, y + .86, 1.15, 1.17, 'rgba(210,235,245,.6)', { edge: 'rgba(255,255,255,.7)' });
        for (const [dx, dy] of [[.34, .36], [.64, .5], [.4, .7]]){ iso.ell(x + dx, y + dy, 1.18, .12, '#c98323'); iso.ell(x + dx, y + dy, 1.22, .09, '#f3c25a'); }
        const [la, lb] = iso.P(x + .5, y + .5, 1.4), lg = c.createRadialGradient(la, lb, 1, la, lb, iso.s * .5);
        lg.addColorStop(0, 'rgba(255,170,80,.35)'); lg.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = lg; c.beginPath(); c.arc(la, lb, iso.s * .5, 0, TAU); c.fill();
        iso.box(x + .1, y + .1, x + .9, y + .9, .92, 1.42, 'rgba(200,232,242,.28)', { leftCol: 'rgba(200,232,242,.32)', rightCol: 'rgba(170,210,225,.35)', edge: 'rgba(255,255,255,.8)', material: 'glass' });
        iso.box(x + .08, y + .08, x + .92, y + .92, 1.42, 1.46, ap.color);
      }
      label(iso, st, '菠蘿包', ap.color);
      break;
    }
    case 'butterBun': case 'butterBunPro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .12, y + .16, x + .88, y + .84, .92, .97, '#c89b62', { material: 'wood' });
      iso.ell(x + .34, y + .52, .98, .15, '#d9952e'); iso.ell(x + .34, y + .52, 1.02, .12, '#f0b44a');
      iso.box(x + .56, y + .26, x + .8, y + .48, .97, 1.07, '#f7dc6f');
      if (ap.pro) iso.box(x + .52, y + .22, x + .84, y + .52, .97, 1.2, 'rgba(210,235,245,.25)', { leftCol: 'rgba(210,235,245,.3)', rightCol: 'rgba(190,220,235,.3)', edge: 'rgba(255,255,255,.8)' });
      const [pa, pb] = iso.P(x + .66, y + .66, .99), ps = iso.s * .42;
      c.fillStyle = '#fbfaf5'; c.beginPath(); c.ellipse(pa, pb, ps * .55, ps * .25, 0, 0, TAU); c.fill(); c.strokeStyle = '#c9c2b3'; c.lineWidth = 1; c.stroke();
      c.drawImage(iconCanvas('butterBun'), pa - ps / 2, pb - ps * .8, ps, ps);
      const [k1x, k1y] = iso.P(x + .2, y + .8, 1.0), [k2x, k2y] = iso.P(x + .45, y + .8, 1.0);
      c.strokeStyle = '#9aa3ab'; c.lineWidth = Math.max(1.5, iso.s * .05); c.beginPath(); c.moveTo(k1x, k1y); c.lineTo(k2x, k2y); c.stroke();
      label(iso, st, '菠蘿油', ap.color);
      break;
    }
    case 'toaster': case 'toasterPro': {
      counter(iso, x, y, ap.color);
      if (ap.pro){
        iso.box(x + .12, y + .2, x + .88, y + .8, .92, 1.3, '#b9c0c7');
        iso.box(x + .06, y + .34, x + .94, y + .66, 1.02, 1.08, '#3b3f44');
        for (const px of [.2, .45, .7]) iso.box(x + px, y + .38, x + px + .14, y + .62, 1.08, 1.11, '#e0b060');
      } else {
        iso.box(x + .22, y + .28, x + .7, y + .72, .92, 1.25, '#cfd6db');
        for (const py of [.36, .54]) iso.box(x + .3, y + py, x + .62, y + py + .08, 1.25, 1.26, '#2d3136');
        if (busy) for (const py of [.36, .54]) iso.box(x + .32, y + py + .01, x + .6, y + py + .07, 1.26, 1.36, '#e0b060');
        iso.box(x + .72, y + .2, x + .92, y + .5, .92, 1.2, '#e8d9b8', { topCol: '#d9c29a' });
      }
      iso.cyl(x + .8, y + .78, .07, .92, 1.1, '#f4efe0', '#c8372d');
      if (busy) steam(iso, x + .45, y + .5, 1.35, t, 2);
      label(iso, st, '奶油多', ap.color);
      break;
    }
    case 'fryer': case 'fryerPro': {
      counter(iso, x, y, ap.color);
      if (ap.pro){
        iso.box(x + .14, y + .14, x + .86, y + .86, .92, 1.02, '#3b3f44');
        iso.box(x + .22, y + .22, x + .78, y + .78, 1.0, 1.02, busy ? '#e0a040' : '#c98a36');
        iso.box(x + .6, y + .1, x + .66, y + .5, 1.02, 1.3, '#9aa3ab');
      } else {
        iso.ell(x + .42, y + .45, .93, .26, '#2a2a2a');
        iso.ell(x + .42, y + .45, .94, .22 + (busy ? Math.sin(t * 18) * .01 : 0), busy ? '#ff8a2a' : '#4a4a4a');
        iso.ell(x + .42, y + .45, .96, .2, '#1f1f1f');
        iso.box(x + .32, y + .36, x + .52, y + .54, .96, 1.02, '#e3a24a');
        const [ha, hb] = iso.P(x + .6, y + .6, .97), [hc, hd] = iso.P(x + .8, y + .8, .97);
        c.strokeStyle = '#1f1f1f'; c.lineWidth = Math.max(2, iso.s * .05); c.beginPath(); c.moveTo(ha, hb); c.lineTo(hc, hd); c.stroke();
      }
      iso.cyl(x + .82, y + .24, .08, .92, 1.02, '#fbfaf5', '#f2d27a');
      iso.cyl(x + .8, y + .6, .05, .92, 1.2, '#a8641c', '#c9c2b3');
      if (busy) steam(iso, x + .42, y + .45, 1.1, t, 2);
      label(iso, st, '西多士', ap.color);
      break;
    }
    case 'noodlePot': case 'noodlePotPro': {
      counter(iso, x, y, ap.color);
      iso.cyl(x + .4, y + .42, ap.pro ? .26 : .22, .92, 1.3, '#c9cfd4', '#9aa3ab');
      iso.ell(x + .4, y + .42, 1.301, ap.pro ? .2 : .17, busy ? '#f2d27a' : '#d9c89a');
      if (ap.pro) iso.cyl(x + .74, y + .3, .14, .92, 1.2, '#c9cfd4', '#9aa3ab');
      for (let i = 0; i < 3; i++) iso.cyl(x + .76, y + .74, .1, .92 + i * .05, .96 + i * .05, '#fbfaf5', '#e9e4d6');
      steam(iso, x + .4, y + .42, 1.35, t, busy ? 3 : 1);
      label(iso, st, '餐蛋麵', ap.color);
      break;
    }
    case 'lemonBar': case 'lemonBarPro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .14, y + .16, x + .5, y + .5, .92, 1.05, '#9a6a3e', { material: 'wood' });
      for (const [dx, dy] of [[.22, .24], [.34, .24], [.28, .36], [.4, .38], [.22, .4]]) iso.ell(x + dx, y + dy, 1.07, .055, '#f6e04b');
      if (ap.pro) iso.box(x + .6, y + .14, x + .86, y + .4, .92, 1.25, '#b9c0c7', { material: 'steel' });
      for (const [gx, gy] of [[.7, .62], [.46, .76]]) iso.cyl(x + gx, y + gy, .07, .92, 1.22, '#c9772c', '#f4f8fa');
      label(iso, st, '凍檸茶', ap.color);
      break;
    }
    case 'coffeeUrn': case 'coffeeUrnPro': {
      counter(iso, x, y, ap.color);
      const metal = ap.pro ? '#c7793f' : '#6b4a31';
      iso.cyl(x + .42, y + .42, .2, .92, 1.55, metal, shade(metal, 1.15));
      iso.cyl(x + .42, y + .42, .205, 1.3, 1.36, '#2f2f2f');
      iso.box(x + .58, y + .58, x + .66, y + .66, 1.0, 1.08, '#2f2f2f');
      iso.cyl(x + .78, y + .76, .08, .92, 1.03, '#ffffff', '#5a3620');
      steam(iso, x + .42, y + .42, 1.65, t, busy ? 3 : 1);
      label(iso, st, '鴛鴦', ap.color);
      break;
    }
    case 'satayPot': case 'satayPotPro': {
      counter(iso, x, y, ap.color);
      iso.cyl(x + .4, y + .44, .24, .92, 1.2, '#4a2e22', '#3a2218');
      iso.ell(x + .4, y + .44, 1.201, .2, busy ? '#e0782a' : '#b9561e');
      if (ap.pro) iso.cyl(x + .76, y + .3, .14, .92, 1.15, '#4a2e22', '#b9561e');
      const [la, lb] = iso.P(x + .45, y + .44, 1.2), [lc, ld] = iso.P(x + .7, y + .7, 1.45);
      c.strokeStyle = '#9aa3ab'; c.lineWidth = Math.max(2, iso.s * .04); c.beginPath(); c.moveTo(la, lb); c.lineTo(lc, ld); c.stroke();
      steam(iso, x + .4, y + .44, 1.25, t, busy ? 3 : 1);
      label(iso, st, '沙嗲', ap.color);
      break;
    }
    case 'griddle': case 'griddlePro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .1, y + .12, x + .9, y + .72, .92, .98, '#1f2226', { material: 'steel' });
      const n = ap.pro ? 3 : 2;
      for (let i = 0; i < n; i++) iso.box(x + .18 + i * .24, y + .24, x + .36 + i * .24, y + .52, .98, 1.02, busy ? '#b8743f' : '#a0622e');
      iso.box(x + .2, y + .78, x + .8, y + .96, .92, 1.05, '#b58050', { material: 'wood' });
      for (const dx of [.32, .52, .7]) iso.ell(x + dx, y + .87, 1.07, .07, '#e8b35a');
      if (busy) steam(iso, x + .45, y + .4, 1.05, t, 2);
      label(iso, st, '豬扒包', ap.color);
      break;
    }
    case 'tartOven': case 'tartOvenPro': {
      counter(iso, x, y, ap.color);
      iso.box(x + .12, y + .14, x + .88, y + .86, .92, ap.pro ? 1.6 : 1.38, '#5d656c', { material: 'steel' });
      iso.onFace('S', x, y, cc => { const rows = ap.pro ? [-148, -120] : [-128]; for (const v of rows){ cc.fillStyle = busy ? '#ffb347' : '#a86a2e'; cc.fillRect(20, v, 60, 18); cc.fillStyle = 'rgba(255,255,255,.3)'; cc.fillRect(22, v + 2, 18, 4); } });
      const top = ap.pro ? 1.6 : 1.38;
      for (const [dx, dy] of [[.3, .3], [.5, .3], [.7, .3], [.3, .5], [.5, .5]]){ iso.ell(x + dx, y + dy, top + .01, .07, '#d9a152'); iso.ell(x + dx, y + dy, top + .02, .05, '#f2c21e'); }
      label(iso, st, '蛋撻', ap.color);
      break;
    }
    case 'wok': case 'wokPro': {
      counter(iso, x, y, ap.color);
      iso.ell(x + .45, y + .45, .93, .3, '#1f1f1f');
      if (busy || ap.pro){
        const f = busy ? 1 : .35;
        for (let i = 0; i < 6; i++){ const a = i / 6 * TAU + t * 4; const [fa, fb] = iso.P(x + .45 + Math.cos(a) * .22, y + .45 + Math.sin(a) * .22, .95); c.fillStyle = `rgba(255,${120 + i * 15},40,${(.8 * f).toFixed(2)})`; c.beginPath(); c.ellipse(fa, fb - iso.s * .06, iso.s * .04, iso.s * .1 * (1 + Math.sin(t * 20 + i) * .3), 0, 0, TAU); c.fill(); }
      }
      iso.ell(x + .45, y + .45, 1.0, .27, '#2b2b2e'); iso.ell(x + .45, y + .45, 1.02, .21, busy ? '#8a4a24' : '#3a3a3e');
      const [ha, hb] = iso.P(x + .66, y + .6, 1.02), [hc, hd] = iso.P(x + .92, y + .8, 1.06);
      c.strokeStyle = '#1f1f1f'; c.lineWidth = Math.max(2, iso.s * .05); c.beginPath(); c.moveTo(ha, hb); c.lineTo(hc, hd); c.stroke();
      if (busy) steam(iso, x + .45, y + .45, 1.15, t, 3);
      label(iso, st, '乾炒牛河', ap.color);
      break;
    }
    case 'pass': {
      counter(iso, x, y, '#9aa4ab');
      for (const px of [.08, .92]) iso.box(x + px - .03, y + .45, x + px + .03, y + .51, .92, 1.75, '#6f787f');
      iso.box(x + .05, y + .42, x + .95, y + .54, 1.72, 1.8, '#4f575d');
      const [lx, ly] = iso.P(x + .5, y + .48, 1.7);
      const g = c.createRadialGradient(lx, ly, 1, lx, ly, iso.s * .7);
      g.addColorStop(0, 'rgba(255,170,80,.45)'); g.addColorStop(1, 'rgba(255,170,80,0)');
      c.fillStyle = g; c.beginPath(); c.arc(lx, ly + iso.s * .3, iso.s * .7, 0, TAU); c.fill();
      iso.ell(x + .82, y + .82, .92, .07, '#c9a227'); iso.ell(x + .82, y + .82, .97, .045, '#e0c14a');
      iso.onFace('S', x, y + .5 - 1, cc => { for (let i = 0; i < 4; i++){ cc.fillStyle = i === 1 ? '#fff3cf' : '#fbfaf5'; cc.fillRect(10 + i * 21, -170, 15, 22); cc.fillStyle = '#9aa3ab'; cc.fillRect(12 + i * 21, -164, 11, 2); cc.fillRect(12 + i * 21, -159, 8, 2); } });
      label(iso, st, '出餐', '#5d676e');
      break;
    }
    case 'shelf': {
      iso.box(x + .06, y + .1, x + .94, y + .9, 0, 1.75, ap.color, { material: 'wood' });
      const face = st.dir === 'E' ? 'E' : 'S';
      for (const f of ['S', 'E']) iso.onFace(f, x, y, cc => {
        cc.fillStyle = shade(ap.color, .6);
        for (const v of [-40, -85, -130]) cc.fillRect(8, v, 84, 5);
        if (f === face){
          for (let i = 0; i < 5; i++){ cc.fillStyle = i % 2 ? '#1f1f1f' : '#f4f4f0'; cc.fillRect(12 + i * 15, -80, 11, 18); cc.fillStyle = '#c8372d'; cc.fillRect(12 + i * 15, -73, 11, 3); }
          for (let i = 0; i < 4; i++){ cc.fillStyle = ['#b3261e', '#2f6f5e', '#b3261e', '#e0b23c'][i]; cc.fillRect(14 + i * 19, -125, 14, 20); }
          cc.fillStyle = '#d9c29a'; cc.fillRect(12, -35, 34, 26); cc.fillRect(52, -32, 34, 23);
        }
      });
      break;
    }
  }
}


// ---------------- furniture ----------------
export function decor(iso, it, t, part){
  const { x, y } = it, doBase = part !== 'back', doBack = part !== 'base';
  switch (it.type){
    case 'formicaTable':
      if (!doBase) return;
      iso.ell(x + .5, y + .5, 0, .2, '#7d868d');
      iso.cyl(x + .5, y + .5, .045, 0, .7, '#b9c0c7');
      iso.box(x + .08, y + .08, x + .92, y + .92, .7, .77, '#dcebdc', { leftCol: '#9aa5a0', rightCol: '#848f8a' });
      break;
    case 'foldTable':
      if (!doBase) return;
      legs(iso, x, y, .16, .7, '#5d5d5d');
      iso.box(x + .08, y + .08, x + .92, y + .92, .7, .75, '#d6bf94', { material: 'wood' });
      break;
    case 'marbleTable': {
      if (!doBase) return;
      iso.ell(x + .5, y + .5, 0, .22, '#222');
      iso.cyl(x + .5, y + .5, .05, 0, .72, '#2a2a2a');
      iso.cyl(x + .5, y + .5, .42, .72, .77, '#e9e6e0', '#f5f3ef');
      const c = iso.ctx; c.strokeStyle = 'rgba(140,140,145,.55)'; c.lineWidth = 1;
      const [a1, b1] = iso.P(x + .25, y + .4, .77), [a2, b2] = iso.P(x + .55, y + .55, .77), [a3, b3] = iso.P(x + .75, y + .72, .77);
      c.beginPath(); c.moveTo(a1, b1); c.quadraticCurveTo(a2, b2 - 4, a3, b3); c.stroke();
      break;
    }
    case 'redStool':
      if (!doBase) return;
      iso.cyl(x + .5, y + .5, .17, 0, .42, '#d63a2f', '#e8574b');
      iso.ell(x + .5, y + .5, .421, .035, '#8f1f18');
      break;
    case 'metalChair':
      if (doBase){ legs(iso, x, y, .26, .4, '#7d868d'); iso.box(x + .2, y + .2, x + .8, y + .8, .4, .45, '#b9c0c7'); }
      if (doBack){ const [a, b, c2, d] = backRect(it, x, y, .06); iso.box(a, b, c2, d, .45, .95, '#9aa3ab'); }
      break;
    case 'crossChair':
      if (doBase){ legs(iso, x, y, .24, .4, '#5e3c24'); iso.box(x + .18, y + .18, x + .82, y + .82, .4, .46, '#8a5a3a', { material: 'wood' }); }
      if (doBack){ const [a, b, c2, d] = backRect(it, x, y, .06); iso.box(a, b, c2, d, .46, 1.0, '#7a4e31'); }
      break;
    case 'rattanChair':
      if (doBase){ legs(iso, x, y, .24, .38, '#8a6a3a'); iso.box(x + .16, y + .16, x + .84, y + .84, .38, .46, '#d7b27a'); }
      if (doBack){ const [a, b, c2, d] = backRect(it, x, y, .08); iso.box(a, b, c2, d, .46, 1.02, '#c9a26b', { leftCol: '#b88d55', rightCol: '#a57c47' }); }
      break;
    case 'boothSeat':
      if (doBase) iso.box(x + .06, y + .06, x + .94, y + .94, 0, .42, '#2f7a64', { topCol: '#3b8f76' });
      if (doBack){ const [a, b, c2, d] = backRect(it, x, y, .22); iso.box(a - (it.dir === 'E' ? .02 : 0), b, c2, d, 0, 1.0, '#2a6b58', { topCol: '#347d67' }); }
      break;
    case 'chromeStool':
      if (!doBase) return;
      iso.ell(x + .5, y + .5, 0, .15, '#9aa3ab');
      iso.cyl(x + .5, y + .5, .03, 0, .45, '#d7dde2');
      iso.cyl(x + .5, y + .5, .19, .45, .53, '#2f7a64', '#3f9a80');
      break;
    case 'timberBench':
      if (doBase){ legs(iso, x, y, .16, .38, '#6b4526'); iso.box(x + .08, y + .1, x + .92, y + .9, .38, .45, '#b58050', { material: 'wood' }); }
      if (doBack){ const [a, b, c2, d] = backRect(it, x, y, .06); iso.box(a, b, c2, d, .45, .62, '#9a6a3e'); iso.box(a, b, c2, d, .72, .88, '#9a6a3e'); }
      break;
    case 'waterDispenser':
      iso.box(x + .26, y + .26, x + .74, y + .74, 0, .95, '#f1f1ee');
      iso.cyl(x + .5, y + .5, .17, .95, 1.42, 'rgba(120,185,225,.85)', 'rgba(170,215,240,.9)');
      iso.cyl(x + .5, y + .5, .05, 1.42, 1.48, '#3f7fae');
      iso.onFace('S', x, y, c => { c.fillStyle = '#c8372d'; c.fillRect(38, -70, 8, 10); c.fillStyle = '#3f7fae'; c.fillRect(54, -70, 8, 10); c.fillStyle = '#d0d4d8'; c.fillRect(32, -40, 36, 5); });
      break;
    case 'drinksFridge':
      iso.box(x + .1, y + .12, x + .9, y + .88, 0, 1.6, '#e9ecef');
      iso.onFace('S', x, y, c => {
        c.fillStyle = '#c8372d'; c.fillRect(10, -158, 80, 16);
        c.fillStyle = '#fff'; c.font = `900 12px ${HAN_SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('凍飲', 50, -150);
        c.fillStyle = 'rgba(40,70,85,.85)'; c.fillRect(14, -138, 72, 128);
        const cans = ['#f2c14e', '#3f9a5a', '#c8372d', '#f08a3c', '#f4f1ea', '#4f74ad'];
        for (let r = 0; r < 4; r++){ c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(16, -104 + r * 30, 68, 2); for (let i = 0; i < 6; i++){ c.fillStyle = cans[(i + r * 2) % cans.length]; c.fillRect(18 + i * 11, -128 + r * 30, 8, 22); } }
        c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(20, -136, 10, 124);
      });
      iso.onFace('E', x, y, c => { c.fillStyle = '#c8372d'; c.fillRect(12, -158, 76, 16); });
      break;
    case 'rosewoodCab':
      iso.box(x + .08, y + .16, x + .92, y + .84, 0, 1.8, '#5a1f14', { material: 'wood' });
      iso.onFace('S', x, y, c => {
        c.fillStyle = 'rgba(200,225,235,.35)'; c.fillRect(12, -170, 34, 110); c.fillRect(54, -170, 34, 110);
        c.strokeStyle = '#c9a227'; c.lineWidth = 2; c.strokeRect(12, -170, 34, 110); c.strokeRect(54, -170, 34, 110);
        for (const [u, v, col] of [[22, -150, '#2d5da8'], [66, -150, '#f4f1ea'], [28, -100, '#c8372d'], [70, -100, '#2d5da8']]){ c.fillStyle = col; c.beginPath(); c.ellipse(u, v, 7, 12, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(u - 3, v - 8, 2, 10); }
      });
      break;
    case 'fishTank': {
      iso.box(x + .1, y + .2, x + .9, y + .8, 0, .7, '#3b2a20', { material: 'wood' });
      iso.box(x + .12, y + .22, x + .88, y + .78, .7, 1.4, 'rgba(90,170,210,.45)', { leftCol: 'rgba(90,170,210,.5)', rightCol: 'rgba(70,140,185,.55)', edge: 'rgba(255,255,255,.7)', material: 'glass' });
      const c = iso.ctx;
      for (let i = 0; i < 3; i++){
        const a = t * (.6 + i * .2) + i * 2, fx = x + .5 + Math.cos(a) * .25, fy = y + .5 + Math.sin(a) * .15;
        const [px, py] = iso.P(fx, fy, .95 + i * .12);
        c.fillStyle = i === 1 ? '#fff' : '#ff8a2a'; c.beginPath(); c.ellipse(px, py, iso.s * .07, iso.s * .04, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(px - iso.s * .06 * Math.sign(Math.cos(a + 1.6) || 1), py); c.lineTo(px - iso.s * .11 * Math.sign(Math.cos(a + 1.6) || 1), py - iso.s * .04); c.lineTo(px - iso.s * .11 * Math.sign(Math.cos(a + 1.6) || 1), py + iso.s * .04); c.fill();
      }
      for (let i = 0; i < 3; i++){ const ph = (t * .5 + i / 3) % 1, [bx, by] = iso.P(x + .7, y + .6, .75 + ph * .6); c.strokeStyle = `rgba(255,255,255,${(1 - ph) * .8})`; c.beginPath(); c.arc(bx, by, 2, 0, TAU); c.stroke(); }
      break;
    }
    case 'tramModel': {
      iso.box(x + .12, y + .12, x + .88, y + .88, 0, .8, '#2a2a2a', { material: 'wood' });
      iso.box(x + .2, y + .38, x + .8, y + .62, .8, 1.02, '#1f6b4f');
      iso.box(x + .2, y + .38, x + .8, y + .62, 1.02, 1.24, '#1f6b4f');
      iso.onFace('S', x, y - .38, c => { c.fillStyle = '#ffe9a8'; for (let i = 0; i < 5; i++){ c.fillRect(24 + i * 11, -118, 7, 10); c.fillRect(24 + i * 11, -96, 7, 8); } c.fillStyle = '#f1e7c8'; c.fillRect(20, -104, 60, 3); });
      const c = iso.ctx, [pa, pb] = iso.P(x + .5, y + .5, 1.24), [qa, qb] = iso.P(x + .62, y + .5, 1.55);
      c.strokeStyle = '#2b2b2b'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(pa, pb); c.lineTo(qa, qb); c.stroke();
      break;
    }
    case 'espressoBar':
      iso.box(x + .06, y + .1, x + .94, y + .9, 0, .9, '#2d2a28', { material: 'wood' });
      iso.box(x + .04, y + .08, x + .96, y + .92, .9, .96, '#e9e6e0');
      iso.box(x + .25, y + .3, x + .75, y + .7, .96, 1.36, '#c9cfd4', { material: 'steel' });
      iso.cyl(x + .45, y + .5, .06, 1.36, 1.46, '#c7793f');
      iso.cyl(x + .72, y + .78, .06, .96, 1.04, '#ffffff', '#5a3620');
      break;
    case 'cashier':
      iso.box(x + .06, y + .1, x + .94, y + .9, 0, .9, '#6d4a31', { material: 'wood' });
      iso.box(x + .06, y + .1, x + .94, y + .9, .9, 1.02, 'rgba(200,230,240,.35)', { leftCol: 'rgba(200,230,240,.4)', rightCol: 'rgba(170,210,225,.4)', edge: 'rgba(255,255,255,.7)', material: 'glass' });
      iso.box(x + .3, y + .3, x + .7, y + .65, 1.02, 1.28, '#5a6168');
      iso.box(x + .36, y + .32, x + .64, y + .42, 1.28, 1.36, '#2d3136');
      iso.onFace('S', x, y, c => { c.fillStyle = '#c8372d'; c.fillRect(20, -80, 60, 12); });
      break;
    case 'luckyBamboo': {
      iso.cyl(x + .5, y + .5, .16, 0, .32, '#e8eef2', '#3f6f8f');
      const c = iso.ctx; c.lineWidth = Math.max(2, iso.s * .05); c.strokeStyle = '#5d9b4a';
      for (const [dx, dy, h] of [[-.05, 0, 1.1], [.05, .03, .95], [0, -.06, 1.25]]){
        const [a, b] = iso.P(x + .5 + dx, y + .5 + dy, .32), [a2, b2] = iso.P(x + .5 + dx, y + .5 + dy, h);
        c.beginPath(); c.moveTo(a, b); c.lineTo(a2, b2); c.stroke();
        c.fillStyle = '#6fb35a'; c.beginPath(); c.ellipse(a2 + 4, b2 + 2, iso.s * .1, iso.s * .04, -.5, 0, TAU); c.fill();
      }
      break;
    }
    case 'bigPlant': {
      iso.cyl(x + .5, y + .5, .2, 0, .36, '#d9d4c7');
      const c = iso.ctx;
      for (let k = 0; k < 9; k++){
        const a = k * 2.4, h = .6 + (k % 3) * .28;
        const [px, py] = iso.P(x + .5 + Math.cos(a) * .18, y + .5 + Math.sin(a) * .18, h);
        c.fillStyle = k % 2 ? '#3f7d45' : '#57a05c';
        c.beginPath(); c.ellipse(px, py, iso.s * .16, iso.s * .09, a, 0, TAU); c.fill();
      }
      break;
    }
  }
}

export function ceiling(iso, it, t){
  const { x, y } = it, c = iso.ctx, cx = x + .5, cy = y + .5;
  if (it.type === 'ceilingFan'){
    const [ta, tb] = iso.P(cx, cy, WALL_H + .3), [ha, hb] = iso.P(cx, cy, 2.05);
    c.strokeStyle = '#3b3b3b'; c.lineWidth = 2; c.beginPath(); c.moveTo(ta, tb); c.lineTo(ha, hb); c.stroke();
    const spin = t * 7;
    c.lineCap = 'round'; c.strokeStyle = '#6b4a2f'; c.lineWidth = Math.max(3, iso.s * .1);
    for (let k = 0; k < 3; k++){
      const a = spin + k * TAU / 3, [ex, ey] = iso.P(cx + Math.cos(a) * .55, cy + Math.sin(a) * .55, 2.05);
      c.beginPath(); c.moveTo(ha, hb); c.lineTo(ex, ey); c.stroke();
    }
    c.lineCap = 'butt';
    iso.cyl(cx, cy, .07, 2.0, 2.1, '#d9d4c7');
  } else if (it.type === 'birdcage'){
    const [ta, tb] = iso.P(cx, cy, WALL_H + .3), [bx, by] = iso.P(cx, cy, 1.35), h = iso.s * .55, w = iso.s * .32;
    c.strokeStyle = '#3b3b3b'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ta, tb); c.lineTo(bx, by - h - 6); c.stroke();
    c.fillStyle = '#7a5230'; c.beginPath(); c.ellipse(bx, by, w, w * .35, 0, 0, TAU); c.fill();
    const hop = Math.abs(Math.sin(t * 3)) * iso.s * .05;
    c.fillStyle = '#f2c14e'; c.beginPath(); c.ellipse(bx, by - h * .3 - hop, iso.s * .07, iso.s * .055, 0, 0, TAU); c.fill();
    c.fillStyle = '#e07a2f'; c.beginPath(); c.moveTo(bx + iso.s * .06, by - h * .32 - hop); c.lineTo(bx + iso.s * .1, by - h * .3 - hop); c.lineTo(bx + iso.s * .06, by - h * .27 - hop); c.fill();
    c.strokeStyle = '#b8894f'; c.lineWidth = 1.3;
    for (let i = -3; i <= 3; i++){ c.beginPath(); c.moveTo(bx + i * w / 3, by); c.quadraticCurveTo(bx + i * w / 3 * 1.05, by - h * .9, bx, by - h); c.stroke(); }
    c.beginPath(); c.ellipse(bx, by - h * .55, w * .95, w * .3, 0, 0, TAU); c.stroke();
    c.fillStyle = '#7a5230'; c.beginPath(); c.arc(bx, by - h - 3, 3, 0, TAU); c.fill();
  } else if (it.type === 'globeLamp'){
    const [ta, tb] = iso.P(cx, cy, WALL_H + .3), [la, lb] = iso.P(cx, cy, 1.85), r = iso.s * .2;
    c.strokeStyle = '#222'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ta, tb); c.lineTo(la, lb - r); c.stroke();
    const glow = c.createRadialGradient(la, lb, 1, la, lb, iso.s);
    glow.addColorStop(0, 'rgba(255,225,170,.45)'); glow.addColorStop(1, 'rgba(255,225,170,0)');
    c.fillStyle = glow; c.beginPath(); c.arc(la, lb, iso.s, 0, TAU); c.fill();
    const g = c.createRadialGradient(la - r * .3, lb - r * .3, 1, la, lb, r);
    g.addColorStop(0, '#fffdf5'); g.addColorStop(1, '#f1d9a8');
    c.fillStyle = g; c.beginPath(); c.arc(la, lb, r, 0, TAU); c.fill();
  } else if (it.type === 'chandelier'){
    const [ta, tb] = iso.P(cx, cy, WALL_H + .3), [la, lb] = iso.P(cx, cy, 1.95);
    c.strokeStyle = '#8a6a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(ta, tb); c.lineTo(la, lb); c.stroke();
    const glow = c.createRadialGradient(la, lb + 10, 1, la, lb + 10, iso.s * 1.2);
    glow.addColorStop(0, 'rgba(255,225,170,.5)'); glow.addColorStop(1, 'rgba(255,225,170,0)');
    c.fillStyle = glow; c.beginPath(); c.arc(la, lb + 10, iso.s * 1.2, 0, TAU); c.fill();
    c.strokeStyle = '#c9a227'; c.lineWidth = 2;
    for (let k = 0; k < 6; k++){
      const a = k / 6 * TAU, [ex, ey] = iso.P(cx + Math.cos(a) * .32, cy + Math.sin(a) * .32, 1.85);
      c.beginPath(); c.moveTo(la, lb); c.quadraticCurveTo((la + ex) / 2, ey + 8, ex, ey); c.stroke();
      c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(ex, ey - 4, 3.5, 0, TAU); c.fill();
    }
    c.fillStyle = '#c9a227'; c.beginPath(); c.arc(la, lb, 5, 0, TAU); c.fill();
  } else if (it.type === 'pendant'){
    const [ta, tb] = iso.P(cx, cy, WALL_H + .3), [la, lb] = iso.P(cx, cy, 1.9);
    c.strokeStyle = '#222'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(ta, tb); c.lineTo(la, lb); c.stroke();
    const g = c.createRadialGradient(la, lb + iso.s * .2, 1, la, lb + iso.s * .2, iso.s * .9);
    g.addColorStop(0, 'rgba(255,214,140,.5)'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.beginPath(); c.arc(la, lb + iso.s * .2, iso.s * .9, 0, TAU); c.fill();
    const w = iso.s * .28;
    c.fillStyle = '#1f2a26'; c.beginPath(); c.moveTo(la - w * .35, lb); c.lineTo(la + w * .35, lb); c.lineTo(la + w, lb + w * .8); c.lineTo(la - w, lb + w * .8); c.closePath(); c.fill();
    c.fillStyle = '#ffe2a6'; c.beginPath(); c.ellipse(la, lb + w * .8, w, w * .3, 0, 0, TAU); c.fill();
  }
}

export function wallItem(c, w, t, hour, day){
    c.textAlign = 'center'; c.textBaseline = 'middle';
    if (w.type === 'menuStrips'){
      const words = ['奶茶', '菠蘿', '多士', '凍檸', '餐蛋'], cols = ['#f6e27a', '#f4b6c2', '#fbfaf2', '#f4b6c2', '#f6e27a'];
      words.forEach((wd, i) => {
        const u = 10 + i * 17; c.fillStyle = cols[i]; c.fillRect(u, -182, 14, 74);
        c.fillStyle = '#1b1b1b'; c.font = `700 11px ${HAN}`;
        [...wd].forEach((ch, j) => c.fillText(ch, u + 7, -168 + j * 14));
        c.fillStyle = '#c8372d'; c.font = `700 8px ${HAN_SANS}`; c.fillText('$' + (14 + i * 2), u + 7, -118);
      });
    } else if (w.type === 'mirrorMenu'){
      c.fillStyle = '#6d4a31'; c.fillRect(6, -186, 88, 84);
      const g = c.createLinearGradient(10, -182, 90, -106); g.addColorStop(0, '#dfe9ec'); g.addColorStop(.5, '#b7c8ce'); g.addColorStop(1, '#e8eff1');
      c.fillStyle = g; c.fillRect(10, -182, 80, 76);
      c.fillStyle = '#c0261d'; c.font = `900 13px ${HAN}`;
      ['奶茶 十八', '凍奶茶 二十', '菠蘿油 十六'].forEach((s, i) => c.fillText(s, 50, -164 + i * 22));
    } else if (w.type === 'wallClock'){
      const cx = 50, cy = -145;
      c.fillStyle = '#222'; c.beginPath(); c.arc(cx, cy, 26, 0, TAU); c.fill();
      c.fillStyle = '#fbfaf5'; c.beginPath(); c.arc(cx, cy, 22, 0, TAU); c.fill();
      c.strokeStyle = '#222'; c.lineCap = 'round';
      const hA = ((hour % 12) / 12) * TAU - Math.PI / 2, mA = ((hour % 1)) * TAU - Math.PI / 2;
      c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(hA) * 12, cy + Math.sin(hA) * 12); c.stroke();
      c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(mA) * 18, cy + Math.sin(mA) * 18); c.stroke();
      c.lineCap = 'butt';
    } else if (w.type === 'dragonMural' || w.type === 'goldSign'){
      c.fillStyle = w.type === 'goldSign' ? '#161412' : '#8f1a14'; c.fillRect(4, -196, 92, 96);
      c.strokeStyle = '#e8c35a'; c.lineWidth = 3; c.strokeRect(8, -192, 84, 88);
      if (w.type === 'goldSign'){
        c.fillStyle = '#f2d27a'; c.shadowColor = '#f2d27a'; c.shadowBlur = 6; c.font = `900 34px ${HAN}`; c.fillText('旺記', 50, -150); c.shadowBlur = 0;
        c.fillStyle = '#c8372d'; c.beginPath(); c.arc(50, -198, 8, 0, TAU); c.fill();
      } else {
        c.strokeStyle = '#f2d27a'; c.lineWidth = 2.5;
        c.beginPath(); for (let k = 0; k <= 30; k++){ const u = 14 + k * 2.4, v = -150 + Math.sin(k * .5) * 16; k ? c.lineTo(u, v) : c.moveTo(u, v); } c.stroke();
        c.beginPath(); c.arc(80, -168, 8, 0, TAU); c.stroke(); c.beginPath(); c.arc(22, -130, 7, 0, TAU); c.stroke();
        c.fillStyle = '#f2d27a'; c.font = `900 13px ${HAN}`; c.fillText('龍鳳呈祥', 50, -112);
      }
    } else if (w.type === 'teaMural'){
      c.fillStyle = '#2f7a64'; c.fillRect(4, -196, 92, 96);
      c.fillStyle = '#fbfaf5'; c.beginPath(); c.moveTo(28, -160); c.lineTo(72, -160); c.lineTo(66, -122); c.lineTo(34, -122); c.closePath(); c.fill();
      c.fillStyle = '#b8743f'; c.beginPath(); c.ellipse(50, -160, 22, 5, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; for (const u of [42, 56]){ c.beginPath(); c.moveTo(u, -168); c.quadraticCurveTo(u - 6, -178, u, -188); c.stroke(); }
      c.fillStyle = '#f2d27a'; c.font = `900 11px ${HAN}`; c.fillText('港式奶茶', 50, -108);
    } else if (w.type === 'neonWall'){
      c.fillStyle = '#121418'; c.fillRect(4, -196, 92, 96);
      c.shadowBlur = 10; c.lineWidth = 2.5;
      c.shadowColor = '#56d6ff'; c.strokeStyle = '#8fe6ff'; c.beginPath(); c.moveTo(30, -170); c.lineTo(62, -170); c.lineTo(58, -140); c.lineTo(34, -140); c.closePath(); c.stroke();
      c.beginPath(); c.arc(64, -156, 6, -Math.PI / 2, Math.PI / 2); c.stroke();
      c.shadowColor = '#ff4fa3'; c.fillStyle = '#ff8cc6'; c.font = `900 16px ${HAN}`; c.fillText('奶茶', 50, -118);
      c.shadowBlur = 0;
    } else if (w.type === 'calendar'){
      c.fillStyle = '#b3261e'; c.fillRect(28, -186, 44, 8);
      c.fillStyle = '#fbfaf2'; c.fillRect(28, -178, 44, 56);
      c.fillStyle = '#c8372d'; c.font = `900 30px ${HAN}`; c.fillText(String(day), 50, -152);
      c.fillStyle = '#333'; c.font = `700 9px ${HAN}`; c.fillText('星期' + '日一二三四五六'[day % 7], 50, -130);
      c.fillStyle = '#b3261e'; c.font = `700 8px ${HAN}`; c.fillText('宜 開市', 50, -183);
    } else if (w.type === 'raceTV'){
      c.fillStyle = '#555'; c.fillRect(46, -122, 8, 14);
      c.fillStyle = '#161616'; c.fillRect(8, -190, 84, 70);
      c.fillStyle = '#3f8f4e'; c.fillRect(13, -185, 74, 58);
      c.strokeStyle = '#e6e0c8'; c.lineWidth = 2; c.beginPath(); c.ellipse(50, -156, 30, 16, 0, 0, TAU); c.stroke();
      const cols = ['#c8372d', '#f2c14e', '#4f74ad', '#fff'];
      cols.forEach((col, i) => { const a = t * (1.1 + i * .07) + i * .3; c.fillStyle = col; c.beginPath(); c.arc(50 + Math.cos(a) * 30, -156 + Math.sin(a) * 16, 3, 0, TAU); c.fill(); });
      c.fillStyle = '#fff'; c.font = `700 8px ${HAN_SANS}`; c.fillText('沙田 第五場', 50, -132);
    } else if (w.type === 'lightbox'){
      c.shadowColor = 'rgba(255,240,200,.9)'; c.shadowBlur = 12;
      c.fillStyle = '#fffaf0'; c.fillRect(6, -188, 88, 76);
      c.shadowBlur = 0;
      const foods = ['#b8743f', '#f0b44a', '#c8372d', '#e9d3b8'];
      foods.forEach((f, i) => { const u = 12 + (i % 2) * 42, v = -182 + Math.floor(i / 2) * 34; c.fillStyle = f; c.fillRect(u, v, 34, 22); c.fillStyle = '#231d18'; c.font = `700 8px ${HAN_SANS}`; c.fillText('$' + (12 + i * 3), u + 17, v + 28); });
    } else if (w.type === 'neonSign'){
      const on = true;                          // steady glow, no flicker
      c.fillStyle = '#141a18'; c.fillRect(8, -180, 84, 64);
      c.shadowColor = '#ff4fa3'; c.shadowBlur = on ? 14 : 0;
      c.fillStyle = on ? '#ff8cc6' : '#8a3a60'; c.font = `900 30px ${HAN}`; c.fillText('冰室', 50, -150);
      c.shadowColor = '#56d6ff'; c.strokeStyle = on ? '#8fe6ff' : '#2e6f84'; c.lineWidth = 2.5; c.strokeRect(14, -174, 72, 52);
      c.shadowBlur = 0;
    }
}
