// Isometric projection and drawing primitives. World units are grid cells; z is height in cells.
const cache = new Map();
export function shade(hex, f){
  const k = hex + f;
  if (cache.has(k)) return cache.get(k);
  let r, g, b;
  if (hex.startsWith('#')){ const n = parseInt(hex.slice(1), 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; }
  else { [r, g, b] = hex.match(/\d+/g).map(Number); }
  const fn = v => Math.round(Math.min(255, f <= 1 ? v * f : v + (255 - v) * (f - 1)));
  const out = `rgb(${fn(r)},${fn(g)},${fn(b)})`;
  cache.set(k, out);
  return out;
}

export class Iso {
  constructor(ctx, s, ox, oy){ this.ctx = ctx; this.s = s; this.ox = ox; this.oy = oy; }
  P(x, y, z = 0){ return [this.ox + (x - y) * this.s, this.oy + (x + y) * this.s / 2 - z * this.s]; }
  unproject(sx, sy){
    const a = (sx - this.ox) / this.s, b = (sy - this.oy) / (this.s / 2);
    return [(a + b) / 2, (b - a) / 2];
  }
  path(pts){
    const c = this.ctx; c.beginPath();
    pts.forEach((p, i) => { const [a, b] = this.P(...p); i ? c.lineTo(a, b) : c.moveTo(a, b); });
    c.closePath();
  }
  poly(pts, fill, stroke, lw = 1){
    this.path(pts);
    if (fill){ this.ctx.fillStyle = fill; this.ctx.fill(); }
    if (stroke){ this.ctx.strokeStyle = stroke; this.ctx.lineWidth = lw; this.ctx.stroke(); }
  }
  // A lit box: faces graded darker toward the floor, a softly lit top, and a thin highlight
  // along the top's front edges. opt.material: 'steel' | 'wood' | 'glass' adds surface detail.
  // Passing leftCol/rightCol/topCol keeps that face flat (used for glass and special cases).
  box(x0, y0, x1, y1, z0, z1, col, opt = {}){
    const c = this.ctx, edge = opt.edge === undefined ? 'rgba(20,16,12,.2)' : opt.edge;
    const flatOnly = typeof col === 'string' && col.startsWith('rgba');
    const h = z1 - z0;
    const face = (pts, fill, from, to, a, b) => {
      this.path(pts);
      if (fill) c.fillStyle = fill;
      else {
        const [fx, fy] = this.P(...from), [tx, ty] = this.P(...to);
        const g = c.createLinearGradient(fx, fy, tx, ty);
        g.addColorStop(0, shade(col, a)); g.addColorStop(1, shade(col, b));
        c.fillStyle = g;
      }
      c.fill();
      if (edge){ c.strokeStyle = edge; c.lineWidth = 1; c.stroke(); }
    };
    // front-left (+y) face, then front-right (+x) face: lighter at the top, darker where they meet the floor
    if (opt.left !== false) face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], opt.leftCol || (flatOnly ? col : null),
      [x0, y1, z1], [x0, y1, z0], .88, h > .3 ? .68 : .8);
    if (opt.right !== false) face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], opt.rightCol || (flatOnly ? col : null),
      [x1, y0, z1], [x1, y0, z0], .7, h > .3 ? .52 : .62);
    // top: light falls from the back
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], opt.topCol || (flatOnly ? col : null),
      [x0, y0, z1], [x1, y1, z1], 1.07, .96);
    const m = opt.material;
    if (m === 'steel' && !flatOnly){
      this.path([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
      c.save(); c.clip();
      const [a1, b1] = this.P(x0, y0, z1), [a2, b2] = this.P(x1, y1, z1);
      const g = c.createLinearGradient(a1, b1, a2, b2);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.42, 'rgba(255,255,255,.35)'); g.addColorStop(.5, 'rgba(255,255,255,.05)'); g.addColorStop(.62, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(Math.min(a1, a2) - this.s * 2, Math.min(b1, b2) - this.s, Math.abs(a2 - a1) + this.s * 4, Math.abs(b2 - b1) + this.s * 2);
      c.restore();
    } else if (m === 'wood' && !flatOnly){
      this.path([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
      c.save(); c.clip();
      c.strokeStyle = shade(col, .82); c.globalAlpha = .45; c.lineWidth = Math.max(.6, this.s * .012);
      const n = Math.max(3, Math.round((y1 - y0) * 9));
      for (let i = 1; i < n; i++){
        const yy = y0 + (y1 - y0) * i / n + Math.sin(i * 7.3) * .01;
        const [pa, pb] = this.P(x0, yy, z1), [qa, qb] = this.P(x1, yy + Math.sin(i * 3.1) * .02, z1);
        c.beginPath(); c.moveTo(pa, pb); c.quadraticCurveTo((pa + qa) / 2, (pb + qb) / 2 + Math.sin(i) * this.s * .02, qa, qb); c.stroke();
      }
      c.restore();
    }
    // bright edge where the top meets the two visible faces
    if (opt.shine !== false && h > .015){
      c.strokeStyle = m === 'glass' ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.28)'; c.lineWidth = 1;
      const [p1, p2, p3] = [this.P(x0, y1, z1), this.P(x1, y1, z1), this.P(x1, y0, z1)];
      c.beginPath(); c.moveTo(...p1); c.lineTo(...p2); c.lineTo(...p3); c.stroke();
    }
    if (m === 'glass'){
      const [a1, b1] = this.P(x0 + (x1 - x0) * .2, y1, z1 - h * .1), [a2, b2] = this.P(x0 + (x1 - x0) * .35, y1, z0 + h * .15);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = Math.max(1.5, this.s * .03);
      c.beginPath(); c.moveTo(a1, b1); c.lineTo(a2, b2); c.stroke();
    }
  }
  // Upright cylinder centred on (cx, cy)
  cyl(cx, cy, r, z0, z1, col, topCol){
    const c = this.ctx, [bx, by] = this.P(cx, cy, z0), [tx, ty] = this.P(cx, cy, z1);
    const rx = r * this.s * 1.414, ry = rx / 2;
    const g = c.createLinearGradient(bx - rx, 0, bx + rx, 0);
    g.addColorStop(0, shade(col, .92)); g.addColorStop(.45, shade(col, 1.08)); g.addColorStop(1, shade(col, .62));
    c.beginPath();
    c.moveTo(bx - rx, by);
    c.ellipse(bx, by, rx, ry, 0, Math.PI, 0, true);
    c.lineTo(tx + rx, ty);
    c.ellipse(tx, ty, rx, ry, 0, 0, Math.PI, true);
    c.closePath();
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(20,16,12,.2)'; c.lineWidth = 1; c.stroke();
    if (by - ty > 3){                                  // a soft specular streak down the left third
      c.save(); c.clip();
      const hx = bx - rx * .42, hw = Math.max(1, rx * .16);
      const sg = c.createLinearGradient(hx - hw, 0, hx + hw, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.38)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = sg; c.fillRect(hx - hw, ty - ry, hw * 2, by - ty + ry * 2);
      c.restore();
    }
    c.beginPath(); c.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
    const tg = c.createLinearGradient(tx - rx, ty - ry, tx + rx, ty + ry);
    const top = topCol || shade(col, 1.12);
    tg.addColorStop(0, top); tg.addColorStop(1, top.startsWith('rgba') ? top : shade(top, .88));
    c.fillStyle = tg; c.fill(); c.stroke();
  }
  ell(x, y, z, r, fill, stroke){
    const c = this.ctx, [a, b] = this.P(x, y, z), rx = r * this.s * 1.414;
    c.beginPath(); c.ellipse(a, b, rx, rx / 2, 0, 0, Math.PI * 2);
    if (fill){ c.fillStyle = fill; c.fill(); }
    if (stroke){ c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  // Draw flat artwork onto a vertical face in a 100-units-per-cell space. v runs down, so z maps to v = -z*100.
  // face: 'S' front-left face of cell (x,y); 'E' front-right face; 'wallN' back wall plane at y; 'wallW' left wall plane at x.
  onFace(face, x, y, fn){
    const c = this.ctx, s = this.s;
    let o, ux, uy;
    if (face === 'S'){ o = this.P(x, y + 1, 0); ux = s / 100; uy = s / 200; }
    else if (face === 'wallN'){ o = this.P(x, y, 0); ux = s / 100; uy = s / 200; }
    else if (face === 'E'){ o = this.P(x + 1, y + 1, 0); ux = s / 100; uy = -s / 200; }
    else { o = this.P(x, y + 1, 0); ux = s / 100; uy = -s / 200; }   // wallW
    c.save(); c.transform(ux, uy, 0, s / 100, o[0], o[1]); fn(c); c.restore();
  }
  hull(x0, y0, x1, y1, z0, z1){
    return [this.P(x0, y0, z1), this.P(x1, y0, z1), this.P(x1, y0, z0), this.P(x1, y1, z0), this.P(x0, y1, z0), this.P(x0, y1, z1)];
  }
}

export function inPoly(px, py, pts){
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++){
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
