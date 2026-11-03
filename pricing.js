'use strict';
/* Fixora — Pricing Guide page script (standalone). */

const root = document.documentElement;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionPaused = () => root.dataset.motion === 'paused' || reducedMotion();
const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;

/* ---------- Image fallback: if an online photo fails, use the local asset ---------- */
$$('img[data-fallback]').forEach(img => {
  const swap = () => { const f = img.dataset.fallback; if (f) { img.removeAttribute('data-fallback'); img.src = f; } };
  img.addEventListener('error', swap, { once: true });
  if (img.complete && img.naturalWidth === 0) swap();
});

/* ---------- Theme ---------- */
const themeButton = $('#theme-toggle');
function themeLabel() {
  const light = root.dataset.theme === 'light';
  $('meta[name="theme-color"]')?.setAttribute('content', light ? '#F0F7FB' : '#0E1C2A');
  themeButton?.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
}
themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  persist('repair-theme', root.dataset.theme);
  themeLabel();
});
themeLabel();

/* ---------- Motion ---------- */
const motionButton = $('#motion-toggle');
function motionLabel() {
  const paused = root.dataset.motion === 'paused';
  motionButton?.setAttribute('aria-pressed', String(paused));
  motionButton?.setAttribute('aria-label', paused ? 'Resume decorative animations' : 'Pause decorative animations');
  if (motionButton) motionButton.textContent = paused ? '▷' : 'Ⅱ';
}
motionButton?.addEventListener('click', () => {
  root.dataset.motion = root.dataset.motion === 'paused' ? 'running' : 'paused';
  persist('repair-motion', root.dataset.motion);
  motionLabel();
});
motionLabel();

/* ---------- Text direction ---------- */
const directionButton = $('#direction-toggle');
function directionLabel() {
  const rtl = root.dir === 'rtl';
  directionButton?.setAttribute('aria-pressed', String(rtl));
  directionButton?.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
}
directionButton?.addEventListener('click', () => {
  root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  persist('repair-direction', root.dir);
  directionLabel();
});
directionLabel();

/* ---------- Mobile menu & dropdown ---------- */
const menu = $('.menu-toggle'), nav = $('#main-nav');
function closeMenu() {
  nav?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', 'Open navigation');
  if (menu) menu.textContent = '☰';
}
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menu.textContent = open ? '×' : '☰';
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeMenu(); $$('.home-dropdown[open]').forEach(d => d.removeAttribute('open')); }
});
document.addEventListener('click', e => {
  $$('.home-dropdown[open]').forEach(d => { if (!d.contains(e.target)) d.removeAttribute('open'); });
});

/* ---------- Hero fills the screen below the header ---------- */
const header = $('.site-header');
function setHeaderHeight() { if (header) root.style.setProperty('--header-h', `${header.offsetHeight}px`); }
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);

/* ---------- Header shadow + back to top ---------- */
const toTop = $('#to-top');
function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 20);
  if (toTop) toTop.hidden = y < 600;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }));

/* ---------- Scroll reveal ---------- */
if ('IntersectionObserver' in window) {
  root.classList.add('js-reveal');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => observer.observe(el));
}

/* ---------- Count-up helper ---------- */
function countTo(el, to, from = 0, duration = 900) {
  if (motionPaused()) { el.textContent = to.toLocaleString('en-IN'); return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased).toLocaleString('en-IN');
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Section 1 · Hero: deal the cards and count up the prices ---------- */
const fan = $('#fan');
if (fan && !motionPaused()) fan.classList.add('dealt');
$$('.fan .count').forEach((el, i) => {
  const to = Number(el.dataset.to);
  el.textContent = '0';
  setTimeout(() => countTo(el, to, 0, 1100), 900 + i * 120);
});

/* ---------- Pricing model (same formula as the home page estimator) ---------- */
const basePrices = { screen: 1499, battery: 999, software: 499, charging: 799 };
const factors = { standard: 1, premium: 1.8, flagship: 2.8 };
const tiers = ['standard', 'premium', 'flagship'];
const tierNames = { standard: 'Everyday models', premium: 'Premium models', flagship: 'Latest flagships' };
const repairNames = { screen: 'Screen replacement', battery: 'Battery replacement', software: 'Software support', charging: 'Charging port' };
function estimate(repair, tier) {
  const min = Math.round(basePrices[repair] * (repair === 'software' ? 1 : factors[tier]) / 100) * 100 - 1;
  const max = min + (repair === 'screen' ? 1000 : repair === 'software' ? 500 : 800);
  return { min, max };
}

/* ---------- Section 2 · Estimator ---------- */
const repairButtons = $$('.repair-cards [role="radio"]');
const range = $('#tier-range');
const erMin = $('#er-min'), erMax = $('#er-max'), erRepair = $('#er-repair');
const erPrice = $('.er-price'), erBar = $('#er-bar-fill');
const tierName = $('#tier-name'), tierNote = $('#tier-note');
const enquiryLink = $('#est-enquiry');
let repair = 'screen';
let last = estimate('screen', 'standard');
const highest = estimate('screen', 'flagship').max;

function updateEstimate() {
  const tier = tiers[Number(range.value)];
  const { min, max } = estimate(repair, tier);
  const fill = `${(Number(range.value) / 2) * 100}%`;
  range.style.setProperty('--fill', fill);
  range.setAttribute('aria-valuetext', tierNames[tier]);
  tierName.textContent = tierNames[tier];
  tierNote.textContent = repair === 'software' ? 'Software support is the same across device ranges.' : '';
  erRepair.textContent = repairNames[repair];

  const minNum = document.createElement('span'), maxNum = document.createElement('span');
  erMin.replaceChildren('₹', minNum);
  erMax.replaceChildren('₹', maxNum);
  countTo(minNum, min, last.min, 600);
  countTo(maxNum, max, last.max, 600);
  last = { min, max };

  erBar.style.width = `${Math.max(12, (max / highest) * 100)}%`;
  erPrice.classList.remove('bump'); void erPrice.offsetWidth; erPrice.classList.add('bump');
  enquiryLink.href = `book-repair.html?service=${encodeURIComponent(repair)}&tier=${encodeURIComponent(tier)}`;
}
function selectRepair(btn, focus = false) {
  repairButtons.forEach(b => {
    const on = b === btn;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  });
  repair = btn.dataset.repair;
  if (focus) btn.focus();
  updateEstimate();
}
repairButtons.forEach((btn, i) => {
  btn.addEventListener('click', () => selectRepair(btn));
  btn.addEventListener('keydown', e => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const rtl = root.dir === 'rtl' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') ? -1 : 1;
    selectRepair(repairButtons[(i + dir * rtl + repairButtons.length) % repairButtons.length], true);
  });
});
range?.addEventListener('input', updateEstimate);
if (range) updateEstimate();

/* Hero cards pre-select their repair in the estimator */
$$('.fan-card').forEach(card => card.addEventListener('click', () => {
  const btn = repairButtons.find(b => b.dataset.repair === card.dataset.repair);
  if (btn) selectRepair(btn);
}));

/* ---------- Section 3 · Price table column highlight ---------- */
const table = $('#ptable');
$$('.tier-switch button').forEach(btn => btn.addEventListener('click', () => {
  $$('.tier-switch button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  if (table) table.dataset.active = btn.dataset.col;
}));

/* ---------- Section 6 · FAQ: one card open at a time ---------- */
$$('.qa').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.qa').forEach(o => { if (o !== d) o.open = false; });
}));

/* ---------- Section 7 · Ticket stub tilts toward the pointer ---------- */
const stub = $('.bt-stub');
stub?.addEventListener('pointermove', e => {
  if (motionPaused() || e.pointerType !== 'mouse' || matchMedia('(max-width: 900px)').matches) return;
  const r = stub.getBoundingClientRect();
  const y = (e.clientY - r.top) / r.height - .5;
  const sign = root.dir === 'rtl' ? -1 : 1;
  stub.style.transform = `rotate(${(4 + y * 4) * sign}deg) translate(${10 * sign}px, 6px)`;
});
stub?.addEventListener('pointerleave', () => { stub.style.transform = ''; });