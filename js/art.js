// All the drawing. Every function takes an Iso and draws one thing at world coordinates.
import { shade } from './iso.js';
import { APPLIANCES, DECOR } from './data.js';
import { WALL_H, PARTITION_H, DH, KW, KH, WINDOW_SLOTS, wallSide } from './world.js';

const TAU = Math.PI * 2;
const HAN = '"Noto Serif TC", "Songti TC", "PMingLiU", serif';
const HAN_SANS = '"Noto Sans TC", "PingFang TC", "Heiti TC", sans-serif';
const hash = (x, y, k = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return n - Math.floor(n); };

export const PAL = {
  mint: '#d3e4d4', dado: '#2f6f5e', band: '#efe6cf', wood: '#8a5a3a', steel: '#c9cfd4', red: '#c8372d',
  gold: '#f2d27a', tile: '#eef0ec', ink: '#231d18', glass: 'rgba(190,225,235,.35)'
};

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
export function drawIcon(c, item, cx, cy, r){
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
  }
  c.restore();
}
const iconCache = new Map();
export function iconCanvas(item, size = 128){
  const k = item + size;
  if (!iconCache.has(k)){
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    drawIcon(cv.getContext('2d'), item, size / 2, size / 2 + size * .04, size * .42);
    iconCache.set(k, cv);
  }
  return iconCache.get(k);
}
export const iconURL = item => iconCanvas(item, 128).toDataURL();

// ---------------- floors ----------------
export function kitchenFloor(iso, x, y){
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){
    const a = x + i / 2, b = y + j / 2, base = (i + j) % 2 ? '#b8563f' : '#c46a51';
    const v = .94 + hash(x * 2 + i, y * 2 + j) * .1;
    iso.poly([[a, b, 0], [a + .5, b, 0], [a + .5, b + .5, 0], [a, b + .5, 0]], shade(base, v), '#7e3526');
    // a glazed sheen across the back half of each tile
    iso.poly([[a + .06, b + .06, 0], [a + .3, b + .06, 0], [a + .06, b + .3, 0]], 'rgba(255,235,220,.12)');
  }
}
const MOSAIC = ['..g.', '.gyg', '..g.', '....'];
export function diningFloor(iso, type, x, y){
  if (type === 'whiteTiles'){
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++){
      const a = x + i / 2, b = y + j / 2, v = .97 + hash(x * 2 + i, y * 2 + j) * .05;
      iso.poly([[a, b, 0], [a + .5, b, 0], [a + .5, b + .5, 0], [a, b + .5, 0]], shade('#f1efe9', v), '#c4bdb0');
      iso.poly([[a + .05, b + .05, 0], [a + .28, b + .05, 0], [a + .05, b + .28, 0]], 'rgba(255,255,255,.35)');
    }
  } else if (type === 'mosaic'){
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){
      const gx = x * 4 + i, gy = y * 4 + j, m = MOSAIC[gy % 4][gx % 4];
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

// ---------------- walls ----------------
function wallSegment(iso, pts, kitchen){
  // pts: bottom-left and bottom-right of a segment in world coords, drawn to full height
  const [[ax, ay], [bx, by]] = pts;
  if (kitchen){
    iso.poly([[ax, ay, 0], [bx, by, 0], [bx, by, WALL_H], [ax, ay, WALL_H]], PAL.tile);
    return;
  }
  iso.poly([[ax, ay, .95], [bx, by, .95], [bx, by, WALL_H], [ax, ay, WALL_H]], PAL.mint);
  iso.poly([[ax, ay, 0], [bx, by, 0], [bx, by, .95], [ax, ay, .95]], PAL.dado);
  iso.poly([[ax, ay, .95], [bx, by, .95], [bx, by, 1.02], [ax, ay, 1.02]], PAL.band);
}
export function drawWalls(iso, dw, door){
  // back wall along y = 0
  for (let x = 0; x < dw; x++){
    if (x === door){
      iso.poly([[x, 0, 1.95], [x + 1, 0, 1.95], [x + 1, 0, WALL_H], [x, 0, WALL_H]], PAL.mint);
      iso.poly([[x, 0, 0], [x + 1, 0, 0], [x + 1, 0, 1.95], [x, 0, 1.95]], '#4a3426');
      iso.onFace('wallN', x, 0, c => {                      // the street outside the doorway
        const g = c.createLinearGradient(0, -187, 0, 0); g.addColorStop(0, '#9cc3d6'); g.addColorStop(.55, '#c9d9d8'); g.addColorStop(.56, '#6f6a62'); g.addColorStop(1, '#4a4640');
        c.fillStyle = g; c.fillRect(8, -187, 84, 187);
        c.fillStyle = '#7d8a93'; c.fillRect(14, -160, 20, 60); c.fillStyle = '#a0a8ad'; c.fillRect(40, -175, 26, 75); c.fillStyle = '#8b939a'; c.fillRect(70, -150, 18, 50);
        c.fillStyle = '#c8372d'; c.fillRect(46, -118, 14, 6);
      });
    } else wallSegment(iso, [[x, 0], [x + 1, 0]]);
  }
  // left wall along x = 0 (dining part then kitchen part)
  for (let y = 0; y < DH + KH; y++) wallSegment(iso, [[0, y + 1], [0, y]], y >= DH);
  for (let y = DH; y < DH + KH; y++) iso.onFace('wallW', 0, y, c => {
    c.strokeStyle = 'rgba(160,170,165,.6)'; c.lineWidth = 1;
    for (let u = 0; u <= 100; u += 20){ c.beginPath(); c.moveTo(u, 0); c.lineTo(u, -WALL_H * 100); c.stroke(); }
    for (let v = 0; v >= -WALL_H * 100; v -= 20){ c.beginPath(); c.moveTo(0, v); c.lineTo(100, v); c.stroke(); }
  });
  // dining dado: small glazed tiles
  const tiles = (face, x, y) => iso.onFace(face, x, y, c => {
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1;
    for (let u = 0; u <= 100; u += 12.5){ c.beginPath(); c.moveTo(u, 0); c.lineTo(u, -95); c.stroke(); }
    for (let v = 0; v >= -95; v -= 12){ c.beginPath(); c.moveTo(0, v); c.lineTo(100, v); c.stroke(); }
  });
  for (let x = 0; x < dw; x++) if (x !== door) tiles('wallN', x, 0);
  for (let y = 0; y < DH; y++) tiles('wallW', 0, y);
  // kitchen wall: a utensil rail with ladles and a strainer, and a shelf of jars
  iso.onFace('wallW', 0, DH + 1, c => {
    c.fillStyle = '#8a9096'; c.fillRect(-90, -178, 180, 4);
    const tools = [[-70, 'ladle'], [-40, 'spatula'], [-8, 'ladle'], [24, 'strainer'], [56, 'ladle']];
    for (const [u, k] of tools){
      c.fillStyle = '#9aa3ab'; c.fillRect(u - 1.5, -174, 3, 40);
      if (k === 'ladle'){ c.beginPath(); c.arc(u, -130, 8, 0, Math.PI); c.fill(); }
      else if (k === 'strainer'){ c.strokeStyle = '#9aa3ab'; c.lineWidth = 2; c.beginPath(); c.arc(u, -128, 10, 0, Math.PI * 2); c.stroke(); c.strokeStyle = 'rgba(150,160,165,.6)'; c.lineWidth = 1; for (let i = -8; i <= 8; i += 4){ c.beginPath(); c.moveTo(u + i, -137); c.lineTo(u + i, -119); c.stroke(); } }
      else { c.fillRect(u - 7, -138, 14, 10); }
    }
  });
  iso.onFace('wallW', 0, DH + 4, c => {
    c.fillStyle = '#7a5230'; c.fillRect(-80, -150, 170, 7);
    const jars = ['#c8372d', '#f2c14e', '#3f8f6b', '#e9e4d6', '#b8743f', '#c8372d', '#6f9cc7'];
    jars.forEach((col, i) => { const u = -74 + i * 23; c.fillStyle = col; c.fillRect(u, -178, 16, 28); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(u + 2, -176, 4, 22); c.fillStyle = '#5a5a5a'; c.fillRect(u - 1, -182, 18, 5); });
  });
  // soft shading where the floor meets the walls
  for (let i = 0; i < 4; i++){
    const d = .08 * (i + 1), a = .07;
    iso.poly([[0, 0, .002], [dw, 0, .002], [dw, d, .002], [d, d, .002], [d, DH + KH, .002], [0, DH + KH, .002]], `rgba(30,20,12,${a})`);
  }

  // caps along the top
  const T = .14;
  iso.poly([[0, 0, WALL_H], [dw, 0, WALL_H], [dw, -T, WALL_H], [-T, -T, WALL_H], [-T, DH + KH, WALL_H], [0, DH + KH, WALL_H]], '#5d6b64');
  // shop sign
  iso.onFace('wallN', 0, 0, c => {
    c.fillStyle = '#9e1f19'; c.fillRect(22, -236, 316, 38);
    c.strokeStyle = PAL.gold; c.lineWidth = 2.5; c.strokeRect(27, -231, 306, 28);
    c.fillStyle = PAL.gold; c.font = `900 25px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('旺 記 茶 餐 廳', 180, -216);
  });
}
export function drawPartition(iso, x){
  const y0 = DH - .07, y1 = DH + .07;
  iso.box(x, y0, x + 1, y1, 0, PARTITION_H - .1, PAL.dado, { topCol: PAL.dado });
  iso.box(x - .01, y0 - .03, x + 1.01, y1 + .03, PARTITION_H - .1, PARTITION_H, PAL.wood);
}

// ---------------- light and shade ----------------
// A soft shadow on the floor under something, nudged away from the light (which comes from the back-left).
export function contactShadow(iso, x0, y0, x1, y1, a = .2){
  const c = iso.ctx, o = .06;
  for (let i = 0; i < 3; i++){
    const g = .05 * i;
    iso.poly([[x0 + o - g, y0 + o - g, .003], [x1 + o + g, y0 + o - g, .003], [x1 + o + g, y1 + o + g, .003], [x0 + o - g, y1 + o + g, .003]], `rgba(25,15,8,${(a / (i + 1.4)).toFixed(3)})`);
  }
}
// The front door's glass; open (0..1) slides the panes apart when someone walks through.
export function drawDoor(iso, x, open){
  const slide = .36 * open, lo = x + .04, hi = x + .96;
  const panes = [[x + .08 - slide, x + .5 - slide], [x + .52 + slide, x + .92 + slide]];   // they slide into the wall
  for (const [p0, p1] of panes){
    const a = Math.max(lo, p0), b = Math.min(hi, p1);
    if (b - a < .02) continue;
    iso.poly([[a, 0, .02], [b, 0, .02], [b, 0, 1.87], [a, 0, 1.87]], 'rgba(169,204,214,.55)', 'rgba(74,52,38,.9)', 2);
  }
  if (open < .3) iso.onFace('wallN', x, 0, c => {
    c.fillStyle = PAL.red; c.fillRect(30, -112, 14, 16);
    c.fillStyle = '#fff'; c.font = `700 11px ${HAN_SANS}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('推', 37, -104);
  });
}
// Sky colour through the windows over the day, and how strong the sunlight on the floor is.
function skyAt(hour){
  const stops = [[7, '#f6c9a0', '#9fb9d6', .5], [9.5, '#9fd0f2', '#cfe8f7', .75], [14.5, '#8cc4ee', '#d7ecf7', .7], [16.5, '#f2b36b', '#f7dca8', .6], [18, '#6b5a9e', '#e79a7a', .25]];
  let i = 0; while (i < stops.length - 2 && hour > stops[i + 1][0]) i++;
  const [h0, a0, b0, s0] = stops[i], [h1, a1, b1, s1] = stops[i + 1], f = Math.max(0, Math.min(1, (hour - h0) / (h1 - h0)));
  const mix = (p, q) => { const A = parseInt(p.slice(1), 16), B = parseInt(q.slice(1), 16); const ch = sh => Math.round(((A >> sh) & 255) * (1 - f) + ((B >> sh) & 255) * f); return `rgb(${ch(16)},${ch(8)},${ch(0)})`; };
  return { top: mix(a0, a1), bottom: mix(b0, b1), sun: s0 + (s1 - s0) * f };
}
// Two windows on the dining room's side wall, with sunlight falling across the floor.
export function drawWindows(iso, hour){
  const sky = skyAt(hour), c = iso.ctx;
  for (const y of WINDOW_SLOTS){
    // light on the floor: slants further across the room later in the day
    const reach = 1.4 + (hour - 7) * .12;
    const g = `rgba(255,226,160,${(.16 * sky.sun).toFixed(3)})`;
    iso.poly([[.02, y + .1, .004], [.02, y + .9, .004], [reach, y + .9 + reach * .35, .004], [reach, y + .1 + reach * .35, .004]], g);
    iso.onFace('wallW', 0, y, cc => {
      cc.fillStyle = '#6d4a31'; cc.fillRect(6, -200, 88, 104);
      const gr = cc.createLinearGradient(0, -194, 0, -102); gr.addColorStop(0, sky.top); gr.addColorStop(1, sky.bottom);
      cc.fillStyle = gr; cc.fillRect(11, -194, 78, 92);
      cc.fillStyle = 'rgba(60,70,80,.55)';                   // buildings across the street
      for (const [u, w, h] of [[12, 16, 36], [30, 22, 54], [54, 14, 30], [70, 18, 46]]) cc.fillRect(u, -102 - h, w, h);
      cc.fillStyle = '#6d4a31'; cc.fillRect(48, -194, 4, 92); cc.fillRect(11, -150, 78, 4);
      cc.fillStyle = 'rgba(255,255,255,.18)'; cc.beginPath(); cc.moveTo(16, -194); cc.lineTo(28, -194); cc.lineTo(16, -120); cc.lineTo(11, -120); cc.closePath(); cc.fill();
    });
  }
  // late in the day everything goes a little golden
  const warm = Math.max(0, (hour - 15) / 3);
  return warm;
}

// ---------------- kitchen stations ----------------
function counter(iso, x, y, body){
  iso.box(x + .05, y + .05, x + .95, y + .95, 0, .84, body);
  iso.box(x + .01, y + .01, x + .99, y + .99, .84, .92, PAL.steel, { material: 'steel' });
}
function label(iso, st, text, bg){
  // Both faces the camera can see get the sign, so every station reads at a glance.
  for (const face of ['S', 'E']) iso.onFace(face, st.x, st.y, c => {
    c.fillStyle = bg; c.fillRect(10, -74, 80, 38);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.strokeRect(13, -71, 74, 32);
    c.fillStyle = '#fff'; c.font = `900 ${text.length > 2 ? 22 : 26}px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, 50, -54);
  });
}
function steam(iso, cx, cy, z, t, n = 2){
  const c = iso.ctx;
  for (let k = 0; k < n; k++){
    const ph = (t * .6 + k / n) % 1, [sx, sy] = iso.P(cx, cy, z + ph * .6);
    c.strokeStyle = `rgba(255,255,255,${((1 - ph) * .75).toFixed(3)})`; c.lineWidth = Math.max(1.2, iso.s * .05);
    c.beginPath();
    for (let q = 0; q <= 6; q++){ const xx = sx + (k % 2 ? 1 : -1) * iso.s * .06 + Math.sin(q * .9 + t * 3 + k) * iso.s * .05, yy = sy - q * iso.s * .05; q ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    c.stroke();
  }
}
export function drawStation(iso, st, t, busy){
  const { x, y } = st, ap = APPLIANCES[st.type], c = iso.ctx;
  contactShadow(iso, x + .04, y + .04, x + .98, y + .98, .28);
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

// ---------------- dining furniture ----------------
function legs(iso, x, y, ins, h, col){ for (const [a, b] of [[ins, ins], [1 - ins, ins], [ins, 1 - ins], [1 - ins, 1 - ins]]) iso.box(x + a - .025, y + b - .025, x + a + .025, y + b + .025, 0, h, col, { edge: false }); }
export function backRect(it, x, y, depth = .2){
  switch (it.dir){
    case 'E': return [x + .08, y + .12, x + .08 + depth, y + .88];
    case 'W': return [x + .92 - depth, y + .12, x + .92, y + .88];
    case 'S': return [x + .12, y + .08, x + .88, y + .08 + depth];
    default:  return [x + .12, y + .92 - depth, x + .88, y + .92];
  }
}
export const backIsNear = it => it.dir === 'W' || it.dir === 'N';
export const hasBack = type => ['boothSeat', 'crossChair', 'metalChair', 'rattanChair', 'timberBench'].includes(type);

// part: 'base' | 'back' | undefined (both)
const SHADOW = { table: [.1, .9, .22], seat: [.18, .82, .2], block: [.08, .92, .26] };
export function drawDecor(iso, it, t, part){
  const { x, y } = it, doBase = part !== 'back', doBack = part !== 'base';
  const sh = SHADOW[DECOR[it.type]?.kind];
  if (doBase && sh) contactShadow(iso, x + sh[0], y + sh[0], x + sh[1], y + sh[1], sh[2]);
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
// A pool of warm light on the floor under a lamp (drawn before furniture so it sits underneath).
export function lampPool(iso, it){
  if (!['pendant', 'globeLamp', 'ceilingFan'].includes(it.type)) return;
  const c = iso.ctx, [a, b] = iso.P(it.x + .5, it.y + .5, 0), r = iso.s * (it.type === 'ceilingFan' ? .9 : 1.5);
  const g = c.createRadialGradient(a, b, 1, a, b, r);
  g.addColorStop(0, it.type === 'ceilingFan' ? 'rgba(255,255,255,.06)' : 'rgba(255,214,150,.3)'); g.addColorStop(1, 'rgba(255,214,150,0)');
  c.save(); c.scale(1, .5); c.fillStyle = g; c.beginPath(); c.arc(a, b * 2, r, 0, TAU); c.fill(); c.restore();
}
export function drawCeiling(iso, it, t){
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
export function drawWallItem(iso, w, t, hour, day = 1){
  const onWall = fn => wallSide(w) === 'W' ? iso.onFace('wallW', 0, w.y, fn) : iso.onFace('wallN', w.x, 0, fn);
  onWall(c => {
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
  });
}

// ---------------- people ----------------
// Drawn as upright sprites in screen space, anchored at the feet (or the seat when sitting).
// p: { x, y, z, look, seated, walking, face, role: 'customer'|'cook'|'waiter', busy, eating, angry, carrying }
const OUTLINE = 'rgba(45,30,22,.6)';
function capsule(c, x1, y1, x2, y2, w, col, lw){
  c.lineCap = 'round';
  c.strokeStyle = OUTLINE; c.lineWidth = w + lw * 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.lineCap = 'butt';
}
function blob(c, x, y, r, col, lw){ c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); c.strokeStyle = OUTLINE; c.lineWidth = lw; c.stroke(); }

export function drawPerson(iso, p, t){
  const c = iso.ctx, k = iso.s, L = p.look || {};
  const role = p.role || 'customer', back = p.face === 'N' || p.face === 'W';
  const m = (p.face === 'S' || p.face === 'W') ? -1 : 1;             // which way they face on screen
  const lw = Math.max(1, k * .022);
  const ph = t * 9 + (p.x + p.y) * 2.3;
  const skin = L.skin || '#e6b58c', hair = L.hair || '#1f1a17';
  const shirt = role === 'customer' ? L.shirt : '#fbfbf8';
  const pants = role === 'cook' ? '#3b3f47' : role === 'waiter' ? '#1d1d20' : (L.pants || '#3a3f4b');
  const style = L.style || 'short';

  // ground shadow
  const [gx, gy] = iso.P(p.x, p.y, 0);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(gx, gy, k * .22, k * .1, 0, 0, TAU); c.fill();

  let [ox, oy] = iso.P(p.x, p.y, p.z);
  if (p.walking) oy -= Math.abs(Math.sin(ph)) * k * .03;
  let hipY;

  if (p.seated){
    // thighs forward toward the table, shins down to the floor
    const d = DIRS_SCREEN[p.face] || [0, 1];
    hipY = oy - k * .02;
    for (const side of [-1, 1]){
      const hx = ox + side * k * .06;
      const kx = hx + d[0] * k * .2, ky = hipY + d[1] * k * .2;
      capsule(c, hx, hipY, kx, ky, k * .1, pants, lw);
      capsule(c, kx, ky, kx, ky + k * .3, k * .085, pants, lw);
      c.fillStyle = '#2a2522'; c.beginPath(); c.ellipse(kx + d[0] * k * .03, ky + k * .31, k * .055, k * .03, 0, 0, TAU); c.fill();
    }
  } else {
    hipY = oy - k * .36;
    for (const side of [-1, 1]){
      const swing = p.walking ? Math.sin(ph) * side * k * .06 : 0;
      const fx = ox + side * k * .06 + swing * .6, fy = oy - k * .03 - (p.walking ? Math.max(0, Math.sin(ph) * side) * k * .04 : 0);
      capsule(c, ox + side * k * .06, hipY + k * .03, fx, fy, k * .1, pants, lw);
      c.fillStyle = role === 'customer' ? (L.shoes || '#2a2522') : '#141414';
      c.beginPath(); c.ellipse(fx + m * k * .02, fy + k * .01, k * .06, k * .032, 0, 0, TAU); c.fill();
    }
  }

  const shY = hipY - k * .36;                    // shoulder line
  const hx = ox, hy = shY - k * .15, hr = k * .14;

  // long hair falls behind the shoulders
  if (style === 'long'){
    c.fillStyle = hair; c.beginPath(); c.roundRect(hx - hr * 1.05, hy - hr * .2, hr * 2.1, hr * 2.2, hr * .6); c.fill();
  }

  // torso
  c.beginPath();
  c.moveTo(ox - k * .13, hipY + k * .02);
  c.lineTo(ox + k * .13, hipY + k * .02);
  c.lineTo(ox + k * .17, shY + k * .08);
  c.quadraticCurveTo(ox + k * .17, shY, ox + k * .09, shY);
  c.lineTo(ox - k * .09, shY);
  c.quadraticCurveTo(ox - k * .17, shY, ox - k * .17, shY + k * .08);
  c.closePath();
  const g = c.createLinearGradient(ox - k * .17, 0, ox + k * .17, 0);
  g.addColorStop(0, shade(shirt, m < 0 ? 1.06 : .86)); g.addColorStop(1, shade(shirt, m < 0 ? .86 : 1.06));
  c.fillStyle = g; c.fill();
  if (role === 'customer' && L.pattern){
    c.save(); c.clip();
    c.strokeStyle = L.pattern === 'stripe' ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.18)'; c.lineWidth = Math.max(1, k * .03);
    if (L.pattern === 'stripe') for (let yy = shY + k * .04; yy < hipY + k * .03; yy += k * .07){ c.beginPath(); c.moveTo(ox - k * .2, yy); c.lineTo(ox + k * .2, yy); c.stroke(); }
    else for (let d = -k * .3; d < k * .3; d += k * .08){ c.beginPath(); c.moveTo(ox + d, shY); c.lineTo(ox + d, hipY + k * .03); c.moveTo(ox - k * .2, shY + (d + k * .3) * .6); c.lineTo(ox + k * .2, shY + (d + k * .3) * .6); c.stroke(); }
    c.restore();
  }
  c.strokeStyle = OUTLINE; c.lineWidth = lw; c.stroke();

  if (role === 'waiter'){
    c.save(); c.clip();
    c.fillStyle = '#1f1f22';
    c.beginPath(); c.moveTo(ox - k * .2, shY); c.lineTo(ox - k * .04, shY); c.lineTo(ox, shY + k * .2); c.lineTo(ox + k * .04, shY); c.lineTo(ox + k * .2, shY); c.lineTo(ox + k * .2, hipY + k * .05); c.lineTo(ox - k * .2, hipY + k * .05); c.closePath(); c.fill();
    c.restore();
    if (!back){ c.fillStyle = '#c8372d'; c.beginPath(); c.moveTo(ox, shY + k * .03); c.lineTo(ox - k * .05, shY); c.lineTo(ox - k * .05, shY + k * .06); c.closePath(); c.moveTo(ox, shY + k * .03); c.lineTo(ox + k * .05, shY); c.lineTo(ox + k * .05, shY + k * .06); c.closePath(); c.fill(); }
  } else if (role === 'cook'){
    c.fillStyle = '#efeae0'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
    c.beginPath(); c.roundRect(ox - k * .12, hipY - k * .14, k * .24, k * .34, k * .03); c.fill(); c.stroke();
    if (!back){ c.fillStyle = '#9aa3ab'; for (const dy of [.08, .16, .24]){ c.beginPath(); c.arc(ox - k * .04, shY + dy * k, k * .014, 0, TAU); c.fill(); c.beginPath(); c.arc(ox + k * .04, shY + dy * k, k * .014, 0, TAU); c.fill(); } }
  } else if (!back){
    c.fillStyle = shade(shirt, 1.25);
    c.beginPath(); c.moveTo(ox - k * .06, shY); c.lineTo(ox, shY + k * .07); c.lineTo(ox + k * .06, shY); c.closePath(); c.fill();
  }

  // arms
  const sleeve = role === 'waiter' ? '#fbfbf8' : shirt;
  for (const side of [-1, 1]){
    const sx = ox + side * k * .155, sy = shY + k * .05;
    let hx2 = ox + side * k * .19, hy2 = hipY - k * .02;
    if (p.walking && !p.carrying?.length){ hx2 += Math.sin(ph) * -side * k * .03; hy2 -= Math.abs(Math.sin(ph)) * k * .02; }
    if (p.busy){ hx2 = ox + m * k * (.16 + side * .04); hy2 = shY + k * (.17 + Math.sin(t * 14 + side * 2) * .04); }
    if (p.eating && side === m){ const bite = (Math.sin(t * 3 + p.x) + 1) / 2; hx2 = ox + m * k * (.13 - bite * .05); hy2 = shY + k * (.2 - bite * .18); }
    if (role === 'waiter' && p.carrying?.length && side === m){ hx2 = ox + m * k * .26; hy2 = shY + k * .06; }
    if (role === 'cook'){
      const mx = (sx + hx2) / 2, my = (sy + hy2) / 2;
      capsule(c, mx, my, hx2, hy2, k * .07, skin, lw);
      capsule(c, sx, sy, mx, my, k * .09, sleeve, lw);
    } else capsule(c, sx, sy, hx2, hy2, k * .085, sleeve, lw);
    blob(c, hx2, hy2, k * .045, skin, lw * .7);
  }
  if (role === 'cook'){                       // towel over one shoulder
    const tx = ox - m * k * .13;
    c.fillStyle = '#dfe9f2'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
    c.beginPath(); c.roundRect(tx - k * .04, shY - k * .02, k * .08, k * .2, k * .02); c.fill(); c.stroke();
    c.strokeStyle = '#6f9cc7'; c.lineWidth = Math.max(1, k * .015); c.beginPath(); c.moveTo(tx - k * .04, shY + k * .12); c.lineTo(tx + k * .04, shY + k * .12); c.stroke();
  }
  // something to do while waiting: the paper for older regulars, a phone for everyone else
  if (p.waiting && !back){
    if (L.elder){
      const nx = ox + m * k * .02, ny = shY + k * .18;
      c.fillStyle = '#efeadb'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
      c.beginPath(); c.moveTo(nx - k * .2, ny - k * .12); c.lineTo(nx + k * .2, ny - k * .16); c.lineTo(nx + k * .2, ny + k * .08); c.lineTo(nx - k * .2, ny + k * .12); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#8f8a80'; for (let i = 0; i < 4; i++) c.fillRect(nx - k * .16, ny - k * .08 + i * k * .045, k * .13, Math.max(1, k * .014));
      c.fillStyle = '#c8372d'; c.fillRect(nx + k * .03, ny - k * .1, k * .13, k * .05);
    } else {
      const px2 = ox + m * k * .08, py2 = shY + k * .16;
      c.fillStyle = '#1d1f24'; c.beginPath(); c.roundRect(px2 - k * .04, py2 - k * .07, k * .08, k * .13, k * .015); c.fill();
      c.fillStyle = 'rgba(140,200,255,.75)'; c.fillRect(px2 - k * .03, py2 - k * .06, k * .06, k * .1);
    }
  }

  // neck + head
  c.fillStyle = shade(skin, .9); c.fillRect(hx - k * .035, shY - k * .04, k * .07, k * .06);
  const hg = c.createRadialGradient(hx - m * hr * .3, hy - hr * .3, hr * .2, hx, hy, hr * 1.1);
  hg.addColorStop(0, shade(skin, 1.08)); hg.addColorStop(1, shade(skin, .9));
  c.beginPath(); c.arc(hx, hy, hr, 0, TAU); c.fillStyle = p.angry ? '#e7907a' : hg; c.fill(); c.strokeStyle = OUTLINE; c.lineWidth = lw; c.stroke();

  if (!back){ for (const s2 of [-1, 1]) if (s2 !== m){ blob(c, hx + s2 * hr * .95, hy + hr * .1, hr * .22, shade(skin, .95), lw * .6); } }
  // hair
  c.fillStyle = hair;
  if (back){
    if (style === 'bald'){ c.strokeStyle = hair; c.lineWidth = hr * .35; c.beginPath(); c.arc(hx, hy + hr * .15, hr * .85, Math.PI * .1, Math.PI * .9); c.stroke(); }
    else { c.beginPath(); c.arc(hx, hy, hr * 1.04, 0, TAU); c.fill(); }
  } else if (style === 'bald'){
    c.strokeStyle = hair; c.lineWidth = hr * .3;
    c.beginPath(); c.arc(hx, hy, hr * .92, Math.PI * .75, Math.PI * 1.1); c.stroke();
    c.beginPath(); c.arc(hx, hy, hr * .92, Math.PI * 1.9, Math.PI * .25); c.stroke();
  } else {
    const deep = style === 'bob' || style === 'long';
    c.beginPath();
    c.arc(hx, hy, hr * 1.06, Math.PI * (deep ? .82 : 1.02), Math.PI * (deep ? 2.18 : 1.98));
    if (!deep){ c.quadraticCurveTo(hx + m * hr * .2, hy - hr * .15, hx - hr * 1.0, hy - hr * .2); }
    else c.lineTo(hx + hr * .7, hy - hr * .1), c.quadraticCurveTo(hx, hy - hr * .55, hx - hr * .7, hy - hr * .1);
    c.closePath(); c.fill();
    if (style === 'bun') blob(c, hx - m * hr * .2, hy - hr * 1.05, hr * .42, hair, lw * .6);
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = Math.max(1, hr * .12);
    c.beginPath(); c.arc(hx, hy, hr * .85, Math.PI * (m < 0 ? 1.25 : 1.5), Math.PI * (m < 0 ? 1.5 : 1.75)); c.stroke();
  }
  if (L.hat === 'cap' && role === 'customer'){
    c.fillStyle = L.hatColor || '#c8372d'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
    c.beginPath(); c.arc(hx, hy - hr * .05, hr * 1.05, Math.PI, 0); c.closePath(); c.fill(); c.stroke();
    if (!back){ c.beginPath(); c.ellipse(hx + m * hr * .7, hy - hr * .05, hr * .6, hr * .16, 0, 0, TAU); c.fill(); c.stroke(); }
  }

  // face
  if (!back){
    const ex = hx + m * hr * .28, ey = hy + hr * .08;
    c.fillStyle = '#231a15';
    for (const s2 of [-1, 1]){ c.beginPath(); c.ellipse(ex + s2 * hr * .3, ey, hr * .085, hr * .12, 0, 0, TAU); c.fill(); }
    if (L.glasses){ c.strokeStyle = '#2b2b2b'; c.lineWidth = Math.max(1, lw * .8); for (const s2 of [-1, 1]){ c.beginPath(); c.arc(ex + s2 * hr * .3, ey, hr * .2, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(ex - hr * .1, ey); c.lineTo(ex + hr * .1, ey); c.stroke(); }
    c.fillStyle = 'rgba(230,120,110,.35)';
    for (const s2 of [-1, 1]){ c.beginPath(); c.arc(ex + s2 * hr * .45, ey + hr * .32, hr * .13, 0, TAU); c.fill(); }
    c.strokeStyle = '#5a2e22'; c.lineWidth = Math.max(1, lw * .8); c.beginPath();
    if (p.angry){ c.arc(ex, ey + hr * .6, hr * .16, Math.PI * 1.15, Math.PI * 1.85); for (const s2 of [-1, 1]){ c.moveTo(ex + s2 * hr * .45, ey - hr * .32); c.lineTo(ex + s2 * hr * .15, ey - hr * .2); } }
    else if (p.eating || p.happy) c.arc(ex, ey + hr * .3, hr * .16, Math.PI * .15, Math.PI * .85);
    else { c.moveTo(ex - hr * .1, ey + hr * .42); c.lineTo(ex + hr * .1, ey + hr * .42); }
    c.stroke();
  }

  if (role === 'cook'){
    c.fillStyle = '#ffffff'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
    c.beginPath(); c.roundRect(hx - hr * .75, hy - hr * 1.85, hr * 1.5, hr * 1.0, hr * .15); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(hx, hy - hr * 1.85, hr * 1.05, hr * .5, 0, 0, TAU); c.fill(); c.stroke();
  }
  if (role === 'waiter' && p.carrying?.length){
    const tx = ox + m * k * .3, ty = shY + k * .04;
    c.fillStyle = '#c9ccd1'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
    c.beginPath(); c.ellipse(tx, ty, k * .2, k * .07, 0, 0, TAU); c.fill(); c.stroke();
    const n = Math.min(3, p.carrying.length), sz = k * .22;
    p.carrying.slice(0, 3).forEach((it, i) => c.drawImage(iconCanvas(it), tx - (n * sz * .8) / 2 + i * sz * .8, ty - sz * .9, sz, sz));
  }
  return [hx, hy - (role === 'cook' ? hr * 1.2 : 0), hr];
}
// Screen direction of facing, for legs when seated (unit-ish vectors in screen space)
const DIRS_SCREEN = { S: [-.8, .4], E: [.8, .4], N: [.8, -.4], W: [-.8, -.4] };
