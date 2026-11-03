'use strict';
/* Fixora — Accessories page script (standalone). */

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
  if (e.key === 'Escape') {
    closeMenu();
    $$('.home-dropdown[open]').forEach(d => d.removeAttribute('open'));
    $$('.hotspot[aria-expanded="true"]').forEach(h => h.setAttribute('aria-expanded', 'false'));
  }
});
document.addEventListener('click', e => {
  $$('.home-dropdown[open]').forEach(d => { if (!d.contains(e.target)) d.removeAttribute('open'); });
  if (!e.target.closest('.hotspot')) $$('.hotspot[aria-expanded="true"]').forEach(h => h.setAttribute('aria-expanded', 'false'));
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

/* ---------- Section 1 · Hero panels: auto-cycle the open panel until the visitor hovers ---------- */
const panels = $$('.panel');
let leadIndex = 0;
function setLead(i) { panels.forEach((p, n) => p.classList.toggle('lead', n === i)); }
setLead(0);
setInterval(() => {
  if (motionPaused() || document.hidden || !panels.length) return;
  if ($('.panels:hover')) return;
  leadIndex = (leadIndex + 1) % panels.length;
  setLead(leadIndex);
}, 3200);

/* ---------- Section 3 · Collection filters (matches ?category= links from the home page) ---------- */
const params = new URLSearchParams(location.search);
const cards = $$('.product-card');
function filterProducts(category, animate = true) {
  const valid = ['all', 'power', 'audio', 'protection'];
  if (!valid.includes(category)) category = 'all';
  $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
  const show = (c) => category === 'all' || c.dataset.category === category;
  const count = cards.filter(show).length;
  const status = $('#filter-status');
  if (status) status.textContent = `Showing ${count} ${category === 'all' ? 'essentials' : category + ' essentials'}`;

  if (!animate || motionPaused()) {
    cards.forEach(c => { c.hidden = !show(c); c.classList.remove('leaving', 'entering'); });
    return;
  }
  cards.forEach(c => { if (!c.hidden && !show(c)) c.classList.add('leaving'); });
  setTimeout(() => {
    let i = 0;
    cards.forEach(c => {
      c.classList.remove('leaving', 'entering');
      c.hidden = !show(c);
      if (!c.hidden) { c.style.setProperty('--i', i++); void c.offsetWidth; c.classList.add('entering'); }
    });
  }, 260);
}
function setCategoryURL(category) {
  const url = new URL(location.href);
  if (category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', category);
  history.replaceState(null, '', url);
}
$$('[data-filter]').forEach(b => b.addEventListener('click', () => { filterProducts(b.dataset.filter); setCategoryURL(b.dataset.filter); }));
filterProducts(params.get('category') || 'all', false);

/* Hero panels and other in-page links filter without reloading */
$$('[data-filter-link]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const cat = a.dataset.filterLink;
  filterProducts(cat);
  setCategoryURL(cat);
  $('#collection')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
}));

/* ---------- Section 2 · Fit check ---------- */
const answers = { port: null, wireless: null };
const fitResult = $('#fit-result');
$$('.seg').forEach(group => {
  $$('button', group).forEach(btn => btn.addEventListener('click', () => {
    $$('button', group).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    answers[group.dataset.q] = btn.dataset.v;
    renderFit();
  }));
});
function renderFit() {
  if (!fitResult) return;
  const items = [];
  if (answers.port === 'usbc') items.push('Braided USB-C Cable', 'Compact USB-C Adapter');
  if (answers.port === 'lightning') items.push('A Lightning cable (we’ll confirm the right one in store)', 'A USB-C adapter, paired with a USB-C to Lightning cable');
  if (answers.port === 'unsure') items.push('Bring your phone and current cable — we’ll identify the port');
  if (answers.wireless === 'yes') items.push('A wireless charging pad, and a case that doesn’t block charging');
  if (answers.wireless === 'unsure') items.push('We can check whether your model supports wireless charging');
  items.push('Everyday Shield Case and Edge Glass Protector for your model');

  const h = document.createElement('h3');
  h.textContent = answers.port && answers.wireless ? 'Suggested for your phone' : 'So far, consider:';
  const ul = document.createElement('ul');
  items.forEach((t, i) => { const li = document.createElement('li'); li.style.setProperty('--i', i); li.textContent = t; ul.append(li); });
  const p = document.createElement('p');
  p.textContent = 'Compatibility and availability are confirmed for your exact model before purchase.';
  fitResult.replaceChildren(h, ul, p);
}

/* ---------- Section 4 · Hotspots (hover on desktop, tap on touch) ---------- */
$$('.hotspot').forEach(h => h.addEventListener('click', e => {
  e.stopPropagation();
  const open = h.getAttribute('aria-expanded') === 'true';
  $$('.hotspot').forEach(o => o.setAttribute('aria-expanded', 'false'));
  h.setAttribute('aria-expanded', String(!open));
}));

/* ---------- Section 5 · Compare slider ---------- */
const compare = $('#compare'), cmpRange = $('#cmp-range');
function setPos(v) { compare?.style.setProperty('--pos', `${v}%`); }
cmpRange?.addEventListener('input', () => setPos(cmpRange.value));
if (compare && cmpRange && 'IntersectionObserver' in window) {
  // Gentle demo sweep the first time it comes into view
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    if (motionPaused()) return;
    const frames = [50, 25, 75, 50];
    let i = 0;
    const tick = () => {
      if (i >= frames.length - 1) return;
      const from = frames[i], to = frames[i + 1], start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 700);
        const v = from + (to - from) * (0.5 - Math.cos(Math.PI * t) / 2);
        cmpRange.value = v; setPos(v);
        if (t < 1) requestAnimationFrame(step); else { i++; tick(); }
      };
      requestAnimationFrame(step);
    };
    setTimeout(tick, 400);
  }, { threshold: .5 });
  io.observe(compare);
}

/* ---------- Section 6 · Carousel arrows + dots ---------- */
const carousel = $('#carousel');
const dotsWrap = $('#car-dots');
if (carousel) {
  const items = $$('.fmt-card', carousel);
  items.forEach(() => dotsWrap?.append(document.createElement('span')));
  const dots = dotsWrap ? $$('span', dotsWrap) : [];
  const stepSize = () => (items[0]?.getBoundingClientRect().width || 300) + 24;
  const sign = () => (root.dir === 'rtl' ? -1 : 1);
  $('#car-next')?.addEventListener('click', () => carousel.scrollBy({ left: stepSize() * sign(), behavior: reducedMotion() ? 'auto' : 'smooth' }));
  $('#car-prev')?.addEventListener('click', () => carousel.scrollBy({ left: -stepSize() * sign(), behavior: reducedMotion() ? 'auto' : 'smooth' }));
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); carousel.scrollBy({ left: stepSize(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); carousel.scrollBy({ left: -stepSize(), behavior: 'smooth' }); }
  });
  const updateDots = () => {
    const idx = Math.round(Math.abs(carousel.scrollLeft) / stepSize());
    dots.forEach((d, i) => d.classList.toggle('on', i === Math.min(idx, dots.length - 1)));
  };
  carousel.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });
  updateDots();
}

/* ---------- Section 7 · Collage parallax on pointer ---------- */
const collage = $('#collage');
const collageZone = $('.cta-collage');
collageZone?.addEventListener('pointermove', e => {
  if (!collage || motionPaused() || e.pointerType !== 'mouse') return;
  const r = collageZone.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  $$('.cl', collage).forEach((img, i) => {
    const depth = (i + 1) * 14;
    img.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
  });
});
collageZone?.addEventListener('pointerleave', () => $$('.cl').forEach(img => { img.style.transform = ''; }));