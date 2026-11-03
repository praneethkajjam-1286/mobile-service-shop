'use strict';
/* Fixora — Contact page script (standalone). */

const root = document.documentElement;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionPaused = () => root.dataset.motion === 'paused' || reducedMotion();
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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

/* ---------- Section 1 · Live chat animation in the hero phone ---------- */
const chatMsgs = $$('#hero-chat .msg');
let chatTimer = null;
function playChat() {
  chatMsgs.forEach(m => m.classList.remove('show'));
  if (motionPaused()) { chatMsgs.forEach(m => m.classList.add('show')); return; }
  chatMsgs.forEach((m, i) => {
    setTimeout(() => m.classList.add('show'), 700 + i * 1100);
  });
  clearTimeout(chatTimer);
  chatTimer = setTimeout(playChat, 700 + chatMsgs.length * 1100 + 3500);
}
playChat();

/* Phone tilts slightly toward the pointer */
const heroSection = $('.ct-hero'), phone = $('.phone');
heroSection?.addEventListener('pointermove', e => {
  if (!phone || motionPaused() || e.pointerType !== 'mouse') return;
  const r = heroSection.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
  phone.style.animation = 'none';
  phone.style.transform = `rotateY(${x * 16}deg) rotateX(${y * -10}deg)`;
});
heroSection?.addEventListener('pointerleave', () => { if (phone) { phone.style.transform = ''; phone.style.animation = ''; } });

/* Quick-start bar: carries the model into the enquiry form */
const quickStart = $('#quick-start');
quickStart?.addEventListener('submit', e => {
  e.preventDefault();
  const model = $('#qs-model').value.trim();
  if (!model) {
    quickStart.classList.remove('shake'); void quickStart.offsetWidth; quickStart.classList.add('shake');
    $('#qs-model').focus();
    return;
  }
  const formModel = $('#f-model');
  if (formModel) formModel.value = model;
  $('#enquiry')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  setTimeout(() => $('#f-name')?.focus({ preventScroll: true }), reducedMotion() ? 0 : 700);
});

/* ---------- Section 2 · Flip cards (tap / Enter to flip on touch & keyboard) ---------- */
$$('.flip').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    if (matchMedia('(hover: none)').matches) card.classList.toggle('flipped');
  });
  card.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); card.classList.toggle('flipped'); }
  });
});

/* ---------- Section 3 · Multi-step enquiry form ---------- */
const form = $('#enquiry-form');
if (form) {
  const steps = $$('.step', form);
  const labels = $$('.step-labels li', form);
  const bar = $('#step-bar');
  const prevBtn = $('#prev-step'), nextBtn = $('#next-step'), submitBtn = $('#submit-step');
  const errorEl = $('#form-error');
  const dateInput = $('#f-date');
  const today = isoDate(new Date());
  dateInput.min = today;
  let current = 0;
  let fileURL = null;

  function showStep(i, backwards = false) {
    steps.forEach((s, n) => {
      const on = n === i;
      s.hidden = !on;
      s.classList.toggle('active', on && !backwards);
      s.classList.toggle('back-in', on && backwards);
    });
    labels.forEach((l, n) => { l.classList.toggle('active', n === i); l.classList.toggle('done', n < i); });
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    prevBtn.disabled = i === 0;
    nextBtn.hidden = i === steps.length - 1;
    submitBtn.hidden = i !== steps.length - 1;
    errorEl.textContent = '';
    current = i;
    steps[i].querySelector('input, textarea')?.focus({ preventScroll: true });
  }

  function validateStep(i) {
    const step = steps[i];
    let ok = true, message = '';
    $$('.field', step).forEach(f => f.classList.remove('invalid'));
    $$('.chips', step).forEach(c => c.classList.remove('invalid'));

    $$('input:not([type=radio]):not([type=checkbox]), textarea', step).forEach(el => {
      el.setCustomValidity('');
      if (el.type === 'date' && el.value && el.value < today) el.setCustomValidity('past');
      if (!el.checkValidity()) {
        ok = false;
        el.closest('.field')?.classList.add('invalid');
        if (!message) message = el.type === 'email' ? 'Please enter a valid email address.'
          : el.type === 'date' ? 'Please choose today or a future date.'
          : 'Please fill in the highlighted field.';
      }
    });
    const radios = $$('input[type=radio]', step);
    if (radios.length && !radios.some(r => r.checked)) {
      ok = false; $('.chips', step).classList.add('invalid');
      if (!message) message = 'Please choose the issue, or "Not sure".';
    }
    const consent = $('input[name=consent]', step);
    if (consent && !consent.checked) { ok = false; if (!message) message = 'Please tick the confirmation box.'; }

    errorEl.textContent = message;
    return ok;
  }

  nextBtn.addEventListener('click', () => { if (validateStep(current)) showStep(current + 1); });
  prevBtn.addEventListener('click', () => { if (current > 0) showStep(current - 1, true); });
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && current < steps.length - 1) { e.preventDefault(); nextBtn.click(); }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(current)) return;
    const v = Object.fromEntries(new FormData(form));
    const text = [
      'FIXORA — REPAIR ENQUIRY REQUEST', 'Prepared locally. Not sent. No appointment confirmed.', '',
      `Name: ${v.name}`, `Email: ${v.email}`, `Phone: ${v.phone || 'Not supplied'}`,
      `Device: ${v.model}`, `Issue: ${v.issue}`, `Preferred date: ${v.date}`, '',
      `Details: ${v.details}`, '', 'Review this file before sharing it with the studio.'
    ].join('\n');
    if (fileURL) URL.revokeObjectURL(fileURL);
    fileURL = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const result = $('#form-result');
    const h = document.createElement('h3'), p = document.createElement('p'), a = document.createElement('a');
    h.textContent = 'Your enquiry is ready to review.';
    p.textContent = 'Download it and share it with the studio. Nothing has been sent and no appointment is confirmed.';
    a.href = fileURL; a.download = 'fixora-enquiry.txt'; a.textContent = 'Download my prepared enquiry';
    result.replaceChildren(h, p, a);
    result.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  });

  showStep(0);
}

/* ---------- Section 4 · Prep checklist with progress ring ---------- */
const prepBoxes = $$('#prep-list input');
const ringFg = $('#ring-fg');
const ringCount = $('#ring-count');
const ringBox = $('.ring-box');
const CIRC = 2 * Math.PI * 52;
function updateRing() {
  const done = prepBoxes.filter(b => b.checked).length;
  const total = prepBoxes.length;
  if (ringFg) ringFg.style.strokeDashoffset = String(CIRC * (1 - done / total));
  if (ringCount) ringCount.textContent = `${done}/${total}`;
  ringBox?.classList.toggle('complete', done === total);
  const allSet = $('#all-set');
  if (allSet) allSet.hidden = done !== total;
}
prepBoxes.forEach(b => b.addEventListener('change', updateRing));
updateRing();

/* ---------- Section 5 · Visit planner ---------- */
const dayStrip = $('#day-strip');
const timeButtons = $$('.time-chips button');
const visitText = $('#visit-text');
const copyBtn = $('#copy-visit');
let chosenDay = null, chosenTime = null;

if (dayStrip) {
  const fmtDay = new Intl.DateTimeFormat('en-IN', { weekday: 'short' });
  const fmtFull = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.dataset.full = fmtFull.format(d);
    btn.dataset.iso = isoDate(d);
    btn.innerHTML = `<small>${i === 0 ? 'Today' : fmtDay.format(d)}</small><b>${d.getDate()}</b>`;
    btn.setAttribute('aria-label', btn.dataset.full);
    btn.addEventListener('click', () => {
      $$('button', dayStrip).forEach(b => b.setAttribute('aria-checked', String(b === btn)));
      chosenDay = btn.dataset.full;
      const formDate = $('#f-date');
      if (formDate && !formDate.value) formDate.value = btn.dataset.iso;
      updateVisit();
    });
    dayStrip.append(btn);
  }
}
timeButtons.forEach(btn => btn.addEventListener('click', () => {
  timeButtons.forEach(b => b.setAttribute('aria-checked', String(b === btn)));
  chosenTime = btn.dataset.time;
  updateVisit();
}));
function updateVisit() {
  if (!visitText) return;
  if (chosenDay && chosenTime) {
    visitText.textContent = `Preferred visit: ${chosenDay}, ${chosenTime.toLowerCase()}.`;
    copyBtn.disabled = false;
  } else {
    visitText.textContent = chosenDay ? `${chosenDay} — now pick a time of day.` : 'Now pick a day.';
    copyBtn.disabled = true;
  }
  const note = visitText.parentElement;
  note.classList.remove('updated'); void note.offsetWidth; note.classList.add('updated');
}
copyBtn?.addEventListener('click', async () => {
  const text = `${visitText.textContent} (Subject to shop confirmation.)`;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied ✓';
  } catch {
    copyBtn.textContent = 'Copy failed';
  }
  setTimeout(() => { copyBtn.textContent = 'Copy note'; }, 1800);
});

/* ---------- Section 6 · FAQ accordion (one open at a time) ---------- */
$$('.faq-q').forEach(q => q.addEventListener('click', () => {
  const item = q.closest('.faq-item');
  const willOpen = !item.classList.contains('open');
  $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-q', i).setAttribute('aria-expanded', 'false'); });
  if (willOpen) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
}));

/* ---------- Section 7 · Slide-to-start CTA ---------- */
const slider = $('#slider-cta');
const knob = $('#slider-knob');
if (slider && knob) {
  const href = slider.dataset.href;
  let startX = 0, x = 0, dragging = false;
  const maxX = () => slider.clientWidth - knob.offsetWidth - 12;
  const dirSign = () => (root.dir === 'rtl' ? -1 : 1);
  const setX = (v) => { x = Math.max(0, Math.min(maxX(), v)); slider.style.setProperty('--x', `${x}px`); };
  const finish = () => {
    slider.classList.add('snap', 'done');
    setX(maxX());
    setTimeout(() => { window.location.href = href; }, reducedMotion() ? 0 : 420);
  };
  const reset = () => { slider.classList.add('snap'); setX(0); };

  knob.addEventListener('pointerdown', e => {
    dragging = true; startX = e.clientX - x * dirSign();
    slider.classList.remove('snap'); slider.classList.add('dragging');
    knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener('pointermove', e => { if (dragging) setX((e.clientX - startX) * dirSign()); });
  const release = () => {
    if (!dragging) return;
    dragging = false; slider.classList.remove('dragging');
    if (x > maxX() * 0.85) finish(); else reset();
  };
  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
  // Keyboard and plain clicks still work: Enter/Space completes the slide.
  knob.addEventListener('click', e => { if (e.detail === 0) finish(); });
  knob.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } });
  window.addEventListener('resize', () => { if (!slider.classList.contains('done')) setX(0); });
}