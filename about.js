'use strict';
/* Fixora — About page script (standalone). */

const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
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
  positionIndicator();
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

/* ---------- Keep the hero exactly one screen tall (below the header) ---------- */
const header = $('.site-header');
function setHeaderHeight() {
  if (header) root.style.setProperty('--header-h', `${header.offsetHeight}px`);
}
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);

/* ---------- Scroll effects: header, back-to-top, hero parallax, journey progress ---------- */
const toTop = $('#to-top');
const heroImg = $('.hero-bg img');
const journey = $('.journey');
const progress = $('#journey-progress');
const steps = $$('.journey-steps li');
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 20);
  if (toTop) toTop.hidden = y < 600;

  if (heroImg && !motionPaused() && y < window.innerHeight * 1.2) {
    heroImg.parentElement.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
  }

  if (journey && progress) {
    const r = journey.getBoundingClientRect();
    const vh = window.innerHeight;
    const pct = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
    progress.style.setProperty('--progress', `${pct * 100}%`);
    const activeCount = Math.ceil(pct * steps.length);
    steps.forEach((li, i) => li.classList.toggle('active', i < activeCount));
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
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

/* ---------- Value cards: 3D tilt + spotlight following the pointer ---------- */
$$('.tilt').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
    if (motionPaused() || e.pointerType !== 'mouse') return;
    card.style.transform = `rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

/* ---------- Magnetic button in the closing section ---------- */
$$('.magnetic').forEach(btn => {
  btn.addEventListener('pointermove', e => {
    if (motionPaused() || e.pointerType !== 'mouse') return;
    const r = btn.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.3}px)`;
  });
  btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
});

/* ---------- Tabs (Why repair) with sliding indicator + keyboard support ---------- */
const tabs = $$('[role="tab"]');
const indicator = $('.tab-indicator');
function positionIndicator() {
  const active = tabs.find(t => t.getAttribute('aria-selected') === 'true');
  if (!active || !indicator) return;
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.transform = `translateX(${active.offsetLeft}px)`;
  indicator.style.top = `${active.offsetTop}px`;
  indicator.style.bottom = 'auto';
  indicator.style.height = `${active.offsetHeight}px`;
}
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    if (panel) panel.hidden = !on;
  });
  positionIndicator();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const rtl = root.dir === 'rtl' ? -1 : 1;
    const next = tabs[(i + dir * rtl + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});
window.addEventListener('resize', positionIndicator);
window.addEventListener('load', positionIndicator);
positionIndicator();