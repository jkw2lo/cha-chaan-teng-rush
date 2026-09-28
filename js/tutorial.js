// A short walkthrough of the screen for new games: dims everything, spotlights one area
// at a time and explains it. Back / Next / Skip, arrow keys and Esc work too.

import { THEME } from './data.js';
const $ = s => document.querySelector(s);

// target: a CSS selector, or a function returning a DOMRect-like {left, top, width, height}
export function buildSteps(kitchenRect){
  return [
    { target: '#stage', title: `Welcome to your ${THEME.meta.place}`,
      text: 'The dining room is at the back and the kitchen is at the front. Customers walk in, sit down and order. You run the kitchen.' },
    { target: '#rail', title: 'Order tickets',
      text: 'Every order hangs here with a timer. Serve it before the bar runs out or the customer walks out. Faster service means bigger tips.' },
    { target: kitchenRect, title: 'Stations',
      text: 'Each station makes one thing, and the icon above it shows what. Click a station to give the cook that job. Keep clicking to line up more.' },
    { target: '.cookbar > .panel:nth-child(1)', title: 'Cook’s queue',
      text: 'The cook works through up to 5 jobs in order. Once the queue is full, clicking a station again clears its jobs. Right-click clears them right away.' },
    { target: '.cookbar > .panel:nth-child(2)', title: 'On the pass',
      text: 'Finished food waits here (5 spots). Tickets go out in the order they came in, as soon as everything on them is ready. Food left too long goes to waste.' },
    { target: '.invpanel', title: 'Inventory',
      text: 'Every dish uses ingredients. The + button orders one pack. Deliveries take time, so order before you run out. Some ingredients unlock new dishes.' },
    { target: () => union($('#today').parentElement, $('#goals').parentElement), title: 'Today and targets',
      text: 'Hit the daily targets for up to 3 stars. Stars raise your level, and new levels open up new dishes.' },
    { target: '.actions', title: 'Between days',
      text: 'Order stock, rearrange the kitchen and redecorate the dining room. Nicer decor brings in more customers.' },
    { target: '#openBtn', title: 'Ready?',
      text: 'Open the shutters when you’re ready. Good luck!', last: true },
  ];
}
function union(a, b){
  const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
  const left = Math.min(r1.left, r2.left), top = Math.min(r1.top, r2.top);
  return { left, top, width: Math.max(r1.right, r2.right) - left, height: Math.max(r1.bottom, r2.bottom) - top };
}

export function runTour(steps, onDone){
  const wrap = document.createElement('div');
  wrap.className = 'tour';
  wrap.innerHTML = `<div class="tour-hole"></div><div class="tour-card" role="dialog" aria-live="polite"></div>`;
  document.body.appendChild(wrap);
  const hole = wrap.querySelector('.tour-hole'), card = wrap.querySelector('.tour-card');
  let i = 0;

  function rectOf(step){
    const t = typeof step.target === 'function' ? step.target() : $(step.target)?.getBoundingClientRect();
    return t || { left: innerWidth / 2 - 100, top: innerHeight / 2 - 50, width: 200, height: 100 };
  }
  function place(){
    const step = steps[i], r = rectOf(step), pad = 8;
    Object.assign(hole.style, { left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
    card.innerHTML = `<p class="tour-step">${i + 1} of ${steps.length}</p><h3>${step.title}</h3><p>${step.text}</p>
      <div class="tour-btns"><button data-t="skip" class="tour-skip">Skip tour</button>
      ${i ? '<button data-t="back">Back</button>' : ''}<button data-t="next" class="primary">${step.last ? 'Let’s go' : 'Next'}</button></div>`;
    // put the card beside the spotlight, wherever there's room
    const cw = 340, ch = card.offsetHeight || 190, gap = 16;
    let left, top;
    if (r.left + r.width + gap + cw < innerWidth) { left = r.left + r.width + gap; top = r.top; }
    else if (r.top + r.height + gap + ch < innerHeight) { left = r.left; top = r.top + r.height + gap; }
    else if (r.top - gap - ch > 0) { left = r.left; top = r.top - gap - ch; }
    else if (r.left - gap - cw > 0) { left = r.left - gap - cw; top = r.top; }
    else { left = innerWidth / 2 - cw / 2; top = innerHeight / 2 - ch / 2; }
    card.style.left = `${Math.max(12, Math.min(innerWidth - cw - 12, left))}px`;
    card.style.top = `${Math.max(12, Math.min(innerHeight - ch - 12, top))}px`;
    card.querySelector('[data-t="next"]').focus();
  }
  function end(){ removeEventListener('resize', place); removeEventListener('keydown', keys); wrap.remove(); onDone && onDone(); }
  function go(d){ i += d; if (i >= steps.length) return end(); i = Math.max(0, i); place(); }
  function keys(e){
    if (e.key === 'Escape'){ e.preventDefault(); end(); }
    if (e.key === 'ArrowRight' || e.key === 'Enter'){ e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); }
  }
  card.addEventListener('click', e => {
    const t = e.target.closest('button')?.dataset.t;
    if (t === 'next') go(1); else if (t === 'back') go(-1); else if (t === 'skip') end();
  });
  addEventListener('resize', place);
  addEventListener('keydown', keys);
  place(); requestAnimationFrame(place);
}
