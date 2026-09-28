// Draws one frame and returns what can be clicked.
import { Iso, inPoly, shade } from './iso.js';
import * as A from './art.js';
import { APPLIANCES, DECOR, MENU, OPEN_HOUR } from './data.js';
import { DH, KW, KH, WALL_H, DIRS, worldW, diningW, doorCell, accessOf, seatReport, inKitchen, inDining, wallSide } from './world.js';
import { clockHour, canMake } from './sim.js';

const TAU = Math.PI * 2;
const BB_Z = 2.35, BB_R = .44;   // station icon: height above the floor and radius, in cells
let staticLayer = null, staticKey = '', doorOpen = 0;
export const invalidateStatic = () => { staticKey = ''; };

export function computeView(cssW, cssH, S, cam){
  const span = worldW(S) + DH + KH;
  const hUnits = span / 2 + WALL_H + .9;
  const s = Math.max(8, Math.min((cssW - 24) / span, (cssH - 16) / hUnits));
  const base = { s, ox: (cssW - span * s) / 2 + (DH + KH) * s, oy: (cssH - hUnits * s) / 2 + (WALL_H + .8) * s };
  if (!cam || cam.z <= 1.001) return base;
  // Zoomed: the world point (cam.x, cam.y) on the floor sits at the middle of the stage.
  const z = s * cam.z;
  return { s: z, ox: cssW / 2 - (cam.x - cam.y) * z, oy: cssH / 2 - (cam.x + cam.y) * z / 2 };
}
// The floor point at the middle of the unzoomed view, so zooming in starts from where you're looking.
export function viewCentre(cssW, cssH, S){
  const v = computeView(cssW, cssH, S);
  const a = (cssW / 2 - v.ox) / v.s, b = (cssH / 2 - v.oy) / (v.s / 2);
  return { x: (a + b) / 2, y: (b - a) / 2 };
}

function buildStatic(S, view, cssW, cssH, dpr){
  const cv = document.createElement('canvas');
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const iso = new Iso(ctx, view.s, view.ox, view.oy);
  const dw = diningW(S);
  for (let x = 0; x < dw; x++) for (let y = 0; y < DH; y++) A.diningFloor(iso, S.dining.floor, x, y);
  for (let x = 0; x < KW; x++) for (let y = DH; y < DH + KH; y++) A.kitchenFloor(iso, x, y);
  // the step down outside the front edges
  iso.poly([[0, DH + KH, 0], [KW, DH + KH, 0], [KW, DH + KH, -.25], [0, DH + KH, -.25]], '#6d3326');
  iso.poly([[KW, DH, 0], [KW, DH + KH, 0], [KW, DH + KH, -.25], [KW, DH, -.25]], '#5a2a20');
  if (dw > KW) iso.poly([[KW, DH, 0], [dw, DH, 0], [dw, DH, -.25], [KW, DH, -.25]], '#6b6558');
  iso.poly([[dw, 0, 0], [dw, DH, 0], [dw, DH, -.25], [dw, 0, -.25]], '#58534a');
  A.drawWalls(iso, dw, doorCell(S)[0]);
  return cv;
}

function roundRect(c, x, y, w, h, r){ c.beginPath(); c.roundRect(x, y, w, h, r); }

export function draw(ctx, cssW, cssH, dpr, S, R, ui, t){
  const view = computeView(cssW, cssH, S, ui.cam);
  const sk = [cssW, cssH, dpr, S.diningSize, S.kitchenSize || 0, S.dining.floor, view.s.toFixed(2), view.ox.toFixed(1), view.oy.toFixed(1)].join('|');
  if (sk !== staticKey){ staticLayer = buildStatic(S, view, cssW, cssH, dpr); staticKey = sk; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(staticLayer, 0, 0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  const iso = new Iso(ctx, view.s, view.ox, view.oy), s = view.s;
  const hour = R ? clockHour(R) : OPEN_HOUR;
  const hits = [];
  const edit = ui.edit;

  // daylight through the side windows, and the front door sliding open for anyone passing through
  const warm = A.drawWindows(iso, hour);
  const d = doorCell(S);
  const near = R && R.customers.some(c => Math.hypot(c.x - (d[0] + .5), c.y - .2) < 1.25);
  doorOpen += ((near ? 1 : 0) - doorOpen) * .18;
  A.drawDoor(iso, d[0], doorOpen);

  for (const w of S.dining.wall){
    if (edit && edit.moving === w.id) continue;
    A.drawWallItem(iso, w, t, hour, S.day);
    const side = wallSide(w), q = side === 'W' ? [[0, w.y + 1], [0, w.y]] : [[w.x, 0], [w.x + 1, 0]];
    hits.push({ kind: 'wall', id: w.id, poly: [iso.P(...q[0], 1.9), iso.P(...q[1], 1.9), iso.P(...q[1], 1.0), iso.P(...q[0], 1.0)] });
  }

  // edit mode: tint the room being edited
  if (edit){
    const cells = [];
    if (edit.room === 'kitchen') for (let x = 0; x < KW; x++) for (let y = DH; y < DH + KH; y++) cells.push([x, y]);
    else for (let x = 0; x < diningW(S); x++) for (let y = 0; y < DH; y++) cells.push([x, y]);
    for (const [x, y] of cells) iso.poly([[x, y, .005], [x + 1, y, .005], [x + 1, y + 1, .005], [x, y + 1, .005]], null, 'rgba(255,255,255,.35)');
    if (edit.ghost) drawGhostCell(iso, edit.ghost);
  }

  for (const it of S.dining.items) if (DECOR[it.type].kind === 'ceiling') A.lampPool(iso, it);

  // ---------- depth-sorted scene ----------
  const list = [];
  const W = worldW(S);
  for (let x = 0; x < W; x++) if (x !== 3) list.push({ k: x + DH + .5, f: () => A.drawPartition(iso, x) });

  const busyStation = R && R.avatar.phase === 'cook' && R.queue[0] ? R.queue[0].stationId : null;
  for (const st of S.kitchen){
    if (edit && edit.moving === st.id) continue;
    list.push({ k: st.x + st.y + 1, f: () => A.drawStation(iso, st, t, st.id === busyStation) });
    hits.push({ kind: 'station', id: st.id, poly: iso.hull(st.x + .02, st.y + .02, st.x + .98, st.y + .98, 0, 1.7), k: st.x + st.y + 1 });
  }
  for (const it of S.dining.items){
    if (edit && edit.moving === it.id) continue;
    const kind = DECOR[it.type].kind;
    if (kind === 'ceiling') continue;
    const k = it.x + it.y + 1;
    if (A.hasBack(it.type)){
      list.push({ k, f: () => A.drawDecor(iso, it, t, 'base') });
      list.push({ k: k + (A.backIsNear(it) ? .05 : -.05), f: () => A.drawDecor(iso, it, t, 'back') });
    } else list.push({ k, f: () => A.drawDecor(iso, it, t) });
    const h = kind === 'table' ? .78 : kind === 'seat' ? (A.hasBack(it.type) ? .95 : .45) : 1.3;
    const ins = kind === 'seat' && !A.hasBack(it.type) ? .25 : .06;
    hits.push({ kind: 'decor', id: it.id, poly: iso.hull(it.x + ins, it.y + ins, it.x + 1 - ins, it.y + 1 - ins, 0, h), k });
  }

  const heads = [];
  if (R){
    for (const c of R.customers){
      const seat = S.dining.items.find(i => i.id === c.seatId);
      const sitting = seat && ['seated', 'waiting', 'eating'].includes(c.state);
      const px = sitting ? seat.x + .5 : c.x, py = sitting ? seat.y + .5 : c.y;
      const k = sitting ? seat.x + seat.y + 1 + .02 : px + py;
      list.push({ k, f: () => { heads.push({ c, pos: A.drawPerson(iso, { x: px, y: py, z: sitting ? .42 : 0, look: c.look, seated: sitting, walking: !sitting, face: sitting ? seat.dir : c.face, role: 'customer', eating: c.state === 'eating', waiting: c.state === 'waiting', angry: c.angry, happy: c.state === 'eating' }, t) }); } });
      if (c.state === 'eating' && c.food && seat){
        const [dx, dy] = DIRS[seat.dir], tx = seat.x + dx, ty = seat.y + dy;
        list.push({ k: tx + ty + 1 + .01, f: () => drawFood(iso, c, tx, ty, dx, dy, R.t) });
      }
    }
    for (const w of R.waiters){
      list.push({ k: w.x + w.y, f: () => A.drawPerson(iso, { x: w.x, y: w.y, z: 0, look: { skin: '#d9a57a', hair: '#1f1a17', style: 'short' }, walking: true, face: w.face, role: 'waiter', carrying: w.items }, t) });
    }
    const Av = R.avatar;
    list.push({ k: Av.x + Av.y, f: () => A.drawPerson(iso, { x: Av.x, y: Av.y, z: 0, look: { skin: '#e6b58c', hair: '#1f1a17' }, walking: Av.phase === 'walk', face: Av.face, role: 'cook', busy: Av.phase === 'cook' }, t) });
  } else {
    list.push({ k: 3.5 + 8.5, f: () => A.drawPerson(iso, { x: 3.5, y: 8.5, z: 0, look: { skin: '#e6b58c', hair: '#1f1a17' }, face: 'S', role: 'cook' }, t) });
  }

  list.sort((a, b) => a.k - b.k);
  for (const d of list) d.f();
  for (const it of S.dining.items) if (DECOR[it.type].kind === 'ceiling' && !(edit && edit.moving === it.id)){
    A.drawCeiling(iso, it, t);
    const [a, b] = iso.P(it.x + .5, it.y + .5, 2.05);
    hits.push({ kind: 'decor', id: it.id, circle: [a, b, s * .5], k: 99 });
  }

  // late afternoon: everything goes a little golden
  if (warm > 0){
    ctx.save(); ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = `rgba(255,196,140,${(.28 * warm).toFixed(3)})`; ctx.fillRect(0, 0, cssW, cssH);
    ctx.restore();
  }

  // ---------- overlays ----------
  if (edit){
    if (edit.ghostItem) drawGhostItem(iso, S, edit, t);
    drawEditMarkers(iso, S, edit);
  } else {
    drawStationBadges(iso, S, R, ui, t);
    if (R) drawTray(iso, R, t);
  }
  if (R){
    if (R.avatar.phase === 'walk') drawPath(iso, R.avatar.path);
    for (const h of heads) drawCustomerOverlay(iso, R, h.c, h.pos, t);
    for (const sp of R.sparks || []){
      const age = R.t - sp.t0, [a, b] = iso.P(sp.x, sp.y, 1.1);
      for (let i = 0; i < 10; i++){
        const ang = i / 10 * TAU + sp.seed, dist = age * s * 1.3, px = a + Math.cos(ang) * dist, py = b + Math.sin(ang) * dist * .6 - age * s * .6;
        const r = s * .07 * (1 - age / 1.2);
        if (r <= 0) continue;
        ctx.fillStyle = i % 2 ? '#ffd166' : '#fff3c4';
        ctx.beginPath(); ctx.moveTo(px, py - r * 2); ctx.lineTo(px + r * .6, py - r * .6); ctx.lineTo(px + r * 2, py); ctx.lineTo(px + r * .6, py + r * .6); ctx.lineTo(px, py + r * 2); ctx.lineTo(px - r * .6, py + r * .6); ctx.lineTo(px - r * 2, py); ctx.lineTo(px - r * .6, py - r * .6); ctx.closePath(); ctx.fill();
      }
    }
    for (const f of R.floaters){
      const age = R.t - f.t0, [a, b] = iso.P(f.x, f.y, f.z + age * .8);
      ctx.globalAlpha = Math.max(0, 1 - age / 1.6);
      ctx.font = `800 ${Math.round(s * .42)}px "Zilla Slab", Georgia, serif`; ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(f.text, a, b);
      ctx.fillStyle = f.color; ctx.fillText(f.text, a, b);
      ctx.globalAlpha = 1;
    }
  }
  if (ui.hover && !edit){
    const h = hits.find(h => h.kind === 'station' && h.id === ui.hover);
    if (h){ ctx.beginPath(); h.poly.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.strokeStyle = 'rgba(255,240,200,.9)'; ctx.lineWidth = 2; ctx.stroke(); }
  }
  if (edit && edit.selected){
    const h = hits.find(h => h.id === edit.selected);
    if (h && h.poly){ ctx.beginPath(); h.poly.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.closePath(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.setLineDash([]); }
    if (h && h.circle){ ctx.beginPath(); ctx.arc(...h.circle, 0, TAU); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2.5; ctx.stroke(); }
  }
  return { iso, hits };
}

function drawFood(iso, c, tx, ty, dx, dy, now){
  const n = c.food.length, prog = Math.min(1, (now - c.eatStart) / (c.eatUntil - c.eatStart)), g = iso.ctx;
  c.food.forEach((it, i) => {
    const off = (i - (n - 1) / 2) * .24;
    const fx = tx + .5 - dx * .2 + (dy ? off : 0), fy = ty + .5 - dy * .2 + (dx ? off : 0);
    const [a, b] = iso.P(fx, fy, .78), sz = iso.s * .42;
    // plate (or saucer) with a rim
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(a + 1, b + 2, sz * .5, sz * .22, 0, 0, TAU); g.fill();
    g.fillStyle = '#fbfaf5'; g.beginPath(); g.ellipse(a, b, sz * .5, sz * .22, 0, 0, TAU); g.fill();
    g.strokeStyle = '#d9d2c3'; g.lineWidth = 1; g.beginPath(); g.ellipse(a, b, sz * .36, sz * .15, 0, 0, TAU); g.stroke();
    const k = 1 - prog * .6;
    g.save(); g.globalAlpha = .4 + .6 * k;
    g.drawImage(A.iconCanvas(it), a - sz * k / 2, b - sz * .8 * k, sz * k, sz * k);
    g.restore();
  });
  // a spoon and fork beside the plates, on the customer's side
  const [sa, sb] = iso.P(tx + .5 - dx * .38 + (dy ? .3 : 0), ty + .5 - dy * .38 + (dx ? .3 : 0), .78);
  g.strokeStyle = '#b9c0c7'; g.lineWidth = Math.max(1.2, iso.s * .025); g.lineCap = 'round';
  g.beginPath(); g.moveTo(sa - iso.s * .1, sb - iso.s * .02); g.lineTo(sa + iso.s * .08, sb + iso.s * .05); g.moveTo(sa - iso.s * .06, sb - iso.s * .06); g.lineTo(sa + iso.s * .12, sb + iso.s * .01); g.stroke();
  g.lineCap = 'butt';
}

function drawPath(iso, path){
  const c = iso.ctx; c.fillStyle = 'rgba(255,240,200,.5)';
  for (const [x, y] of path){ const [a, b] = iso.P(x + .5, y + .5, .02); c.beginPath(); c.ellipse(a, b, iso.s * .07, iso.s * .035, 0, 0, TAU); c.fill(); }
}

function drawStationBadges(iso, S, R, ui, t){
  const c = iso.ctx, s = iso.s;
  for (const st of S.kitchen){
    const ap = APPLIANCES[st.type];
    if (!ap.makes) continue;
    const item = ap.makes, locked = !S.unlocked.includes(item);
    const [bx, by] = iso.P(st.x + .5, st.y + .5, BB_Z), r = s * BB_R;
    c.save();
    if (locked) c.globalAlpha = .55;
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(bx + 1.5, by + 2, r, 0, TAU); c.fill();
    c.fillStyle = '#fffaf0'; c.beginPath(); c.arc(bx, by, r, 0, TAU); c.fill();
    c.lineWidth = Math.max(2, s * .07); c.strokeStyle = ap.color; c.stroke();
    c.drawImage(A.iconCanvas(item), bx - r * .85, by - r * .9, r * 1.7, r * 1.7);
    c.restore();
    if (locked){
      c.fillStyle = '#3b3b3b'; roundRect(c, bx - r * .36, by - r * .05, r * .72, r * .58, r * .1); c.fill();
      c.strokeStyle = '#3b3b3b'; c.lineWidth = r * .14; c.beginPath(); c.arc(bx, by - r * .05, r * .24, Math.PI, 0); c.stroke();
    } else if (R && !canMake(S, R, item) && !R.queue.some(q => q.stationId === st.id)){
      c.fillStyle = '#c8372d'; roundRect(c, bx - r * 1.05, by + r * .62, r * 2.1, r * .7, r * .2); c.fill();
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(r * .5)}px "Noto Serif TC", serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('售罄 OUT', bx, by + r * .98);
    }
    if (!R) continue;
    // cooking progress
    if (R.avatar.phase === 'cook' && R.queue[0] && R.queue[0].stationId === st.id){
      const p = 1 - R.avatar.cookLeft / R.avatar.cookTotal;
      c.lineWidth = Math.max(3, s * .1); c.strokeStyle = '#2e9e5b';
      c.beginPath(); c.arc(bx, by, r + c.lineWidth * .6, -Math.PI / 2, -Math.PI / 2 + TAU * p); c.stroke();
    }
    // queue numbers
    let j = 0;
    R.queue.forEach((q, i) => {
      if (q.stationId !== st.id) return;
      const qx = bx + r * .92 + j * r * .72, qy = by - r * .8, qr = r * .36;
      const active = i === 0 && R.avatar.phase !== 'idle';
      c.fillStyle = active ? '#2e9e5b' : '#c8372d';
      c.beginPath(); c.arc(qx, qy, qr, 0, TAU); c.fill();
      c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke();
      c.fillStyle = '#fff'; c.font = `800 ${Math.round(qr * 1.25)}px "Zilla Slab", Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(String(i + 1), qx, qy + 1);
      j++;
    });
  }
}

function drawTray(iso, R, t){
  if (!R.tray.length) return;
  const c = iso.ctx, s = iso.s, sz = s * .36;
  // plates in a row along the pass counter (the hatch at x 3, y 6), freshness as a thin bar under each
  R.tray.forEach((it, i) => {
    const px = 3.18 + (i % 3) * .3, py = 6.3 + Math.floor(i / 3) * .36;
    const [a, b] = iso.P(px, py, .93);
    c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(a, b, sz * .5, sz * .22, 0, 0, TAU); c.fill();
    c.drawImage(A.iconCanvas(it.item), a - sz / 2, b - sz * .85, sz, sz);
    const f = Math.max(0, (it.fresh - R.t) / it.total);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(a - sz * .4, b + sz * .28, sz * .8, 3);
    c.fillStyle = f > .5 ? '#7fe08a' : f > .25 ? '#ffd166' : '#ff6b5b'; c.fillRect(a - sz * .4, b + sz * .28, sz * .8 * f, 3);
  });
}

function drawCustomerOverlay(iso, R, cust, pos, t){
  const c = iso.ctx, s = iso.s, [hx, hy, r] = pos;
  if (cust.state === 'waiting'){
    const o = R.orders.find(o => o.id === cust.orderId);
    if (!o) return;
    const entries = Object.entries(o.items), sz = s * .46;
    const w = entries.reduce((a, [, n]) => a + sz + (n > 1 ? sz * .55 : 0), 0) + sz * .9 + 10, h = sz + 10;
    const x = hx - w / 2, y = hy - r * 2.2 - h;
    c.fillStyle = o.sent ? '#e7f6ea' : '#fffaf0'; roundRect(c, x, y, w, h, h / 2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.stroke();
    c.beginPath(); c.moveTo(hx - 4, y + h); c.lineTo(hx, y + h + 6); c.lineTo(hx + 4, y + h); c.fillStyle = o.sent ? '#e7f6ea' : '#fffaf0'; c.fill();
    // patience ring
    const left = o.sent ? 1 : Math.max(0, (o.deadline - R.t) / (o.deadline - o.created));
    const pr = sz * .38, pcx = x + 5 + pr, pcy = y + h / 2;
    c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.arc(pcx, pcy, pr, 0, TAU); c.fill();
    c.fillStyle = o.sent ? '#2e9e5b' : left > .5 ? '#3aa56b' : left > .25 ? '#f2a13b' : '#d8412f';
    c.beginPath(); c.moveTo(pcx, pcy); c.arc(pcx, pcy, pr, -Math.PI / 2, -Math.PI / 2 + TAU * left); c.closePath(); c.fill();
    let cx = x + 5 + pr * 2 + 4;
    for (const [it, n] of entries){
      c.drawImage(A.iconCanvas(it), cx, y + 5, sz, sz); cx += sz;
      if (n > 1){ c.fillStyle = '#231d18'; c.font = `800 ${Math.round(sz * .5)}px "Zilla Slab", Georgia, serif`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('×' + n, cx - 2, y + h / 2 + 1); cx += sz * .55; }
    }
    c.fillStyle = 'rgba(35,29,24,.7)'; c.font = `700 ${Math.round(s * .2)}px "Zilla Slab", Georgia, serif`; c.textAlign = 'center'; c.fillText('#' + o.no, hx, y - 4);
  } else if (cust.state === 'leaving' && cust.angry){
    c.strokeStyle = '#ff5b4d'; c.lineWidth = 2.5;
    const y = hy - r * 2;
    c.beginPath(); c.moveTo(hx - 6, y - 6); c.lineTo(hx + 6, y + 6); c.moveTo(hx + 6, y - 6); c.lineTo(hx - 6, y + 6); c.stroke();
  }
}

// ---------- edit mode ----------
function drawGhostCell(iso, g){
  const col = g.ok ? 'rgba(120,230,140,.35)' : 'rgba(255,90,80,.4)';
  if (g.wall){
    const q = g.side === 'W' ? [[0, g.y + 1], [0, g.y]] : [[g.x, 0], [g.x + 1, 0]];
    iso.poly([[...q[0], 1], [...q[1], 1], [...q[1], 1.9], [...q[0], 1.9]], col, g.ok ? '#7fe08a' : '#ff6b5b', 2);
    return;
  }
  iso.poly([[g.x, g.y, .01], [g.x + 1, g.y, .01], [g.x + 1, g.y + 1, .01], [g.x, g.y + 1, .01]], col, g.ok ? '#7fe08a' : '#ff6b5b', 2);
  if (g.access) iso.poly([[g.access[0] + .25, g.access[1] + .25, .02], [g.access[0] + .75, g.access[1] + .25, .02], [g.access[0] + .75, g.access[1] + .75, .02], [g.access[0] + .25, g.access[1] + .75, .02]], 'rgba(255,240,200,.35)', 'rgba(255,240,200,.9)', 1.5);
}
function drawGhostItem(iso, S, edit, t){
  const g = edit.ghost, it = edit.ghostItem;
  if (!g) return;
  const c = iso.ctx; c.save(); c.globalAlpha = .75;
  const placed = { ...it, x: g.x, y: g.y, side: g.side || it.side };
  if (edit.room === 'kitchen') A.drawStation(iso, placed, t, false);
  else {
    const kind = DECOR[it.type].kind;
    if (kind === 'wall') A.drawWallItem(iso, placed, t, 9);
    else if (kind === 'ceiling') A.drawCeiling(iso, placed, t);
    else if (kind !== 'floor') A.drawDecor(iso, placed, t);
  }
  c.restore();
}
function drawEditMarkers(iso, S, edit){
  if (edit.room !== 'dining') return;
  const c = iso.ctx;
  for (const r of seatReport(S)){
    if (r.ok || edit.moving === r.seat.id) continue;
    const [a, b] = iso.P(r.seat.x + .5, r.seat.y + .5, 1.3), rr = iso.s * .22;
    c.fillStyle = '#ff6b5b'; c.beginPath(); c.arc(a, b, rr, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.font = `800 ${Math.round(rr * 1.4)}px "Zilla Slab", Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', a, b + 1);
  }
  const d = doorCell(S);
  iso.poly([[d[0] + .15, d[1] + .15, .02], [d[0] + .85, d[1] + .15, .02], [d[0] + .85, d[1] + .85, .02], [d[0] + .15, d[1] + .85, .02]], 'rgba(255,209,102,.25)', 'rgba(255,209,102,.8)', 1.5);
  iso.poly([[3.15, 5.15, .02], [3.85, 5.15, .02], [3.85, 5.85, .02], [3.15, 5.85, .02]], 'rgba(255,209,102,.25)', 'rgba(255,209,102,.8)', 1.5);
}

export function hitTest(hits, x, y){
  const sorted = [...hits].sort((a, b) => (b.k || 0) - (a.k || 0));
  for (const h of sorted){
    if (h.poly && inPoly(x, y, h.poly)) return h;
    if (h.circle && Math.hypot(x - h.circle[0], y - h.circle[1]) < h.circle[2]) return h;
  }
  return null;
}
// Station billboards float above the counters; treat a click on one as a click on its station.
export function billboardHit(iso, S, x, y){
  for (const st of S.kitchen){
    if (!APPLIANCES[st.type].makes) continue;
    const [bx, by] = iso.P(st.x + .5, st.y + .5, BB_Z);
    if (Math.hypot(x - bx, y - by) < iso.s * (BB_R + .06)) return st;
  }
  return null;
}
