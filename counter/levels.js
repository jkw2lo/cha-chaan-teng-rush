// Counter Rush levels: a ladder of days, then 搏命 Do or Die.
// Each day is a three-minute shift with its own stations, pace and target; hitting the target
// unlocks the next day. Clearing the last day opens Do or Die: one shift with no closing time,
// levelling up at each takings mark until three customers walk out.
// The difficulty setting (settings.js) multiplies everything here.

// stations: which columns are open (the rest are shuttered); two = chance of a two-item order
export const DAYS = [
  { n: 1, zh: '開張', name: 'Opening day',     note: 'Just drinks and buns',          stations: ['drinks', 'buns'],                   target: 250, pace: .8,  patience: 1.15, two: 0 },
  { n: 2, zh: '多士', name: 'Toast time',      note: 'The toaster opens',             stations: ['drinks', 'buns', 'toast'],          target: 300, pace: .9,  patience: 1.05, two: .15 },
  { n: 3, zh: '粉麵', name: 'Noodle day',      note: 'The noodle pot opens',          stations: ['drinks', 'buns', 'toast', 'noodles'], target: 340, pace: .95, patience: 1,    two: .25 },
  { n: 4, zh: '全餐', name: 'Full menu',       note: 'More people order two things',  stations: ['drinks', 'buns', 'toast', 'noodles'], target: 420, pace: 1,   patience: 1,    two: .35 },
  { n: 5, zh: '午市', name: 'Lunch rush',      note: 'Customers come in faster',      stations: ['drinks', 'buns', 'toast', 'noodles'], target: 450, pace: 1.2, patience: .95,  two: .4 },
  { n: 6, zh: '落雨', name: 'Rainy day crowd', note: 'Busy, and nobody wants to wait', stations: ['drinks', 'buns', 'toast', 'noodles'], target: 480, pace: 1.3, patience: .8,   two: .45 },
];
export const ENDLESS = {
  zh: '搏命', name: 'Do or Die', note: 'No closing time. Every takings mark is a new level, and each level is faster. Three walkouts and it’s over.',
  strikes: 3,
  // takings needed to reach level L+1 (running total): 150, 320, 510, 720, …
  mark: L => { let m = 0; for (let k = 1; k <= L; k++) m += 130 + 20 * k; return m; },
  // how level L plays
  level: L => ({ pace: 1 + .12 * (L - 1), patience: Math.max(.5, 1 - .06 * (L - 1)), two: Math.min(.6, .3 + .05 * (L - 1)) }),
};

// The day a station first opens, for the shutter sign.
export const opensOn = id => DAYS.find(d => d.stations.includes(id))?.n;

// ---------- saved progress ----------
const KEY = 'counter-rush-progress-v1';
export function loadProgress(){
  let p = null;
  try { p = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  return { stars: {}, best: {}, endless: null, ...(p || {}) };          // stars[n], best[n] = takings, endless = { level, takings }
}
export function saveProgress(p){ try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
// Day 1 is always open; each later day opens once the one before has a star. Do or Die opens after the last day.
export const unlocked = (p, n) => n === 1 || (p.stars[n - 1] || 0) >= 1;
export const endlessUnlocked = p => (p.stars[DAYS.length] || 0) >= 1;
export const totalStars = p => Object.values(p.stars).reduce((a, b) => a + b, 0);
export const furthestDay = p => DAYS.filter(d => unlocked(p, d.n)).pop().n;

// What the sim needs for a day (or Do or Die), with the difficulty setting applied.
export function runConfig(which, settings, stations){
  const mul = { patience: settings.patience, pace: settings.pace, window: settings.window, target: settings.target };
  if (which === 'endless') return { ...mul, target: 0, endless: true, open: stations.map((_, i) => i), two: ENDLESS.level(1).two, dayLabel: `${ENDLESS.zh} ${ENDLESS.name}` };
  const d = DAYS[which - 1];
  return { patience: d.patience * mul.patience, pace: d.pace * mul.pace, window: mul.window,
    target: Math.round(d.target * mul.target / 10) * 10, two: d.two, day: d.n,
    open: stations.map((s, i) => d.stations.includes(s.id) ? i : -1).filter(i => i >= 0), dayLabel: `Day ${d.n} · ${d.name}` };
}
