// Redecorating the dining room and rearranging the kitchen. The game is paused while editing.
import { DECOR, APPLIANCES, DINING_SIZES, SELL_BACK } from './data.js';
import { KW, DH, KH, WALL_H, DIR_ORDER, inKitchen, accessOf, kitchenProblem, diningProblem, faceTable, rotateDir, diningW } from './world.js';
import { newId } from './state.js';

export function startEdit(ui, room){
  ui.edit = { room, selected: null, moving: null, ghostItem: null, ghost: null, style: 'all', cat: 'all' };
}

const avatarCell = R => R ? [Math.floor(R.avatar.x), Math.floor(R.avatar.y)] : [3, 8];
const itemsOf = (S, room, kind) => room === 'kitchen' ? S.kitchen : kind === 'wall' ? S.dining.wall : S.dining.items;
const find = (S, room, id) => room === 'kitchen' ? S.kitchen.find(i => i.id === id) : (S.dining.items.find(i => i.id === id) || S.dining.wall.find(i => i.id === id));
export const findItem = find;

export function beginBuy(S, ui, type){
  const E = ui.edit;
  const price = E.room === 'kitchen' ? APPLIANCES[type].price : DECOR[type].price;
  if (price > S.money) return `You need ${price - Math.floor(S.money)} more dollars for that.`;
  E.moving = null; E.selected = null;
  E.ghostItem = { id: null, type, dir: E.room === 'kitchen' ? 'S' : (DECOR[type].kind === 'seat' ? 'E' : 'S'), x: 0, y: 0 };
  E.ghost = null;
  return null;
}
export function beginMove(S, ui, id){
  const E = ui.edit, it = find(S, E.room, id);
  if (!it) return 'Nothing selected.';
  if (E.room === 'kitchen' && APPLIANCES[it.type].fixed) return 'The serving hatch is built into the wall.';
  E.moving = id; E.selected = id; E.ghostItem = { ...it }; E.ghost = null;
  return null;
}
export function cancelPlacing(ui){ const E = ui.edit; if (!E) return; E.ghostItem = null; E.moving = null; E.ghost = null; }

// Work out where the ghost would land for the pointer at screen (sx, sy)
export function updateGhost(S, R, ui, iso, sx, sy){
  const E = ui.edit, it = E && E.ghostItem;
  if (!it) return;
  if (E.room === 'dining' && DECOR[it.type].kind === 'wall'){
    // Left of the corner is the side wall (x = 0), right of it the back wall (y = 0).
    const side = sx < iso.ox ? 'W' : 'N';
    const slot = side === 'N' ? Math.floor((sx - iso.ox) / iso.s) : Math.floor((iso.ox - sx) / iso.s);
    it.side = side;
    const x = side === 'N' ? slot : 0, y = side === 'N' ? 0 : slot;
    const problem = diningProblem(S, it, x, y, E.moving);
    E.ghost = { x, y, side, wall: true, ok: !problem, msg: problem };
    return;
  }
  const [fx, fy] = iso.unproject(sx, sy);
  const x = Math.floor(fx), y = Math.floor(fy);
  if (E.room === 'kitchen'){
    const others = S.kitchen.filter(k => k.id !== E.moving);
    const tryDir = d => inKitchen(x, y) ? kitchenProblem(others.concat([{ ...it, id: it.id || -1, x, y, dir: d }]), avatarCell(R)) : 'Put it inside the kitchen.';
    let problem = tryDir(it.dir);
    // If it can't work facing this way (say, facing a wall), turn it to the first way that does.
    if (problem && inKitchen(x, y)){
      const d = DIR_ORDER.find(d => !tryDir(d));
      if (d){ it.dir = d; problem = null; }
    }
    if (!problem && R && E.moving && R.avatar.phase === 'cook' && R.queue[0] && R.queue[0].stationId === E.moving) problem = 'The cook is using it right now.';
    E.ghost = { x, y, ok: !problem, msg: problem, access: accessOf({ ...it, x, y }) };
  } else {
    const problem = diningProblem(S, it, x, y, E.moving);
    E.ghost = { x, y, ok: !problem, msg: problem };
    if (DECOR[it.type].kind === 'seat' && !problem) it.dir = faceTable(S.dining.items, { ...it, x, y });
  }
}

export function place(S, ui){
  const E = ui.edit, it = E.ghostItem, g = E.ghost;
  if (!it || !g) return null;
  if (!g.ok) return g.msg;
  if (E.moving){
    const cur = find(S, E.room, E.moving);
    cur.x = g.x; cur.y = g.y; cur.dir = it.dir;
    if (g.wall) cur.side = g.side;
    E.moving = null; E.ghostItem = null; E.ghost = null; E.selected = cur.id;
    return null;
  }
  const kind = E.room === 'kitchen' ? null : DECOR[it.type].kind;
  const price = E.room === 'kitchen' ? APPLIANCES[it.type].price : DECOR[it.type].price;
  if (price > S.money) return 'Not enough cash.';
  S.money -= price;
  const fresh = { id: newId(), type: it.type, x: g.x, y: g.y, dir: it.dir };
  if (kind === 'wall'){ fresh.side = g.side || 'N'; delete fresh.dir; }
  itemsOf(S, E.room, kind).push(fresh);
  E.selected = fresh.id; E.ghost = null;
  if (price > S.money) E.ghostItem = null;                 // can't afford another
  return null;
}

export function rotate(S, R, ui){
  const E = ui.edit;
  if (E.ghostItem){ E.ghostItem.dir = rotateDir(E.ghostItem.dir || 'S'); return null; }
  const it = E.selected && find(S, E.room, E.selected);
  if (!it || it.dir === undefined) return null;
  const before = it.dir;
  it.dir = rotateDir(it.dir);
  if (E.room === 'kitchen'){
    const problem = kitchenProblem(S.kitchen, avatarCell(R));
    if (problem){ it.dir = before; return problem; }
  }
  return null;
}

export function sell(S, ui){
  const E = ui.edit, it = E.selected && find(S, E.room, E.selected);
  if (!it) return { msg: 'Select something first.' };
  if (E.room === 'kitchen'){
    if (APPLIANCES[it.type].fixed) return { msg: 'The serving hatch stays.' };
    const refund = Math.round(APPLIANCES[it.type].price * SELL_BACK);
    S.kitchen.splice(S.kitchen.indexOf(it), 1); S.money += refund;
    E.selected = null;
    return { refund };
  }
  const kind = DECOR[it.type].kind, list = itemsOf(S, 'dining', kind);
  const refund = Math.round(DECOR[it.type].price * SELL_BACK);
  list.splice(list.indexOf(it), 1); S.money += refund;
  E.selected = null;
  return { refund };
}

export function useFloor(S, type){
  if (S.dining.ownedFloors.includes(type)){ S.dining.floor = type; return null; }
  const price = DECOR[type].price;
  if (price > S.money) return `You need ${price - Math.floor(S.money)} more dollars for that floor.`;
  S.money -= price; S.dining.ownedFloors.push(type); S.dining.floor = type;
  return null;
}

export function expand(S){
  const next = DINING_SIZES[S.diningSize + 1];
  if (!next) return 'The dining room is as big as it gets.';
  if (next.price > S.money) return `You need ${next.price - Math.floor(S.money)} more dollars to expand.`;
  S.money -= next.price; S.diningSize++;
  return null;
}
