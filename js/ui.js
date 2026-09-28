// DOM panels around the canvas. Everything here reads state; main.js wires the buttons.
import { MENU, MENU_ORDER, INGREDIENTS, APPLIANCES, APPLIANCE_SHOP, DECOR, STYLES, DINING_SIZES, DAY_SECONDS, QUEUE_MAX, PASS_MAX, AMBIENCE_MAX, TARGET_REWARD, GOAL_REWARD, LEVEL_STARS, itemLevel, KITCHEN_SIZES, MAX_LEVEL, THEME, KNOWN_AFTER } from './data.js';
import { known, readingTicket, level, itemReady, hasStation, visibleIngredients, clockHour, fmtClock, fmtMoney, dayProgress, capacity, shelves, packsRoom, incoming, passClaims, goalStatus, pickGoals } from './sim.js';
import { ambience, appealGain, ambienceEffect } from './ambience.js';
import { iconURL } from './art.js';
import { seatReport } from './world.js';

const $ = id => document.getElementById(id);
function setHTML(id, html){ const el = $(id); if (el._html !== html){ el._html = html; el.innerHTML = html; } }
const icons = {};
export const icon = item => (icons[item] ||= iconURL(item));
const secs = n => { n = Math.max(0, Math.ceil(n)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };

export function stars(p){
  const full = p / 20;
  let out = '';
  for (let i = 0; i < 5; i++){
    const f = Math.max(0, Math.min(1, full - i));
    out += `<span class="star"><i style="width:${Math.round(f * 100)}%"></i></span>`;
  }
  return `${out}<span class="popn">${Math.round(p)}</span>`;
}

export function renderTop(S, R, phase, ui){
  $('dayNo').textContent = `Day ${S.day}`;
  $('clock').textContent = R ? fmtClock(clockHour(R)) : phase === 'prep' ? 'Before opening' : '';
  $('dayFill').style.width = `${(R ? dayProgress(R) : 0) * 100}%`;
  const m = $('money'); m.textContent = fmtMoney(S.money); m.classList.toggle('neg', S.money < 0);
  $('pop').innerHTML = stars(S.popularity);
  const lv = level(S), next = LEVEL_STARS[lv];
  setHTML('lvl', `${lv}<i class="of">${next !== undefined ? `★ ${S.stars}/${next}` : `★ ${S.stars} · max`}</i>`);
  const coming = MENU_ORDER.find(m => itemLevel(m) === lv + 1);
  $('lvlStat').title = next !== undefined ? `${next - S.stars} more stars to level ${lv + 1}${coming ? `, which opens up ${MENU[coming].zh} ${MENU[coming].name.toLowerCase()}` : ''}. Earn up to 3 stars a day from the targets.` : 'Top level.';
  const a = ambience(S), eff = ambienceEffect(a.total);
  $('amb').innerHTML = `${a.total}<i class="of">/${AMBIENCE_MAX}</i><small>${a.tier.zh}</small>`;
  $('ambStat').title = `${a.tier.name}. Right now: +${Math.round((eff.customers - 1) * 100)}% customers, +${Math.round((eff.tips - 1) * 100)}% tips. The bonus tops out at ${AMBIENCE_MAX}.${a.next ? ` ${a.next.min - a.total} more for ${a.next.name.toLowerCase()}.` : ''}`;
  $('pauseBtn').textContent = ui.paused ? 'Play' : 'Pause';
  $('pauseBtn').setAttribute('aria-pressed', String(ui.paused));
  $('speedBtn').textContent = `${ui.speed}×`;
  $('closeBtn').disabled = !(phase === 'day' && R && !R.closing);
  $('pauseBtn').disabled = $('speedBtn').disabled = phase !== 'day';
  document.querySelector('.controls').hidden = !!ui.edit || phase !== 'day';
  for (const id of ['kitchenBtn', 'diningBtn']){ $(id).disabled = phase === 'day'; $(id).title = phase === 'day' ? 'You can rearrange between days' : ''; }
  for (const id of ['kitchenBtn', 'diningBtn']) $(id).classList.toggle('on', !!ui.edit && ui.edit.room === (id === 'kitchenBtn' ? 'kitchen' : 'dining'));
}

export function renderRail(S, R){
  if (!R || !R.orders.some(o => !o.sent)){ setHTML('rail', ''); return; }
  const claims = passClaims(R);
  // Oldest ticket first, always. A ticket leaves the rail the moment it goes out, and nothing else moves.
  const orders = R.orders.filter(o => !o.sent).sort((a, b) => a.no - b.no);
  setHTML('rail', orders.map(o => {
    const left = Math.max(0, o.deadline - R.t), frac = o.sent ? 1 : left / (o.deadline - o.created);
    const tone = o.sent ? 'sent' : frac > .5 ? 'ok' : frac > .25 ? 'warn' : 'late';
    const items = Object.entries(o.items).map(([it, n]) => {
      const ready = o.sent ? n : (claims.get(o.id) || {})[it] || 0;
      const cls = !o.sent && ready >= n ? 'ready' : !o.sent && ready ? 'part' : '';
      const tip = `${MENU[it].name}${ready && !o.sent ? `: ${ready} of ${n} on the pass` : ''}`;
      if (S.learning){
        // learning mode: the name leads; the picture goes once you know the dish, the romanisation fades as you learn it
        const seen = (S.learned || {})[it] || 0, k = known(S, it), fade = Math.max(0, 1 - seen / KNOWN_AFTER);
        return `<span class="ti learn ${k ? 'known' : ''} ${cls}" title="${tip}">${k ? '' : `<img src="${icon(it)}" alt="">`}<b class="lzh">${MENU[it].zh}</b><small class="ljp" style="opacity:${Math.max(.0, fade).toFixed(2)}">${MENU[it].jp || ''}</small><em>${n > 1 ? '×' + n : ''}</em></span>`;
      }
      return `<span class="ti ${cls}" title="${tip}"><img src="${icon(it)}" alt="${MENU[it].name}"><em>${n > 1 ? '×' + n : ''}</em><small>${MENU[it].zh}</small></span>`;
    }).join('');
    return `<article class="ticket ${tone} ${readingTicket(S, o) ? 'reading' : ''}">
      <header><b>#${o.no}</b><span>${o.sent ? 'Out ✓' : secs(left)}</span></header>
      <div class="titems">${items}</div>
      <div class="tbar"><i style="width:${Math.round(frac * 100)}%"></i></div>
    </article>`;
  }).join(''));
}

export function renderSide(S, R){
  // inventory: one fixed grid so every bar lines up
  const sh = shelves(S);
  $('capNote').textContent = `Holds ${2 + sh} packs of each. The + button orders one pack.`;
  const visible = visibleIngredients(S);
  $('inv').classList.toggle('compact', visible.length > 7);
  setHTML('inv', visible.map(k => [k, INGREDIENTS[k]]).map(([k, ing]) => {
    const stock = S.stock[k], cap = capacity(S, k), inc = R ? R.deliveries.filter(d => d.ing === k) : [];
    const pct = Math.min(100, (Math.max(0, stock) / cap) * 100), incPct = Math.min(100 - pct, incoming(R, k) / cap * 100);
    const tone = stock <= 0 ? 'out' : stock < 4 ? 'low' : '';
    const unlocks = MENU_ORDER.filter(m => !S.unlocked.includes(m) && itemReady(S, m) && MENU[m].recipe[k]);
    const note = inc.length ? `<span class="inc">+${inc.reduce((s2, d) => s2 + d.qty, 0)} in ${secs(Math.min(...inc.map(d => d.left)))}</span>`
      : unlocks.length && stock <= 0 ? `<span class="unl">unlocks ${unlocks.map(m => MENU[m].zh).join(' ')}</span>` : '';
    return `<div class="inv ${tone}" title="${ing.name} (${ing.zh}): ${stock} of ${cap}">
      <span class="chip" style="--c:${ing.color}">${ing.glyph}</span><span class="nm">${ing.name}</span>
      <div class="bar"><i style="width:${pct}%"></i><i class="incbar" style="width:${incPct}%"></i></div>
      <b class="qty">${stock <= 0 ? 'Out' : stock}<small> / ${cap}</small></b><span class="invnote">${note}</span>
      ${quickBtn(S, R, k, ing)}
    </div>`;
  }).join(''));

  // cook's queue and the pass: same five-slot look
  const q = R ? R.queue : [];
  let qh = '';
  for (let i = 0; i < QUEUE_MAX; i++){
    const e = q[i];
    if (!e){ qh += `<span class="qslot empty">${i + 1}</span>`; continue; }
    const active = i === 0 && R.avatar.phase !== 'idle';
    const prog = active && R.avatar.phase === 'cook' ? 1 - Math.max(0, R.avatar.cookLeft) / R.avatar.cookTotal : 0;
    qh += `<span class="qslot ${active ? 'active' : ''}" title="${MENU[e.item].name}"><img src="${icon(e.item)}" alt="${MENU[e.item].name}"><b>${i + 1}</b>${active ? `<i style="width:${Math.round(prog * 100)}%"></i>` : ''}</span>`;
  }
  setHTML('queue', qh);
  const tray = R ? R.tray : [];
  let th = '';
  for (let i = 0; i < PASS_MAX; i++){
    const t = tray[i];
    if (!t){ th += `<span class="qslot empty">${i + 1}</span>`; continue; }
    const f = Math.max(0, (t.fresh - R.t) / t.total);
    th += `<span class="qslot pass" title="${MENU[t.item].name}, ${secs(t.fresh - R.t)} before it’s wasted"><img src="${icon(t.item)}" alt="${MENU[t.item].name}"><b>${i + 1}</b><i class="${f > .5 ? 'ok' : f > .25 ? 'warn' : 'late'}" style="width:${Math.round(f * 100)}%"></i></span>`;
  }
  setHTML('tray', th);
  $('trayHead').classList.toggle('full', tray.length >= PASS_MAX);

  // today
  const st = R ? R.stats : null;
  setHTML('today', st ? `
    <div><dt>Sales</dt><dd>${fmtMoney(st.revenue)}</dd></div>
    <div><dt>Tips</dt><dd>${fmtMoney(st.tips)}</dd></div>
    <div><dt>Wasted</dt><dd class="${st.waste ? 'bad' : ''}">${st.waste ? '−' + fmtMoney(st.waste) : '$0'}</dd></div>
    <div><dt>Served</dt><dd>${st.served}</dd></div>
    <div><dt>Walked out</dt><dd class="${st.walkouts ? 'bad' : ''}">${st.walkouts}</dd></div>
    <div><dt>Turned away</dt><dd>${st.lost}</dd></div>`
    : `<div><dt>Sales</dt><dd>$0</dd></div><div><dt>Tips</dt><dd>$0</dd></div><div><dt>Wasted</dt><dd>$0</dd></div>
       <div><dt>Served</dt><dd>0</dd></div><div><dt>Walked out</dt><dd>0</dd></div><div><dt>Turned away</dt><dd>0</dd></div>`);

  // targets
  const goals = R ? goalStatus(R) : previewGoals(S);
  setHTML('goals', goalsHTML(goals));

  setHTML('feed', R ? R.feed.slice(0, 1).map(f => `<li class="${f.tone}"><time>${fmtClock(7 + 11 * Math.min(1, f.t / DAY_SECONDS))}</time>${f.text}</li>`).join('') : '');
}
function quickBtn(S, R, k, ing){
  const room = packsRoom(S, R, k) >= 1, cash = S.money >= ing.cost;
  const why = !room ? 'No room: shelves are full' : !cash ? `Needs ${fmtMoney(ing.cost)}` : `Order 1 pack (${ing.pack}) for ${fmtMoney(ing.cost)}`;
  return `<button type="button" class="qo" data-quick="${k}" ${room && cash ? '' : 'disabled'} title="${why}" aria-label="${why}">+${ing.pack}<small>${fmtMoney(ing.cost)}</small></button>`;
}
export function previewGoals(S){
  const g = pickGoals(S);
  return { target: { value: 0, n: g.target, done: false }, list: goalStatus({ goals: g, stats: { revenue: 0, tips: 0, sold: {} } }).list };
}
export function goalsHTML(g, final){
  const pct = Math.min(100, g.target.value / g.target.n * 100);
  const row = x => {
    const state = x.done ? (final || x.kind === 'min' ? 'done' : 'ok') : (x.kind === 'max' ? 'fail' : '');
    const prog = x.kind === 'min' ? `${Math.min(x.value, x.n)}/${x.n}` : `${x.value > x.n ? 'over' : `${x.value}/${x.n}`}`;
    return `<li class="${state}"><span class="tick"></span><span>${x.label}</span><em>${x.id === 'waste' ? (x.value ? 'wasted' : '') : prog}</em></li>`;
  };
  return `<div class="target ${g.target.done ? 'done' : ''}"><div class="tl"><span>Sales target</span><b>${fmtMoney(g.target.value)} <small>/ ${fmtMoney(g.target.n)}</small></b></div><div class="bar"><i style="width:${pct}%"></i></div></div>
    <ul class="goallist">${g.list.map(row).join('')}</ul>`;
}

export function pumpToasts(R){
  if (!R) return;
  const box = $('toasts');
  while (R.toasts.length){
    const t = R.toasts.shift(), el = document.createElement('div');
    el.className = `toast ${t.tone}`; el.textContent = t.text;
    box.appendChild(el);
    setTimeout(() => el.classList.add('gone'), 3200);
    setTimeout(() => el.remove(), 3700);
  }
}
export function flash(text, tone = 'info'){
  const box = $('toasts'), el = document.createElement('div');
  el.className = `toast ${tone}`; el.textContent = text;
  box.appendChild(el);
  setTimeout(() => el.classList.add('gone'), 2600);
  setTimeout(() => el.remove(), 3100);
}

// ---------- restock drawer ----------
export function renderRestock(S, R, cart, live){
  const rows = visibleIngredients(S).map(k => [k, INGREDIENTS[k]]).map(([k, ing]) => {
    const n = cart[k] || 0, room = packsRoom(S, R, k), full = n >= room;
    const uses = MENU_ORDER.filter(m => itemReady(S, m) && MENU[m].recipe[k]).map(m => MENU[m].zh).join(' · ');
    return `<div class="rrow">
      <span class="chip" style="--c:${ing.color}">${ing.glyph}</span>
      <div class="rname"><b>${ing.name}</b><small>${ing.zh} · for ${uses}</small>
        <small>${ing.pack} per pack · ${fmtMoney(ing.cost)} · ${live ? `arrives in ${ing.delivery}s` : 'arrives before opening'}</small></div>
      <div class="rstock"><small>In stock</small><b>${S.stock[k]}<small> / ${capacity(S, k)}</small></b><small class="${room ? '' : 'bad'}">${room ? `room for ${room - n} more` : 'shelves full'}</small></div>
      <div class="stepper"><button data-dec="${k}" aria-label="One pack fewer of ${ing.name}" ${n ? '' : 'disabled'}>−</button><output>${n}</output><button data-inc="${k}" aria-label="One more pack of ${ing.name}" ${full ? 'disabled' : ''}>+</button></div>
    </div>`;
  }).join('');
  const total = Object.entries(cart).reduce((s, [k, n]) => s + INGREDIENTS[k].cost * n, 0);
  $('drawer').innerHTML = `
    <div class="dhead"><h2><span class="zh">入貨</span> Order stock</h2><button class="x" data-close aria-label="Close">×</button></div>
    <p class="muted">${live ? 'Deliveries take time, so order before you run out. The shop keeps trading while you wait.' : 'Anything you order now is delivered before you open.'}</p>
    <div class="rrows">${rows}</div>
    <div class="dfoot"><div><small>Total</small><b class="${total > S.money ? 'neg' : ''}">${fmtMoney(total)}</b><small>Cash ${fmtMoney(S.money)}</small></div>
    <button class="primary" data-buy ${total && total <= S.money ? '' : 'disabled'}>Place order</button></div>`;
}

// ---------- shop / editor ----------
export function renderEditor(S, ui){
  const E = ui.edit, el = $('editor');
  const kitchen = E.room === 'kitchen';
  const sel = E.selected && (kitchen ? S.kitchen.find(i => i.id === E.selected) : (S.dining.items.find(i => i.id === E.selected) || S.dining.wall.find(i => i.id === E.selected)));
  let cards;
  if (kitchen){
    const nk = KITCHEN_SIZES[(S.kitchenSize || 0) + 1];
    const kCard = nk ? (level(S) < nk.level
      ? `<button class="card expand locked" disabled><span class="glyph">擴</span><b>${nk.name}</b><small>${nk.zh} · 2 more columns</small><em>Level ${nk.level}</em></button>`
      : `<button class="card expand" data-expand-kitchen ${nk.price > S.money ? 'disabled' : ''}><span class="glyph">擴</span><b>${nk.name}</b><small>${nk.zh} · 2 more columns of kitchen</small><em>${fmtMoney(nk.price)}</em></button>`) : '';
    cards = kCard + APPLIANCE_SHOP.map(k => {
      const ap = APPLIANCES[k], makes = ap.makes ? MENU[ap.makes] : null;
      const detail = makes ? `${makes.zh} · ${Math.round(makes.cook * ap.speed * 10) / 10}s${ap.pro ? ' · faster' : ''}` : 'Holds +1 pack of everything';
      if (ap.makes && !itemReady(S, ap.makes)) return `<button class="card locked" disabled title="Opens at level ${itemLevel(ap.makes)}"><img src="${icon(ap.makes)}" alt=""><b>${ap.name}</b><small>${makes.zh} · ${makes.name}</small><em>Level ${itemLevel(ap.makes)}</em></button>`;
      const isNew = ap.makes && !hasStation(S, ap.makes) && !ap.pro;
      return card(k, ap.name, ap.zh, detail, ap.price, S.money, ap.makes ? `<img src="${icon(ap.makes)}" alt="">` : `<span class="glyph">貨</span>`, (ap.pro ? 'pro' : '') + (isNew ? ' fresh' : ''));
    }).join('');
  } else {
    const next = DINING_SIZES[S.diningSize + 1];
    const floorCards = Object.entries(DECOR).filter(([k, d]) => d.kind === 'floor' && (E.style === 'all' || d.style === E.style) && (E.cat === 'all' || E.cat === 'floor'))
      .map(([k, d]) => {
        const owned = S.dining.ownedFloors.includes(k), using = S.dining.floor === k;
        return `<button class="card floor ${using ? 'using' : ''}" data-floor="${k}" ${!owned && d.price > S.money ? 'disabled' : ''}>
          <span class="thumb floor-${k}"></span><b>${d.name}</b><small>${d.zh} · ${STYLES[d.style].zh}</small>
          ${using ? '' : `<span class="gain">+${appealGain(S, k)} ambience</span>`}<em>${using ? 'In use' : owned ? 'Owned · use' : fmtMoney(d.price)}</em></button>`;
      }).join('');
    const items = Object.entries(DECOR).filter(([k, d]) => d.kind !== 'floor' && !d.hidden && (E.style === 'all' || d.style === E.style) && (E.cat === 'all' || E.cat === d.kind))
      .map(([k, d]) => (d.level || 0) > level(S)
        ? `<button class="card locked ${d.style}" disabled title="Opens at level ${d.level}"><canvas class="dthumb" data-thumb="${k}" width="120" height="96"></canvas><b>${d.name}</b><small>${d.zh} · ${STYLES[d.style].name}</small><em>Level ${d.level}</em></button>`
        : card(k, d.name, d.zh, `${STYLES[d.style].name} · ${kindName(d.kind)}`, d.price, S.money, `<canvas class="dthumb" data-thumb="${k}" width="120" height="96"></canvas>`, d.style + (d.level ? ' premium' : ''), appealGain(S, k))).join('');
    const expandCard = next ? `<button class="card expand" data-expand ${next.price > S.money ? 'disabled' : ''}>
        <span class="glyph">擴</span><b>${next.name}</b><small>${next.zh} · room for ${next.w - DINING_SIZES[S.diningSize].w} more columns</small><em>${fmtMoney(next.price)}</em></button>` : '';
    cards = expandCard + items + floorCards;
  }
  const filters = kitchen ? '' : `<div class="filters">
      ${['all', 'old', 'simple', 'modern'].map(s => `<button data-style="${s}" class="${E.style === s ? 'on' : ''}">${s === 'all' ? 'All styles' : `${STYLES[s].zh} ${STYLES[s].name}`}</button>`).join('')}
      <span class="sep"></span>
      ${['all', 'table', 'seat', 'block', 'ceiling', 'wall', 'floor'].map(c => `<button data-cat="${c}" class="${E.cat === c ? 'on' : ''}">${c === 'all' ? 'Everything' : kindName(c)}</button>`).join('')}
    </div>`;
  const seats = seatReport(S), bad = seats.filter(r => !r.ok);
  const status = kitchen ? `<p class="muted">Each appliance is used from the tile it faces (the light square while placing). Shorter walks between the ones you use most means faster service.</p>`
    : `<p class="muted"><b>${seats.length - bad.length}</b> working seats, so at most ${seats.length - bad.length} customers at once.${bad.length ? ` <span class="bad">${bad.length} seat${bad.length > 1 ? 's' : ''} marked ! ${bad.length > 1 ? 'aren’t' : 'isn’t'} usable: a seat must face a table and be reachable from the door.</span>` : ''}</p>`;
  const selBar = E.ghostItem
    ? `<div class="selbar"><span>${E.moving ? 'Moving' : 'Placing'} <b>${kitchen ? APPLIANCES[E.ghostItem.type].name : DECOR[E.ghostItem.type].name}</b>. Drop it on a green square. <kbd>R</kbd> rotates, <kbd>Esc</kbd> cancels.</span></div>`
    : `<div class="selbar"><span>Drag a card into the ${kitchen ? 'kitchen' : 'room'} to buy it. Drag anything already there to move it. Click it to rotate or sell.</span></div>`;
  const amb = ambience(S);
  const ambLine = kitchen ? '' : `<div class="ambline"><span>Ambience <b>${amb.total}</b> · ${amb.tier.zh} ${amb.tier.name}${amb.next ? ` (${amb.next.min - amb.total} to ${amb.next.name.toLowerCase()})` : ''}</span>
      ${amb.styles.map(g => `<span class="set">${STYLES[g.style].zh} ${g.n} pieces <b>×${g.mult.toFixed(2)}</b></span>`).join('')}</div>`;
  el.innerHTML = `
    <div class="ehead"><h2><span class="zh">${kitchen ? '廚房' : '裝修'}</span> ${kitchen ? 'Kitchen layout' : 'Dining room'}</h2>
      <span class="cash">${fmtMoney(S.money)}</span><span class="paused">Game paused</span><button class="primary" data-done>Done</button></div>
    ${status}${ambLine}${selBar}${filters}
    <div class="cards">${cards}</div>`;
}
const kindName = k => ({ table: 'Tables', seat: 'Seats', block: 'Counters & plants', ceiling: 'Ceiling', wall: 'Wall', floor: 'Floors' })[k] || k;
function card(k, name, zh, detail, price, money, art, cls, gain){
  return `<button class="card ${cls}" data-buy="${k}" ${price > money ? 'disabled' : ''} title="Drag into the room, or click then click a spot">${art}<b>${name}</b><small>${zh} · ${detail}</small>${gain !== undefined ? `<span class="gain">+${gain} ambience</span>` : ''}<em>${fmtMoney(price)}</em></button>`;
}

// ---------- modals ----------
export function modal(html){
  $('modalCard').innerHTML = html;
  $('modal').hidden = false;
}
export function closeModal(){ $('modal').hidden = true; }

export function titleHTML(hasSave){
  return `<div class="title">
    <div class="sign">${THEME.meta.sign.replace(/ /g, '')}</div>
    <h1>${THEME.meta.name}</h1>
    <p>${THEME.meta.intro}</p>
    <ul class="how">
      <li><b>Click a station</b> to give the cook a job. Keep clicking to line up more (up to ${QUEUE_MAX}); one more click clears that station’s jobs. Right-click clears them straight away.</li>
      <li>Finished items wait on the <b>pass</b> (it holds ${PASS_MAX}). Tickets go out in the order they came in, as soon as everything on them is ready.</li>
      <li>Fast tickets earn <b>bigger tips</b> and popularity. Slow ones walk out. Items nobody needs go stale and cost you.</li>
      <li>Watch your <b>stock</b>. Deliveries take time, and if you sell out of everything you have to close early.</li>
      <li>Hit the <b>daily targets</b> for stars. Stars raise your level, and new levels open up new dishes.</li>
      <li>Between days, spend your takings on <b>furniture, a bigger dining room and better appliances</b>.</li>
    </ul>
    <label class="learnopt"><input type="checkbox" id="learnTitle"> <span><b>學 Learning mode</b>: tickets and customers use ${THEME.meta.lang.name} with ${THEME.meta.lang.romanisation}, which fades as you learn each dish. You can switch it any time.</span></label>
    <div class="btns">${hasSave ? '<button class="primary" data-continue>Continue</button><button data-new>New game</button>' : '<button class="primary" data-new>Open the shop</button>'}</div>
    ${otherGames()}
  </div>`;
}

export function summaryHTML(S, R){
  const st = R.stats, profit = S.money - st.moneyStart, dPop = S.popularity - st.popStart;
  const low = visibleIngredients(S).filter(k => S.stock[k] < 6).map(k => `${INGREDIENTS[k].name.toLowerCase()} (${S.stock[k]})`);
  return `<div class="summary">
    <p class="eyebrow">Day ${S.day} ${R.forcedAt ? `· closed early at ${R.forcedAt}` : '· closed at 18:00'}</p>
    <h2>${st.served ? `${st.served} tickets out the door` : 'A quiet day'}</h2>
    <dl class="sumgrid">
      <div><dt>Sales</dt><dd>${fmtMoney(st.revenue)}</dd></div>
      <div><dt>Tips</dt><dd>${fmtMoney(st.tips)}</dd></div>
      <div><dt>Wasted</dt><dd class="${st.waste ? 'bad' : ''}">${st.waste ? '−' + fmtMoney(st.waste) : '$0'}</dd></div>
      <div><dt>Cash change</dt><dd class="${profit < 0 ? 'bad' : 'good'}">${profit >= 0 ? '+' : ''}${fmtMoney(profit)}</dd></div>
      <div><dt>Walked out</dt><dd class="${st.walkouts ? 'bad' : ''}">${st.walkouts}</dd></div>
      <div><dt>Turned away</dt><dd>${st.lost}</dd></div>
      <div><dt>Items made</dt><dd>${st.made}</dd></div>
      <div><dt>Popularity</dt><dd class="${dPop < 0 ? 'bad' : 'good'}">${Math.round(S.popularity)} (${dPop >= 0 ? '+' : ''}${Math.round(dPop)})</dd></div>
    </dl>
    <div class="sumgoals"><h3>Targets ${'★'.repeat(R.results.stars)}${'☆'.repeat(3 - R.results.stars)}</h3>${goalsHTML(R.results, true)}
      ${R.results.bonus ? `<p class="good">Bonus earned: ${fmtMoney(R.results.bonus)}${R.results.target.done ? ` and +${TARGET_REWARD.popularity} popularity` : ''}</p>` : '<p class="muted">No bonus today. Tomorrow’s targets are shown before you open.</p>'}</div>
    ${R.results.levelUp ? `<div class="levelup"><b>Level ${R.results.levelUp}!</b> ${R.results.newItems.map(m => `${MENU[m].zh} ${MENU[m].name.toLowerCase()}`).join(' and ')} ${R.results.newItems.length > 1 ? 'are' : 'is'} now available. Buy the station in the kitchen and order its ingredients, and it goes on the menu.</div>` : ''}
    ${st.lost ? `<p class="muted">${st.lost} customer${st.lost > 1 ? 's' : ''} couldn't get a seat or found nothing on the menu. More seats means more customers at once.</p>` : ''}
    ${low.length ? `<p class="warnline">Running low: ${low.join(', ')}. Anything you order tonight arrives before opening.</p>` : ''}
    <div class="btns"><button data-restock>Order stock</button><button data-edit="kitchen">Rearrange kitchen</button><button data-edit="dining">Redecorate</button><button class="primary" data-next>On to day ${S.day + 1}</button></div>
  </div>`;
}

// Links to the other restaurants built on this engine.
const GAMES = [{ id: 'cct', name: 'Cha Chaan Teng Rush', zh: '茶餐廳' }, { id: 'dimsum', name: 'Dim Sum Rush', zh: '飲茶' }];
function otherGames(){
  const others = GAMES.filter(g => g.id !== (THEME && THEME.id));
  return others.length ? `<p class="games">Also open: ${others.map(g => `<a href="?game=${g.id}">${g.zh} ${g.name} →</a>`).join(' ')}</p>` : '';
}

// The word list: every dish you can make, with how well you know it.
export function wordsHTML(S){
  const rows = MENU_ORDER.filter(m => itemReady(S, m)).map(m => {
    const seen = (S.learned || {})[m] || 0, pct = Math.min(100, seen / KNOWN_AFTER * 100), k = known(S, m);
    return `<tr class="${k ? 'known' : ''}"><td class="wzh">${MENU[m].zh}</td><td class="wjp">${MENU[m].jp || ''}</td><td>${MENU[m].name}</td>
      <td class="wbar"><div class="bar"><i style="width:${pct}%"></i></div><small>${k ? 'Known ★' : `${seen} of ${KNOWN_AFTER} served`}</small></td></tr>`;
  }).join('');
  const sample = THEME.phrase({ [MENU_ORDER[0]]: 2 });
  return `<div class="summary words">
    <p class="eyebrow">學 Learning mode · ${THEME.meta.lang.name}</p>
    <h2>Your words</h2>
    <label class="learnopt"><input type="checkbox" id="learnToggle" ${S.learning ? 'checked' : ''}> <span><b>Learning mode ${S.learning ? 'on' : 'off'}</b>. Tickets show dish names in ${THEME.meta.lang.name} with ${THEME.meta.lang.romanisation}. Customers say their whole order (for example 「${sample.zh}」 <i>${sample.jp}</i>). After ${KNOWN_AFTER} servings a dish is known: its picture drops off the ticket, and tickets you fill by reading alone tip ${Math.round(.15 * 100)}% more.</span></label>
    <table class="wtable"><thead><tr><th>Dish</th><th>${THEME.meta.lang.romanisation}</th><th>English</th><th>Progress</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="btns"><button class="primary" data-closewords>Back to the shop</button></div>
  </div>`;
}
