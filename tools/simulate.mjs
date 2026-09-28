// Plays whole days headlessly, for balancing.
//   node tools/simulate.mjs [days] [perfect|casual]
// perfect: reacts every tick, batches the most urgent tickets, restocks early.
// casual:  looks up every ~2s, works tickets strictly in order without batching, restocks late,
//          and between days buys the stations/shelves/rooms a player would.
globalThis.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
const { fresh } = await import('../js/state.js');
const sim = await import('../js/sim.js');
const { APPLIANCES, MENU, INGREDIENTS, KITCHEN_SIZES, DINING_SIZES, DECOR } = await import('../js/data.js');
const world = await import('../js/world.js');

const days = Number(process.argv[2] || 3), style = process.argv[3] || 'casual';
const S = fresh(); world.syncKitchen(S);
sim.placeStockOrder(S, null, { ice: 1, butter: 1 });

function stationFor(item){ return S.kitchen.find(k => APPLIANCES[k.type].makes === item); }
function placeStation(type){
  for (let y = world.KY0; y < world.KY0 + world.KH; y++) for (let x = 0; x < world.KW; x++) for (const dir of world.DIR_ORDER){
    const cand = [...S.kitchen, { id: 9000 + S.kitchen.length, type, x, y, dir }];
    if (!world.kitchenProblem(cand, [3, 8])){ S.kitchen.push(cand.at(-1)); return true; }
  }
  return false;
}
function placeDecor(type){
  for (let y = 0; y < world.DH; y++) for (let x = 0; x < world.diningW(S); x++){
    if (!world.diningProblem(S, { type }, x, y)){ S.dining.items.push({ id: 8000 + S.dining.items.length, type, x, y, dir: 'S' }); return true; }
  }
  return false;
}
// What a sensible player does between days.
function shop(){
  const lvl = sim.level(S);
  const nk = KITCHEN_SIZES[S.kitchenSize + 1];
  if (nk && lvl >= nk.level && S.money > nk.price + 800){ S.money -= nk.price; S.kitchenSize++; world.syncKitchen(S); }
  for (const item of Object.keys(MENU)){
    if (!sim.itemReady(S, item) || stationFor(item)) continue;
    const type = Object.keys(APPLIANCES).find(k => APPLIANCES[k].makes === item && !APPLIANCES[k].pro);
    if (S.money > APPLIANCES[type].price + 300 && placeStation(type)) S.money -= APPLIANCES[type].price;
  }
  // upgrade to Pro versions once the cash is there (swap in place: same spot, same facing)
  for (const st of S.kitchen){
    const pro = Object.keys(APPLIANCES).find(k => APPLIANCES[k].pro && APPLIANCES[k].makes === APPLIANCES[st.type].makes);
    if (!APPLIANCES[st.type].pro && pro && S.money > APPLIANCES[pro].price + 1500){ S.money -= APPLIANCES[pro].price - APPLIANCES[st.type].price / 2; st.type = pro; }
  }
  if (sim.visibleIngredients(S).length > 8 && sim.shelves(S) < 2 && S.money > 600 && placeStation('shelf')) S.money -= APPLIANCES.shelf.price;
  const nd = DINING_SIZES[S.diningSize + 1];
  if (nd && S.money > nd.price + 1500){ S.money -= nd.price; S.diningSize++; }
  // a table with a stool either side, only where every seat stays reachable
  const want = 4 + S.diningSize * 4;
  outer: for (let y = 2; y < world.DH - 1 && world.seatReport(S).filter(r => r.ok).length < want && S.money > 900; y += 2)
    for (let x = 1; x < world.diningW(S) - 1; x += 3){
      const snap = S.dining.items.length, ok0 = world.seatReport(S).filter(r => r.ok).length;
      const add = [{ type: 'foldTable', x, y, dir: 'S' }, { type: 'redStool', x: x - 1, y, dir: 'E' }, { type: 'redStool', x: x + 1, y, dir: 'W' }];
      if (add.some(a => world.diningProblem(S, a, a.x, a.y))) continue;
      add.forEach((a, i) => S.dining.items.push({ id: 8000 + snap + i, ...a }));
      if (world.seatReport(S).filter(r => r.ok).length < ok0 + 2 || world.seatReport(S).some(r => !r.ok)){ S.dining.items.length = snap; continue; }
      S.money -= 100;
      if (world.seatReport(S).filter(r => r.ok).length >= want) break outer;
    }
  // restock everything to about two packs for tomorrow
  for (const k of sim.visibleIngredients(S)){
    const want = Math.min(sim.packsRoom(S, null, k), Math.max(0, Math.ceil((INGREDIENTS[k].pack * 2 - S.stock[k]) / INGREDIENTS[k].pack)));
    if (want > 0 && S.money > INGREDIENTS[k].cost * want + 200) sim.placeStockOrder(S, null, { [k]: want });
  }
}

let totalStars = 0;
for (let d = 0; d < days; d++){
  if (d > 0) shop();
  const R = sim.newRun(S);
  let guard = 0, nextLook = 0;
  while (!R.over && guard++ < 30000){
    if (style === 'perfect' || R.t >= nextLook){
      nextLook = R.t + 1.5 + Math.random() * 1.5;
      const have = {}; for (const t of R.tray) have[t.item] = (have[t.item] || 0) + 1;
      for (const q of R.queue) have[q.item] = (have[q.item] || 0) + 1;
      const tickets = R.orders.filter(o => !o.sent).sort(style === 'perfect' ? (a, b) => a.deadline - b.deadline : (a, b) => a.no - b.no);
      for (const o of (style === 'perfect' ? tickets : tickets.slice(0, 2))){
        for (const [it, n] of Object.entries(o.items)){
          const short = n - (have[it] || 0);
          for (let i = 0; i < short && R.queue.length < 5; i++){
            const st = stationFor(it);
            if (!st) break;
            const r = sim.clickStation(S, R, st, false);
            if (r.added) have[it] = (have[it] || 0) + 1; else break;
          }
          have[it] = Math.max(0, (have[it] || 0) - n);
        }
      }
      const low = style === 'perfect' ? 5 : 2;
      for (const k of sim.visibleIngredients(S)) if (S.stock[k] < low && !R.deliveries.some(x => x.ing === k) && S.money > 80 && sim.packsRoom(S, R, k) > 0) sim.placeStockOrder(S, R, { [k]: 1 });
    }
    sim.tick(S, R, 0.1);
    R.events.length = 0;
  }
  const s = R.stats, res = R.results;
  totalStars += res.stars;
  console.log(`Day ${String(S.day).padStart(2)}: L${sim.level(S)} ★${res.stars} (${S.stars}) served ${s.served}, walkouts ${s.walkouts}, lost ${s.lost}, sales+tips ${sim.fmtMoney(s.revenue + s.tips)} / target ${sim.fmtMoney(res.target.n)}, cash ${sim.fmtMoney(S.money)}, pop ${Math.round(S.popularity)}, menu ${S.unlocked.length}`);
  S.day++;
}
console.log(`\n${style}: ${totalStars} stars in ${days} days, level ${sim.level(S)}`);
