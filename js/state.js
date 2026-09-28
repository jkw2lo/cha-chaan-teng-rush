// Persistent progress (saved between days). Anything that only matters during
// a single day lives in the run object in sim.js instead.
import { STARTING, INGREDIENTS, THEME } from './data.js';

const saveKey = () => THEME.meta.saveKey;
let nextId = 100;
export const newId = () => ++nextId;

export function newGame(){
  return {
    version: 1,
    day: 1,
    money: STARTING.money,
    popularity: STARTING.popularity,
    stock: Object.fromEntries(Object.keys(INGREDIENTS).map(k => [k, STARTING.stock[k] || 0])),
    unlocked: [...STARTING.unlocked],
    diningSize: 0,
    kitchenSize: 0,
    relaxed: false,
    stars: 0,
    kitchen: THEME.data.LAYOUT.kitchen.map(k => ({ ...k })),
    dining: {
      floor: THEME.data.LAYOUT.floor,
      ownedFloors: [THEME.data.LAYOUT.floor],
      items: THEME.data.LAYOUT.items.map(i => ({ ...i })),
      wall: THEME.data.LAYOUT.wall.map(w => ({ ...w })),
    },
    history: [],
  };
}

function syncIds(S){
  const all = [...S.kitchen, ...S.dining.items, ...S.dining.wall].map(i => i.id);
  nextId = Math.max(nextId, ...all);
}

export function save(S){
  try { localStorage.setItem(saveKey(), JSON.stringify(S)); } catch (e) { /* storage unavailable: play continues unsaved */ }
}
export function load(){
  try {
    const raw = localStorage.getItem(saveKey());
    if (!raw) return null;
    const S = JSON.parse(raw);
    if (S.version !== 1) return null;
    syncIds(S);
    S.stars ??= 0; S.kitchenSize ??= 0; S.relaxed ??= false;
    for (const k of Object.keys(INGREDIENTS)) S.stock[k] ??= 0;   // ingredients added since this save
    return S;
  } catch (e) { return null; }
}
export function clearSave(){
  try { localStorage.removeItem(saveKey()); } catch (e) {}
}
export const fresh = () => { const S = newGame(); syncIds(S); return S; };
