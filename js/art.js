// Shared drawing: people, walls, light and shade, and helpers the themes build on.
// Anything restaurant-specific (dishes, stations, furniture) is drawn by the active theme's art.js.
import { shade } from './iso.js';
import { APPLIANCES, DECOR, THEME } from './data.js';
import { WALL_H, PARTITION_H, DH, KW, KH, WINDOW_SLOTS, wallSide, DIRS } from './world.js';

export const TAU = Math.PI * 2;
export const HAN = '"Noto Serif TC", "Songti TC", "PMingLiU", serif';
export const HAN_SANS = '"Noto Sans TC", "PingFang TC", "Heiti TC", sans-serif';
export const hash = (x, y, k = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453; return n - Math.floor(n); };

export const PAL = {
  mint: '#d3e4d4', dado: '#2f6f5e', band: '#efe6cf', wood: '#8a5a3a', steel: '#c9cfd4', red: '#c8372d',
  gold: '#f2d27a', tile: '#eef0ec', ink: '#231d18', glass: 'rgba(190,225,235,.35)',
  kitchenA: '#b8563f', kitchenB: '#c46a51'
};
// a theme can recolour the walls, floors and trim
export const applyPalette = p => Object.assign(PAL, p || {});

// ---------------- menu icons: drawn by the theme ----------------
export const drawIcon = (c, item, cx, cy, r) => THEME.art.icon(c, item, cx, cy, r);
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
    const a = x + i / 2, b = y + j / 2, base = (i + j) % 2 ? PAL.kitchenA : PAL.kitchenB;
    const v = .94 + hash(x * 2 + i, y * 2 + j) * .1;
    iso.poly([[a, b, 0], [a + .5, b, 0], [a + .5, b + .5, 0], [a, b + .5, 0]], shade(base, v), '#7e3526');
    // a glazed sheen across the back half of each tile
    iso.poly([[a + .06, b + .06, 0], [a + .3, b + .06, 0], [a + .06, b + .3, 0]], 'rgba(255,235,220,.12)');
  }
}
export function diningFloor(iso, type, x, y){
  if (THEME.art.floor) return THEME.art.floor(iso, type, x, y);
  iso.poly([[x, y, 0], [x + 1, y, 0], [x + 1, y + 1, 0], [x, y + 1, 0]], shade('#bdb6a8', .95 + hash(x, y) * .08), 'rgba(90,85,75,.25)');
}
// ---------------- walls ----------------
function wallSegment(iso, pts, kitchen){
  // pts: bottom-left and bottom-right of a segment in world coords, drawn to full height
  const [[ax, ay], [bx, by]] = pts;
  if (THEME.art.wallSegment && THEME.art.wallSegment(iso, pts, kitchen)) return;
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
  const face = THEME.art.wallFace || tiles;          // a theme can panel its dining walls its own way
  for (let x = 0; x < dw; x++) if (x !== door) face('wallN', x, 0, iso);
  for (let y = 0; y < DH; y++) face('wallW', 0, y, iso);
  if (THEME.art.kitchenWall) THEME.art.kitchenWall(iso);
  // kitchen wall: a utensil rail with ladles and a strainer, and a shelf of jars
  else iso.onFace('wallW', 0, DH + 1, c => {
    c.fillStyle = '#8a9096'; c.fillRect(-90, -178, 180, 4);
    const tools = [[-70, 'ladle'], [-40, 'spatula'], [-8, 'ladle'], [24, 'strainer'], [56, 'ladle']];
    for (const [u, k] of tools){
      c.fillStyle = '#9aa3ab'; c.fillRect(u - 1.5, -174, 3, 40);
      if (k === 'ladle'){ c.beginPath(); c.arc(u, -130, 8, 0, Math.PI); c.fill(); }
      else if (k === 'strainer'){ c.strokeStyle = '#9aa3ab'; c.lineWidth = 2; c.beginPath(); c.arc(u, -128, 10, 0, Math.PI * 2); c.stroke(); c.strokeStyle = 'rgba(150,160,165,.6)'; c.lineWidth = 1; for (let i = -8; i <= 8; i += 4){ c.beginPath(); c.moveTo(u + i, -137); c.lineTo(u + i, -119); c.stroke(); } }
      else { c.fillRect(u - 7, -138, 14, 10); }
    }
  });
  if (!THEME.art.kitchenWall) iso.onFace('wallW', 0, DH + 4, c => {
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
  iso.poly([[0, 0, WALL_H], [dw, 0, WALL_H], [dw, -T, WALL_H], [-T, -T, WALL_H], [-T, DH + KH, WALL_H], [0, DH + KH, WALL_H]], PAL.cap || '#5d6b64');
  if (THEME.art.room) THEME.art.room(iso, dw, door);  // anything else the theme adds to the shell (pillars, trim)
  // shop sign
  if (THEME.art.sign) iso.onFace('wallN', 0, 0, c => THEME.art.sign(c));
  else iso.onFace('wallN', 0, 0, c => {
    c.fillStyle = '#9e1f19'; c.fillRect(22, -236, 316, 38);
    c.strokeStyle = PAL.gold; c.lineWidth = 2.5; c.strokeRect(27, -231, 306, 28);
    c.fillStyle = PAL.gold; c.font = `900 25px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(THEME.meta.sign, 180, -216);
  });
}
export function drawPartition(iso, x){
  if (THEME.art.partition) return THEME.art.partition(iso, x);
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
      if (THEME.art.windowFrame) THEME.art.windowFrame(cc);
      else { cc.fillStyle = '#6d4a31'; cc.fillRect(48, -194, 4, 92); cc.fillRect(11, -150, 78, 4); }
      cc.fillStyle = 'rgba(255,255,255,.18)'; cc.beginPath(); cc.moveTo(16, -194); cc.lineTo(28, -194); cc.lineTo(16, -120); cc.lineTo(11, -120); cc.closePath(); cc.fill();
    });
  }
  // late in the day everything goes a little golden
  const warm = Math.max(0, (hour - 15) / 3);
  return warm;
}

// ---------------- kitchen stations ----------------
export function counter(iso, x, y, body){
  iso.box(x + .05, y + .05, x + .95, y + .95, 0, .84, body);
  iso.box(x + .01, y + .01, x + .99, y + .99, .84, .92, PAL.steel, { material: 'steel' });
}
export function label(iso, st, text, bg){
  // The sign goes on the front when the camera can see it; a station turned away shows it on both sides we can see.
  const faces = st.dir === 'S' || st.dir === 'E' ? [st.dir] : ['S', 'E'];
  for (const face of faces) iso.onFace(face, st.x, st.y, c => {
    c.fillStyle = bg; c.fillRect(10, -74, 80, 38);
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.strokeRect(13, -71, 74, 32);
    c.fillStyle = '#fff'; c.font = `900 ${text.length > 3 ? 17 : text.length > 2 ? 22 : 26}px ${HAN}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, 50, -54);
  });
}
export function steam(iso, cx, cy, z, t, n = 2){
  const c = iso.ctx;
  for (let k = 0; k < n; k++){
    const ph = (t * .6 + k / n) % 1, [sx, sy] = iso.P(cx, cy, z + ph * .6);
    c.strokeStyle = `rgba(255,255,255,${((1 - ph) * .75).toFixed(3)})`; c.lineWidth = Math.max(1.2, iso.s * .05);
    c.beginPath();
    for (let q = 0; q <= 6; q++){ const xx = sx + (k % 2 ? 1 : -1) * iso.s * .06 + Math.sin(q * .9 + t * 3 + k) * iso.s * .05, yy = sy - q * iso.s * .05; q ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    c.stroke();
  }
}
// The rubber mat where the cook stands to work a station: it marks which way the station faces.
export function workMat(iso, st){
  const [dx, dy] = DIRS[st.dir] || [0, 1], ax = st.x + dx, ay = st.y + dy;
  // the mat hugs the station's front edge
  const x0 = ax + (dx > 0 ? .02 : .1), x1 = ax + (dx < 0 ? .98 : .9), y0 = ay + (dy > 0 ? .02 : .1), y1 = ay + (dy < 0 ? .98 : .9);
  const along = dx !== 0;   // ridges run parallel to the counter
  iso.poly([[x0, y0, .004], [x1, y0, .004], [x1, y1, .004], [x0, y1, .004]], '#2e3033', '#1c1d1f', 1.2);
  for (let i = 1; i < 6; i++){
    const f = i / 6;
    const seg = along ? [[x0 + .05, y0 + (y1 - y0) * f], [x1 - .05, y0 + (y1 - y0) * f]] : [[x0 + (x1 - x0) * f, y0 + .05], [x0 + (x1 - x0) * f, y1 - .05]];
    iso.poly([[...seg[0], .006], [...seg[1], .006]], null, 'rgba(255,255,255,.12)', Math.max(1, iso.s * .02));
  }
  // a yellow safety edge along the side that meets the counter
  const e = .07, edge = dx > 0 ? [[x0, y0], [x0 + e, y0], [x0 + e, y1], [x0, y1]] : dx < 0 ? [[x1 - e, y0], [x1, y0], [x1, y1], [x1 - e, y1]]
    : dy > 0 ? [[x0, y0], [x1, y0], [x1, y0 + e], [x0, y0 + e]] : [[x0, y1 - e], [x1, y1 - e], [x1, y1], [x0, y1]];
  iso.poly(edge.map(([a, b]) => [a, b, .008]), '#e0b23c');
}
// Edit mode: a bold arrow from the station out to where the cook stands.
export function facingArrow(iso, st, col = '#ffd166'){
  const [dx, dy] = DIRS[st.dir] || [0, 1], px = -dy, py = dx;
  const cx = st.x + .5 + dx * .95, cy = st.y + .5 + dy * .95;
  const pt = (f, s) => [cx + dx * f + px * s, cy + dy * f + py * s, .03];
  const pts = [pt(-.4, -.1), pt(0, -.1), pt(0, -.26), pt(.36, 0), pt(0, .26), pt(0, .1), pt(-.4, .1)];
  iso.poly(pts, col, 'rgba(40,25,10,.8)', Math.max(1.5, iso.s * .03));
}
export function drawStation(iso, st, t, busy){
  contactShadow(iso, st.x + .04, st.y + .04, st.x + .98, st.y + .98, .28);
  THEME.art.station(iso, st, t, busy);
}

// ---------------- dining furniture ----------------
export function legs(iso, x, y, ins, h, col){ for (const [a, b] of [[ins, ins], [1 - ins, ins], [ins, 1 - ins], [1 - ins, 1 - ins]]) iso.box(x + a - .025, y + b - .025, x + a + .025, y + b + .025, 0, h, col, { edge: false }); }
export function backRect(it, x, y, depth = .2){
  switch (it.dir){
    case 'E': return [x + .08, y + .12, x + .08 + depth, y + .88];
    case 'W': return [x + .92 - depth, y + .12, x + .92, y + .88];
    case 'S': return [x + .12, y + .08, x + .88, y + .08 + depth];
    default:  return [x + .12, y + .92 - depth, x + .88, y + .92];
  }
}
export const backIsNear = it => it.dir === 'W' || it.dir === 'N';
export const hasBack = type => (THEME.art.backs || []).includes(type);

// part: 'base' | 'back' | undefined (both)
const SHADOW = { table: [.1, .9, .22], seat: [.18, .82, .2], block: [.08, .92, .26] };
export function drawDecor(iso, it, t, part){
  const { x, y } = it;
  const sh = SHADOW[DECOR[it.type]?.kind];
  if (part !== 'back' && sh) contactShadow(iso, x + sh[0], y + sh[0], x + sh[1], y + sh[1], sh[2]);
  THEME.art.decor(iso, it, t, part);
}
// A pool of warm light on the floor under a lamp (drawn before furniture so it sits underneath).
export function lampPool(iso, it){
  if (!(THEME.art.lamps || []).includes(it.type)) return;
  const c = iso.ctx, [a, b] = iso.P(it.x + .5, it.y + .5, 0), r = iso.s * (it.type === 'ceilingFan' ? .9 : 1.5);
  const g = c.createRadialGradient(a, b, 1, a, b, r);
  g.addColorStop(0, it.type === 'ceilingFan' ? 'rgba(255,255,255,.06)' : 'rgba(255,214,150,.3)'); g.addColorStop(1, 'rgba(255,214,150,0)');
  c.save(); c.scale(1, .5); c.fillStyle = g; c.beginPath(); c.arc(a, b * 2, r, 0, TAU); c.fill(); c.restore();
}
export const drawCeiling = (iso, it, t) => THEME.art.ceiling(iso, it, t);
export function drawWallItem(iso, w, t, hour, day = 1){
  const onWall = fn => wallSide(w) === 'W' ? iso.onFace('wallW', 0, w.y, fn) : iso.onFace('wallN', w.x, 0, fn);
  onWall(c => { c.textAlign = 'center'; c.textBaseline = 'middle'; THEME.art.wallItem(c, w, t, hour, day); });
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

// A dim sum trolley: steel cart with stacked bamboo steamers, pushed ahead of the waiter.
export function drawTrolley(iso, x, y, face, t){
  if (THEME.art.trolley) return THEME.art.trolley(iso, x, y, face, t);
  const [dx, dy] = DIRS[face] || [0, 1], cx = x + dx * .42, cy = y + dy * .42;
  contactShadow(iso, cx - .22, cy - .22, cx + .22, cy + .22, .22);
  iso.box(cx - .2, cy - .2, cx + .2, cy + .2, .12, .5, '#b9c0c7', { material: 'steel' });
  for (const [ox, oy] of [[-.16, -.16], [.16, -.16], [-.16, .16], [.16, .16]]) iso.cyl(cx + ox, cy + oy, .035, 0, .12, '#2b2b2b');
  for (let i = 0; i < 3; i++) iso.cyl(cx - .02, cy - .02, .13, .5 + i * .09, .58 + i * .09, '#c9a26b', i === 2 ? '#b88d55' : undefined);
  steam(iso, cx, cy, .82, t, 2);
}
export function drawPerson(iso, p, t){
  // the trolley is drawn behind the waiter when they push it away from us, in front when towards us
  const cartFront = p.cart && (p.face === 'S' || p.face === 'E');
  if (p.cart && !cartFront) drawTrolley(iso, p.x, p.y, p.face, t);
  const c = iso.ctx, k = iso.s, L = p.look || {};
  const role = p.role || 'customer', back = p.face === 'N' || p.face === 'W';
  const m = (p.face === 'S' || p.face === 'W') ? -1 : 1;             // which way they face on screen
  const lw = Math.max(1, k * .022);
  const ph = t * 9 + (p.x + p.y) * 2.3;
  const skin = L.skin || '#e6b58c', hair = L.hair || '#1f1a17';
  const U = (THEME.meta.uniform || {})[role] || {};    // a theme can dress its staff
  const shirt = role === 'customer' ? L.shirt : (U.shirt || '#fbfbf8');
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
    c.fillStyle = U.vest || '#1f1f22';
    c.beginPath(); c.moveTo(ox - k * .2, shY); c.lineTo(ox - k * .04, shY); c.lineTo(ox, shY + k * .2); c.lineTo(ox + k * .04, shY); c.lineTo(ox + k * .2, shY); c.lineTo(ox + k * .2, hipY + k * .05); c.lineTo(ox - k * .2, hipY + k * .05); c.closePath(); c.fill();
    c.restore();
    if (U.trim && !back){                            // piping down the vest's front edges
      c.strokeStyle = U.trim; c.lineWidth = Math.max(1, k * .02);
      c.beginPath(); c.moveTo(ox - k * .04, shY); c.lineTo(ox, shY + k * .2); c.lineTo(ox + k * .04, shY); c.moveTo(ox, shY + k * .2); c.lineTo(ox, hipY); c.stroke();
    }
    if (!back){ c.fillStyle = U.bow || '#c8372d'; c.beginPath(); c.moveTo(ox, shY + k * .03); c.lineTo(ox - k * .05, shY); c.lineTo(ox - k * .05, shY + k * .06); c.closePath(); c.moveTo(ox, shY + k * .03); c.lineTo(ox + k * .05, shY); c.lineTo(ox + k * .05, shY + k * .06); c.closePath(); c.fill(); }
  } else if (role === 'cook'){
    c.fillStyle = '#efeae0'; c.strokeStyle = OUTLINE; c.lineWidth = lw;
    c.beginPath(); c.roundRect(ox - k * .12, hipY - k * .14, k * .24, k * .34, k * .03); c.fill(); c.stroke();
    if (!back){ c.fillStyle = '#9aa3ab'; for (const dy of [.08, .16, .24]){ c.beginPath(); c.arc(ox - k * .04, shY + dy * k, k * .014, 0, TAU); c.fill(); c.beginPath(); c.arc(ox + k * .04, shY + dy * k, k * .014, 0, TAU); c.fill(); } }
  } else if (!back){
    c.fillStyle = shade(shirt, 1.25);
    c.beginPath(); c.moveTo(ox - k * .06, shY); c.lineTo(ox, shY + k * .07); c.lineTo(ox + k * .06, shY); c.closePath(); c.fill();
  }

  // arms
  const sleeve = role === 'waiter' ? (U.shirt || '#fbfbf8') : shirt;
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
  if (cartFront) drawTrolley(iso, p.x, p.y, p.face, t);
  return [hx, hy - (role === 'cook' ? hr * 1.2 : 0), hr];
}
// Screen direction of facing, for legs when seated (unit-ish vectors in screen space)
const DIRS_SCREEN = { S: [-.8, .4], E: [.8, .4], N: [.8, -.4], W: [-.8, -.4] };
