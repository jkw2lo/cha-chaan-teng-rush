// Cha chaan teng (茶餐廳): everything on the menu, in the kitchen and in the dining room.
// The engine reads these through js/data.js once the theme is loaded.

export const INGREDIENTS = {
  tea:    { name: 'Tea leaves',      zh: '茶葉', glyph: '茶', pack: 20, cost: 40, delivery: 45, color: '#6b4a2f' },
  milk:   { name: 'Evaporated milk', zh: '淡奶', glyph: '奶', pack: 12, cost: 36, delivery: 45, color: '#2b2b2b' },
  ice:    { name: 'Ice',             zh: '冰',   glyph: '冰', pack: 20, cost: 20, delivery: 30, color: '#5aa7c9' },
  bun:    { name: 'Pineapple buns',  zh: '菠蘿包', jp: 'bo1 lo4 baau1', m: '個', glyph: '包', pack: 12, cost: 48, delivery: 60, color: '#d9952e' },
  butter: { name: 'Butter slices',   zh: '牛油', glyph: '油', pack: 16, cost: 32, delivery: 40, color: '#e2b93b' },
  bread:     { name: 'Sliced bread',   zh: '方包', glyph: '方', pack: 20, cost: 30, delivery: 50, color: '#c49a5c' },
  condensed: { name: 'Condensed milk', zh: '煉奶', glyph: '煉', pack: 20, cost: 30, delivery: 45, color: '#b89a52' },
  egg:       { name: 'Eggs',           zh: '雞蛋', glyph: '蛋', pack: 12, cost: 24, delivery: 40, color: '#d9a441' },
  syrup:     { name: 'Golden syrup',   zh: '糖漿', glyph: '糖', pack: 20, cost: 30, delivery: 45, color: '#a8641c' },
  noodles:   { name: 'Instant noodles', zh: '公仔麵', glyph: '麵', pack: 20, cost: 40, delivery: 45, color: '#c99a2e' },
  luncheon:  { name: 'Luncheon meat',  zh: '午餐肉', glyph: '午', pack: 12, cost: 48, delivery: 50, color: '#c4625a' },
  lemon:     { name: 'Lemons',         zh: '檸檬', glyph: '檸', pack: 20, cost: 30, delivery: 40, color: '#c9a91c' },
  coffee:    { name: 'Coffee',         zh: '咖啡', glyph: '啡', pack: 20, cost: 50, delivery: 45, color: '#5a3a24' },
  beef:      { name: 'Beef',           zh: '牛肉', glyph: '牛', pack: 12, cost: 72, delivery: 60, color: '#9e3b33' },
  sauce:     { name: 'Satay & soy',    zh: '醬料', glyph: '醬', pack: 20, cost: 30, delivery: 40, color: '#6b3a1f' },
  porkchop:  { name: 'Pork chops',     zh: '豬扒', glyph: '扒', pack: 12, cost: 60, delivery: 55, color: '#a0622e' },
  pastry:    { name: 'Tart pastry',    zh: '酥皮', glyph: '酥', pack: 20, cost: 40, delivery: 50, color: '#c29a52' },
  riceNoodle:{ name: 'Rice noodles',   zh: '河粉', glyph: '河', pack: 16, cost: 40, delivery: 50, color: '#a89878' },
};

// cook = seconds at a basic station; fresh = seconds it can sit on the pass before it's wasted
// level = restaurant level needed before the item (its station and ingredients) becomes available
export const MENU = {
  hotTea:    { name: 'Hot milk tea',              zh: '熱奶茶', jp: 'jit6 naai5 caa4', m: '杯', price: 18, recipe: { tea: 1, milk: 1 },         cook: 5, fresh: 50, weight: 3 },
  icedTea:   { name: 'Iced milk tea',             zh: '凍奶茶', jp: 'dung3 naai5 caa4', m: '杯', price: 20, recipe: { tea: 1, milk: 1, ice: 1 }, cook: 6, fresh: 40, weight: 3 },
  bun:       { name: 'Pineapple bun',             zh: '菠蘿包', price: 12, recipe: { bun: 1 },                  cook: 4, fresh: 90, weight: 2 },
  butterBun: { name: 'Pineapple bun with butter', zh: '菠蘿油', jp: 'bo1 lo4 jau4', m: '個', price: 16, recipe: { bun: 1, butter: 1 },       cook: 6, fresh: 60, weight: 2 },
  condensedToast: { name: 'Condensed milk toast', zh: '奶油多', jp: 'naai5 jau4 do1', m: '份', price: 16, recipe: { bread: 1, butter: 1, condensed: 1 }, cook: 5, fresh: 60, weight: 2, level: 2 },
  frenchToast:    { name: 'French toast',         zh: '西多士', jp: 'sai1 do1 si2', m: '份', price: 26, recipe: { bread: 2, egg: 1, butter: 1, syrup: 1 }, cook: 8, fresh: 50, weight: 2, level: 3 },
  noodleSpam:  { name: 'Luncheon meat & egg noodles', zh: '餐蛋麵', jp: 'caan1 daan6 min6', m: '碗', price: 38, recipe: { noodles: 1, luncheon: 1, egg: 1 },       cook: 9,  fresh: 45, weight: 2, level: 4 },
  lemonTea:    { name: 'Iced lemon tea',       zh: '凍檸茶', jp: 'dung3 ning4 caa4', m: '杯', price: 22, recipe: { tea: 1, lemon: 1, ice: 1, syrup: 1 },       cook: 6,  fresh: 40, weight: 3, level: 5 },
  yuenyeung:   { name: 'Yuenyeung (coffee & tea)', zh: '鴛鴦', jp: 'jyun1 joeng1', m: '杯', price: 22, recipe: { tea: 1, milk: 1, coffee: 1 },          cook: 6,  fresh: 50, weight: 2, level: 6 },
  satayBeef:   { name: 'Satay beef noodles',   zh: '沙嗲牛麵', jp: 'saa3 de1 ngau4 min6', m: '碗', price: 42, recipe: { noodles: 1, beef: 1, sauce: 1 },        cook: 10, fresh: 45, weight: 2, level: 7 },
  porkchopBun: { name: 'Pork chop bun',        zh: '豬扒包', jp: 'zyu1 paa1 baau1', m: '個', price: 36, recipe: { porkchop: 1, bun: 1 },                   cook: 9,  fresh: 55, weight: 2, level: 8 },
  eggTart:     { name: 'Egg tart',             zh: '蛋撻', jp: 'daan6 taat1', m: '個',   price: 14, recipe: { egg: 1, pastry: 1 },                     cook: 7,  fresh: 80, weight: 3, level: 9 },
  beefChowFun: { name: 'Beef chow fun',        zh: '乾炒牛河', jp: 'gon1 caau2 ngau4 ho2', m: '碟', price: 58, recipe: { riceNoodle: 1, beef: 1, sauce: 1 },     cook: 12, fresh: 40, weight: 2, level: 10 },
};
export const MENU_ORDER = ['hotTea', 'icedTea', 'bun', 'butterBun', 'condensedToast', 'frenchToast',
  'noodleSpam', 'lemonTea', 'yuenyeung', 'satayBeef', 'porkchopBun', 'eggTart', 'beefChowFun'];


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
  noodlePot:    { name: 'Noodle pot',           zh: '餐蛋麵', makes: 'noodleSpam',  speed: 1,  price: 400,  color: '#b8862e' },
  noodlePotPro: { name: 'Twin noodle boiler',   zh: '餐蛋麵', makes: 'noodleSpam',  speed: .6, price: 800,  color: '#8f6620', pro: true },
  lemonBar:     { name: 'Lemon tea bar',        zh: '凍檸茶', makes: 'lemonTea',    speed: 1,  price: 350,  color: '#b89a1c' },
  lemonBarPro:  { name: 'Lemon press bar',      zh: '凍檸茶', makes: 'lemonTea',    speed: .6, price: 700,  color: '#8f7812', pro: true },
  coffeeUrn:    { name: 'Coffee urn',           zh: '鴛鴦',   makes: 'yuenyeung',   speed: 1,  price: 380,  color: '#6b4a31' },
  coffeeUrnPro: { name: 'Copper coffee urn',    zh: '鴛鴦',   makes: 'yuenyeung',   speed: .6, price: 750,  color: '#4f3422', pro: true },
  satayPot:     { name: 'Satay pot',            zh: '沙嗲',   makes: 'satayBeef',   speed: 1,  price: 450,  color: '#9e4a26' },
  satayPotPro:  { name: 'Satay double pot',     zh: '沙嗲',   makes: 'satayBeef',   speed: .6, price: 900,  color: '#7a3518', pro: true },
  griddle:      { name: 'Pork chop griddle',    zh: '豬扒包', makes: 'porkchopBun', speed: 1,  price: 500,  color: '#5d656c' },
  griddlePro:   { name: 'Double griddle',       zh: '豬扒包', makes: 'porkchopBun', speed: .6, price: 950,  color: '#3f464c', pro: true },
  tartOven:     { name: 'Tart oven',            zh: '蛋撻',   makes: 'eggTart',     speed: 1,  price: 550,  color: '#c28a3a' },
  tartOvenPro:  { name: 'Deck tart oven',       zh: '蛋撻',   makes: 'eggTart',     speed: .6, price: 1000, color: '#9a6a24', pro: true },
  wok:          { name: 'Wok station',          zh: '乾炒牛河', makes: 'beefChowFun', speed: 1,  price: 700,  color: '#3b3f44' },
  wokPro:       { name: 'Jet-burner wok',       zh: '乾炒牛河', makes: 'beefChowFun', speed: .6, price: 1300, color: '#26292d', pro: true },
  shelf:        { name: 'Stock shelf',          zh: '貨架',   price: 120, color: '#8a6a50', storage: 1 },
  pass:         { name: 'Serving hatch',        zh: '出餐',   fixed: true, color: '#aab3ba' },
};
export const APPLIANCE_SHOP = ['shelf', 'hotTea', 'icedTea', 'bun', 'butterBun', 'toaster', 'fryer', 'noodlePot', 'lemonBar', 'coffeeUrn', 'satayPot', 'griddle', 'tartOven', 'wok',
  'hotTeaPro', 'icedTeaPro', 'bunPro', 'butterBunPro', 'toasterPro', 'fryerPro', 'noodlePotPro', 'lemonBarPro', 'coffeeUrnPro', 'satayPotPro', 'griddlePro', 'tartOvenPro', 'wokPro'];

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

  // premium pieces: open up at higher levels
  dragonMural:  { style: 'old',    kind: 'wall',    name: 'Dragon & phoenix mural', zh: '龍鳳壁畫', price: 600,  appeal: 22, level: 6 },
  rosewoodCab:  { style: 'old',    kind: 'block',   name: 'Rosewood display cabinet', zh: '酸枝櫃', price: 800, appeal: 26, level: 8 },
  goldSign:     { style: 'old',    kind: 'wall',    name: 'Gilded shop sign',    zh: '金漆招牌', price: 1500, appeal: 40, level: 10 },
  teaMural:     { style: 'simple', kind: 'wall',    name: 'Milk tea mural',      zh: '奶茶壁畫', price: 450,  appeal: 18, level: 6 },
  fishTank:     { style: 'simple', kind: 'block',   name: 'Goldfish tank',       zh: '金魚缸', price: 600,  appeal: 22, level: 8 },
  tramModel:    { style: 'simple', kind: 'block',   name: 'Ding-ding tram model', zh: '電車模型', price: 1200, appeal: 34, level: 10 },
  neonWall:     { style: 'modern', kind: 'wall',    name: 'Neon wall piece',     zh: '霓虹牆', price: 700,  appeal: 24, level: 6 },
  espressoBar:  { style: 'modern', kind: 'block',   name: 'Espresso bar',        zh: '咖啡吧', price: 900,  appeal: 28, level: 8 },
  chandelier:   { style: 'modern', kind: 'ceiling', name: 'Brass chandelier',    zh: '水晶吊燈', price: 1400, appeal: 38, level: 10 },

  concrete:     { style: 'simple', kind: 'floor',   name: 'Bare concrete',       zh: '石屎地', price: 0, appeal: 0, hidden: true },
};


// goals tied to particular dishes (the engine adds the general ones)
export const GOALS = [
  { id: 'iced',    kind: 'min', stat: 'sold.icedTea',   needs: 'icedTea',   n: d => 5 + d, label: n => `Sell ${n} iced milk teas` },
  { id: 'butter',  kind: 'min', stat: 'sold.butterBun', needs: 'butterBun', n: d => 4 + d, label: n => `Sell ${n} 菠蘿油` },
  { id: 'noodle',  kind: 'min', stat: 'sold.noodleSpam', needs: 'noodleSpam', n: d => 3 + Math.floor(d / 3), label: n => `Sell ${n} 餐蛋麵` },
  { id: 'lemon',   kind: 'min', stat: 'sold.lemonTea', needs: 'lemonTea', n: d => 4 + Math.floor(d / 3), label: n => `Sell ${n} 凍檸茶` },
  { id: 'tart',    kind: 'min', stat: 'sold.eggTart', needs: 'eggTart', n: d => 5 + Math.floor(d / 3), label: n => `Sell ${n} 蛋撻` },
  { id: 'wok',     kind: 'min', stat: 'sold.beefChowFun', needs: 'beefChowFun', n: d => 3 + Math.floor(d / 4), label: n => `Sell ${n} 乾炒牛河` },
];

export const STARTING = {
  money: 400,
  popularity: 30,
  stock: { tea: 16, milk: 12, ice: 0, bun: 12, butter: 0 },
  unlocked: ['hotTea', 'bun'],
};

// the shop you start with
export const LAYOUT = {
  kitchen: [
    { id: 1, type: 'pass',      x: 3, y: 6,  dir: 'S' },
    { id: 2, type: 'hotTea',    x: 0, y: 7,  dir: 'E' },
    { id: 3, type: 'icedTea',   x: 0, y: 9,  dir: 'E' },
    { id: 4, type: 'bun',       x: 6, y: 6,  dir: 'S' },
    { id: 5, type: 'butterBun', x: 7, y: 9,  dir: 'W' },
    { id: 6, type: 'shelf',     x: 7, y: 11, dir: 'W' },
  ],
  floor: 'concrete',
  items: [
    { id: 10, type: 'foldTable', x: 2, y: 3, dir: 'S' },
    { id: 11, type: 'foldTable', x: 5, y: 3, dir: 'S' },
    { id: 12, type: 'redStool',  x: 1, y: 3, dir: 'E' },
    { id: 13, type: 'redStool',  x: 3, y: 3, dir: 'W' },
    { id: 14, type: 'redStool',  x: 4, y: 3, dir: 'E' },
    { id: 15, type: 'redStool',  x: 6, y: 3, dir: 'W' },
  ],
  wall: [{ id: 20, type: 'menuStrips', x: 1 }],
};
