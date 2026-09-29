// Dim sum teahouse (飲茶) theme: Dim Sum Rush.
import * as data from './data.js';
import * as art from './art.js';

export const id = 'dimsum';

export const meta = {
  name: 'Dim Sum Rush',
  brandZh: '飲茶', brandEn: 'Rush',
  sign: '金 龍 酒 家',
  place: 'dim sum teahouse',
  intro: 'It’s Sunday morning at the Golden Dragon. Pour the pu-erh, keep the steamers going, and push the trolley between the tables before the whole family gets hungry.',
  saveKey: 'dimsum-rush-save-v1',
  passName: 'On the trolley', passZh: '點心車',
  boosts: { cook: { zh: '濃茶', name: 'Strong tea for the cook' }, patience: { zh: '送小食', name: 'Free snacks round' } },
  passMax: 8,                 // the trolley holds more than a hatch
  trolley: true,              // waiters push a trolley out to the tables
  passOverflow: 'discard',
  targetScale: .92,           // many small baskets: slightly gentler sales targets    // a full trolley sheds its oldest unwanted basket instead of making the cook wait
  palette: { mint: '#efe0bf', dado: '#7e1a16', band: '#d9a93b', kitchenA: '#8e9a96', kitchenB: '#a3aea9' },
  lang: { voice: 'zh-HK', name: 'Cantonese', romanisation: 'Jyutping' },
  splash: {
    board: '飲茶', word: 'RUSH',
    tagZh: '一盅兩件，嘆番杯茶。', tag: 'Steam the dumplings. Push the trolley. Feed the Sunday crowd.',
    signs: [['酒家', '#ff3b30', 6, 14, true, 6.2], ['點心', '#ffd23f', 16, 30, true, 5.2], ['蝦餃', '#ff8fd0', 83, 12, true, 5.6],
            ['燒賣', '#ffa53b', 92, 34, true, 5.0], ['叉燒包', '#ff5fa2', 70, 40, false, 4.0], ['茶', '#39e07a', 25, 8, false, 4.4],
            ['龍鳳', '#5ad1ff', 62, 7, false, 4.4], ['喜宴', '#ffe45c', 3, 50, false, 3.6]],
  },
};

// "唔該，兩籠蝦餃，一壺普洱！" — how a table orders
const NUM = ['', '一', '兩', '三', '四', '五'], NUM_JP = ['', 'jat1', 'loeng5', 'saam1', 'sei3', 'ng5'];
const MEASURE_JP = { 籠: 'lung4', 碟: 'dip6', 壺: 'wu4', 個: 'go3', 盅: 'zung1' };
export function phrase(items){
  const parts = Object.entries(items).map(([k, n]) => {
    const m = data.MENU[k], mw = m.m || '個';
    return { zh: `${NUM[Math.min(n, 5)]}${mw}${m.zh}`, jp: `${NUM_JP[Math.min(n, 5)]} ${MEASURE_JP[mw] || ''} ${m.jp || ''}`.replace(/\s+/g, ' ').trim() };
  });
  return { zh: '唔該，' + parts.map(p => p.zh).join('，') + '！', jp: 'm4 goi1, ' + parts.map(p => p.jp).join(', ') + '!', en: 'please' };
}
export function callout(items){
  return Object.entries(items).map(([k, n]) => `${NUM[Math.min(n, 5)]}${data.MENU[k].m || '個'}${data.MENU[k].zh}`).join('，');
}

export { data, art };
