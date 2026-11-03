'use strict';
/* Fixora — shared site script (home page modified).
   Every feature is guarded, so this file is safe on all pages. */

const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* ---------- Header shadow + back-to-top ---------- */
const header = $('.site-header'), toTop = $('#to-top');
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
  }), { threshold: .08 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 80}ms`; observer.observe(el); });
}

/* ---------- FAQ: keep one item open at a time ---------- */
$$('.faq-list details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) $$('.faq-list details').forEach(o => { if (o !== d) o.removeAttribute('open'); });
}));

/* ---------- Accessory filters (accessories page) ---------- */
const params = new URLSearchParams(location.search);
function filterProducts(category) {
  const valid = ['all', 'power', 'audio', 'protection'];
  if (!valid.includes(category)) category = 'all';
  $$('[data-filter]').forEach(b => {
    const active = b.dataset.filter === category;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  $$('.product-card').forEach(p => {
    p.hidden = category !== 'all' && p.dataset.category !== category;
    if (!p.hidden) { count++; p.classList.add('visible'); }
  });
  const status = $('#filter-status');
  if (status) status.textContent = `Showing ${count} ${category === 'all' ? 'essentials' : category + ' essentials'}`;
}
$$('[data-filter]').forEach(b => b.addEventListener('click', () => {
  filterProducts(b.dataset.filter);
  const url = new URL(location.href);
  if (b.dataset.filter === 'all') url.searchParams.delete('category');
  else url.searchParams.set('category', b.dataset.filter);
  history.replaceState(null, '', url);
}));
if ($('#collection')) filterProducts(params.get('category') || 'all');

/* ---------- Symptom checker ---------- */
const symptoms = {
  screen:   ['Start with the display.', 'Ask for a screen and touch assessment. The part option depends on your exact model.', 'services.html#screen'],
  battery:  ['Start with battery health.', 'A health and charging check can help distinguish battery wear from other power issues.', 'services.html#battery'],
  software: ['Start with diagnostics.', 'Describe the crashes or slowdowns. Back up where possible before any reset is considered.', 'services.html#software'],
  charging: ['Start with the connection.', 'Check the cable, adapter, and charging port together before assuming a battery fault.', 'services.html#additional']
};
function updateSymptom() {
  const value = $('#symptom')?.value;
  const result = $('#symptom-result');
  if (!value || !result || !symptoms[value]) return;
  const [title, body, url] = symptoms[value];
  const h = document.createElement('h3'), p = document.createElement('p');
  h.textContent = title; p.textContent = body;
  result.replaceChildren(h, p);
  const link = $('#symptom-link');
  if (link) link.href = url;
}
$('#symptom')?.addEventListener('change', updateSymptom);
updateSymptom();

/* ---------- Price estimator ---------- */
const basePrices = { screen: 1499, battery: 999, software: 499, charging: 799 };
const factors = { standard: 1, premium: 1.8, flagship: 2.8 };
function updateEstimate() {
  if (!$('#repair-type') || !$('#device-tier')) return;
  const repair = $('#repair-type').value, tier = $('#device-tier').value;
  const min = Math.round(basePrices[repair] * (repair === 'software' ? 1 : factors[tier]) / 100) * 100 - 1;
  const max = min + (repair === 'screen' ? 1000 : repair === 'software' ? 500 : 800);
  const out = $('#estimate-price');
  if (out) out.textContent = `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  const enquiry = $('#estimate-enquiry');
  if (enquiry) enquiry.href = `book-repair.html?service=${encodeURIComponent(repair)}&tier=${encodeURIComponent(tier)}`;
}
$('#repair-type')?.addEventListener('change', updateEstimate);
$('#device-tier')?.addEventListener('change', updateEstimate);
updateEstimate();

/* ---------- Booking form (book-repair page) ---------- */
const form = $('#booking-form');
let requestURL = null;
if (form) {
  const date = $('#date');
  const now = new Date();
  const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  date.min = dateString;
  const service = params.get('service');
  if (Array.from($('#service').options).some(o => o.value === service)) $('#service').value = service;
  const accessoryNames = { case: 'Everyday Shield Case', glass: 'Edge Glass Protector', adapter: 'Compact USB-C Adapter', cable: 'Braided USB-C Cable', earbuds: 'Pocket Wireless Earbuds', headphones: 'Studio Wireless Headphones' };
  if (accessoryNames[params.get('accessory')]) {
    $('#service').value = 'accessory';
    $('#details').value = `I would like to check compatibility and availability for the ${accessoryNames[params.get('accessory')]}. `;
  }
  date.addEventListener('input', () => date.setCustomValidity(''));
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (date.value < dateString) { date.setCustomValidity('Choose today or a future date.'); date.reportValidity(); return; }
    if (!form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const label = $('#service').selectedOptions[0].textContent;
    const text = [
      'FIXORA — REPAIR ENQUIRY REQUEST', 'Prepared locally. Not sent. No appointment confirmed.', '',
      `Name: ${values.name}`, `Email: ${values.email}`, `Phone: ${values.phone || 'Not supplied'}`,
      `Device: ${values.model}`, `Enquiry: ${label}`, `Preferred date: ${values.date}`, '',
      `Details: ${values.details}`, '', 'Review this file before sharing it with your chosen repair shop.'
    ].join('\n');
    if (requestURL) URL.revokeObjectURL(requestURL);
    requestURL = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const result = $('#booking-result');
    result.replaceChildren();
    result.className = 'booking-success';
    const h = document.createElement('h3'), p = document.createElement('p'), a = document.createElement('a');
    h.textContent = 'Your request is ready to review.';
    p.textContent = 'Download the details and share them with your chosen repair shop. Nothing has been sent and no appointment is confirmed.';
    a.href = requestURL; a.download = 'fixora-enquiry.txt'; a.textContent = 'Download my prepared enquiry';
    result.append(h, p, a);
    result.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  });
}