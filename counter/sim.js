// Counter Rush: one day at the counter. Pure state and rules, no drawing, so a script can play it.
// Everything the player does is one of the exported actions; tick() moves time on.
// Things worth a sound or a floating number are pushed onto run.events for the page to pick up.
import { INGREDIENTS, APPLIANCES, RECIPES, RECIPE_ORDER, RECIPE_STATION, START_STOCK, DAY, STATIONS, candidates, finished, partsCost, rawInput } from './recipes.js';
import { ENDLESS } from './levels.js';

const ORDER_WEIGHTS = { hotTea: 3, butterBun: 2, condensedToast: 2, noodleSpam: 2 };
export const SEAT_WALK = 320;          // px per second, customers walking along the counter
export const DOOR_X = 1230;            // they come in (and leave) through the door on the right

// cfg (levels.js runConfig): patience, pace, window, target, two (chance of a two-item order),
// open (station indices that are open), endless (Do or Die), plus labels for the page.
export function newRun(rnd = Math.random, cfg = {}){
  cfg = { patience: 1, pace: 1, window: 1, target: DAY.target, two: DAY.twoItemChance, open: STATIONS.map((_, i) => i), endless: false, ...cfg };
  const run = {
    rnd, cfg, t: 0, over: false, closed: false,
    target: cfg.target,
    cfgLabel: cfg.label || 'Normal',
    dayLabel: cfg.dayLabel || '',
    open: cfg.open,
    menu: RECIPE_ORDER.filter(r => cfg.open.includes(RECIPE_STATION[r])),
    // Do or Die: the level, how it plays, and the takings mark for the next one
    endless: cfg.endless, level: 1, lv: { pace: 1, patience: 1, two: cfg.two }, nextMark: 0,
    // each appliance's green window stretches or shrinks with the difficulty; `ready` stays put
    timing: Object.fromEntries(Object.entries(APPLIANCES).map(([k, a]) => [k, { ready: a.ready, burn: a.ready + (a.burn - a.ready) * cfg.window }])),
    cash: DAY.startCash, sales: 0, tips: 0, stockSpent: 0, waste: 0,
    served: 0, walkouts: 0, messes: 0, burnt: 0, customers: 0,
    stock: { ...START_STOCK },
    deliveries: [],                                      // { ing, eta, express }
    seats: Array.from({ length: DAY.seats }, () => ({ cust: null, dirty: [] })),
    walkers: [],                                         // customers on their way out
    spots: Array(DAY.spots).fill(null),                  // one per station: { parts: [], mess: null | 'why' }
    apps: Object.fromEntries(Object.keys(APPLIANCES).map(k => [k, { part: null, t: 0, pull: 0, ruined: false }])),
    nextArrival: DAY.firstAt,
    events: [],
    nextId: 1,
  };
  if (cfg.endless){ run.strikes = ENDLESS.strikes; run.lv = ENDLESS.level(1); run.nextMark = ENDLESS.mark(1); }
  return run;
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
  if (dish){ ev(run, 'dish', { spot: i, dish }); autoServe(run); }
}
export const stationOf = app => STATIONS.findIndex(st => st.app === app);
// whatever comes out of an appliance lands on its station's plate, tipped in with what's there
function place(run, parts, mess, i){
  const sp = run.spots[i];
  if (!sp){ run.spots[i] = { parts, mess }; return i; }
  if (spotDish(sp) || sp.mess) return -1;
  sp.parts.push(...parts);
  if (mess) sp.mess = mess;
  return i;
}

// Click a bin in station i: the raw part for its appliance goes in the appliance, anything else onto its plate.
export function useBin(run, ing, i){
  const st = STATIONS[i];
  if (!run.open.includes(i)) return `The ${st.name.toLowerCase()} station isn't open yet.`;
  if (st.app && APPLIANCES[st.app].takes === ing) return loadAppliance(run, st.app, { bin: ing });
  return addIngredient(run, ing, i);
}
// An ingredient onto station i's plate. Returns an error string or null.
export function addIngredient(run, ing, i){
  if (run.over) return 'closed';
  if (!(run.stock[ing] > 0)) return `Out of ${INGREDIENTS[ing].name.toLowerCase()}. Phone the supplier.`;
  run.stock[ing]--;
  if (!run.spots[i]) run.spots[i] = { parts: [ing], mess: null };
  else run.spots[i].parts.push(ing);
  ev(run, 'add', { spot: i, ing });
  settle(run, i);
  return null;
}

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
export function takeOut(run, key){
  const a = run.apps[key], def = { ...APPLIANCES[key], ...run.timing[key] };
  if (a.ruined){ binAppliance(run, key); return null; }
  if (!a.part) return null;
  const early = a.t < def.ready;
  const i = place(run, early ? [def.takes] : [def.gives], early ? def.early : null, stationOf(key));
  if (i < 0) return 'The plate below is full. Serve it or bin it first.';
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
  const sp = run.spots[stationOf('kettle')];
  if (sp && (spotDish(sp) || sp.mess)) return 'The cup below is full. Serve it or bin it first.';
  a.pull += dt;
  if (a.pull >= def.pull) return takeOut(run, 'kettle');
  return null;
}
export const releasePull = run => { run.apps.kettle.pull = 0; };

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
// A finished dish goes straight out to whoever ordered it, the most impatient first.
// One nobody has ordered waits on its plate until someone does.
function autoServe(run){
  run.spots.forEach((sp, i) => {
    const dish = spotDish(sp);
    if (!dish) return;
    let best = -1;
    run.seats.forEach((s, k) => {
      const c = s.cust;
      if (c && c.state === 'wait' && c.order.some((d, j) => d === dish && !c.got[j]) && (best < 0 || c.patience < run.seats[best].cust.patience)) best = k;
    });
    if (best < 0) return;
    const c = run.seats[best].cust;
    c.got[c.order.findIndex((d, j) => d === dish && !c.got[j])] = true;
    run.spots[i] = null;
    ev(run, 'serve', { seat: best, spot: i, dish });
    if (c.got.every(Boolean)){ c.state = 'eat'; c.eat = 0; c.frac = c.patience / c.max; }
  });
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
  // short of cash, the supplier puts it on your tab (賒數): cash goes negative rather than leaving you stuck with empty bins
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
  // only what today's open stations can make; a two-item order is a milk tea and something to eat
  const menu = Object.fromEntries(run.menu.map(r => [r, ORDER_WEIGHTS[r]])), food = run.menu.filter(r => r !== 'hotTea');
  const order = [pick(run, menu)];
  if (run.rnd() < run.lv.two && run.menu.includes('hotTea') && food.length){
    order.unshift('hotTea');
    if (order[1] === 'hotTea') order[1] = pick(run, Object.fromEntries(food.map(r => [r, 1])));
  }
  const max = DAY.patience[order.length - 1] * run.cfg.patience * run.lv.patience;
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
  const closing = !run.endless && run.t >= DAY.seconds;
  if (closing && !run.closed){ run.closed = true; ev(run, 'closing'); }

  if (!closing && run.t >= run.nextArrival && (run.endless || run.t < DAY.seconds - 10)){
    if (arrive(run)){
      // a day gets busier towards closing; Do or Die gets busier by level instead
      const ramp = run.endless ? 1 : 1 - .35 * run.t / DAY.seconds;
      run.nextArrival = run.t + (DAY.gap[0] + run.rnd() * (DAY.gap[1] - DAY.gap[0])) * ramp / (run.cfg.pace * run.lv.pace);
    } else run.nextArrival = run.t + .5;
  }

  run.seats.forEach((s, i) => {
    const c = s.cust;
    if (!c) return;
    if (c.state === 'arrive'){
      c.x = Math.max(seatX[i], c.x - SEAT_WALK * dt);
      if (c.x <= seatX[i]){ c.state = 'wait'; c.saidAt = run.t; ev(run, 'order', { seat: i, order: c.order }); autoServe(run); }
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
        if (run.endless) levelUp(run);
      }
    }
  });
  for (const w of run.walkers) w.x += SEAT_WALK * dt;
  run.walkers = run.walkers.filter(w => w.x < DOOR_X);

  for (const [key, a] of Object.entries(run.apps)){
    if (!a.part || a.ruined) continue;
    const def = { ...APPLIANCES[key], ...run.timing[key] }, before = a.t;
    a.t += dt;
    if (before < def.ready && a.t >= def.ready) ev(run, 'ready', { app: key });
    const warnAt = def.burn - (def.burn - def.ready) * .35;
    if (before < warnAt && a.t >= warnAt) ev(run, 'warn', { app: key });
    if (a.t >= def.burn){ a.ruined = true; run.burnt++; ev(run, 'burnt', { app: key, why: def.late }); }
  }

  for (const d of run.deliveries.filter(d => run.t >= d.eta)){
    run.stock[d.ing] += INGREDIENTS[d.ing].pack;
    ev(run, 'delivery', { ing: d.ing });
  }
  run.deliveries = run.deliveries.filter(d => run.t < d.eta);

  // Do or Die ends on the last strike
  if (run.endless && run.walkouts >= run.strikes){ run.over = true; ev(run, 'over'); return; }
  // after closing time, the day ends once the last customer has gone (or a minute on, whatever happens)
  if (closing && (run.seats.every(s => !s.cust) || run.t >= DAY.seconds + 60)){
    run.over = true;
    ev(run, 'over');
  }
}

// Do or Die: passing a takings mark is a new level, faster and less patient
function levelUp(run){
  while (takings(run) >= run.nextMark){
    run.level++;
    run.lv = ENDLESS.level(run.level);
    run.nextMark = ENDLESS.mark(run.level);
    ev(run, 'levelup', { level: run.level });
  }
}

export const takings = run => run.sales + run.tips;
export const net = run => run.sales + run.tips - run.stockSpent - run.waste;
export function stars(run){
  const t = takings(run);
  return t >= run.target * 1.5 ? 3 : t >= run.target * 1.2 ? 2 : t >= run.target ? 1 : 0;
}
export { RECIPE_ORDER };
