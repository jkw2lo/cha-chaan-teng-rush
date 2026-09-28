// Plays days headlessly with a simple bot cook. Usage: node tools/simulate.mjs [days]
globalThis.localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
const { fresh } = await import('../js/state.js');
const { newRun, tick, clickStation, placeStockOrder, fmtMoney } = await import('../js/sim.js');
const { APPLIANCES, MENU } = await import('../js/data.js');

const S = fresh();
const days = Number(process.argv[2] || 3);
placeStockOrder(S, null, { ice: 1, butter: 1 });
for (let d = 0; d < days; d++){
  const R = newRun(S);
  let guard = 0;
  while (!R.over && guard++ < 20000){
    // bot: queue whatever the most urgent unsent ticket still needs
    const have = {}; for (const t of R.tray) have[t.item] = (have[t.item] || 0) + 1;
    for (const q of R.queue) have[q.item] = (have[q.item] || 0) + 1;
    for (const o of [...R.orders].filter(o => !o.sent).sort((a, b) => a.deadline - b.deadline)){
      for (const [it, n] of Object.entries(o.items)){
        const short = n - (have[it] || 0);
        for (let i = 0; i < short && R.queue.length < 5; i++){
          const st = S.kitchen.find(k => APPLIANCES[k.type].makes === it);
          const r = clickStation(S, R, st, false);
          if (r.added) have[it] = (have[it] || 0) + 1; else break;
        }
        have[it] = Math.max(0, (have[it] || 0) - n);
      }
    }
    // bot restocks when low
    for (const k of Object.keys(S.stock)) if (S.stock[k] < 4 && !R.deliveries.some(x => x.ing === k) && S.money > 60) placeStockOrder(S, R, { [k]: 1 });
    tick(S, R, 0.1);
  }
  const s = R.stats;
  console.log(`Day ${S.day}: served ${s.served}, walkouts ${s.walkouts}, lost ${s.lost}, sales ${fmtMoney(s.revenue)}, tips ${fmtMoney(s.tips)}, waste ${fmtMoney(s.waste)}, cash ${fmtMoney(S.money)}, pop ${Math.round(S.popularity)}${R.forcedAt ? ', forced close ' + R.forcedAt : ''} (t=${Math.round(R.t)}s)`);
  S.day++;
}
