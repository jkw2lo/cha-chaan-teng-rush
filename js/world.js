// The restaurant is one grid in world coordinates.
// Dining room: x 0..diningWidth, y 0..DH.  Kitchen: x 0..KW, y DH..DH+KH.
// A low partition wall runs along y = DH; the serving hatch is the gap in it.
import { DINING_SIZES, DECOR, APPLIANCES } from './data.js';

export const DH = 6, KW = 8, KH = 6, KY0 = DH;
export const WALL_H = 2.4, PARTITION_H = 1.2;
export const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const DIR_ORDER = ['S', 'W', 'N', 'E'];
export const HATCH = [3, DH - 1];                // dining-side cell in front of the pass
// Wall pieces hang on the back wall (side 'N', slot = x) or the dining room's side wall (side 'W', slot = y).
// The side wall's windows take two of its slots.
export const WINDOW_SLOTS = [1, 4];
export const wallSide = w => w.side || 'N';

export const diningW = S => DINING_SIZES[S.diningSize].w;
export const worldW = S => Math.max(KW, diningW(S));
export const doorCell = S => [diningW(S) - 2, 0];
export const inKitchen = (x, y) => x >= 0 && x < KW && y >= KY0 && y < KY0 + KH;
export const inDining = (S, x, y) => x >= 0 && x < diningW(S) && y >= 0 && y < DH;
export const key = (x, y) => x + ',' + y;
export const accessOf = st => [st.x + DIRS[st.dir][0], st.y + DIRS[st.dir][1]];
export const rotateDir = d => DIR_ORDER[(DIR_ORDER.indexOf(d) + 1) % 4];

export function bfs(start, goals, passable){
  const goalSet = new Set((Array.isArray(goals[0]) ? goals : [goals]).map(g => key(...g)));
  if (goalSet.has(key(...start))) return [];
  const prev = new Map([[key(...start), null]]), q = [start];
  while (q.length){
    const cur = q.shift();
    for (const [dx, dy] of Object.values(DIRS)){
      const nx = cur[0] + dx, ny = cur[1] + dy, k = key(nx, ny);
      if (prev.has(k)) continue;
      if (!goalSet.has(k) && !passable(nx, ny)) continue;
      prev.set(k, cur);
      if (goalSet.has(k)){
        const path = [[nx, ny]];
        let p = cur;
        while (p && key(...p) !== key(...start)){ path.unshift(p); p = prev.get(key(...p)); }
        return path;
      }
      q.push([nx, ny]);
    }
  }
  return null;
}

// ---------- kitchen ----------
export function kitchenBlocked(stations){
  return new Set(stations.map(s => key(s.x, s.y)));
}
export function kitchenPath(S, from, to){
  const blocked = kitchenBlocked(S.kitchen);
  return bfs(from, to, (x, y) => inKitchen(x, y) && !blocked.has(key(x, y)));
}
// Returns null if the layout works, otherwise a sentence saying why not.
export function kitchenProblem(stations, avatarCell){
  const blocked = kitchenBlocked(stations);
  if (blocked.size !== stations.length) return 'Two appliances can’t share a spot.';
  for (const s of stations){
    if (!inKitchen(s.x, s.y)) return 'That’s outside the kitchen.';
    if (avatarCell && s.x === avatarCell[0] && s.y === avatarCell[1]) return 'The cook is standing there.';
  }
  const pass = stations.find(s => s.type === 'pass');
  const start = accessOf(pass);
  const passable = (x, y) => inKitchen(x, y) && !blocked.has(key(x, y));
  for (const s of stations){
    if (APPLIANCES[s.type].makes === undefined && s.type !== 'pass') continue;
    const a = accessOf(s);
    if (!passable(...a)) return `The front of the ${APPLIANCES[s.type].name.toLowerCase()} is blocked.`;
    if (bfs(start, a, passable) === null) return `The cook can’t reach the ${APPLIANCES[s.type].name.toLowerCase()}.`;
  }
  if (avatarCell && bfs(avatarCell, start, passable) === null) return 'That would trap the cook.';
  return null;
}

// ---------- dining ----------
const blocks = it => ['table', 'seat', 'block'].includes(DECOR[it.type].kind);
export function diningBlocked(items){
  return new Set(items.filter(blocks).map(i => key(i.x, i.y)));
}
export function tableAt(items, x, y){
  return items.find(i => i.x === x && i.y === y && DECOR[i.type].kind === 'table');
}
// A seat works when it faces a table and a customer can walk to it from the door.
export function seatReport(S){
  const items = S.dining.items, blocked = diningBlocked(items), door = doorCell(S);
  const passable = (x, y) => inDining(S, x, y) && !blocked.has(key(x, y));
  return items.filter(i => DECOR[i.type].kind === 'seat').map(seat => {
    const [dx, dy] = DIRS[seat.dir];
    const table = tableAt(items, seat.x + dx, seat.y + dy);
    const reach = bfs(door, [seat.x, seat.y], passable) !== null;
    return { seat, table, ok: !!table && reach, reason: !table ? 'not facing a table' : !reach ? 'can’t be reached' : null };
  });
}
export function diningProblem(S, item, x, y, ignoreId){
  const kind = DECOR[item.type].kind;
  if (kind === 'wall'){
    const side = item.side || 'N';
    if (side === 'N'){
      if (x < 0 || x >= diningW(S)) return 'Hang it on a wall.';
      if (x === doorCell(S)[0]) return 'That’s the front door.';
    } else {
      if (y < 0 || y >= DH) return 'Hang it on a wall.';
      if (WINDOW_SLOTS.includes(y)) return 'That’s a window.';
    }
    const slot = side === 'N' ? x : y;
    if (S.dining.wall.some(w => wallSide(w) === side && (side === 'N' ? w.x : w.y) === slot && w.id !== ignoreId)) return 'Something already hangs there.';
    return null;
  }
  if (!inDining(S, x, y)) return 'That’s outside the dining room.';
  const others = S.dining.items.filter(i => i.id !== ignoreId);
  if (kind === 'ceiling') return others.some(i => i.x === x && i.y === y && DECOR[i.type].kind === 'ceiling') ? 'There’s already a light or fan there.' : null;
  const d = doorCell(S);
  if (x === d[0] && y === d[1]) return 'Keep the doorway clear.';
  if (x === HATCH[0] && y === HATCH[1]) return 'Keep the serving hatch clear.';
  if (others.some(i => i.x === x && i.y === y && blocks(i))) return 'That spot’s taken.';
  return null;
}
// Turn a new seat toward a neighbouring table if it has one.
export function faceTable(items, seat){
  const cur = DIRS[seat.dir];
  if (tableAt(items, seat.x + cur[0], seat.y + cur[1])) return seat.dir;
  for (const d of DIR_ORDER){ const [dx, dy] = DIRS[d]; if (tableAt(items, seat.x + dx, seat.y + dy)) return d; }
  return seat.dir;
}
