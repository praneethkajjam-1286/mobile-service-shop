'use strict';
/* Fixora — Home 2 · A second life (standalone script) */

const root = document.documentElement;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionPaused = () => root.dataset.motion === 'paused' || reducedMotion();


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
  sizeJourney(); onScroll();
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

/* ---------- Header height (hero fills the screen below it) ---------- */
const header = $('.site-header');
function setHeaderHeight() { if (header) root.style.setProperty('--header-h', `${header.offsetHeight}px`); }
setHeaderHeight();

/* ---------- Section 3 · Horizontal journey sizing ---------- */
const journey = $('#journey'), track = $('#j-track'), jBar = $('#j-bar');
const horizontalOK = () => !matchMedia('(max-width: 900px)').matches;
function sizeJourney() {
  if (!journey || !track) return;
  if (!horizontalOK()) { journey.style.height = ''; track.style.transform = ''; return; }
  const extra = Math.max(0, track.scrollWidth - innerWidth);
  journey.style.height = `${innerHeight + extra}px`;
}

/* ---------- Scroll-driven effects ---------- */
const toTop = $('#to-top');
let ticking = false;
function onScroll() {
  const y = scrollY;
  header?.classList.toggle('scrolled', y > 20);
  if (toTop) toTop.hidden = y < 600;

  // Journey: vertical scroll moves the cards sideways
  if (journey && track && horizontalOK()) {
    const start = journey.offsetTop - (header?.offsetHeight || 0);
    const distance = journey.offsetHeight - innerHeight;
    const p = distance > 0 ? Math.min(1, Math.max(0, (y - start) / distance)) : 0;
    const extra = Math.max(0, track.scrollWidth - innerWidth);
    const dir = root.dir === 'rtl' ? 1 : -1;
    track.style.transform = `translate3d(${dir * extra * p}px,0,0)`;
    if (jBar) jBar.style.width = `${p * 100}%`;
  }
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
window.addEventListener('resize', () => { setHeaderHeight(); sizeJourney(); onScroll(); });
window.addEventListener('load', () => { sizeJourney(); onScroll(); });
sizeJourney();
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

/* ---------- Section 5 · Care-tip deck ---------- */
const deck = $('#deck');
const tips = $$('.tip', deck || document);
const deckCount = $('#deck-count');
let order = tips.map((_, i) => i);
let busy = false;
function layoutDeck() {
  order.forEach((tipIndex, k) => {
    const t = tips[tipIndex];
    t.style.setProperty('--k', Math.min(k, 3));
    t.dataset.k = k;
    t.setAttribute('aria-hidden', k === 0 ? 'false' : 'true');
  });
  if (deckCount) deckCount.textContent = `${order[0] + 1} / ${tips.length}`;
}
function nextTip() {
  if (busy || !tips.length) return;
  const top = tips[order[0]];
  if (motionPaused()) { order.push(order.shift()); layoutDeck(); return; }
  busy = true;
  top.classList.add('fly');
  setTimeout(() => {
    order.push(order.shift());
    top.classList.remove('fly');
    top.style.transition = 'none';
    layoutDeck();
    void top.offsetWidth;
    top.style.transition = '';
    busy = false;
  }, 450);
}
function prevTip() {
  if (busy || !tips.length) return;
  order.unshift(order.pop());
  layoutDeck();
}
$('#deck-next')?.addEventListener('click', nextTip);
$('#deck-prev')?.addEventListener('click', prevTip);
deck?.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); nextTip(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevTip(); }
});
// Swipe on touch screens
let startX = null;
deck?.addEventListener('pointerdown', e => { startX = e.clientX; });
deck?.addEventListener('pointerup', e => {
  if (startX === null) return;
  const dx = e.clientX - startX; startX = null;
  if (Math.abs(dx) > 40) { dx < 0 ? nextTip() : prevTip(); }   // swipe
  else if (Math.abs(dx) < 6) nextTip();                         // tap / click
});
layoutDeck();