// Counter Rush: one day at the counter. Pure state and rules, no drawing, so a script can play it.
// Everything the player does is one of the exported actions; tick() moves time on.
// Things worth a sound or a floating number are pushed onto run.events for the page to pick up.
import { INGREDIENTS, APPLIANCES, RECIPES, RECIPE_ORDER, START_STOCK, DAY, candidates, finished, partsCost, rawInput } from './recipes.js';

const ORDER_WEIGHTS = { hotTea: 3, butterBun: 2, condensedToast: 2, noodleSpam: 2 };
export const SEAT_WALK = 320;          // px per second, customers walking along the counter
export const DOOR_X = 1340;            // they come in from the right

export function newRun(rnd = Math.random){
  return {
    rnd, t: 0, over: false, closed: false,
    cash: DAY.startCash, sales: 0, tips: 0, stockSpent: 0, waste: 0,
    served: 0, walkouts: 0, messes: 0, burnt: 0, customers: 0,
    stock: { ...START_STOCK },
    deliveries: [],                                      // { ing, eta, express }
    seats: Array.from({ length: DAY.seats }, () => ({ cust: null, dirty: [] })),
    walkers: [],                                         // customers on their way out
    spots: Array(DAY.spots).fill(null),                  // { parts: [], mess: null | 'why' }
    active: 0,
    apps: Object.fromEntries(Object.keys(APPLIANCES).map(k => [k, { part: null, t: 0, pull: 0, ruined: false }])),
    nextArrival: DAY.firstAt,
    events: [],
    nextId: 1,
  };
}

const ev = (run, kind, o = {}) => run.events.push({ kind, ...o });
const pick = (run, weights) => {
  const keys = Object.keys(weights), total = keys.reduce((s, k) => s + weights[k], 0);
  let x = run.rnd() * total;
  for (const k of keys){ if ((x -= weights[k]) < 0) return k; }
  return keys[0];
};
export const seatFree = s => !s.cust && !s.dirty.length;
export const spotDish = sp => sp && !sp.mess ? finished(sp.parts) : null;

// ---------- building dishes ----------
function settle(run, i){
  const sp = run.spots[i];
  if (!sp || sp.mess) return;
  if (!candidates(sp.parts).length && !rawInput(sp.parts)){ sp.mess = 'Wrong mix'; run.messes++; ev(run, 'mess', { spot: i }); return; }
  const dish = finished(sp.parts);
  if (dish){
    ev(run, 'dish', { spot: i, dish });
    // the next thing you build goes on a fresh spot
    if (run.active === i){ const e = run.spots.findIndex(s => !s); if (e >= 0) run.active = e; }
  }
}
function place(run, parts, mess, prefer){
  let i = prefer != null && !run.spots[prefer] ? prefer : !run.spots[run.active] ? run.active : run.spots.findIndex(s => !s);
  if (i < 0) return -1;
  run.spots[i] = { parts, mess };
  // hand focus to what just landed unless you were halfway through something else
  const cur = run.spots[run.active];
  if (!cur || cur === run.spots[i] || cur.mess || spotDish(cur)) run.active = i;
  return i;
}

// Click (or drag) an ingredient from its bin onto a spot. Returns an error string or null.
export function addIngredient(run, ing, i = run.active){
  if (run.over) return 'closed';
  if (!(run.stock[ing] > 0)) return `Out of ${INGREDIENTS[ing].name.toLowerCase()}. Phone the supplier.`;
  run.stock[ing]--;
  if (!run.spots[i]) run.spots[i] = { parts: [ing], mess: null };
  else run.spots[i].parts.push(ing);
  run.active = i;
  ev(run, 'add', { spot: i, ing });
  settle(run, i);
  return null;
}
export function selectSpot(run, i){ run.active = i; }

// Put something into an appliance: from a spot, or straight from its bin.
export function loadAppliance(run, key, from){
  const a = run.apps[key], def = APPLIANCES[key];
  if (a.part || a.ruined) return `The ${def.name.toLowerCase()} is busy.`;
  if (from.bin){
    if (from.bin !== def.takes) return `${INGREDIENTS[from.bin].name} doesn't go in the ${def.name.toLowerCase()}.`;
    if (!(run.stock[from.bin] > 0)) return `Out of ${INGREDIENTS[from.bin].name.toLowerCase()}. Phone the supplier.`;
    run.stock[from.bin]--;
  } else {
    const sp = run.spots[from.spot];
    if (!sp) return null;
    if (sp.mess || sp.parts.length !== 1 || sp.parts[0] !== def.takes) return `Only ${INGREDIENTS[def.takes].name.toLowerCase()} goes in the ${def.name.toLowerCase()}, on its own.`;
    run.spots[from.spot] = null;
  }
  Object.assign(a, { part: def.takes, t: 0, pull: 0, ruined: false });
  ev(run, 'load', { app: key });
  return null;
}

// Take whatever's in an appliance out onto a spot. Early = undercooked, which is a mess.
export function takeOut(run, key, prefer){
  const a = run.apps[key], def = APPLIANCES[key];
  if (a.ruined){ binAppliance(run, key); return null; }
  if (!a.part) return null;
  const early = a.t < def.ready;
  const i = place(run, early ? [def.takes] : [def.gives], early ? def.early : null, prefer);
  if (i < 0) return 'No room on the counter. Serve or bin something first.';
  Object.assign(a, { part: null, t: 0, pull: 0 });
  if (early){ run.messes++; ev(run, 'mess', { spot: i, why: def.early }); }
  else ev(run, 'out', { app: key, spot: i });
  settle(run, i);
  return null;
}
// The kettle is emptied by pulling the tea through the sock: hold for def.pull seconds.
export function holdPull(run, dt){
  const a = run.apps.kettle, def = APPLIANCES.kettle;
  if (!a.part || a.ruined) return null;
  if (!run.spots.some(s => !s)) return 'No room on the counter for a cup.';
  a.pull += dt;
  if (a.pull >= def.pull) return takeOut(run, 'kettle');
  return null;
}
export const releasePull = run => { run.apps.kettle.pull = 0; };

// Drag one spot onto another: moves it, or tips it in with what's there.
export function moveSpot(run, from, to){
  if (from === to) return null;
  const a = run.spots[from], b = run.spots[to];
  if (!a) return null;
  run.spots[from] = null;
  if (!b){ run.spots[to] = a; if (run.active === from) run.active = to; return null; }
  b.parts.push(...a.parts);
  if (a.mess && !b.mess){ b.mess = a.mess; }
  run.active = to;
  ev(run, 'add', { spot: to });
  settle(run, to);
  return null;
}

function waste(run, parts, mess){
  const cost = Math.round((partsCost(parts) + (mess ? DAY.messFee : 0)) * 100) / 100;
  run.waste += cost; run.cash -= cost;
  return cost;
}
export function binSpot(run, i){
  const sp = run.spots[i];
  if (!sp) return;
  const cost = waste(run, sp.parts, sp.mess);
  run.spots[i] = null;
  ev(run, 'bin', { spot: i, cost });
}
export function binAppliance(run, key){
  const a = run.apps[key], def = APPLIANCES[key];
  if (!a.part) return;
  const cost = waste(run, [def.takes], true);
  Object.assign(a, { part: null, t: 0, pull: 0, ruined: false });
  ev(run, 'bin', { app: key, cost });
}

// ---------- the counter ----------
export function serve(run, i, seat){
  const dish = spotDish(run.spots[i]), c = run.seats[seat].cust;
  if (!dish) return run.spots[i]?.mess ? 'That’s a mess. Drag it to the bin.' : 'That’s not finished yet.';
  if (!c || c.state !== 'wait') return 'Nobody’s waiting there.';
  const k = c.order.findIndex((d, j) => d === dish && !c.got[j]);
  if (k < 0) return `They didn’t order ${RECIPES[dish].zh}.`;
  c.got[k] = true;
  run.spots[i] = null;
  ev(run, 'serve', { seat, dish });
  if (c.got.every(Boolean)){ c.state = 'eat'; c.eat = 0; c.frac = c.patience / c.max; }
  return null;
}
export function clearSeat(run, seat){
  const s = run.seats[seat];
  if (!s.dirty.length || s.cust) return false;
  s.dirty = [];
  ev(run, 'clear', { seat });
  return true;
}

// ---------- the phone ----------
export const packPrice = (ing, express) => Math.round(INGREDIENTS[ing].unit * INGREDIENTS[ing].pack * (express ? DAY.expressMult : 1));
export function phoneOrder(run, ing, express){
  const cost = packPrice(ing, express);
  if (run.cash < cost) return `Not enough cash: that's $${cost}.`;
  if (run.deliveries.some(d => d.ing === ing)) return `${INGREDIENTS[ing].name} is already on its way.`;
  run.cash -= cost; run.stockSpent += cost;
  run.deliveries.push({ ing, eta: run.t + (express ? DAY.delivery.express : DAY.delivery.normal), total: express ? DAY.delivery.express : DAY.delivery.normal, express });
  ev(run, 'phone', { ing, express, cost });
  return null;
}

// ---------- time ----------
function arrive(run){
  const free = run.seats.map((s, i) => seatFree(s) ? i : -1).filter(i => i >= 0);
  if (!free.length) return false;
  const seat = free[Math.floor(run.rnd() * free.length)];
  const two = run.rnd() < DAY.twoItemChance;
  const order = [pick(run, ORDER_WEIGHTS)];
  if (two){ order.unshift('hotTea'); if (order[1] === 'hotTea') order[1] = pick(run, { butterBun: 1, condensedToast: 1, noodleSpam: 1 }); }
  const max = DAY.patience[order.length - 1];
  run.seats[seat].cust = { id: run.nextId++, order, got: order.map(() => false), patience: max, max, state: 'arrive', x: DOOR_X, look: Math.floor(run.rnd() * 1e6) };
  run.customers++;
  ev(run, 'arrive', { seat });
  return true;
}
function leave(run, seat, happy){
  const s = run.seats[seat], c = s.cust;
  // whatever they were served stays behind to be cleared
  s.dirty = c.order.filter((d, j) => c.got[j]).map(d => RECIPES[d].vessel);
  s.cust = null;
  run.walkers.push({ ...c, state: 'leave', happy, seat });
}

export function tick(run, dt, seatX){
  if (run.over) return;
  run.t += dt;
  const closing = run.t >= DAY.seconds;
  if (closing && !run.closed){ run.closed = true; ev(run, 'closing'); }

  if (!closing && run.t >= run.nextArrival && run.t < DAY.seconds - 10){
    if (arrive(run)){
      const ramp = 1 - .35 * run.t / DAY.seconds;
      run.nextArrival = run.t + (DAY.gap[0] + run.rnd() * (DAY.gap[1] - DAY.gap[0])) * ramp;
    } else run.nextArrival = run.t + .5;
  }

  run.seats.forEach((s, i) => {
    const c = s.cust;
    if (!c) return;
    if (c.state === 'arrive'){
      c.x = Math.max(seatX[i], c.x - SEAT_WALK * dt);
      if (c.x <= seatX[i]){ c.state = 'wait'; ev(run, 'order', { seat: i, order: c.order }); }
    } else if (c.state === 'wait'){
      c.patience -= dt;
      if (c.patience <= 0){ run.walkouts++; ev(run, 'walkout', { seat: i }); leave(run, i, false); }
    } else if (c.state === 'eat'){
      c.eat += dt;
      if (c.eat >= DAY.eatSecs){
        const price = c.order.reduce((sum, d) => sum + RECIPES[d].price, 0);
        const tip = Math.round(price * .5 * c.frac);
        run.sales += price; run.tips += tip; run.cash += price + tip; run.served++;
        ev(run, 'pay', { seat: i, price, tip });
        leave(run, i, true);
      }
    }
  });
  for (const w of run.walkers) w.x += SEAT_WALK * dt;
  run.walkers = run.walkers.filter(w => w.x < DOOR_X + 60);

  for (const [key, a] of Object.entries(run.apps)){
    if (!a.part || a.ruined) continue;
    const def = APPLIANCES[key], before = a.t;
    a.t += dt;
    if (before < def.ready && a.t >= def.ready) ev(run, 'ready', { app: key });
    if (a.t >= def.burn){ a.ruined = true; run.burnt++; ev(run, 'burnt', { app: key, why: def.late }); }
  }

  for (const d of run.deliveries.filter(d => run.t >= d.eta)){
    run.stock[d.ing] += INGREDIENTS[d.ing].pack;
    ev(run, 'delivery', { ing: d.ing });
  }
  run.deliveries = run.deliveries.filter(d => run.t < d.eta);

  // after closing time, the day ends once the last customer has gone (or a minute on, whatever happens)
  if (closing && (run.seats.every(s => !s.cust) || run.t >= DAY.seconds + 60)){
    run.over = true;
    ev(run, 'over');
  }
}

export const takings = run => run.sales + run.tips;
export const net = run => run.sales + run.tips - run.stockSpent - run.waste;
export function stars(run){
  const t = takings(run);
  return t >= DAY.target * 1.5 ? 3 : t >= DAY.target * 1.2 ? 2 : t >= DAY.target ? 1 : 0;
}
export { RECIPE_ORDER };
