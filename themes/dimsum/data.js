// Dim sum teahouse (飲茶): a Sunday-morning 酒樓. Finished baskets ride out on the trolley,
// and every table wants its tea.

// cost is per pack; delivery is seconds during a day (orders placed between days arrive before opening)
export const INGREDIENTS = {
  tea:      { name: 'Pu-erh tea leaves', zh: '普洱', glyph: '茶', pack: 20, cost: 40, delivery: 45, color: '#5a3a24' },
  shrimp:   { name: 'Shrimp',            zh: '蝦',   glyph: '蝦', pack: 12, cost: 60, delivery: 55, color: '#d9776f' },
  pork:     { name: 'Minced pork',       zh: '豬肉', glyph: '豬', pack: 12, cost: 48, delivery: 50, color: '#b8625a' },
  wrapper:  { name: 'Dumpling wrappers', zh: '餃皮', glyph: '皮', pack: 20, cost: 30, delivery: 40, color: '#b9a27a' },
  charsiu:  { name: 'Char siu',          zh: '叉燒', glyph: '叉', pack: 12, cost: 60, delivery: 55, color: '#a8322a' },
  dough:    { name: 'Bao dough',         zh: '麵粉', glyph: '麵', pack: 20, cost: 30, delivery: 40, color: '#b8ab8e' },
  batter:   { name: 'Rice-roll batter',  zh: '米漿', glyph: '米', pack: 16, cost: 32, delivery: 45, color: '#a9a38f' },
  turnip:   { name: 'Turnip cake',       zh: '蘿蔔糕', glyph: '蘿', pack: 12, cost: 36, delivery: 50, color: '#b99a5a' },
  feet:     { name: 'Chicken feet',      zh: '鳳爪', glyph: '爪', pack: 12, cost: 42, delivery: 55, color: '#b4532a' },
  blackbean:{ name: 'Black bean sauce',  zh: '豉汁', glyph: '豉', pack: 20, cost: 30, delivery: 40, color: '#3b2a24' },
  ribs:     { name: 'Spare ribs',        zh: '排骨', glyph: '骨', pack: 12, cost: 60, delivery: 55, color: '#9a4a3a' },
  glutinous:{ name: 'Glutinous rice',    zh: '糯米', glyph: '糯', pack: 16, cost: 36, delivery: 45, color: '#a39a86' },
  chicken:  { name: 'Chicken',           zh: '雞肉', glyph: '雞', pack: 12, cost: 48, delivery: 50, color: '#c49a5c' },
  custard:  { name: 'Salted-egg custard', zh: '流沙', glyph: '沙', pack: 16, cost: 44, delivery: 50, color: '#d9a42a' },
  pastry:   { name: 'Tart pastry',       zh: '酥皮', glyph: '酥', pack: 20, cost: 40, delivery: 50, color: '#c29a52' },
  egg:      { name: 'Eggs',              zh: '雞蛋', glyph: '蛋', pack: 12, cost: 24, delivery: 40, color: '#d9a441' },
  broth:    { name: 'Superior broth',    zh: '上湯', glyph: '湯', pack: 12, cost: 54, delivery: 55, color: '#b8862e' },
};

// Prices are per basket/plate; each job makes one. m = measure word (籠 basket, 碟 plate, 壺 pot, 個 piece, 盅 soup cup).
export const MENU = {
  puer:        { name: 'Pu-erh tea',           zh: '普洱茶', jp: 'pou2 nei2 caa4', m: '壺', price: 9, recipe: { tea: 1 },                     cook: 4,  fresh: 70, weight: 4 },
  harGow:      { name: 'Shrimp dumplings',     zh: '蝦餃',   jp: 'haa1 gaau2',     m: '籠', price: 14, recipe: { shrimp: 1, wrapper: 1 },       cook: 5, fresh: 60, weight: 3 },
  siuMai:      { name: 'Pork dumplings',       zh: '燒賣',   jp: 'siu1 maai2',     m: '籠', price: 13, recipe: { pork: 1, wrapper: 1 },         cook: 5, fresh: 60, weight: 3 },
  charSiuBao:  { name: 'Char siu buns',        zh: '叉燒包', jp: 'caa1 siu1 baau1', m: '籠', price: 12, recipe: { charsiu: 1, dough: 1 },        cook: 6, fresh: 70, weight: 3 },
  cheungFun:   { name: 'Rice noodle rolls',    zh: '腸粉',   jp: 'coeng4 fan2',    m: '碟', price: 17, recipe: { batter: 1, shrimp: 1 },        cook: 6,  fresh: 45, weight: 2, level: 2 },
  turnipCake:  { name: 'Turnip cake',          zh: '蘿蔔糕', jp: 'lo4 baak6 gou1', m: '碟', price: 13, recipe: { turnip: 1 },                   cook: 5,  fresh: 60, weight: 2, level: 3 },
  chickenFeet: { name: 'Phoenix claws',        zh: '鳳爪',   jp: 'fung6 zaau2',    m: '碟', price: 12, recipe: { feet: 1, blackbean: 1 },       cook: 6, fresh: 70, weight: 2, level: 4 },
  spareRibs:   { name: 'Black bean spare ribs', zh: '豉汁排骨', jp: 'si6 zap1 paai4 gwat1', m: '碟', price: 13, recipe: { ribs: 1, blackbean: 1 }, cook: 6, fresh: 60, weight: 2, level: 5 },
  loMaiGai:    { name: 'Sticky rice in lotus leaf', zh: '糯米雞', jp: 'no6 mai5 gai1', m: '個', price: 14, recipe: { glutinous: 1, chicken: 1 }, cook: 7, fresh: 80, weight: 2, level: 6 },
  springRoll:  { name: 'Spring rolls',         zh: '春卷',   jp: 'ceon1 gyun2',    m: '碟', price: 12, recipe: { wrapper: 1, pork: 1 },         cook: 5,  fresh: 45, weight: 2, level: 7 },
  custardBun:  { name: 'Molten custard buns',  zh: '流沙包', jp: 'lau4 saa1 baau1', m: '籠', price: 13, recipe: { dough: 1, custard: 1 },       cook: 6, fresh: 60, weight: 2, level: 8 },
  eggTart:     { name: 'Egg tarts',            zh: '蛋撻',   jp: 'daan6 taat1',    m: '碟', price: 9, recipe: { pastry: 1, egg: 1 },           cook: 5, fresh: 80, weight: 2, level: 9 },
  soupDumpling:{ name: 'Soup dumpling',        zh: '灌湯餃', jp: 'gun3 tong1 gaau2', m: '盅', price: 28, recipe: { shrimp: 1, pork: 1, broth: 1 }, cook: 8, fresh: 45, weight: 2, level: 10 },
};
export const MENU_ORDER = ['puer', 'harGow', 'siuMai', 'charSiuBao', 'cheungFun', 'turnipCake', 'chickenFeet', 'spareRibs', 'loMaiGai', 'springRoll', 'custardBun', 'eggTart', 'soupDumpling'];

// Kitchen appliances. `speed` multiplies cook time (lower is faster).
const st = (name, zh, makes, price, color, pro) => ({ name, zh, makes, speed: pro ? .6 : 1, price, color, ...(pro ? { pro: true } : {}) });
export const APPLIANCES = {
  teaStation:    st('Tea station',           '普洱',   'puer',         250, '#6b4a31'),
  teaStationPro: st('Twin tea urns',         '普洱',   'puer',         600, '#4f3422', true),
  hgSteamer:     st('Har gow steamer',       '蝦餃',   'harGow',       300, '#b24a3a'),
  hgSteamerPro:  st('Tower steamer (har gow)', '蝦餃', 'harGow',       700, '#8a3428', true),
  smSteamer:     st('Siu mai steamer',       '燒賣',   'siuMai',       300, '#c9862e'),
  smSteamerPro:  st('Tower steamer (siu mai)', '燒賣', 'siuMai',       700, '#9e6620', true),
  baoSteamer:    st('Bao steamer',           '叉燒包', 'charSiuBao',   300, '#a8322a'),
  baoSteamerPro: st('Tower steamer (bao)',   '叉燒包', 'charSiuBao',   700, '#80241e', true),
  cheungFunTray: st('Rice-roll steamer',     '腸粉',   'cheungFun',    400, '#7d868d'),
  cheungFunPro:  st('Twin rice-roll steamer', '腸粉',  'cheungFun',    800, '#5d656c', true),
  turnipPan:     st('Turnip cake griddle',   '蘿蔔糕', 'turnipCake',   380, '#4a4f55'),
  turnipPanPro:  st('Wide griddle',          '蘿蔔糕', 'turnipCake',   750, '#33373c', true),
  feetSteamer:   st('Phoenix claw steamer',  '鳳爪',   'chickenFeet',  420, '#9a4a24'),
  feetSteamerPro:st('Tower steamer (claws)', '鳳爪',   'chickenFeet',  850, '#7a3818', true),
  ribSteamer:    st('Spare rib steamer',     '排骨',   'spareRibs',    450, '#6b3a2a'),
  ribSteamerPro: st('Tower steamer (ribs)',  '排骨',   'spareRibs',    900, '#4f2a1e', true),
  loMaiSteamer:  st('Lotus-leaf steamer',    '糯米雞', 'loMaiGai',     480, '#4f7a3a'),
  loMaiSteamerPro: st('Tower steamer (lo mai gai)', '糯米雞', 'loMaiGai', 950, '#3a5c2a', true),
  rollFryer:     st('Spring roll fryer',     '春卷',   'springRoll',   450, '#8a5a2a'),
  rollFryerPro:  st('Twin fryer',            '春卷',   'springRoll',   900, '#6a441e', true),
  custardSteamer:st('Custard bun steamer',   '流沙包', 'custardBun',   500, '#c9a227'),
  custardSteamerPro: st('Tower steamer (custard)', '流沙包', 'custardBun', 1000, '#a8841a', true),
  tartOven:      st('Tart oven',             '蛋撻',   'eggTart',      550, '#c28a3a'),
  tartOvenPro:   st('Deck tart oven',        '蛋撻',   'eggTart',     1000, '#9a6a24', true),
  soupPot:       st('Soup dumpling pot',     '灌湯餃', 'soupDumpling', 700, '#8f6620'),
  soupPotPro:    st('Double soup pot',       '灌湯餃', 'soupDumpling',1300, '#6f4c16', true),
  shelf:         { name: 'Stock shelf', zh: '貨架', price: 120, color: '#8a6a50', storage: 1 },
  pass:          { name: 'Dim sum trolley', zh: '點心車', fixed: true, color: '#aab3ba' },
};
export const APPLIANCE_SHOP = ['shelf', 'teaStation', 'hgSteamer', 'smSteamer', 'baoSteamer', 'cheungFunTray', 'turnipPan', 'feetSteamer', 'ribSteamer', 'loMaiSteamer', 'rollFryer', 'custardSteamer', 'tartOven', 'soupPot',
  'teaStationPro', 'hgSteamerPro', 'smSteamerPro', 'baoSteamerPro', 'cheungFunPro', 'turnipPanPro', 'feetSteamerPro', 'ribSteamerPro', 'loMaiSteamerPro', 'rollFryerPro', 'custardSteamerPro', 'tartOvenPro', 'soupPotPro'];

export const STYLES = {
  banquet: { name: 'Banquet hall', zh: '酒樓' },
  teahouse:{ name: 'Old teahouse', zh: '茶樓' },
  modern:  { name: 'Modern',       zh: '新派' },
};
// kind: table | seat | block | ceiling | wall | floor. Pieces shared with the cha chaan teng reuse its art.
export const DECOR = {
  roundTable:   { style: 'banquet', kind: 'table',   name: 'Round table with lazy susan', zh: '圓枱', price: 160, appeal: 7 },
  banquetChair: { style: 'banquet', kind: 'seat',    name: 'Red banquet chair',   zh: '宴會椅', price: 70,  appeal: 4 },
  palaceLantern:{ style: 'banquet', kind: 'ceiling', name: 'Palace lantern',      zh: '宮燈',   price: 200, appeal: 11 },
  doubleHappy:  { style: 'banquet', kind: 'wall',    name: 'Double happiness panel', zh: '囍字', price: 180, appeal: 10 },
  foldScreen:   { style: 'banquet', kind: 'block',   name: 'Lacquer folding screen', zh: '屏風', price: 320, appeal: 14 },
  redCarpet:    { style: 'banquet', kind: 'floor',   name: 'Red banquet carpet',  zh: '紅地氈', price: 450, appeal: 26 },

  woodRound:    { style: 'teahouse', kind: 'table',  name: 'Wooden round table',  zh: '木圓枱', price: 90,  appeal: 4 },
  woodStool:    { style: 'teahouse', kind: 'seat',   name: 'Wooden stool',        zh: '木櫈',   price: 30,  appeal: 2 },
  crossChair:   { style: 'teahouse', kind: 'seat',   name: 'Cross-back chair',    zh: '木椅',   price: 60,  appeal: 4 },
  birdcage:     { style: 'teahouse', kind: 'ceiling', name: 'Hanging birdcage',   zh: '雀籠',   price: 160, appeal: 9 },
  ceilingFan:   { style: 'teahouse', kind: 'ceiling', name: 'Ceiling fan',        zh: '吊扇',   price: 180, appeal: 8 },
  teaMenu:      { style: 'teahouse', kind: 'wall',   name: 'Hand-written dim sum board', zh: '點心牌', price: 90, appeal: 7 },
  teapotShelf:  { style: 'teahouse', kind: 'block',  name: 'Teapot shelf',        zh: '茶壺架', price: 150, appeal: 8 },
  mosaic:       { style: 'teahouse', kind: 'floor',  name: 'Mosaic tiles',        zh: '紙皮石', price: 400, appeal: 22 },

  marbleTable:  { style: 'modern', kind: 'table',   name: 'Marble table',        zh: '雲石枱', price: 220, appeal: 9 },
  rattanChair:  { style: 'modern', kind: 'seat',    name: 'Rattan chair',        zh: '藤椅',   price: 110, appeal: 6 },
  pendant:      { style: 'modern', kind: 'ceiling', name: 'Pendant lamp',        zh: '吊燈',   price: 140, appeal: 9 },
  neonSign:     { style: 'modern', kind: 'wall',    name: 'Neon sign',           zh: '霓虹燈', price: 300, appeal: 16 },
  bigPlant:     { style: 'modern', kind: 'block',   name: 'Fiddle-leaf fig',     zh: '琴葉榕', price: 90,  appeal: 8 },
  terrazzo:     { style: 'modern', kind: 'floor',   name: 'Terrazzo',            zh: '水磨石', price: 500, appeal: 28 },

  // more for each style
  couplets:     { style: 'banquet', kind: 'wall',    name: 'Red couplets',        zh: '對聯',   price: 120, appeal: 8 },
  lanternString:{ style: 'banquet', kind: 'ceiling', name: 'String of lanterns',  zh: '燈籠串', price: 150, appeal: 9 },
  porcelainVase:{ style: 'banquet', kind: 'block',   name: 'Blue-and-white vase', zh: '青花瓶', price: 260, appeal: 12 },
  rosewoodChair:{ style: 'teahouse', kind: 'seat',   name: 'Rosewood armchair',   zh: '酸枝椅', price: 140, appeal: 7 },
  calligraphy:  { style: 'teahouse', kind: 'wall',   name: 'Calligraphy scroll',  zh: '書法掛軸', price: 110, appeal: 8 },
  latticePanel: { style: 'teahouse', kind: 'wall',   name: 'Carved lattice window', zh: '木窗花', price: 160, appeal: 10 },
  bambooLamp:   { style: 'teahouse', kind: 'ceiling', name: 'Woven bamboo lamp',  zh: '竹燈',   price: 120, appeal: 8 },
  bonsai:       { style: 'teahouse', kind: 'block',  name: 'Bonsai on a stand',   zh: '盆景',   price: 180, appeal: 10 },
  teaCabinet:   { style: 'teahouse', kind: 'block',  name: 'Tea-tin cabinet',     zh: '茶葉櫃', price: 240, appeal: 12 },
  velvetBooth:  { style: 'modern', kind: 'seat',    name: 'Velvet booth seat',   zh: '絲絨卡座', price: 150, appeal: 8 },
  brassLamp:    { style: 'modern', kind: 'ceiling', name: 'Brass globe cluster', zh: '銅吊燈', price: 220, appeal: 12 },
  greenWall:    { style: 'modern', kind: 'wall',    name: 'Living plant wall',   zh: '植物牆', price: 260, appeal: 13 },
  herringbone:  { style: 'modern', kind: 'floor',   name: 'Herringbone parquet', zh: '人字地板', price: 480, appeal: 27 },

  // premium pieces
  goldMarble:   { style: 'banquet', kind: 'floor',  name: 'Gold-veined marble',  zh: '金紋雲石', price: 900, appeal: 36, level: 7 },
  koiPond:      { style: 'teahouse', kind: 'block', name: 'Koi pond',            zh: '錦鯉池', price: 850, appeal: 28, level: 7 },
  dragonMural:  { style: 'banquet', kind: 'wall',   name: 'Dragon & phoenix wall', zh: '龍鳳壁畫', price: 650, appeal: 24, level: 6 },
  fishTank:     { style: 'teahouse', kind: 'block', name: 'Live seafood tank',    zh: '海鮮缸', price: 700, appeal: 24, level: 8 },
  chandelier:   { style: 'banquet', kind: 'ceiling', name: 'Crystal chandelier',  zh: '水晶吊燈', price: 1400, appeal: 40, level: 10 },

  boards:       { style: 'teahouse', kind: 'floor', name: 'Worn floorboards',    zh: '木地板', price: 0, appeal: 0, hidden: true },
};

// goals tied to particular dishes (the engine adds the general ones)
export const GOALS = [
  { id: 'hargow', kind: 'min', stat: 'sold.harGow', needs: 'harGow', n: d => 6 + d, label: n => `Serve ${n} baskets of 蝦餃` },
  { id: 'tea',    kind: 'min', stat: 'sold.puer',   needs: 'puer',   n: d => 6 + d, label: n => `Pour ${n} pots of 普洱` },
  { id: 'bao',    kind: 'min', stat: 'sold.charSiuBao', needs: 'charSiuBao', n: d => 5 + d, label: n => `Serve ${n} baskets of 叉燒包` },
  { id: 'feet',   kind: 'min', stat: 'sold.chickenFeet', needs: 'chickenFeet', n: d => 4 + Math.floor(d / 3), label: n => `Serve ${n} plates of 鳳爪` },
  { id: 'soup',   kind: 'min', stat: 'sold.soupDumpling', needs: 'soupDumpling', n: d => 3 + Math.floor(d / 4), label: n => `Serve ${n} 灌湯餃` },
];

export const STARTING = {
  money: 450,
  popularity: 30,
  stock: { tea: 16, shrimp: 12, pork: 12, wrapper: 20 },
  unlocked: ['puer', 'harGow', 'siuMai'],
};

export const LAYOUT = {
  kitchen: [
    { id: 1, type: 'pass',       x: 3, y: 6,  dir: 'S' },
    { id: 2, type: 'teaStation', x: 0, y: 7,  dir: 'E' },
    { id: 3, type: 'hgSteamer',  x: 0, y: 9,  dir: 'E' },
    { id: 4, type: 'smSteamer',  x: 6, y: 6,  dir: 'S' },
    { id: 5, type: 'baoSteamer', x: 7, y: 9,  dir: 'W' },
    { id: 6, type: 'shelf',      x: 7, y: 11, dir: 'W' },
  ],
  floor: 'boards',
  items: [
    { id: 10, type: 'woodRound', x: 2, y: 3, dir: 'S' },
    { id: 11, type: 'woodRound', x: 5, y: 3, dir: 'S' },
    { id: 12, type: 'woodStool', x: 1, y: 3, dir: 'E' },
    { id: 13, type: 'woodStool', x: 3, y: 3, dir: 'W' },
    { id: 14, type: 'woodStool', x: 4, y: 3, dir: 'E' },
    { id: 15, type: 'woodStool', x: 6, y: 3, dir: 'W' },
  ],
  wall: [{ id: 20, type: 'teaMenu', x: 1 }],
};
