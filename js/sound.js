// Every sound is synthesised with Web Audio, so there are no audio files to load.
// Spoken call-outs use the browser's built-in Cantonese voice (zh-HK) where one is installed.

const PREF_KEY = 'cct-rush-sound';
let ac = null, master = null, sizzle = null;
let mode = 'all';                                   // 'all' | 'sfx' (no voice) | 'off'
try { mode = localStorage.getItem(PREF_KEY) || 'all'; } catch (e) {}

export const soundMode = () => mode;
export function cycleSound(){
  mode = mode === 'all' ? 'sfx' : mode === 'sfx' ? 'off' : 'all';
  try { localStorage.setItem(PREF_KEY, mode); } catch (e) {}
  if (mode === 'off') stopSizzle();
  return mode;
}

// Browsers only allow audio after the player has clicked something.
export function unlockAudio(){
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
}

function tone(freq, dur, type = 'sine', vol = .2, delay = 0, slideTo){
  if (!ac || mode === 'off') return;
  const t0 = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + .05);
}
function noiseBuffer(){
  const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function noise(dur, vol = .15, freq = 2000, delay = 0, type = 'bandpass'){
  if (!ac || mode === 'off') return;
  const t0 = ac.currentTime + delay, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noiseBuffer(); f.type = type; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  src.connect(f); f.connect(g); g.connect(master); src.start(t0); src.stop(t0 + dur + .05);
}

export const sfx = {
  queue(){ tone(660, .07, 'triangle', .14); tone(990, .07, 'triangle', .1, .05); },
  clear(){ tone(420, .12, 'triangle', .12, 0, 260); },
  deny(){ tone(200, .12, 'square', .07); },
  // a cup set down on the pass
  ready(){ tone(2350, .14, 'sine', .1); tone(3520, .1, 'sine', .05, .01); noise(.04, .06, 4000); },
  // the service bell when a ticket goes out
  bell(){ for (const [f, v] of [[1319, .16], [1976, .08], [2637, .05], [3951, .03]]) tone(f, 1.1, 'sine', v); },
  // the till
  cash(){ noise(.06, .14, 3500); tone(1568, .22, 'triangle', .12, .06); tone(2093, .35, 'triangle', .1, .14); },
  walkout(){ tone(240, .35, 'sawtooth', .07, 0, 140); },
  door(){ tone(1046, .5, 'sine', .07); tone(784, .6, 'sine', .06, .2); },
  delivery(){ tone(523, .1, 'square', .05); tone(659, .1, 'square', .05, .11); tone(784, .18, 'square', .05, .22); },
  waste(){ noise(.25, .1, 600, 0, 'lowpass'); },
  levelUp(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .4, 'triangle', .12, i * .09)); },
  unlock(){ [784, 988, 1175].forEach((f, i) => tone(f, .3, 'triangle', .1, i * .08)); },
};

// A soft frying/boiling bed while the cook is working at a hot station.
export function startSizzle(){
  if (!ac || mode === 'off' || sizzle) return;
  const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noiseBuffer(); src.loop = true; f.type = 'highpass'; f.frequency.value = 3000;
  g.gain.value = 0; g.gain.linearRampToValueAtTime(.035, ac.currentTime + .2);
  src.connect(f); f.connect(g); g.connect(master); src.start();
  sizzle = { src, g };
}
export function stopSizzle(){
  if (!sizzle) return;
  const { src, g } = sizzle; sizzle = null;
  g.gain.linearRampToValueAtTime(0, ac.currentTime + .2); src.stop(ac.currentTime + .25);
}

// ---------- spoken call-outs, in the theme's language ----------
import { THEME } from './data.js';
let voice = null;
function pickVoice(){
  if (!('speechSynthesis' in window) || !THEME) return null;
  const want = THEME.meta.lang.voice.toLowerCase(), base = want.split('-')[0];
  const vs = speechSynthesis.getVoices();
  return vs.find(v => v.lang.replace('_', '-').toLowerCase() === want) || (base === 'zh' ? vs.find(v => /yue/i.test(v.lang)) : vs.find(v => v.lang.toLowerCase().startsWith(base))) || null;
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
export const hasVoice = () => !!(voice || (voice = pickVoice()));
export const hasCantoneseVoice = hasVoice;
export function speak(text, rate = 1.1){
  if (mode !== 'all' || !hasVoice()) return;
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice; u.lang = voice.lang; u.rate = rate; u.volume = .8;
  speechSynthesis.speak(u);
}
// items: { itemKey: count }
export const callOut = items => speak(THEME.callout(items), 1.15);
