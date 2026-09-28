// Cha chaan teng (茶餐廳) theme: the original Cha Chaan Teng Rush.
import * as data from './data.js';
import * as art from './art.js';

export const id = 'cct';

export const meta = {
  name: 'Cha Chaan Teng Rush',
  brandZh: '茶餐廳', brandEn: 'Rush',
  sign: '旺 記 茶 餐 廳',
  place: 'cha chaan teng',
  intro: 'You’ve taken over a tiny cha chaan teng. Brew the milk tea, warm the pineapple buns, keep the shelves stocked, and turn it into the busiest spot on the street.',
  saveKey: 'cct-rush-save-v1',
  passName: 'On the pass', passZh: '出餐',
  // language for learning mode and spoken orders
  lang: { voice: 'zh-HK', name: 'Cantonese', romanisation: 'Jyutping' },
  splash: {
    board: '茶餐廳', word: 'RUSH',
    tagZh: '一杯奶茶，一日開始。', tag: 'Brew the milk tea. Feed the street. Survive the lunch rush.',
    signs: [['冰室', '#ff5fa2', 6, 14, true, 6.2], ['燒臘', '#ff3b30', 16, 30, true, 5.2], ['涼茶', '#39e07a', 83, 12, true, 5.6],
            ['麻雀', '#5ad1ff', 92, 34, true, 5.0], ['粥麵', '#ffd23f', 73, 40, false, 4.2], ['士多', '#ffa53b', 25, 8, false, 3.8],
            ['奶茶', '#ff8fd0', 64, 7, false, 4.4], ['菠蘿油', '#ffe45c', 3, 50, false, 3.4]],
  },
};

// How a customer orders, for learning mode and call-outs: "兩杯熱奶茶，唔該".
const NUM = ['', '一', '兩', '三', '四', '五'], NUM_JP = ['', 'jat1', 'loeng5', 'saam1', 'sei3', 'ng5'];
const MEASURE_JP = { 杯: 'bui1', 個: 'go3', 份: 'fan6', 碗: 'wun2', 碟: 'dip6', 籠: 'lung4', 壺: 'wu4', 件: 'gin6' };
export function phrase(items){
  const parts = Object.entries(items).map(([k, n]) => {
    const m = data.MENU[k], mw = m.m || '個';
    return { zh: `${NUM[Math.min(n, 5)]}${mw}${m.zh}`, jp: `${NUM_JP[Math.min(n, 5)]} ${MEASURE_JP[mw] || ''} ${m.jp || ''}`.replace(/\s+/g, ' ').trim() };
  });
  return { zh: parts.map(p => p.zh).join('，') + '，唔該！', jp: parts.map(p => p.jp).join(', ') + ', m4 goi1!', en: 'please' };
}
// what the kitchen shouts when a ticket comes in (shorter than what the customer says)
export function callout(items){
  return Object.entries(items).map(([k, n]) => `${n > 1 ? NUM[Math.min(n, 5)] + (data.MENU[k].m || '個') : ''}${data.MENU[k].zh}`).join('，');
}

export { data, art };
