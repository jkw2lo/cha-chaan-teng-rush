// Counter Rush: what's in the bins, what the appliances do, and what each dish is made of.
// A dish in progress is a bag of parts. Raw ingredients come out of the bins; appliances turn
// one raw part into a cooked one (bread -> toast). A bag is fine as long as it could still
// become some dish; anything else is a mess that has to be binned.

// unit = cost of one serving's worth; pack = how many units a phone order brings
export const INGREDIENTS = {
  tea:       { name: 'Tea leaves',      zh: '茶葉',   short: 'Tea',      unit: 1.5, pack: 10 },
  milk:      { name: 'Evaporated milk', zh: '淡奶',   short: 'Evap milk', unit: 1.5, pack: 10 },
  bun:       { name: 'Pineapple bun',   zh: '菠蘿包', short: 'Bun',      unit: 3,   pack: 8 },
  butter:    { name: 'Butter',          zh: '牛油',   short: 'Butter',   unit: 1,   pack: 10 },
  bread:     { name: 'Thick bread',     zh: '方包',   short: 'Bread',    unit: 1.5, pack: 10 },
  condensed: { name: 'Condensed milk',  zh: '煉奶',   short: 'Cond milk', unit: 1,   pack: 10 },
  noodles:   { name: 'Instant noodles', zh: '公仔麵', short: 'Noodles',  unit: 2,   pack: 8 },
  luncheon:  { name: 'Luncheon meat',   zh: '午餐肉', short: 'Luncheon', unit: 3,   pack: 8 },
  egg:       { name: 'Fried egg',       zh: '煎蛋',   short: 'Egg',      unit: 1.5, pack: 10 },
};
export const BIN_ORDER = ['tea', 'milk', 'bun', 'butter', 'bread', 'condensed', 'noodles', 'luncheon', 'egg'];

// The prep area is four stations, each a column: its ingredients on top, its appliance (or the bun
// cabinet) in the middle, and its own cup, plate or bowl at the bottom where the dish comes together.
// Butter sits in two stations; both bins draw on the same stock.
export const STATIONS = [
  { id: 'drinks',  zh: '飲品', name: 'Drinks',  bins: ['tea', 'milk'],                 app: 'kettle',  vessel: 'cup',   color: '#1f5a8a' },
  { id: 'buns',    zh: '麵包', name: 'Buns',    bins: ['butter'],                      cabinet: 'bun', vessel: 'plate', color: '#b87a14' },
  { id: 'toast',   zh: '多士', name: 'Toast',   bins: ['bread', 'butter', 'condensed'], app: 'toaster', vessel: 'plate', color: '#b3261e' },
  { id: 'noodles', zh: '粉麵', name: 'Noodles', bins: ['noodles', 'luncheon', 'egg'],   app: 'pot',     vessel: 'bowl',  color: '#2f6f4e' },
];
// which station makes each dish
export const RECIPE_STATION = { hotTea: 0, butterBun: 1, condensedToast: 2, noodleSpam: 3 };
export const VESSEL_NAME = { cup: ['杯', 'Cup'], plate: ['碟', 'Plate'], bowl: ['碗', 'Bowl'] };
export const START_STOCK = { tea: 7, milk: 7, bun: 5, butter: 8, bread: 5, condensed: 5, noodles: 4, luncheon: 4, egg: 5 };

// Cooked parts: what they're called on the counter.
export const PARTS = {
  brewTea:   { name: 'Pulled tea',      zh: '奶茶底' },
  toast:     { name: 'Toast',           zh: '多士' },
  boiled:    { name: 'Noodles',         zh: '麵' },
};

// Timed appliances. `takes` is the one raw part that goes in; `gives` comes out if it's taken out
// between `ready` and `burn` seconds. Out too early is `early` (undercooked); left past `burn` it's ruined.
// The kettle is emptied by pulling the tea through the sock (click and hold for `pull` seconds).
export const APPLIANCES = {
  kettle:  { name: 'Kettle & tea sock', zh: '茶壺', takes: 'tea',     gives: 'brewTea', ready: 5,   burn: 12, pull: 1.1,
             early: 'Weak tea', late: 'Stewed tea' },
  toaster: { name: 'Toaster',           zh: '多士爐', takes: 'bread',   gives: 'toast',   ready: 4,   burn: 8.5,
             early: 'Pale toast', late: 'Burnt toast' },
  pot:     { name: 'Noodle pot',        zh: '麵煲', takes: 'noodles', gives: 'boiled',  ready: 6,   burn: 13,
             early: 'Hard noodles', late: 'Mushy noodles' },
};
export const APPLIANCE_ORDER = ['kettle', 'toaster', 'pot'];

// Dishes use the cha chaan teng theme's menu keys, so its icons and Cantonese names fit straight in.
// vessel: what the finished dish (and the empty one left behind) sits in.
export const RECIPES = {
  hotTea:         { name: 'Hot milk tea',   zh: '熱奶茶', jp: 'jit6 naai5 caa4', price: 18, vessel: 'cup',   parts: ['brewTea', 'milk'],
                    steps: ['Click tea leaves: they go in the kettle', 'When the bar is green, hold on the kettle to pull the tea', 'Click evaporated milk'] },
  butterBun:      { name: 'Pineapple bun with butter', zh: '菠蘿油', jp: 'bo1 lo4 jau4', price: 16, vessel: 'plate', parts: ['bun', 'butter'],
                    steps: ['Click the bun cabinet', 'Click butter'] },
  condensedToast: { name: 'Condensed milk toast', zh: '奶油多', jp: 'naai5 jau4 do1', price: 18, vessel: 'plate', parts: ['toast', 'butter', 'condensed'],
                    steps: ['Click bread: it goes in the toaster', 'Click the toaster when it’s golden', 'Click butter and condensed milk'] },
  noodleSpam:     { name: 'Luncheon meat & egg noodles', zh: '餐蛋麵', jp: 'caan1 daan6 min6', price: 34, vessel: 'bowl', parts: ['boiled', 'luncheon', 'egg'],
                    steps: ['Click noodles: they go in the pot', 'Click the pot when they’re soft', 'Click luncheon meat and egg'] },
};
export const RECIPE_ORDER = ['hotTea', 'butterBun', 'condensedToast', 'noodleSpam'];

export const partName = p => (INGREDIENTS[p] || PARTS[p] || { name: p }).name;
export const partZh = p => (INGREDIENTS[p] || PARTS[p] || { zh: '' }).zh;

const count = arr => arr.reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {});
// recipes this bag of parts could still turn into
export function candidates(parts){
  const have = count(parts);
  return RECIPE_ORDER.filter(r => {
    const need = count(RECIPES[r].parts);
    return Object.entries(have).every(([k, n]) => (need[k] || 0) >= n);
  });
}
// a raw part that's waiting to go into its appliance (bread for the toaster) is fine on its own
export const rawInput = parts => parts.length === 1 && Object.values(APPLIANCES).some(a => a.takes === parts[0]);
// the finished dish, if the bag is exactly one recipe
export function finished(parts){
  return candidates(parts).find(r => RECIPES[r].parts.length === parts.length) || null;
}
// what's still missing for a recipe
export function missing(parts, r){
  const left = [...RECIPES[r].parts];
  for (const p of parts){ const i = left.indexOf(p); if (i >= 0) left.splice(i, 1); }
  return left;
}
// what a bag of parts would have cost
export const partsCost = parts => parts.reduce((s, p) => s + (INGREDIENTS[p]?.unit ?? INGREDIENTS[rawOf(p)]?.unit ?? 0), 0);
const rawOf = p => Object.values(APPLIANCES).find(a => a.gives === p)?.takes;
// the vessel a bag sits in, from what it's heading towards
export function vesselOf(parts){
  if (rawInput(parts)) return parts[0] === 'tea' ? 'tin' : 'board';
  const c = candidates(parts);
  return c.length ? RECIPES[c[0]].vessel : 'plate';
}

// ---------- the day ----------
export const DAY = {
  seconds: 180,            // about three minutes
  seats: 4,
  spots: 4,                // one plate per station
  target: 400,             // takings (sales + tips) to hit on Normal; tuned with a bot needing ~2.3s per action
  startCash: 40,
  eatSecs: 4.5,
  patience: [50, 64],      // seconds for one item, two items
  firstAt: 2,
  gap: [5, 11],            // seconds between arrivals while a seat is free
  twoItemChance: .35,
  expressMult: 1.6,
  delivery: { normal: 22, express: 6 },
  messFee: 2,              // cleaning up on top of the wasted ingredients
};
