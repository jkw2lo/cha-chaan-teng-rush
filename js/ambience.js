// How good the dining room looks. Every piece of decor adds appeal; pieces of
// the same style multiply each other, so a matching set beats a jumble.
import { DECOR, SET_STEP, SET_CAP, AMBIENCE_TIERS, AMBIENCE_MAX } from './data.js';

export const setMultiplier = n => Math.min(SET_CAP, 1 + SET_STEP * Math.max(0, n - 1));

export function ambience(S){
  const pieces = [...S.dining.items, ...S.dining.wall, { type: S.dining.floor }];
  const byStyle = {};
  for (const it of pieces){
    const d = DECOR[it.type];
    if (!d || !d.appeal) continue;
    const g = (byStyle[d.style] ||= { style: d.style, n: 0, base: 0 });
    g.n++; g.base += d.appeal;
  }
  const styles = Object.values(byStyle).map(g => ({ ...g, mult: setMultiplier(g.n), pts: Math.round(g.base * setMultiplier(g.n)) }))
    .sort((a, b) => b.pts - a.pts);
  const total = styles.reduce((s, g) => s + g.pts, 0);
  let tier = AMBIENCE_TIERS[0];
  for (const t of AMBIENCE_TIERS) if (total >= t.min) tier = t;
  const next = AMBIENCE_TIERS.find(t => t.min > total) || null;
  return { total, styles, tier, next };
}

// What ambience does in play: more people wander in, and they tip a little better.
// Both bonuses grow in a straight line and top out at AMBIENCE_MAX.
export const ambienceEffect = total => {
  const f = Math.min(1, total / AMBIENCE_MAX);
  return { customers: 1 + .5 * f, tips: 1 + .4 * f };
};

// Points a new piece would add right now, counting the set bonus it joins.
export function appealGain(S, type){
  const before = ambience(S).total;
  const d = DECOR[type];
  const trial = d.kind === 'floor'
    ? { ...S, dining: { ...S.dining, floor: type } }
    : d.kind === 'wall'
      ? { ...S, dining: { ...S.dining, wall: [...S.dining.wall, { type }] } }
      : { ...S, dining: { ...S.dining, items: [...S.dining.items, { type }] } };
  return ambience(trial).total - before;
}
