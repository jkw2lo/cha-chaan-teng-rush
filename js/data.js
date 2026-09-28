// Engine tuning, plus the active theme's content (menu, ingredients, appliances, decor).
// A theme is loaded once at start-up with useTheme(); everything else imports from here,
// so the rest of the engine never needs to know which restaurant it's running.

export const DAY_SECONDS = 720;          // one day = 12 real minutes
export const OPEN_HOUR = 7, CLOSE_HOUR = 18;
export const QUEUE_MAX = 5;
export let PASS_MAX = 5;                 // the pass holds this many finished items; a full pass makes the cook wait (themes can change it)
export const WALK_SPEED = 3.2;           // cook, cells per second
export const CUSTOMER_SPEED = 1.7;
export const WAITER_SPEED = 3.6;
export const WALKOUT_PENALTY = 2.5;        // popularity lost when a customer gives up
export const SELL_BACK = 0.5;            // refund when selling furniture or appliances

// The kitchen can be knocked through too, once you reach the level for it.
export const KITCHEN_SIZES = [
  { w: 8,  price: 0,    level: 1, name: 'Galley kitchen',        zh: '細廚房' },
  { w: 10, price: 3500, level: 5, name: 'Knock into the store room', zh: '打通貨倉' },
  { w: 12, price: 8000, level: 8, name: 'Full back-of-house',    zh: '大廚房' },
];

export const DINING_SIZES = [
  { w: 8,  price: 0,    name: 'Shopfront',               zh: '細舖' },
  { w: 10, price: 2500, name: 'Knock through next door', zh: '打通隔籬' },
  { w: 12, price: 6000, name: 'The whole ground floor',  zh: '成個地舖' },
];

// cost is per pack; delivery is seconds during a day (orders placed between days arrive before opening)

// ---------- the active theme ----------
export let THEME = null;
export let INGREDIENTS = {}, MENU = {}, MENU_ORDER = [], APPLIANCES = {}, APPLIANCE_SHOP = [], STYLES = {}, DECOR = {}, STARTING = {}, GOALS = [];
export const itemLevel = item => MENU[item].level || 1;
export function useTheme(t){
  THEME = t;
  ({ INGREDIENTS, MENU, MENU_ORDER, APPLIANCES, APPLIANCE_SHOP, STYLES, DECOR, STARTING } = t.data);
  GOALS = [...BASE_GOALS, ...(t.data.GOALS || [])];
  PASS_MAX = t.meta.passMax || 5;
}

// Restaurant level comes from the stars you earn hitting daily targets (up to 3 a day).
// Reaching a level opens up new menu items: their station appears in the kitchen shop
// and their ingredients in the restock list.
export const LEVEL_STARS = [0, 3, 7, 12, 17, 23, 29, 36, 43, 50];   // total stars needed for level 1..10
export const MAX_LEVEL = LEVEL_STARS.length;
export const levelOf = stars => LEVEL_STARS.filter(n => stars >= n).length;

// Storage: every ingredient holds BASE_PACKS packs, plus one more per stock shelf in the kitchen.
export const BASE_PACKS = 2;

// Ambience: each piece of decor has appeal points. Pieces of the same style
// multiply each other: ×(1 + SET_STEP per extra piece), capped at SET_CAP.
// Scored out of AMBIENCE_MAX: that's where the bonus (more customers, bigger tips) tops out.
export const SET_STEP = .08, SET_CAP = 2, AMBIENCE_MAX = 200;
export const AMBIENCE_TIERS = [
  { min: 0,   name: 'Bare bones',              zh: '簡陋' },
  { min: 30,  name: 'Homely',                  zh: '溫馨' },
  { min: 70,  name: 'Charming',                zh: '有格調' },
  { min: 120, name: 'Neighbourhood favourite', zh: '街坊至愛' },
  { min: 200, name: 'Famous for its look',     zh: '打卡熱點' },
];

// Daily targets. Every day has a sales target plus two goals picked for that day.
// Hitting the sales target pays a bonus and popularity; each goal pays a smaller bonus.
// The sales target follows your level (more dishes, more you can sell) with a gentle nudge each day.
// Tuned so a steady player earns about 2 stars a day and reaches level 10 in roughly a month of days.
const TARGET_BY_LEVEL = [650, 850, 1050, 1200, 1350, 1500, 1600, 1700, 1800, 1900];
export const salesTarget = (day, lvl = 1) => Math.round((TARGET_BY_LEVEL[Math.min(lvl, TARGET_BY_LEVEL.length) - 1] + 8 * (day - 1)) / 50) * 50;
export const TARGET_REWARD = { cash: 100, popularity: 3 }, GOAL_REWARD = 60;
const BASE_GOALS = [
  { id: 'tickets', kind: 'min', stat: 'served',   n: d => 10 + 3 * d, label: n => `Serve ${n} tickets` },
  { id: 'tips',    kind: 'min', stat: 'tips',     n: d => 50 + 20 * d, label: n => `Earn $${n} in tips` },
  { id: 'fast',    kind: 'min', stat: 'fast',     n: d => 4 + 2 * d,  label: n => `${n} tickets out with half their time left` },
  { id: 'walk',    kind: 'max', stat: 'walkouts', n: () => 2,         label: n => `No more than ${n} walkouts` },
  { id: 'waste',   kind: 'max', stat: 'waste',    n: () => 0,         label: () => 'Waste nothing' },
];


