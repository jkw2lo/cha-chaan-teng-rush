// One day of trading. `S` is the saved game, `R` is today's run.
import { DAY_SECONDS, OPEN_HOUR, CLOSE_HOUR, QUEUE_MAX, PASS_MAX, GOALS, salesTarget, TARGET_REWARD, GOAL_REWARD, WALK_SPEED, CUSTOMER_SPEED, WAITER_SPEED,
         WALKOUT_PENALTY, MENU, MENU_ORDER, INGREDIENTS, APPLIANCES, DECOR, BASE_PACKS, itemLevel, levelOf, MAX_LEVEL, KNOWN_AFTER, READING_BONUS } from './data.js';
import { ambience, ambienceEffect } from './ambience.js';
import { DIRS, HATCH, key, accessOf, bfs, inDining, inKitchen, kitchenBlocked, diningBlocked,
         doorCell, seatReport } from './world.js';

let uid = 1;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function newRun(S){
  return {
    t: 0, running: true, closing: false, over: false, forcedAt: null,
    spawnIn: 3, ticket: 1,
    customers: [], orders: [], queue: [], tray: [], waiters: [], deliveries: [], floaters: [], sparks: [], events: [],
    avatar: { x: 3.5, y: 8.5, path: [], phase: 'idle', cookLeft: 0, cookTotal: 0, face: 'S' },
    stats: { revenue: 0, tips: 0, waste: 0, served: 0, walkouts: 0, lost: 0, made: 0, fast: 0, sold: {}, popStart: S.popularity, moneyStart: S.money },
    goals: pickGoals(S),
    feed: [], toasts: [],
  };
}

// ---------- daily targets ----------
function seeded(n){ let x = Math.sin(n * 9301 + 49297) * 233280; return () => { x = Math.sin(x) * 10000; return x - Math.floor(x); }; }
export function pickGoals(S){
  const rnd = seeded(S.day);
  const pool = GOALS.filter(g => !g.needs || S.unlocked.includes(g.needs));
  const chosen = [];
  while (chosen.length < 2 && pool.length) chosen.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return { target: salesTarget(S.day, level(S)), list: chosen.map(g => ({ id: g.id, n: g.n(S.day) })) };
}
const statOf = (R, path) => path.split('.').reduce((o, k) => (o || {})[k] || 0, R.stats);
// Where each target stands right now. `done` for a max-goal means "still within the limit".
export function goalStatus(R){
  const sales = R.stats.revenue + R.stats.tips;
  return {
    target: { value: sales, n: R.goals.target, done: sales >= R.goals.target },
    list: R.goals.list.map(g => {
      const def = GOALS.find(d => d.id === g.id), v = statOf(R, def.stat);
      return { id: g.id, label: def.label(g.n), kind: def.kind, value: v, n: g.n, done: def.kind === 'min' ? v >= g.n : v <= g.n };
    }),
  };
}

export const clockHour = R => OPEN_HOUR + (CLOSE_HOUR - OPEN_HOUR) * clamp(R.t / DAY_SECONDS, 0, 1);
export function fmtClock(h){
  const H = Math.floor(h), M = Math.floor((h - H) * 60);
  return `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}`;
}
export const fmtMoney = n => (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
export const servingCost = item => Math.max(1, Math.round(Object.entries(MENU[item].recipe)
  .reduce((sum, [i, n]) => sum + INGREDIENTS[i].cost / INGREDIENTS[i].pack * n, 0)));

const emit = (R, type, data) => { if (R && R.events) R.events.push({ type, data }); };
function say(R, text, tone = 'info'){ R.feed.unshift({ text, tone, t: R.t }); R.feed.length = Math.min(R.feed.length, 30); }
function toast(R, text, tone = 'info'){ R.toasts.push({ id: uid++, text, tone, born: performance.now() }); }
function floater(R, x, y, z, text, color){ R.floaters.push({ x, y, z, text, color, t0: R.t }); }

// ---------- levels ----------
export const level = S => levelOf(S.stars || 0);
// Learning mode: how well you know a dish, and whether a ticket reads as text only.
export const known = (S, item) => ((S.learned || {})[item] || 0) >= KNOWN_AFTER;
export const readingTicket = (S, o) => S.learning && Object.keys(o.items).every(it => known(S, it));
export const maxed = S => level(S) >= MAX_LEVEL;
// Relaxed days (unlocked at the top level): customers wait much longer and walkouts don't cost popularity.
export const relaxed = S => maxed(S) && S.relaxed;
export const itemReady = (S, item) => level(S) >= itemLevel(item);           // reached the level for it
export const hasStation = (S, item) => S.kitchen.some(k => APPLIANCES[k.type].makes === item);
// Ingredients you can see and order: the ones used by anything you've reached the level for.
export const visibleIngredients = S => Object.keys(INGREDIENTS).filter(i => MENU_ORDER.some(m => itemReady(S, m) && MENU[m].recipe[i]));

// ---------- stock ----------
export function reserved(R, ing){
  let n = 0;
  for (const q of R.queue) if (!q.started) n += MENU[q.item].recipe[ing] || 0;
  return n;
}
export const freeStock = (S, R, ing) => S.stock[ing] - (R ? reserved(R, ing) : 0);
export function missingFor(S, R, item){
  return Object.entries(MENU[item].recipe).filter(([i, n]) => freeStock(S, R, i) < n).map(([i]) => i);
}
export const canMake = (S, R, item) => missingFor(S, R, item).length === 0;
export function sellable(S, R){
  return MENU_ORDER.filter(item => S.unlocked.includes(item) && S.kitchen.some(k => APPLIANCES[k.type].makes === item) &&
    (canMake(S, R, item) || R.tray.some(t => t.item === item) || R.queue.some(q => q.item === item)));
}
export function checkUnlocks(S, R){
  for (const item of MENU_ORDER){
    if (S.unlocked.includes(item) || !itemReady(S, item) || !hasStation(S, item)) continue;
    if (Object.keys(MENU[item].recipe).every(i => S.stock[i] > 0)){
      S.unlocked.push(item);
      if (R){ emit(R, 'unlock'); toast(R, `New on the menu: ${MENU[item].zh} ${MENU[item].name}`, 'good'); say(R, `${MENU[item].zh} added to the menu`, 'good'); }
    }
  }
}
// Storage: how much of an ingredient fits in the kitchen, and how much is already coming.
export const shelves = S => S.kitchen.filter(k => APPLIANCES[k.type].storage).length;
export const capacity = (S, ing) => INGREDIENTS[ing].pack * (BASE_PACKS + shelves(S));
export const incoming = (R, ing) => R ? R.deliveries.filter(d => d.ing === ing).reduce((s, d) => s + d.qty, 0) : 0;
export const roomFor = (S, R, ing) => capacity(S, ing) - S.stock[ing] - incoming(R, ing);
export const packsRoom = (S, R, ing) => Math.max(0, Math.floor(roomFor(S, R, ing) / INGREDIENTS[ing].pack));

// cart: {ing: packs}. Between days (no run, or run over) stock arrives at once.
export function placeStockOrder(S, R, cart){
  const cost = Object.entries(cart).reduce((s, [i, n]) => s + INGREDIENTS[i].cost * n, 0);
  if (cost <= 0) return { ok: false, msg: 'Pick something to order first.' };
  if (cost > S.money) return { ok: false, msg: `That costs ${fmtMoney(cost)} and you have ${fmtMoney(S.money)}.` };
  for (const [ing, packs] of Object.entries(cart)){
    if (packs > packsRoom(S, R, ing)) return { ok: false, msg: `There's only room for ${packsRoom(S, R, ing)} more pack${packsRoom(S, R, ing) === 1 ? '' : 's'} of ${INGREDIENTS[ing].name.toLowerCase()}. A stock shelf adds space.` };
  }
  S.money -= cost;
  const live = R && R.running && !R.over;
  for (const [ing, packs] of Object.entries(cart)){
    if (!packs) continue;
    const qty = packs * INGREDIENTS[ing].pack;
    if (live){
      R.deliveries.push({ id: uid++, ing, qty, left: INGREDIENTS[ing].delivery, total: INGREDIENTS[ing].delivery });
      say(R, `Ordered ${qty} ${INGREDIENTS[ing].name.toLowerCase()}`);
    } else S.stock[ing] += qty;
  }
  if (!live) checkUnlocks(S, R);
  return { ok: true, cost, live };
}

// ---------- the cook's queue ----------
// Each click queues another job at the station. Once it can't take more (5 jobs, or the
// cook's queue is full), the next click clears every waiting job at that station.
// clearAll (right-click) clears straight away.
export function clickStation(S, R, st, clearAll){
  const ap = APPLIANCES[st.type];
  if (st.type === 'pass') return { msg: 'Finished items wait here until a whole ticket is ready.' };
  if (!ap.makes) return { msg: 'Deliveries land here. Order more with Restock.' };
  const item = ap.makes;
  if (!itemReady(S, item)) return { msg: `${MENU[item].name} opens up at level ${itemLevel(item)}. Earn stars by hitting daily targets.` };
  if (!S.unlocked.includes(item)){
    const need = Object.keys(MENU[item].recipe).filter(i => S.stock[i] <= 0).map(i => INGREDIENTS[i].name.toLowerCase());
    return { msg: `Order ${need.join(' and ')} to put ${MENU[item].name.toLowerCase()} on the menu.` };
  }
  const cookingNow = R.avatar.phase === 'cook' ? R.queue[0] : null;
  const mine = R.queue.filter(q => q.stationId === st.id && q !== cookingNow);
  const atCap = R.queue.length >= QUEUE_MAX;
  if (clearAll || atCap){
    if (mine.length){
      if (mine.includes(R.queue[0])){ R.avatar.phase = 'idle'; R.avatar.path = []; }
      R.queue = R.queue.filter(q => !mine.includes(q));
      return { removed: mine.length };
    }
    if (atCap) return { msg: `The cook has ${QUEUE_MAX} jobs lined up. Click a station again to clear its jobs.` };
    return {};
  }
  const missing = missingFor(S, R, item);
  if (missing.length) return { msg: `Out of ${missing.map(i => INGREDIENTS[i].name.toLowerCase()).join(' and ')}. Restock to make more.` };
  R.queue.push({ id: uid++, stationId: st.id, item, started: false });
  return { added: true };
}

function moveAlong(ent, path, speed, dt){
  let step = speed * dt;
  while (step > 0 && path.length){
    const [cx, cy] = path[0], tx = cx + .5, ty = cy + .5;
    const dx = tx - ent.x, dy = ty - ent.y, d = Math.hypot(dx, dy);
    if (d > .001){ ent.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N'); }
    if (d <= step){ ent.x = tx; ent.y = ty; path.shift(); step -= d; }
    else { ent.x += dx / d * step; ent.y += dy / d * step; step = 0; }
  }
  return path.length === 0;
}

function updateCook(S, R, dt){
  const A = R.avatar;
  if (A.phase === 'idle'){
    const q = R.queue[0];
    if (!q) return;
    const st = S.kitchen.find(k => k.id === q.stationId);
    if (!st){ R.queue.shift(); return; }
    const start = [Math.floor(A.x), Math.floor(A.y)], goal = accessOf(st);
    const blocked = kitchenBlocked(S.kitchen);
    const path = bfs(start, goal, (x, y) => inKitchen(x, y) && !blocked.has(key(x, y)));
    if (path === null){ say(R, `Can't reach ${APPLIANCES[st.type].zh}`, 'bad'); R.queue.shift(); return; }
    A.path = [start, ...path]; A.phase = 'walk'; A.target = st.id;
  }
  if (A.phase === 'walk'){
    if (!moveAlong(A, A.path, WALK_SPEED, dt)) return;
    const q = R.queue[0], st = S.kitchen.find(k => k.id === q.stationId);
    if (!st){ R.queue.shift(); A.phase = 'idle'; return; }
    for (const [ing, n] of Object.entries(MENU[q.item].recipe)) S.stock[ing] -= n;
    q.started = true;
    const [ax, ay] = accessOf(st);
    A.face = ({ N: 'S', S: 'N', E: 'W', W: 'E' })[st.dir];
    A.x = ax + .5; A.y = ay + .5;
    A.phase = 'cook';
    A.cookTotal = A.cookLeft = MENU[q.item].cook * APPLIANCES[st.type].speed;
  }
  if (A.phase === 'cook'){
    A.cookLeft -= dt;
    if (A.cookLeft > 0) return;
    if (R.tray.length >= PASS_MAX){                       // nowhere to put it: wait for space on the pass
      if (!A.blocked){ A.blocked = true; toast(R, 'The pass is full. The cook is waiting for space.', 'warn'); }
      A.cookLeft = 0; return;
    }
    A.blocked = false;
    const q = R.queue.shift();
    R.tray.push({ id: uid++, item: q.item, made: R.t, fresh: R.t + MENU[q.item].fresh, total: MENU[q.item].fresh });
    emit(R, 'ready');
    R.stats.made++;
    A.phase = 'idle';
  }
}

// ---------- customers ----------
const SHIRTS = ['#d65a4a', '#4f74ad', '#e0b23c', '#7a5ea8', '#3f8f6b', '#e07a5f', '#5b6b7a', '#f2efe6'];
const SKINS = ['#f1c7a1', '#e6b58c', '#d9a57a', '#c68d63', '#b57d55'];
const HAIRS = ['#1f1a17', '#2a211c', '#3b2e25', '#8f8a84', '#c9c4bd'];
const PANTS = ['#2f3645', '#4a4f57', '#1f1f22', '#7a6a55', '#3d4f6b', '#5b4636'];
const STYLES_HAIR = ['short', 'short', 'bob', 'bun', 'long', 'bald'];
function randomLook(){
  const elder = Math.random() < .25;
  const style = elder ? pick(['short', 'bald', 'bob']) : pick(STYLES_HAIR.filter(s => s !== 'bald'));
  const r = Math.random();
  return { shirt: pick(SHIRTS), skin: pick(SKINS), pants: pick(PANTS), style, elder,
           hair: elder ? pick(['#8f8a84', '#c9c4bd', '#b3aea7']) : pick(HAIRS.slice(0, 3)), glasses: Math.random() < (elder ? .5 : .15),
           pattern: r < .18 ? 'stripe' : r < .3 ? 'check' : null,
           hat: !elder && Math.random() < .15 ? 'cap' : null, hatColor: pick(['#c8372d', '#2f3645', '#3f8f6b', '#e0b23c']) };
}

function rush(h){
  const bump = (c, w) => Math.exp(-(((h - c) / w) ** 2));
  return 1 + .9 * bump(8.3, .8) + 1.2 * bump(12.6, .9) + .8 * bump(15.3, .55);   // breakfast, lunch, 三點三 tea
}
function nextSpawn(S, R){
  const mean = 16 / (rush(clockHour(R)) * (.5 + S.popularity / 60) * ambienceEffect(ambience(S).total).customers);
  return clamp(-Math.log(1 - Math.random()) * mean, 2.5, 40);
}
function freeSeats(S, R){
  const taken = new Set(R.customers.map(c => c.seatId));
  return seatReport(S).filter(r => r.ok && !taken.has(r.seat.id)).map(r => r.seat);
}
function pickOrder(S, R){
  const menu = sellable(S, R);
  if (!menu.length) return null;
  const d = Math.min(S.day, 10), weights = [50, 32, 13 + d, 5 + d / 2];      // orders grow for ten days, then hold
  let r = Math.random() * weights.reduce((a, b) => a + b), n = 1;
  for (let i = 0; i < weights.length; i++){ r -= weights[i]; if (r <= 0){ n = i + 1; break; } }
  const items = {};
  const total = menu.reduce((s, m) => s + MENU[m].weight, 0);
  for (let i = 0; i < n; i++){
    let w = Math.random() * total, choice = menu[0];
    for (const m of menu){ w -= MENU[m].weight; if (w <= 0){ choice = m; break; } }
    items[choice] = (items[choice] || 0) + 1;
  }
  return { items, count: n };
}
function spawnCustomer(S, R){
  const seats = freeSeats(S, R);
  if (!seats.length){ R.stats.lost++; return; }
  if (!sellable(S, R).length){ R.stats.lost++; return; }
  const seat = pick(seats), door = doorCell(S), blocked = diningBlocked(S.dining.items);
  const path = bfs(door, [seat.x, seat.y], (x, y) => inDining(S, x, y) && !blocked.has(key(x, y)));
  if (!path){ R.stats.lost++; return; }
  emit(R, 'door');
  R.customers.push({ id: uid++, x: door[0] + .5, y: -.6, path: [door, ...path], state: 'walkIn', seatId: seat.id,
                     look: randomLook(), face: 'S', since: R.t });
}
function leave(S, R, c, angry){
  const seat = S.dining.items.find(i => i.id === c.seatId);
  const door = doorCell(S), blocked = diningBlocked(S.dining.items);
  const from = seat ? [seat.x, seat.y] : [Math.floor(c.x), Math.floor(c.y)];
  const path = bfs(from, door, (x, y) => inDining(S, x, y) && !blocked.has(key(x, y))) || [door];
  c.path = [...path, [door[0], -1]];
  c.state = 'leaving'; c.angry = !!angry; c.food = null;
}
function walkout(S, R, c, o){
  R.orders.splice(R.orders.indexOf(o), 1);
  if (!relaxed(S)) S.popularity = Math.max(0, S.popularity - WALKOUT_PENALTY);
  R.stats.walkouts++;
  floater(R, c.x, c.y, 1.4, 'Too slow!', '#ff6b5b');
  emit(R, 'walkout');
  say(R, `#${o.no} walked out`, 'bad');
  leave(S, R, c, true);
}
function updateCustomers(S, R, dt){
  for (const c of [...R.customers]){
    const seat = S.dining.items.find(i => i.id === c.seatId);
    if (c.state === 'walkIn'){
      if (!seat){ leave(S, R, c); continue; }
      if (moveAlong(c, c.path, CUSTOMER_SPEED, dt)){ c.state = 'seated'; c.since = R.t; c.face = seat.dir; }
    } else if (c.state === 'seated'){
      if (R.t - c.since < 1.4) continue;
      if (R.closing && R.forcedAt){ leave(S, R, c); continue; }
      const ord = pickOrder(S, R);
      if (!ord){ R.stats.lost++; leave(S, R, c); continue; }
      // slow dishes (noodles, chow fun) buy you extra time
      const slow = Object.entries(ord.items).reduce((t, [it, n]) => t + Math.max(0, MENU[it].cook - 5) * 1.6 * n, 0);
      const patience = (28 + 13 * ord.count + slow) * Math.max(.85, 1 - (S.day - 1) * .015) * (relaxed(S) ? 1.8 : 1);
      const o = { id: uid++, no: R.ticket++, custId: c.id, items: ord.items, count: ord.count, created: R.t, deadline: R.t + patience, sent: false };
      R.orders.push(o); c.orderId = o.id; c.state = 'waiting';
      emit(R, 'order', o.items);
    } else if (c.state === 'waiting'){
      const o = R.orders.find(o => o.id === c.orderId);
      if (o && !o.sent && R.t > o.deadline) walkout(S, R, c, o);
    } else if (c.state === 'eating'){
      if (R.t > c.eatUntil){ const o = R.orders.find(o => o.id === c.orderId); if (o) R.orders.splice(R.orders.indexOf(o), 1); leave(S, R, c); }
    } else if (c.state === 'leaving'){
      if (moveAlong(c, c.path, CUSTOMER_SPEED * (c.angry ? 1.4 : 1), dt)) R.customers.splice(R.customers.indexOf(c), 1);
    }
  }
}

// ---------- the pass and the waiters ----------
// Tickets are filled in the order they came in. An earlier ticket claims the items it
// needs even before it's complete, so a later, smaller ticket can't take them.
export function passClaims(R){
  const pool = {};
  for (const t of R.tray) pool[t.item] = (pool[t.item] || 0) + 1;
  const claims = new Map();
  for (const o of R.orders.filter(o => !o.sent).sort((a, b) => a.no - b.no)){
    const got = {};
    for (const [it, n] of Object.entries(o.items)){ got[it] = Math.min(n, pool[it] || 0); pool[it] = (pool[it] || 0) - got[it]; }
    claims.set(o.id, got);
  }
  return claims;
}
function allocate(S, R){
  const claims = passClaims(R);
  for (const o of R.orders.filter(o => !o.sent).sort((a, b) => a.no - b.no)){
    const got = claims.get(o.id);
    if (!Object.entries(o.items).every(([it, n]) => got[it] >= n)) continue;
    const taken = [];
    for (const [it, n] of Object.entries(o.items)){
      const pool = R.tray.filter(t => t.item === it).sort((a, b) => a.made - b.made).slice(0, n);
      for (const t of pool){ R.tray.splice(R.tray.indexOf(t), 1); taken.push(it); }
    }
    o.sent = true; o.sentAt = R.t;
    emit(R, 'out');
    dispatchWaiter(S, R, o, taken);
  }
}
function dispatchWaiter(S, R, o, items){
  const c = R.customers.find(c => c.id === o.custId);
  const seat = c && S.dining.items.find(i => i.id === c.seatId);
  const blocked = diningBlocked(S.dining.items);
  const passable = (x, y) => inDining(S, x, y) && !blocked.has(key(x, y));
  let path = null;
  if (seat){
    const goals = Object.values(DIRS).map(([dx, dy]) => [seat.x + dx, seat.y + dy]).filter(g => passable(...g));
    if (goals.length) path = bfs(HATCH, goals, passable);
  }
  R.waiters.push({ id: uid++, x: HATCH[0] + .5, y: HATCH[1] + .5, path: path ? [HATCH, ...path] : (seat ? [[seat.x, seat.y]] : []),
                   phase: 'out', orderId: o.id, custId: o.custId, items, face: 'N' });
}
function serve(S, R, w){
  const o = R.orders.find(o => o.id === w.orderId), c = R.customers.find(c => c.id === w.custId);
  if (!o || !c) return;
  const subtotal = Object.entries(o.items).reduce((s, [it, n]) => s + MENU[it].price * n, 0);
  const r = clamp((o.deadline - o.sentAt) / (o.deadline - o.created), 0, 1);
  const tip = Math.round(subtotal * (.04 + .32 * r) * (.8 + S.popularity / 250) * ambienceEffect(ambience(S).total).tips);
  const reading = readingTicket(S, o);
  const tipFinal = reading ? Math.round(tip * (1 + READING_BONUS) + 2) : tip;
  S.learned ||= {};
  for (const [it, n] of Object.entries(o.items)) S.learned[it] = (S.learned[it] || 0) + n;
  if (reading) R.stats.read = (R.stats.read || 0) + 1;
  S.money += subtotal + tipFinal;
  R.stats.revenue += subtotal; R.stats.tips += tipFinal; R.stats.served++;
  if (r >= .5) R.stats.fast++;
  for (const [it, n] of Object.entries(o.items)) R.stats.sold[it] = (R.stats.sold[it] || 0) + n;
  S.popularity = Math.min(100, S.popularity + .15 + .45 * r);
  c.state = 'eating'; c.food = w.items; c.eatStart = R.t; c.eatUntil = R.t + 7 + 2.5 * w.items.length;
  floater(R, c.x, c.y, 1.5, `+${fmtMoney(subtotal + tipFinal)}${reading ? ' 讀' : ''}`, r > .6 ? '#7fe08a' : '#ffd166');
  R.sparks.push({ x: c.x, y: c.y, t0: R.t, seed: Math.random() * 6 });
  emit(R, 'cash');
}
function updateWaiters(S, R, dt){
  for (const w of [...R.waiters]){
    if (!moveAlong(w, w.path, WAITER_SPEED, dt)) continue;
    if (w.phase === 'out'){
      serve(S, R, w);
      w.phase = 'back'; w.items = [];
      const blocked = diningBlocked(S.dining.items);
      const back = bfs([Math.floor(w.x), Math.floor(w.y)], HATCH, (x, y) => inDining(S, x, y) && !blocked.has(key(x, y)));
      w.path = back || [HATCH];
    } else R.waiters.splice(R.waiters.indexOf(w), 1);
  }
}
function wasteTray(S, R, t, reason){
  const cost = servingCost(t.item);
  S.money -= cost; R.stats.waste += cost;
  say(R, `${MENU[t.item].zh} wasted −${fmtMoney(cost)}`, 'bad');
  emit(R, 'waste');
}

// ---------- main tick ----------
export function tick(S, R, dt){
  if (R.over) return;
  R.t += dt;

  for (const d of [...R.deliveries]){
    d.left -= dt;
    if (d.left <= 0){
      S.stock[d.ing] += d.qty;
      R.deliveries.splice(R.deliveries.indexOf(d), 1);
      say(R, `+${d.qty} ${INGREDIENTS[d.ing].name.toLowerCase()} arrived`, 'good');
      emit(R, 'delivery');
      toast(R, `Delivery arrived: ${INGREDIENTS[d.ing].zh} ×${d.qty}`, 'good');
      checkUnlocks(S, R);
    }
  }

  if (!R.closing){
    if (R.t >= DAY_SECONDS){ R.closing = true; say(R, 'Closing time'); toast(R, 'Closing time. Finish the tickets you have.', 'info'); }
    else if ((R.spawnIn -= dt) <= 0){ spawnCustomer(S, R); R.spawnIn = nextSpawn(S, R); }
  }

  updateCustomers(S, R, dt);
  updateCook(S, R, dt);

  for (const t of [...R.tray]) if (R.t > t.fresh){ R.tray.splice(R.tray.indexOf(t), 1); wasteTray(S, R, t, t.item === 'icedTea' ? 'melted on the pass' : 'went stale on the pass'); }
  allocate(S, R);
  updateWaiters(S, R, dt);
  R.floaters = R.floaters.filter(f => R.t - f.t0 < 1.6);
  R.sparks = R.sparks.filter(p => R.t - p.t0 < 1.2);

  // Out of everything with nothing on the way: the shop has to shut.
  if (!R.closing && !sellable(S, R).length && !R.deliveries.length){
    R.closing = true; R.forcedAt = fmtClock(clockHour(R));
    for (const c of R.customers){
      const o = R.orders.find(o => o.id === c.orderId);
      if (o && !o.sent) walkout(S, R, c, o);
    }
    toast(R, `Out of stock at ${R.forcedAt}. You had to close early.`, 'bad');
    say(R, `Sold out, closed at ${R.forcedAt}`, 'bad');
  }

  if (R.closing && !R.customers.length && !R.waiters.length) endDay(S, R);
  else if (R.t > DAY_SECONDS + 150) endDay(S, R);
}

function endDay(S, R){
  for (const t of R.tray) wasteTray(S, R, t, 'was left on the pass at closing');
  R.tray = [];
  for (const q of R.queue) if (q.started){ /* already cooked into nothing: counted as made */ }
  R.queue = [];
  for (const d of R.deliveries) S.stock[d.ing] += d.qty;       // late deliveries still land overnight
  R.deliveries = [];
  R.customers = []; R.waiters = []; R.orders = [];
  R.over = true; R.running = false;
  const g = goalStatus(R);
  let bonus = 0, stars = 0;
  if (g.target.done){ bonus += TARGET_REWARD.cash; S.popularity = Math.min(100, S.popularity + TARGET_REWARD.popularity); stars++; }
  for (const x of g.list) if (x.done){ bonus += GOAL_REWARD; stars++; }
  S.money += bonus;
  const before = level(S);
  S.stars = (S.stars || 0) + stars;
  const after = level(S);
  // overnight, word of mouth drifts popularity back toward a steady baseline
  if (S.popularity < 35) S.popularity += (35 - S.popularity) * .25;
  R.results = { ...g, bonus, stars, levelUp: after > before ? after : null,
    newItems: after > before ? MENU_ORDER.filter(m => itemLevel(m) > before && itemLevel(m) <= after) : [] };
  checkUnlocks(S, null);
}

export const dayProgress = R => clamp(R.t / DAY_SECONDS, 0, 1);
