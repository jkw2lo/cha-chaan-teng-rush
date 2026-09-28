// Opening screen: a Hong Kong street at night. Neon signs, tenement blocks with air-con units
// and laundry poles, a ding-ding tram and a red taxi going past. Click to roll the shutter up.

import { THEME } from './data.js';

let raf = 0;
function seeded(seed){ let x = seed; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; }

function buildCity(w, h){
  const rnd = seeded(1997);
  const street = h * .8;
  const far = [], near = [];
  for (let x = -20; x < w + 40;){
    const bw = 40 + rnd() * 70, bh = h * (.35 + rnd() * .35);
    far.push({ x, w: bw, h: bh }); x += bw + 2;
  }
  for (let x = -30; x < w + 60;){
    const bw = 90 + rnd() * 110, bh = h * (.45 + rnd() * .3);
    const cols = Math.floor(bw / 22), rows = Math.floor(bh / 26);
    const wins = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++){
      const lit = rnd();
      wins.push({ c, r, lit: lit < .55, col: lit < .35 ? '#ffd98a' : lit < .5 ? '#f4f1d0' : '#9fd4ff', flick: rnd() < .04 });
    }
    const ac = [], laundry = [];
    for (let i = 0; i < rows * .6; i++) ac.push({ c: Math.floor(rnd() * cols), r: Math.floor(rnd() * rows) });
    for (let i = 0; i < rows * .15; i++) laundry.push({ r: 2 + Math.floor(rnd() * (rows - 3)), cols: ['#e05a47', '#f4f1ea', '#4f74ad', '#f2c14e'].sort(() => rnd() - .5) });
    near.push({ x, w: bw, h: bh, cols, rows, wins, ac, laundry, tone: ['#23233b', '#2b2238', '#1f2a36', '#2d2630'][Math.floor(rnd() * 4)] });
    x += bw + 6 + rnd() * 8;
  }
  return { far, near, street };
}

function drawTram(c, x, y, s){
  // Hong Kong's double-decker "ding ding"
  const w = 230 * s, h = 120 * s;
  c.save(); c.translate(x, y - h);
  c.strokeStyle = '#2b2b2b'; c.lineWidth = 2 * s;
  c.beginPath(); c.moveTo(w * .5, 0); c.lineTo(w * .62, -34 * s); c.stroke();
  c.fillStyle = '#1f6b4f'; c.beginPath(); c.roundRect(0, 0, w, h, 10 * s); c.fill();
  c.fillStyle = '#f1e7c8'; c.fillRect(0, h * .47, w, h * .08);
  c.fillStyle = '#ffe9a8';
  for (let i = 0; i < 7; i++){ c.fillRect(12 * s + i * 30 * s, 10 * s, 22 * s, 30 * s); c.fillRect(12 * s + i * 30 * s, h * .6, 22 * s, 26 * s); }
  c.fillStyle = '#c8372d'; c.fillRect(w * .36, h * .47, w * .28, h * .08);
  c.fillStyle = '#fff'; c.font = `900 ${11 * s}px "Noto Serif TC", serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('叮叮', w * .5, h * .51);
  c.fillStyle = '#111'; for (const wx of [.18, .82]){ c.beginPath(); c.arc(w * wx, h + 2 * s, 9 * s, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function drawTaxi(c, x, y, s){
  const w = 110 * s, h = 34 * s;
  c.save(); c.translate(x, y - h);
  c.fillStyle = '#d7263d'; c.beginPath(); c.roundRect(0, h * .35, w, h * .65, 6 * s); c.fill();
  c.fillStyle = '#c9ccd1'; c.beginPath(); c.moveTo(w * .22, h * .38); c.lineTo(w * .32, 0); c.lineTo(w * .72, 0); c.lineTo(w * .8, h * .38); c.closePath(); c.fill();
  c.fillStyle = '#9fd4ff'; c.fillRect(w * .34, h * .06, w * .16, h * .28); c.fillRect(w * .54, h * .06, w * .16, h * .28);
  c.fillStyle = '#ffe45c'; c.fillRect(w * .44, -6 * s, w * .14, 6 * s);
  c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(4 * s, h * .6, 4 * s, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#111'; for (const wx of [.2, .8]){ c.beginPath(); c.arc(w * wx, h, 8 * s, 0, Math.PI * 2); c.fill(); }
  const g = c.createLinearGradient(0, 0, -120 * s, 0); g.addColorStop(0, 'rgba(255,240,180,.45)'); g.addColorStop(1, 'rgba(255,240,180,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(2 * s, h * .5); c.lineTo(-120 * s, h * .2); c.lineTo(-120 * s, h * 1.1); c.closePath(); c.fill();
  c.restore();
}

function drawScene(c, w, h, city, t, still){
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#090d24'); sky.addColorStop(.55, '#26163d'); sky.addColorStop(.8, '#4a1f45'); sky.addColorStop(1, '#1a1020');
  c.fillStyle = sky; c.fillRect(0, 0, w, h);
  const st = city.street;
  c.fillStyle = '#141a2e';
  for (const b of city.far) c.fillRect(b.x, st - b.h, b.w, b.h);
  for (const b of city.near){
    const top = st - b.h;
    c.fillStyle = b.tone; c.fillRect(b.x, top, b.w, b.h);
    c.fillStyle = 'rgba(255,255,255,.04)'; c.fillRect(b.x, top, 4, b.h);
    for (const wi of b.wins){
      if (!wi.lit) continue;
      if (wi.flick && !still && Math.sin(t * 3 + wi.c * 7 + wi.r) > .7) continue;
      c.fillStyle = wi.col; c.globalAlpha = .85;
      c.fillRect(b.x + 6 + wi.c * 22, top + 8 + wi.r * 26, 12, 15);
    }
    c.globalAlpha = 1;
    c.fillStyle = '#b9bec5';
    for (const a of b.ac) c.fillRect(b.x + 4 + a.c * 22, top + 25 + a.r * 26, 16, 8);
    for (const l of b.laundry){
      const y = top + 22 + l.r * 26;
      c.strokeStyle = '#8a8f96'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.x - 6, y); c.lineTo(b.x + b.w * .6, y); c.stroke();
      l.cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(b.x + 4 + i * 14, y + 1, 9, 12); });
    }
  }
  // street, tram tracks and overhead wire
  c.fillStyle = '#16151c'; c.fillRect(0, st, w, h - st);
  c.fillStyle = '#2a2830'; c.fillRect(0, st, w, 8);
  c.strokeStyle = '#3a3842'; c.lineWidth = 2;
  for (const y of [st + h * .06, st + h * .075]){ c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.strokeStyle = '#555'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, st - h * .215); c.lineTo(w, st - h * .215); c.stroke();
  // neon puddle glow on the wet road
  const glow = c.createLinearGradient(0, st, 0, h);
  glow.addColorStop(0, 'rgba(255,95,162,.18)'); glow.addColorStop(1, 'rgba(90,209,255,.05)');
  c.fillStyle = glow; c.fillRect(0, st + 8, w, h - st);
  const s = Math.max(.6, h / 900);
  const tramX = still ? w * .08 : ((t * 55) % (w + 500)) - 320;
  drawTram(c, tramX, st + h * .075, s);
  const taxiX = still ? w * .7 : w + 200 - ((t * 150 + 200) % (w + 420));
  drawTaxi(c, taxiX, st + h * .16, s);
}

export function showSplash(onDone){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('div');
  el.className = 'splash';
  el.innerHTML = `
    <canvas class="splash-city"></canvas>
    ${THEME.meta.splash.signs.map(([txt, col, x, y, vert, size], i) => `<div class="neon ${vert ? 'vert' : ''}" style="--c:${col}; left:${x}%; top:${y}%; font-size:${size}vh; animation-delay:${(i * 1.7) % 5}s">${txt}</div>`).join('')}
    <div class="splash-title">
      <div class="neon-board"><span class="zh">${THEME.meta.splash.board}</span></div>
      <div class="rush">${THEME.meta.splash.word}</div>
      <p class="tag"><span>${THEME.meta.splash.tagZh}</span>${THEME.meta.splash.tag}</p>
    </div>
    <button class="splash-go" type="button"><span class="zh">開舖</span> Click anywhere to open the shutters</button>
    <div class="shutter-edge"></div>`;
  document.body.appendChild(el);
  const cv = el.querySelector('canvas'), c = cv.getContext('2d');
  let city = null, w = 0, h = 0;
  const size = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    city = buildCity(w, h);
  };
  size(); addEventListener('resize', size);
  const t0 = performance.now();
  const frame = now => { drawScene(c, w, h, city, (now - t0) / 1000, reduce); raf = requestAnimationFrame(frame); };
  raf = requestAnimationFrame(frame);

  let done = false;
  const go = () => {
    if (done) return; done = true;
    el.classList.add('opening');
    setTimeout(() => { cancelAnimationFrame(raf); removeEventListener('resize', size); el.remove(); onDone(); }, reduce ? 0 : 1100);
  };
  el.addEventListener('click', go);
  addEventListener('keydown', function k(e){ if (['Enter', ' '].includes(e.key)){ e.preventDefault(); removeEventListener('keydown', k); go(); } });
}
