// Persistent progress (saved between days). Anything that only matters during
// a single day lives in the run object in sim.js instead.
import { STARTING, INGREDIENTS } from './data.js';

const SAVE_KEY = 'cct-rush-save-v1';
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
    kitchen: [
      { id: 1, type: 'pass',      x: 3, y: 6,  dir: 'S' },
      { id: 2, type: 'hotTea',    x: 0, y: 7,  dir: 'E' },
      { id: 3, type: 'icedTea',   x: 0, y: 9,  dir: 'E' },
      { id: 4, type: 'bun',       x: 6, y: 6,  dir: 'S' },
      { id: 5, type: 'butterBun', x: 7, y: 9,  dir: 'W' },
      { id: 6, type: 'shelf',     x: 7, y: 11, dir: 'W' },
    ],
    dining: {
      floor: 'concrete',
      ownedFloors: ['concrete'],
      items: [
        { id: 10, type: 'foldTable', x: 2, y: 3, dir: 'S' },
        { id: 11, type: 'foldTable', x: 5, y: 3, dir: 'S' },
        { id: 12, type: 'redStool',  x: 1, y: 3, dir: 'E' },
        { id: 13, type: 'redStool',  x: 3, y: 3, dir: 'W' },
        { id: 14, type: 'redStool',  x: 4, y: 3, dir: 'E' },
        { id: 15, type: 'redStool',  x: 6, y: 3, dir: 'W' },
      ],
      wall: [{ id: 20, type: 'menuStrips', x: 1 }],
    },
    history: [],
  };
}

function syncIds(S){
  const all = [...S.kitchen, ...S.dining.items, ...S.dining.wall].map(i => i.id);
  nextId = Math.max(nextId, ...all);
}

export function save(S){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable: play continues unsaved */ }
}
export function load(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
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
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
export const fresh = () => { const S = newGame(); syncIds(S); return S; };
