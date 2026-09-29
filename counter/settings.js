// Counter Rush difficulty: one slider for a preset, plus four fine-tune knobs it sets.
// Saved per browser; a new setting takes effect from the next day you open.
const KEY = 'counter-rush-difficulty-v3';     // v3: the target is a multiplier on each day's own target
export const PRESETS = [
  { name: 'Relaxed', zh: '慢慢嚟', patience: 1.6,  pace: .7,  window: 1.6,  target: .6 },
  { name: 'Easy',    zh: '輕鬆',   patience: 1.3,  pace: .85, window: 1.3,  target: .8 },
  { name: 'Normal',  zh: '正常',   patience: 1,    pace: 1,   window: 1,    target: 1 },
  { name: 'Busy',    zh: '好忙',   patience: .8,   pace: 1.2, window: .8,   target: 1.25 },
  { name: 'Frantic', zh: '癲咗',   patience: .65,  pace: 1.4, window: .65,  target: 1.5 },
];
// the fine-tune knobs: what they're called, their range, and how to show a value
export const KNOBS = [
  { id: 'patience', label: 'Customer patience', min: .5, max: 2,   step: .05, fmt: v => `×${v.toFixed(2)}`, hint: 'How long people wait before walking out' },
  { id: 'pace',     label: 'Customers coming in', min: .5, max: 2, step: .05, fmt: v => `×${v.toFixed(2)}`, hint: 'Higher means shorter gaps between arrivals' },
  { id: 'window',   label: 'Cooking window',    min: .4, max: 2.5, step: .05, fmt: v => `×${v.toFixed(2)}`, hint: 'How long the green “ready” stretch lasts before food burns' },
  { id: 'target',   label: 'Takings targets',   min: .5, max: 2,   step: .05, fmt: v => `×${v.toFixed(2)}`, hint: 'Scales every day’s target (the first star)' },
];

export function loadSettings(){
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  const base = { preset: 2, ...PRESETS[2] };
  if (!s) return base;
  for (const k of KNOBS) if (typeof s[k.id] === 'number') base[k.id] = Math.min(k.max, Math.max(k.min, s[k.id]));
  if (Number.isInteger(s.preset)) base.preset = s.preset;
  return base;
}
export function saveSettings(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
export const matchesPreset = s => { const p = PRESETS[s.preset]; return !!p && KNOBS.every(k => Math.abs(p[k.id] - s[k.id]) < 1e-6); };
export const settingsLabel = s => matchesPreset(s) ? `${PRESETS[s.preset].zh} ${PRESETS[s.preset].name}` : 'Custom';
