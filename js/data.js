// Everything the game is tuned by lives here. Adding a menu item means:
// an ingredient (if new), a MENU entry, and an appliance that `makes` it.

export const DAY_SECONDS = 720;          // one day = 12 real minutes
export const OPEN_HOUR = 7, CLOSE_HOUR = 18;
export const QUEUE_MAX = 5;
export const PASS_MAX = 5;               // the pass holds this many finished items; a full pass makes the cook wait
export const WALK_SPEED = 3.2;           // cook, cells per second
export const CUSTOMER_SPEED = 1.7;
export const WAITER_SPEED = 3.6;
export const WALKOUT_PENALTY = 4;        // popularity lost when a customer gives up
export const SELL_BACK = 0.5;            // refund when selling furniture or appliances

export const DINING_SIZES = [
  { w: 8,  price: 0,    name: 'Shopfront',               zh: '細舖' },
  { w: 10, price: 2500, name: 'Knock through next door', zh: '打通隔籬' },
  { w: 12, price: 6000, name: 'The whole ground floor',  zh: '成個地舖' },
];

// cost is per pack; delivery is seconds during a day (orders placed between days arrive before opening)
export const INGREDIENTS = {
  tea:    { name: 'Tea leaves',      zh: '茶葉', glyph: '茶', pack: 20, cost: 40, delivery: 45, color: '#6b4a2f' },
  milk:   { name: 'Evaporated milk', zh: '淡奶', glyph: '奶', pack: 12, cost: 36, delivery: 45, color: '#2b2b2b' },
  ice:    { name: 'Ice',             zh: '冰',   glyph: '冰', pack: 20, cost: 20, delivery: 30, color: '#5aa7c9' },
  bun:    { name: 'Pineapple buns',  zh: '菠蘿包', glyph: '包', pack: 12, cost: 48, delivery: 60, color: '#d9952e' },
  butter: { name: 'Butter slices',   zh: '牛油', glyph: '油', pack: 16, cost: 32, delivery: 40, color: '#e2b93b' },
  bread:     { name: 'Sliced bread',   zh: '方包', glyph: '方', pack: 20, cost: 30, delivery: 50, color: '#c49a5c' },
  condensed: { name: 'Condensed milk', zh: '煉奶', glyph: '煉', pack: 20, cost: 30, delivery: 45, color: '#b89a52' },
  egg:       { name: 'Eggs',           zh: '雞蛋', glyph: '蛋', pack: 12, cost: 24, delivery: 40, color: '#d9a441' },
  syrup:     { name: 'Golden syrup',   zh: '糖漿', glyph: '糖', pack: 20, cost: 30, delivery: 45, color: '#a8641c' },
};

// cook = seconds at a basic station; fresh = seconds it can sit on the pass before it's wasted
// level = restaurant level needed before the item (its station and ingredients) becomes available
export const MENU = {
  hotTea:    { name: 'Hot milk tea',              zh: '熱奶茶', price: 18, recipe: { tea: 1, milk: 1 },         cook: 5, fresh: 50, weight: 3 },
  icedTea:   { name: 'Iced milk tea',             zh: '凍奶茶', price: 20, recipe: { tea: 1, milk: 1, ice: 1 }, cook: 6, fresh: 40, weight: 3 },
  bun:       { name: 'Pineapple bun',             zh: '菠蘿包', price: 12, recipe: { bun: 1 },                  cook: 4, fresh: 90, weight: 2 },
  butterBun: { name: 'Pineapple bun with butter', zh: '菠蘿油', price: 16, recipe: { bun: 1, butter: 1 },       cook: 6, fresh: 60, weight: 2 },
  condensedToast: { name: 'Condensed milk toast', zh: '奶油多', price: 16, recipe: { bread: 1, butter: 1, condensed: 1 }, cook: 5, fresh: 60, weight: 2, level: 2 },
  frenchToast:    { name: 'French toast',         zh: '西多士', price: 26, recipe: { bread: 2, egg: 1, butter: 1, syrup: 1 }, cook: 8, fresh: 50, weight: 2, level: 3 },
};
export const MENU_ORDER = ['hotTea', 'icedTea', 'bun', 'butterBun', 'condensedToast', 'frenchToast'];
export const itemLevel = item => MENU[item].level || 1;

// Restaurant level comes from the stars you earn hitting daily targets (up to 3 a day).
// Reaching a level opens up new menu items: their station appears in the kitchen shop
// and their ingredients in the restock list.
export const LEVEL_STARS = [0, 3, 7, 12, 18, 25];      // total stars needed for level 1, 2, 3...
export const levelOf = stars => LEVEL_STARS.filter(n => stars >= n).length;

// Kitchen appliances. `speed` multiplies cook time (lower is faster).
export const APPLIANCES = {
  hotTea:       { name: 'Hot tea station',      zh: '熱奶茶', makes: 'hotTea',    speed: 1,   price: 250, color: '#c8553d' },
  hotTeaPro:    { name: 'Copper tea urn',       zh: '熱奶茶', makes: 'hotTea',    speed: .65, price: 600, color: '#9e3b28', pro: true },
  icedTea:      { name: 'Iced tea station',     zh: '凍奶茶', makes: 'icedTea',   speed: 1,   price: 250, color: '#3f7fae' },
  icedTeaPro:   { name: 'Ice-bath chiller',     zh: '凍奶茶', makes: 'icedTea',   speed: .65, price: 650, color: '#2c5f86', pro: true },
  bun:          { name: 'Bun warming cabinet',  zh: '菠蘿包', makes: 'bun',       speed: 1,   price: 200, color: '#9a6a3f' },
  bunPro:       { name: 'Twin-deck oven',       zh: '菠蘿包', makes: 'bun',       speed: .6,  price: 500, color: '#6f4a2a', pro: true },
  butterBun:    { name: 'Butter board',         zh: '菠蘿油', makes: 'butterBun', speed: 1,   price: 200, color: '#c9a227' },
  butterBunPro: { name: 'Chilled butter bar',   zh: '菠蘿油', makes: 'butterBun', speed: .6,  price: 450, color: '#a8841a', pro: true },
  toaster:      { name: 'Toaster',              zh: '奶油多', makes: 'condensedToast', speed: 1,   price: 350, color: '#7d868d' },
  toasterPro:   { name: 'Conveyor toaster',     zh: '奶油多', makes: 'condensedToast', speed: .6,  price: 700, color: '#5d656c', pro: true },
  fryer:        { name: 'French toast pan',     zh: '西多士', makes: 'frenchToast',    speed: 1,   price: 450, color: '#8a4a2f' },
  fryerPro:     { name: 'Deep fryer',           zh: '西多士', makes: 'frenchToast',    speed: .6,  price: 850, color: '#6a3520', pro: true },
  shelf:        { name: 'Stock shelf',          zh: '貨架',   price: 120, color: '#8a6a50', storage: 1 },
  pass:         { name: 'Serving hatch',        zh: '出餐',   fixed: true, color: '#aab3ba' },
};
export const APPLIANCE_SHOP = ['hotTea', 'icedTea', 'bun', 'butterBun', 'toaster', 'fryer', 'hotTeaPro', 'icedTeaPro', 'bunPro', 'butterBunPro', 'toasterPro', 'fryerPro', 'shelf'];

export const STYLES = {
  old:    { name: 'Old school', zh: '老派' },
  simple: { name: 'Simple',     zh: '簡約' },
  modern: { name: 'Modern',     zh: '新派' },
};
// kind: table | seat | block (blocks walking) | ceiling (hangs above, doesn't block) | wall (back wall) | floor
export const DECOR = {
  formicaTable: { style: 'old',    kind: 'table',   name: 'Formica table',       zh: '膠板枱', price: 120, appeal: 6 },
  boothSeat:    { style: 'old',    kind: 'seat',    name: 'Green vinyl booth',   zh: '卡位',   price: 140, appeal: 7 },
  crossChair:   { style: 'old',    kind: 'seat',    name: 'Cross-back chair',    zh: '木椅',   price: 60, appeal: 4 },
  cashier:      { style: 'old',    kind: 'block',   name: 'Glass cashier counter', zh: '收銀櫃', price: 260, appeal: 12 },
  ceilingFan:   { style: 'old',    kind: 'ceiling', name: 'Ceiling fan',         zh: '吊扇',   price: 180, appeal: 10 },
  mirrorMenu:   { style: 'old',    kind: 'wall',    name: 'Painted mirror menu', zh: '鏡面餐牌', price: 150, appeal: 12 },
  chromeStool:  { style: 'old',    kind: 'seat',    name: 'Chrome bar stool',    zh: '鐵腳櫈', price: 45, appeal: 3 },
  birdcage:     { style: 'old',    kind: 'ceiling', name: 'Hanging birdcage',    zh: '雀籠',   price: 160, appeal: 9 },
  calendar:     { style: 'old',    kind: 'wall',    name: 'Tear-off calendar',   zh: '月曆',   price: 60, appeal: 6 },
  mosaic:       { style: 'old',    kind: 'floor',   name: 'Mosaic tiles',        zh: '紙皮石', price: 400, appeal: 25 },

  foldTable:    { style: 'simple', kind: 'table',   name: 'Folding table',       zh: '摺枱',   price: 60, appeal: 2 },
  redStool:     { style: 'simple', kind: 'seat',    name: 'Red plastic stool',   zh: '膠櫈',   price: 20, appeal: 1 },
  metalChair:   { style: 'simple', kind: 'seat',    name: 'Metal chair',         zh: '鐵椅',   price: 35, appeal: 2 },
  luckyBamboo:  { style: 'simple', kind: 'block',   name: 'Lucky bamboo',        zh: '富貴竹', price: 45, appeal: 5 },
  menuStrips:   { style: 'simple', kind: 'wall',    name: 'Paper menu strips',   zh: '餐牌紙', price: 30, appeal: 4 },
  wallClock:    { style: 'simple', kind: 'wall',    name: 'Wall clock',          zh: '掛鐘',   price: 40, appeal: 4 },
  waterDispenser: { style: 'simple', kind: 'block', name: 'Water dispenser',     zh: '蒸餾水機', price: 70, appeal: 3 },
  drinksFridge: { style: 'simple', kind: 'block',   name: 'Drinks fridge',       zh: '汽水雪櫃', price: 150, appeal: 6 },
  raceTV:       { style: 'simple', kind: 'wall',    name: 'TV showing the races', zh: '賽馬電視', price: 180, appeal: 8 },
  whiteTiles:   { style: 'simple', kind: 'floor',   name: 'White tiles',         zh: '白瓷磚', price: 150, appeal: 10 },

  marbleTable:  { style: 'modern', kind: 'table',   name: 'Marble table',        zh: '雲石枱', price: 220, appeal: 9 },
  rattanChair:  { style: 'modern', kind: 'seat',    name: 'Rattan chair',        zh: '藤椅',   price: 110, appeal: 6 },
  bigPlant:     { style: 'modern', kind: 'block',   name: 'Fiddle-leaf fig',     zh: '琴葉榕', price: 90, appeal: 8 },
  pendant:      { style: 'modern', kind: 'ceiling', name: 'Pendant lamp',        zh: '吊燈',   price: 140, appeal: 9 },
  neonSign:     { style: 'modern', kind: 'wall',    name: 'Neon sign',           zh: '霓虹燈', price: 300, appeal: 16 },
  timberBench:  { style: 'modern', kind: 'seat',    name: 'Timber bench',        zh: '木長櫈', price: 90, appeal: 5 },
  globeLamp:    { style: 'modern', kind: 'ceiling', name: 'Globe lamp',          zh: '球形燈', price: 120, appeal: 8 },
  lightbox:     { style: 'modern', kind: 'wall',    name: 'Lightbox menu',       zh: '燈箱餐牌', price: 220, appeal: 12 },
  terrazzo:     { style: 'modern', kind: 'floor',   name: 'Terrazzo',            zh: '水磨石', price: 500, appeal: 28 },

  concrete:     { style: 'simple', kind: 'floor',   name: 'Bare concrete',       zh: '石屎地', price: 0, appeal: 0, hidden: true },
};

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
export const salesTarget = day => Math.round((450 + 150 * (day - 1)) / 50) * 50;
export const TARGET_REWARD = { cash: 100, popularity: 3 }, GOAL_REWARD = 60;
export const GOALS = [
  { id: 'tickets', kind: 'min', stat: 'served',   n: d => 10 + 3 * d, label: n => `Serve ${n} tickets` },
  { id: 'tips',    kind: 'min', stat: 'tips',     n: d => 50 + 20 * d, label: n => `Earn $${n} in tips` },
  { id: 'fast',    kind: 'min', stat: 'fast',     n: d => 4 + 2 * d,  label: n => `${n} tickets out with half their time left` },
  { id: 'walk',    kind: 'max', stat: 'walkouts', n: () => 2,         label: n => `No more than ${n} walkouts` },
  { id: 'waste',   kind: 'max', stat: 'waste',    n: () => 0,         label: () => 'Waste nothing' },
  { id: 'iced',    kind: 'min', stat: 'sold.icedTea',   needs: 'icedTea',   n: d => 5 + d, label: n => `Sell ${n} iced milk teas` },
  { id: 'butter',  kind: 'min', stat: 'sold.butterBun', needs: 'butterBun', n: d => 4 + d, label: n => `Sell ${n} 菠蘿油` },
];

export const STARTING = {
  money: 400,
  popularity: 30,
  stock: { tea: 16, milk: 12, ice: 0, bun: 12, butter: 0 },
  unlocked: ['hotTea', 'bun'],
};
