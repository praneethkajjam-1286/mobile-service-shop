'use strict';
/* Fixora — Services listing page (service.html)
   Renders the 6 service cards. Each "View service" button opens
   service-detail.html?service=<id>, which shows only that service. */

const root = document.documentElement;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionPaused = () => root.dataset.motion === 'paused' || reducedMotion();
const DETAIL_PAGE = 'service-detail.html';

/* ---------- The 6 services (card summaries) ---------- */
const SERVICES = [
  { id: 'screen', group: 'repair', badge: 'Display care', title: 'Screen & Display Repair',
    text: 'Cracks, dead pixels or unresponsive touch? We assess the display, explain repair options and confirm pricing before work.',
    from: '₹1,499*', img: 'assets/images/services-screen-card.png',
    fallback: '', alt: 'Screen protector being aligned over a smartphone display' },
  { id: 'battery', group: 'repair', badge: 'Power, restored', title: 'Battery & Power',
    text: 'Rapid drain or sudden shutdowns can signal battery trouble. We check battery health and charging before recommending next steps.',
    from: '₹999*', img: 'assets/images/services-battery-hero.png',
    fallback: '', alt: 'Battery components and tools on a repair workbench' },
  { id: 'software', group: 'repair', badge: 'Software support', title: 'Software Support',
    text: 'Slow apps, freezes or failed updates can have several causes. We check storage and system health, then discuss safe options.',
    from: '₹499*', img: 'assets/images/services-software-hero.png',
    fallback: '', alt: 'Smartphone undergoing app maintenance at a repair bench' },
  { id: 'charging', group: 'repair', badge: 'Connections', title: 'Charging Port & Connections',
    text: 'Loose connections, slow charging or no power? We check your cable, adapter and port first, then explain repair options.',
    from: '₹799*', img: 'assets/images/services-charging-hero.png',
    fallback: '', alt: 'Phone, cables and chargers arranged on a work surface' },
  { id: 'backglass', group: 'repair', badge: 'Body care', title: 'Back Glass & Body',
    text: 'Cracked rear glass, a bent frame or camera damage? We assess safety and condition, then confirm model-specific repair options.',
    from: 'Quoted after assessment', img: 'assets/images/services-backglass-hero.png',
    fallback: '', alt: 'Smartphone back glass and internal body components' },
  { id: 'protection', group: 'care', badge: 'Protection', title: 'Screen Protector Fitting',
    text: 'Help prevent scratches and everyday impact with a protector matched to your model. We fit it carefully and check alignment.',
    from: 'Ask in store', img: 'assets/images/services-protection-hero.png',
    fallback: '', alt: 'Smartphone with a screen protector ready for fitting' }
];
const detailURL = (id) => `${DETAIL_PAGE}?service=${encodeURIComponent(id)}`;

/* ---------- Image fallback (works for images added later too) ---------- */
function attachFallback(img) {
  const swap = () => { const f = img.dataset.fallback; if (f) { img.removeAttribute('data-fallback'); img.src = f; } };
  img.addEventListener('error', swap, { once: true });
  if (img.complete && img.naturalWidth === 0) swap();
}

/* ---------- Render cards ---------- */
const cardsWrap = $('#service-cards');
if (cardsWrap) {
  cardsWrap.replaceChildren(...SERVICES.map((s, i) => {
    const card = document.createElement('article');
    card.className = 's-card reveal';
    card.dataset.group = s.group;
    card.style.setProperty('--s', i % 3);
    card.innerHTML = `
      <div class="sc-media">
        <img loading="lazy" alt="">
        <span class="sc-badge"></span>
        <span class="sc-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      </div>
      <div class="sc-body">
        <h3></h3>
        <p></p>
        <div class="sc-foot">
          <span class="sc-price">Starting from<b></b></span>
          <a class="view-btn">View service <span aria-hidden="true">→</span></a>
        </div>
      </div>`;
    const img = $('img', card);
    img.src = s.img; img.alt = s.alt;
    if (s.fallback) { img.dataset.fallback = s.fallback; attachFallback(img); }
    $('.sc-badge', card).textContent = s.badge;
    $('h3', card).textContent = s.title;
    $('.sc-body p', card).textContent = s.text;
    const price = $('.sc-price', card);
    if (s.from.startsWith('₹')) $('b', price).textContent = s.from;
    else { price.firstChild.textContent = 'Pricing'; $('b', price).textContent = s.from; }
    const btn = $('.view-btn', card);
    btn.href = detailURL(s.id);
    btn.setAttribute('aria-label', `View service: ${s.title}`);
    // Whole card is clickable, but the real link stays the button (for accessibility)
    card.addEventListener('click', e => { if (!e.target.closest('a')) location.href = detailURL(s.id); });
    card.style.cursor = 'pointer';
    return card;
  }));
}

/* ---------- Hero quick-jump list ---------- */
const gpList = $('#gp-list');
if (gpList) {
  SERVICES.forEach((s, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = detailURL(s.id);
    a.innerHTML = `<span class="gp-num">${String(i + 1).padStart(2, '0')}</span><span class="gp-name"></span><span class="gp-price"></span><span class="gp-arrow" aria-hidden="true">→</span>`;
    $('.gp-name', a).textContent = s.title;
    $('.gp-price', a).textContent = s.from.startsWith('₹') ? `from ${s.from}` : '';
    li.append(a);
    gpList.append(li);
  });
}

/* ---------- Static image fallbacks ---------- */
$$('img[data-fallback]').forEach(attachFallback);

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
document.addEventListener('click', e => {
  $$('.home-dropdown[open]').forEach(d => { if (!d.contains(e.target)) d.removeAttribute('open'); });
});

/* ---------- Hero height + header shadow + back to top ---------- */
const header = $('.site-header');
function setHeaderHeight() { if (header) root.style.setProperty('--header-h', `${header.offsetHeight}px`); }
setHeaderHeight();
window.addEventListener('resize', setHeaderHeight);
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

/* ---------- Card filter ---------- */
const cards = $$('.s-card');
const cardStatus = $('#card-status');
function applyFilter(group) {
  $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === group)));
  const match = (c) => group === 'all' || c.dataset.group === group;
  if (cardStatus) cardStatus.textContent = `Showing ${cards.filter(match).length} services`;
  if (motionPaused()) { cards.forEach(c => { c.hidden = !match(c); }); return; }
  cards.forEach(c => { if (!c.hidden && !match(c)) c.classList.add('hide'); });
  setTimeout(() => {
    let i = 0;
    cards.forEach(c => {
      c.classList.remove('hide', 'show');
      c.hidden = !match(c);
      if (!c.hidden) { c.classList.add('visible'); c.style.setProperty('--i', i++); void c.offsetWidth; c.classList.add('show'); }
    });
  }, 260);
}
$$('[data-filter]').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));

/* ---------- Card tilt + spotlight ---------- */
cards.forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
    if (motionPaused() || e.pointerType !== 'mouse') return;
    card.style.transform = `rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

/* ---------- Gallery lightbox ---------- */
const galleryItems = $$('.g-item');
const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
let lbIndex = 0, lastFocus = null;
function showLightbox(i) {
  lbIndex = (i + galleryItems.length) % galleryItems.length;
  const item = galleryItems[lbIndex];
  const thumb = $('img', item);
  lbImg.src = thumb.dataset.full && !thumb.src.includes('assets/') ? thumb.dataset.full : thumb.src;
  lbImg.alt = thumb.alt;
  lbCap.textContent = `${item.dataset.caption}  ·  ${lbIndex + 1} / ${galleryItems.length}`;
  lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
}
function openLightbox(i) {
  lastFocus = document.activeElement;
  lb.hidden = false;
  document.body.classList.add('lb-open');
  showLightbox(i);
  $('#lb-close').focus();
}
function closeLightbox() {
  lb.hidden = true;
  document.body.classList.remove('lb-open');
  lastFocus?.focus();
}
galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
$('#lb-close')?.addEventListener('click', closeLightbox);
$('#lb-prev')?.addEventListener('click', () => showLightbox(lbIndex - 1));
$('#lb-next')?.addEventListener('click', () => showLightbox(lbIndex + 1));
lb?.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (lb && !lb.hidden) { closeLightbox(); return; }
    closeMenu(); $$('.home-dropdown[open]').forEach(d => d.removeAttribute('open'));
  }
  if (lb && !lb.hidden) {
    if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
    if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = $$('button', lb); const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
});

/* ---------- FAQ accordion (one open at a time) ---------- */
$$('.faq-q').forEach(q => q.addEventListener('click', () => {
  const item = q.closest('.faq-item');
  const willOpen = !item.classList.contains('open');
  $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-q', i).setAttribute('aria-expanded', 'false'); });
  if (willOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
}));

/* ---------- CTA card glow follows the pointer ---------- */
const ctaCard = $('#cta-card');
ctaCard?.addEventListener('pointermove', e => {
  const r = ctaCard.getBoundingClientRect();
  ctaCard.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
  ctaCard.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
});
