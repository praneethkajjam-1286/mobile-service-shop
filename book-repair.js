'use strict';
/* Fixora — Book a Repair page script (standalone).
   Reads links from other pages: ?service=screen|battery|software|charging|backglass
   &tier=standard|premium|flagship, and ?accessory=case|glass|adapter|cable|earbuds|headphones */

const root = document.documentElement;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme toggle ---------- */
const themeBtn = $('#theme-toggle');
function themeLabel() {
  const light = root.dataset.theme === 'light';
  $('meta[name="theme-color"]')?.setAttribute('content', light ? '#F0F7FB' : '#0E1C2A');
  themeBtn?.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
}
themeBtn?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  persist('repair-theme', root.dataset.theme);
  themeLabel();
});
themeLabel();

/* ---------- Direction (RTL) toggle ---------- */
const dirBtn = $('#direction-toggle');
function dirLabel() {
  const rtl = root.dir === 'rtl';
  dirBtn?.setAttribute('aria-pressed', String(rtl));
  dirBtn?.setAttribute('aria-label', rtl ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout');
}
dirBtn?.addEventListener('click', () => {
  root.dir = root.dir === 'rtl' ? 'ltr' : 'rtl';
  persist('repair-direction', root.dir);
  dirLabel();
});
dirLabel();

/* ---------- Form setup ---------- */
const form = $('#booking-form');
const fields = {
  name: $('#name'), email: $('#email'), phone: $('#phone'), model: $('#model'),
  service: $('#service'), tier: $('#tier'), date: $('#date'), details: $('#details'), consent: $('#consent')
};
const REQUIRED = ['name', 'email', 'model', 'service', 'date', 'details'];
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
fields.date.min = today;

/* ---------- Pre-fill from other pages' links ---------- */
const params = new URLSearchParams(location.search);
const accessoryNames = {
  case: 'Everyday Shield Case', glass: 'Edge Glass Protector', adapter: 'Compact USB-C Adapter',
  cable: 'Braided USB-C Cable', earbuds: 'Pocket Wireless Earbuds', headphones: 'Studio Wireless Headphones'
};
const service = params.get('service');
if (service && $$('option', fields.service).some(o => o.value === service)) fields.service.value = service;
const tier = params.get('tier');
if (tier && $$('option', fields.tier).some(o => o.value === tier)) fields.tier.value = tier;
const accessory = params.get('accessory');
if (accessoryNames[accessory]) {
  fields.service.value = 'accessory';
  fields.details.value = `I would like to check compatibility and availability for the ${accessoryNames[accessory]}. `;
}

/* ---------- Validation ---------- */
const messages = {
  name: (v) => v.trim().length < 2 ? 'Please enter your full name.' : '',
  email: (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : '',
  phone: (v) => v.trim() && !/^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? 'Please enter a valid phone number, or leave it blank.' : '',
  model: (v) => v.trim().length < 2 ? 'Please enter your phone model.' : '',
  service: (v) => !v ? 'Please choose what you need help with.' : '',
  date: (v) => !v ? 'Please choose a preferred date.' : v < today ? 'Please choose today or a future date.' : '',
  details: (v) => v.trim().length < 10 ? 'Please add a few words about the problem (at least 10 characters).' : '',
  consent: (_, el) => !el.checked ? 'Please tick the box to confirm.' : ''
};
function validate(name, show = true) {
  const el = fields[name];
  const msg = messages[name] ? messages[name](el.value, el) : '';
  const wrap = el.closest('.field');
  const err = $(`#${name}-error`);
  if (show) {
    if (err) err.textContent = msg;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) el.setAttribute('aria-describedby', err.id);
    if (wrap) {
      wrap.classList.toggle('invalid', Boolean(msg));
      wrap.classList.toggle('valid', !msg && (el.value || '').trim() !== '');
      if (msg) { wrap.classList.remove('invalid'); void wrap.offsetWidth; wrap.classList.add('invalid'); }
    }
  }
  return !msg;
}
const touched = new Set();
Object.keys(fields).forEach(name => {
  const el = fields[name];
  const evt = el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
  el.addEventListener('blur', () => { if (name !== 'tier') { touched.add(name); validate(name); } });
  el.addEventListener(evt, () => {
    if (touched.has(name)) validate(name);
    updateProgress();
  });
});

/* ---------- Progress bar ---------- */
const bar = $('#progress-bar'), barText = $('#progress-text');
function updateProgress() {
  const done = REQUIRED.filter(n => validate(n, false)).length;
  bar.style.width = `${(done / REQUIRED.length) * 100}%`;
  barText.textContent = `${done} of ${REQUIRED.length} required fields complete`;
}

/* ---------- Character counter ---------- */
const count = $('#details-count');
function updateCount() { count.textContent = fields.details.value.length; }
fields.details.addEventListener('input', updateCount);
updateCount();
updateProgress();

/* ---------- Submit: prepare the enquiry file locally ---------- */
const result = $('#booking-result');
const submitBtn = $('#submit-btn');
let fileURL = null;
form.addEventListener('submit', e => {
  e.preventDefault();
  const order = ['name', 'email', 'phone', 'model', 'service', 'date', 'details', 'consent'];
  order.forEach(n => touched.add(n));
  const firstBad = order.find(n => !validate(n));
  if (firstBad) {
    fields[firstBad].focus();
    fields[firstBad].scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    return;
  }

  submitBtn.classList.add('loading');
  $('.cta-label', submitBtn).textContent = 'Preparing…';

  setTimeout(() => {
    const v = Object.fromEntries(new FormData(form));
    const serviceLabel = fields.service.selectedOptions[0].textContent;
    const tierLabel = fields.tier.value ? fields.tier.selectedOptions[0].textContent : 'Not sure';
    const rows = [
      ['Name', v.name.trim()], ['Email', v.email.trim()], ['Phone', v.phone.trim() || 'Not supplied'],
      ['Device', v.model.trim()], ['Service', serviceLabel], ['Device range', tierLabel], ['Preferred date', v.date]
    ];
    const text = [
      'FIXORA — REPAIR ENQUIRY REQUEST', 'Prepared locally. Not sent. No appointment confirmed.', '',
      ...rows.map(([k, val]) => `${k}: ${val}`), '',
      `Details: ${v.details.trim()}`, '',
      'Review this file before sharing it with the studio.'
    ].join('\n');

    if (fileURL) URL.revokeObjectURL(fileURL);
    fileURL = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    $('#download-link').href = fileURL;

    const summary = $('#summary');
    summary.replaceChildren(...rows.map(([k, val]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = val;
      row.append(dt, dd);
      return row;
    }));

    form.hidden = true;
    $('.progress').hidden = true;
    barText.hidden = true;
    result.hidden = false;
    result.focus();
    submitBtn.classList.remove('loading');
    $('.cta-label', submitBtn).textContent = 'Prepare my enquiry';
  }, reducedMotion() ? 0 : 650);
});

/* ---------- Edit again ---------- */
$('#edit-btn')?.addEventListener('click', () => {
  result.hidden = true;
  form.hidden = false;
  $('.progress').hidden = false;
  barText.hidden = false;
  fields.name.focus();
});