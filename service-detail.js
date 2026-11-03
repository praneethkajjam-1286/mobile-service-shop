'use strict';
/* Fixora — Service detail page (service-detail.html)
   One template, six services. The page reads ?service=<id> from the URL
   and renders only that service's hero, context, reasons, pricing, FAQs and CTA.
   Valid ids: screen, battery, software, charging, backglass, protection */

const root = document.documentElement;
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
function persist(k, v) { try { localStorage.setItem(k, v); } catch {} }
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const motionPaused = () => root.dataset.motion === 'paused' || reducedMotion();
const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;

/* ---------- Pricing model (same formula as Home 1 estimator) ---------- */
const BASE = { screen: 1499, battery: 999, software: 499, charging: 799 };
const FACTOR = { standard: 1, premium: 1.8, flagship: 2.8 };
function range(repair, tier) {
  const min = Math.round(BASE[repair] * (repair === 'software' ? 1 : FACTOR[tier]) / 100) * 100 - 1;
  const max = min + (repair === 'screen' ? 1000 : repair === 'software' ? 500 : 800);
  return { min, max };
}
const TIERS = [
  { key: 'standard', name: 'Everyday models', sub: 'Popular everyday phones' },
  { key: 'premium', name: 'Premium models', sub: 'Higher-end recent phones', featured: true },
  { key: 'flagship', name: 'Latest flagships', sub: 'Newest top-tier phones' }
];

/* ---------- Service content ---------- */
const SERVICES = {
  screen: {
    title: 'Screen & Display Repair', short: 'Screen & display', badge: 'Display care',
    lead: 'Cracked glass, flickering, dead spots or touch that won’t respond. We assess the glass, display panel and touch layer together before suggesting a fix.',
    hero: 'assets/images/services-screen-hero.png',
    heroFallback: 'assets/images/Back%20glass%20replacement%20iPhone%20XR.jpeg',
    photo: 'assets/images/services-screen-detail.png',
    ctaImage: 'assets/images/services-screen-cta.png',
    photoFallback: 'assets/images/familiar-phone-repair.png', photoAlt: 'Technician carefully repairing an iPhone screen',
    facts: [['Starting from', '₹1,499*'], ['Starts with', 'Display assessment'], ['You decide', 'After a confirmed quote']],
    ovTitle: 'A clearer view, explained first.',
    ov: ['Screen damage isn’t always what it looks like. A small crack can hide display damage underneath, and touch problems can come from the panel or its connection.',
         'We check each part separately so you know exactly what needs replacing, then explain the part options available for your exact model before any work begins.'],
    signs: ['Cracks or chips in the glass', 'Lines, flicker or dark patches', 'Touch that misses or ghosts', 'Display stays black'],
    included: ['Glass, panel and touch assessment', 'Part options explained for your model', 'Confirmed quote before work', 'Touch and display tested at handover'],
    whyTitle: 'Why choose our screen care',
    why: [['◎', 'Whole-screen check', 'Glass, display and touch are assessed together, not guessed from the crack.'],
          ['⇄', 'Options explained', 'Where more than one part option exists, we explain each clearly.'],
          ['✓', 'Tested together', 'Brightness, colour and touch are checked with you at handover.'],
          ['⬡', 'Protection advice', 'Ask about glass and a case to help prevent the next crack.']],
    pricing: 'tiers',
    faqs: [['Can you fix just the glass?', 'It depends on your model and the damage. The assessment shows whether the glass, display or both need attention.'],
           ['Will my data be affected?', 'Screen repairs don’t usually affect your data, but we always recommend a backup where possible.'],
           ['What if touch still misbehaves after?', 'Touch is tested at handover. If something isn’t right, we’ll look at it together.']],
    ctaTitle: 'See clearly again.', ctaText: 'Prepare an enquiry with your model and what happened. We’ll confirm the right fix after a display assessment.'
  },
  battery: {
    title: 'Battery & Power', short: 'Battery & power', badge: 'Power, restored',
    lead: 'Fast drain, unexpected shutdowns or a phone that only works on the charger. A battery health and charging check separates normal wear from other power issues.',
    hero: 'assets/images/services-battery-hero.png',
    heroFallback: '',
    photo: 'assets/images/services-battery-detail.png',
    ctaImage: 'assets/images/services-battery-cta.png',
    photoFallback: '', photoAlt: 'A battery pack with illuminated energy cells',
    facts: [['Starting from', '₹999*'], ['Starts with', 'Battery health check'], ['You decide', 'After a confirmed quote']],
    ovTitle: 'More day. Less charging.',
    ov: ['Batteries wear with age, but not every power problem is the battery. Charging faults, software and heavy background activity can all look similar.',
         'We start with a health and charging check, explain what we find, and only recommend a replacement when it’s the right fix.'],
    signs: ['Battery drains much faster', 'Sudden shutdowns at mid charge', 'Phone gets unusually warm', 'Only works when plugged in'],
    included: ['Battery health and charging check', 'Cause explained in plain language', 'Part options and confirmed quote', 'Power tested at handover'],
    whyTitle: 'Why choose our battery care',
    why: [['◔', 'Health check first', 'We confirm the battery is the cause before recommending a replacement.'],
          ['ϟ', 'Charging checked too', 'Cable, adapter and port behaviour are reviewed alongside the battery.'],
          ['⇄', 'Clear options', 'Part choices and pricing explained before any work begins.'],
          ['✓', 'Tested at handover', 'Charging and power are checked together before you leave.']],
    pricing: 'tiers',
    faqs: [['How do I know it’s the battery?', 'A health and charging check helps separate battery wear from charging or software issues.'],
           ['Should I keep using a swollen battery?', 'No. If the back is lifting or the screen is being pushed, stop charging it and bring it in for an assessment.'],
           ['Will a new battery make my phone faster?', 'Sometimes. Some phones slow down to protect a worn battery; the assessment helps tell if that applies.']],
    ctaTitle: 'Get your day back.', ctaText: 'Tell us how your battery behaves. We’ll start with a health check and explain the options.'
  },
  software: {
    title: 'Software Support', short: 'Software support', badge: 'Software support',
    lead: 'Slow apps, update errors and frustrating freezes. We look at storage, background activity and system health together to find a sensible route forward.',
    hero: 'assets/images/services-software-hero.png',
    photo: 'assets/images/services-software-detail.png',
    ctaImage: 'assets/images/services-software-cta.png',
    photoAlt: 'Technical support for a smartphone',
    facts: [['Starting from', '₹499*'], ['Starts with', 'Diagnostics'], ['Before you visit', 'Back up where possible']],
    ovTitle: 'Back in your flow.',
    ov: ['A slow or unstable phone often has more than one cause. Storage, background apps, updates and even battery health can all play a part.',
         'We look at the whole picture, explain what we find, and talk through options before anything is reset or removed.'],
    signs: ['Phone feels slow or laggy', 'Apps crash or freeze', 'Updates won’t finish', 'Storage always full'],
    included: ['Storage and background activity review', 'Update and system status check', 'Options explained before any reset', 'Phone checked with you at handover'],
    whyTitle: 'Why choose our software support',
    why: [['⌕', 'Whole-picture diagnostics', 'We check storage, apps, updates and battery health together.'],
          ['⛨', 'Data-first approach', 'We talk through backups before anything that could affect your data.'],
          ['⇄', 'Your choice', 'Every step is explained, and nothing is removed without your say-so.'],
          ['✓', 'Same price, any phone', 'Software support is priced the same across device ranges.']],
    pricing: 'flat',
    faqs: [['Will you reset my phone?', 'Only if it’s needed and you agree. We explain the options first and recommend a backup.'],
           ['Can you recover deleted photos?', 'Recovery isn’t always possible. Ask the studio about your situation when you prepare your enquiry.'],
           ['Why is the price the same for all phones?', 'Software support doesn’t usually involve replacement parts, so the starting range doesn’t change by device.']],
    ctaTitle: 'Make it feel new again.', ctaText: 'Describe what your phone is doing. We’ll diagnose the cause and explain the options before changing anything.'
  },
  charging: {
    title: 'Charging Port & Connections', short: 'Charging & ports', badge: 'Connections',
    lead: 'Loose cable, slow charging or no connection at all. Before assuming the battery has failed, we trace the whole charging path from cable to battery.',
    hero: 'assets/images/services-charging-hero.png',
    photo: 'assets/images/services-charging-detail.png',
    ctaImage: 'assets/images/services-charging-cta.png',
    photoAlt: 'USB-C charger and cable shown in close-up',
    facts: [['Starting from', '₹799*'], ['Starts with', 'Charging path check'], ['Bring along', 'Your cable and adapter']],
    ovTitle: 'Plugged in, properly.',
    ov: ['Charging problems are often caused by something simple: a worn cable, the wrong adapter or debris in the port. Sometimes the port itself is loose or damaged.',
         'We check the cable, adapter and port together, and only look at the battery once the rest of the chain is ruled out.'],
    signs: ['Cable feels loose in the port', 'Charges only at an angle', 'Charging is very slow', 'Phone isn’t detected by a computer'],
    included: ['Cable and adapter check', 'Port inspection and cleaning assessment', 'Confirmed quote if a repair is needed', 'Charging tested at handover'],
    whyTitle: 'Why choose our charging care',
    why: [['⌁', 'Whole-chain check', 'Cable, adapter and port are tested before the battery is blamed.'],
          ['◫', 'Port inspection', 'Debris, wear and loose connections are checked closely.'],
          ['⇄', 'Simple fixes first', 'If a cable or adapter is the cause, we’ll tell you before suggesting a repair.'],
          ['✓', 'Tested together', 'Charging and data connection are checked at handover.']],
    pricing: 'tiers',
    faqs: [['Should I bring my charger?', 'Yes. Bringing your usual cable and adapter helps us check the whole charging path.'],
           ['Can I clean the port myself?', 'Avoid metal objects. If you suspect debris, it’s safer to have it inspected.'],
           ['Does wireless charging still work if the port fails?', 'Often, if your phone supports it, but that doesn’t tell us why the port has stopped working.']],
    ctaTitle: 'Power up properly.', ctaText: 'Bring your phone, cable and adapter. We’ll trace the charging path and explain what we find.'
  },
  backglass: {
    title: 'Back Glass & Body', short: 'Back glass & body', badge: 'Body care',
    lead: 'Shattered rear glass or a damaged frame. We assess the damage for safety and explain the replacement options available for your model.',
    hero: 'assets/images/services-backglass-hero.png',
    photo: 'assets/images/services-backglass-detail.png',
    ctaImage: 'assets/images/services-backglass-cta.png',
    photoAlt: 'Replacement smartphone back cover beside its phone frame',
    facts: [['Pricing', 'Quoted after assessment'], ['Starts with', 'Safety assessment'], ['Also checked', 'Camera lens and frame']],
    ovTitle: 'Back to its best.',
    ov: ['Cracked back glass can spread, cut fingers and let in dust or moisture. A damaged frame can also put pressure on the screen and internal parts.',
         'We assess the back, frame and camera area together, then explain the options and confirm the price for your exact model.'],
    signs: ['Cracked or shattered back glass', 'Sharp edges on the rear', 'Bent or dented frame', 'Cracked camera lens cover'],
    included: ['Back, frame and camera area assessment', 'Options explained for your model', 'Confirmed quote before work', 'Final checks at handover'],
    whyTitle: 'Why choose our body care',
    why: [['⛨', 'Safety first', 'Sharp, loose glass is assessed and handled carefully.'],
          ['◎', 'Whole-body check', 'Frame and camera area are checked alongside the glass.'],
          ['⇄', 'Model-specific quote', 'Back glass work varies by model, so we confirm the price after assessment.'],
          ['✓', 'Finished with care', 'Fit and finish are checked together before you leave.']],
    pricing: 'quote',
    faqs: [['Why isn’t there a starting price?', 'Back glass work varies a lot between models, so we confirm the price after assessing your phone.'],
           ['Is it safe to keep using my phone?', 'Cover sharp edges with tape or a case and bring it in soon, as cracks can spread.'],
           ['Does the camera need replacing too?', 'Not always. The assessment checks whether only the lens cover is affected.']],
    ctaTitle: 'Make it whole again.', ctaText: 'Share a description of the damage and your model. We’ll confirm the options and price after an assessment.'
  },
  protection: {
    title: 'Screen Protector Fitting', short: 'Protector fitting', badge: 'Protection',
    lead: 'Edge glass and cases selected for your exact model, fitted carefully so they sit right and protect where it matters.',
    hero: 'assets/images/services-protection-hero.png',
    photo: 'assets/images/services-protection-detail.png',
    ctaImage: 'assets/images/services-protection-cta.png',
    photoAlt: 'Screen protector installation kit arranged beside a smartphone',
    facts: [['Pricing', 'Ask in store'], ['Matched to', 'Your exact model'], ['Pairs with', 'A protective case']],
    ovTitle: 'Protection, considered.',
    ov: ['A well-fitted screen protector and case are a small step that can help prevent your next repair. Fit matters: bubbles, dust and misalignment reduce protection.',
         'We check compatibility for your exact model, clean the screen properly and fit the protector with care.'],
    signs: ['New phone, no protection yet', 'Old protector is cracked or lifting', 'Case no longer fits well', 'Frequent drops at work or play'],
    included: ['Compatibility check for your model', 'Screen cleaned before fitting', 'Careful alignment and fitting', 'Fit checked with you'],
    whyTitle: 'Why choose our fitting service',
    why: [['◎', 'Exact-model match', 'Glass and cases are selected for your specific phone.'],
          ['✧', 'Clean application', 'The screen is cleaned properly to reduce dust and bubbles.'],
          ['⇲', 'Aligned with care', 'Protectors are fitted so edges, sensors and cameras aren’t blocked.'],
          ['⬡', 'Case pairing', 'We help you choose a case that works with your protector.']],
    pricing: 'quote',
    faqs: [['Do I need to buy the protector here?', 'Ask the studio when you prepare your enquiry about fitting a protector you already have.'],
           ['Will it affect touch or the fingerprint sensor?', 'A protector matched to your model is chosen to work with its sensors. We’ll check fit with you.'],
           ['How long does fitting take?', 'Ask the studio when you plan your visit.']],
    ctaTitle: 'Protect what you rely on.', ctaText: 'Tell us your model. We’ll check compatibility and availability before you visit.'
  }
};
const ORDER = ['screen', 'battery', 'software', 'charging', 'backglass', 'protection'];

/* ---------- Helpers ---------- */
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function setImg(img, src, fallback, alt = '') {
  if (!img) return;
  img.alt = alt;
  img.onerror = () => { if (fallback && img.src !== new URL(fallback, location.href).href) { img.onerror = null; img.src = fallback; } };
  img.src = src;
}
const detailURL = (id) => `service-detail.html?service=${encodeURIComponent(id)}`;
const bookURL = (id, tier) => {
  const map = { screen: 'screen', battery: 'battery', software: 'software', charging: 'charging' };
  const q = new URLSearchParams();
  if (map[id]) q.set('service', map[id]);
  if (tier) q.set('tier', tier);
  const s = q.toString();
  return `book-repair.html${s ? `?${s}` : ''}`;
};

/* ---------- Render one service ---------- */
function render(id) {
  const s = SERVICES[id];
  const main = $('#main');
  if (!s) { renderNotFound(); return; }

  document.title = `${s.title} | Fixora — Services`;
  $('meta[name="description"]')?.setAttribute('content', s.lead);
  $('meta[property="og:title"]')?.setAttribute('content', `${s.title} | Fixora`);

  /* 1 · Hero */
  setImg($('#hero-img'), s.hero, s.heroFallback);
  $('#crumb-current').textContent = s.short;
  const words = s.title.split(' ');
  const h1 = $('#hero-title');
  h1.replaceChildren(words.slice(0, -1).join(' ') + ' ', el('em', null, words.at(-1)));
  $('#hero-lead').textContent = s.lead;
  $('#hero-facts').replaceChildren(...s.facts.map(([k, v]) => { const li = el('li'); li.append(el('small', null, k), el('b', null, v)); return li; }));
  $('#hero-book').href = bookURL(id);

  const sw = $('#switcher');
  sw.replaceChildren(...ORDER.map(key => {
    const a = el('a', null, SERVICES[key].short);
    a.href = detailURL(key);
    a.dataset.service = key;
    if (key === id) a.setAttribute('aria-current', 'page');
    return a;
  }));
  sw.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });

  /* 2 · Context */
  $('#ov-title').textContent = s.ovTitle;
  $('#ov-body').replaceChildren(...s.ov.map(t => el('p', null, t)));
  $('#ov-signs').replaceChildren(...s.signs.map(t => el('li', null, t)));
  $('#ov-included').replaceChildren(...s.included.map(t => el('li', null, t)));
  setImg($('#ov-img'), s.photo, s.photoFallback, s.photoAlt);

  /* 3 · Why choose */
  $('#why-title').textContent = s.whyTitle;
  $('#why-grid').replaceChildren(...s.why.map(([icon, title, text], i) => {
    const card = el('article', 'why-card reveal');
    card.style.setProperty('--s', i);
    card.append(el('span', 'why-num', String(i + 1).padStart(2, '0')), el('span', 'why-icon', icon), el('h3', null, title), el('p', null, text));
    card.querySelector('.why-icon').setAttribute('aria-hidden', 'true');
    return card;
  }));

  /* 4 · Pricing */
  const grid = $('#price-grid');
  grid.className = 'price-grid';
  $('#price-title').textContent = `${s.short} pricing`;
  if (s.pricing === 'tiers') {
    $('#price-intro').textContent = 'Illustrative starting ranges by device range. Your exact quote is confirmed after an assessment.';
    grid.replaceChildren(...TIERS.map((t, i) => priceCard(id, t, range(id, t.key), i)));
  } else if (s.pricing === 'flat') {
    $('#price-intro').textContent = 'Software support uses one starting range for every device range.';
    grid.classList.add('single');
    grid.replaceChildren(priceCard(id, { key: 'standard', name: 'All device ranges', sub: 'Everyday, premium and flagship', featured: true }, range(id, 'standard'), 0));
  } else {
    $('#price-intro').textContent = 'This service varies too much between models for a fair starting price, so it’s quoted for your exact phone.';
    grid.classList.add('single');
    grid.replaceChildren(quoteCard(id, s));
  }

  /* 5 · FAQs */
  $('#faq-title').textContent = `${s.short}: your questions.`;
  $('#faq-list').replaceChildren(...s.faqs.map(([q, a], i) => {
    const item = el('div', 'faq-item');
    const btn = el('button', 'faq-q');
    btn.id = `fq-${i}`; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', `fa-${i}`);
    btn.append(el('span', 'fq-num', String(i + 1).padStart(2, '0')), document.createTextNode(q), el('span', 'fq-icon'));
    btn.querySelector('.fq-icon').setAttribute('aria-hidden', 'true');
    const panel = el('div', 'faq-a');
    panel.id = `fa-${i}`; panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', `fq-${i}`);
    const inner = el('div'); inner.append(el('p', null, a)); panel.append(inner);
    item.append(btn, panel);
    btn.addEventListener('click', () => toggleFaq(item));
    return item;
  }));

  /* 6 · CTA + pager */
  $('#cta-title').textContent = s.ctaTitle;
  $('#cta-text').textContent = s.ctaText;
  $('#cta-book').href = bookURL(id);
  setImg($('#cta-img'), s.ctaImage || s.photo, s.ctaImage ? '' : s.photoFallback);
  const idx = ORDER.indexOf(id);
  const prevId = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
  const nextId = ORDER[(idx + 1) % ORDER.length];
  const prev = $('#pager-prev'), next = $('#pager-next');
  prev.href = detailURL(prevId); prev.dataset.service = prevId; $('b', prev).textContent = `← ${SERVICES[prevId].short}`;
  next.href = detailURL(nextId); next.dataset.service = nextId; $('b', next).textContent = `${SERVICES[nextId].short} →`;

  main.setAttribute('aria-busy', 'false');
  observeReveals();
}

function priceCard(id, tier, { min, max }, i) {
  const card = el('article', `price-card reveal${tier.featured ? ' featured' : ''}`);
  card.style.setProperty('--s', i);
  if (tier.featured && SERVICES[id].pricing === 'tiers') card.append(el('span', 'pc-flag', 'Most common'));
  card.append(el('span', 'pc-tier', tier.name));
  const r = el('p', 'pc-range');
  const from = el('span', 'count', rupees(min));
  from.dataset.to = min;
  r.append(from, el('span', 'to', `to ${rupees(max)}*`));
  card.append(r, el('p', 'pc-sub', tier.sub));
  const list = el('ul', 'pc-list');
  ['Assessment before any work', 'Part options explained', 'Final checks at handover'].forEach(t => list.append(el('li', null, t)));
  card.append(list);
  const a = el('a', 'pc-btn');
  a.href = bookURL(id, tier.key);
  a.append(document.createTextNode('Prepare an enquiry'), el('span', null, '→'));
  a.querySelector('span').setAttribute('aria-hidden', 'true');
  card.append(a);
  return card;
}
function quoteCard(id, s) {
  const card = el('article', 'price-card featured reveal');
  card.append(el('span', 'pc-tier', 'Your exact model'));
  const r = el('p', 'pc-range', s.facts[0][1]);
  card.append(r, el('p', 'pc-sub', 'You’ll see the options and a confirmed price before anything is done.'));
  const list = el('ul', 'pc-list');
  s.included.forEach(t => list.append(el('li', null, t)));
  card.append(list);
  const a = el('a', 'pc-btn');
  a.href = id === 'protection' ? 'book-repair.html?accessory=glass' : bookURL(id);
  a.append(document.createTextNode(id === 'protection' ? 'Check fit & availability' : 'Ask for a quote'), el('span', null, '→'));
  a.querySelector('span').setAttribute('aria-hidden', 'true');
  card.append(a);
  return card;
}

function renderNotFound() {
  document.title = 'Service not found | Fixora';
  const main = $('#main');
  const wrap = el('section', 'not-found');
  const inner = el('div', 'wrap');
  const h = el('h1', null, 'Service not found.');
  const p = el('p', null, 'That service link doesn’t match one of our services. Choose one below.');
  const list = el('div', 'switcher');
  list.style.justifyContent = 'center';
  ORDER.forEach(k => { const a = el('a', null, SERVICES[k].short); a.href = detailURL(k); list.append(a); });
  inner.append(h, p, list);
  wrap.append(inner);
  main.replaceChildren(wrap);
  main.setAttribute('aria-busy', 'false');
}

/* ---------- FAQ accordion ---------- */
function toggleFaq(item) {
  const willOpen = !item.classList.contains('open');
  $$('#faq-list .faq-item').forEach(i => { i.classList.remove('open'); $('.faq-q', i).setAttribute('aria-expanded', 'false'); });
  if (willOpen) { item.classList.add('open'); $('.faq-q', item).setAttribute('aria-expanded', 'true'); }
}

/* ---------- Scroll reveal (re-run after each render) ---------- */
let revealer = null;
function observeReveals() {
  if (!('IntersectionObserver' in window)) return;
  root.classList.add('js-reveal');
  revealer?.disconnect();
  revealer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealer.unobserve(entry.target);
    $$('.count', entry.target).forEach(countUp);
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(e => { e.classList.remove('visible'); revealer.observe(e); });
}
function countUp(span) {
  const to = Number(span.dataset.to);
  if (!to || motionPaused()) { span.textContent = rupees(to); return; }
  const start = performance.now(), dur = 900;
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur);
    span.textContent = rupees(Math.round(to * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Switch services without a full reload ---------- */
function currentId() {
  const raw = (new URLSearchParams(location.search).get('service') || 'screen').toLowerCase();
  return raw;
}
function go(id, push = true) {
  const main = $('#main');
  const doRender = () => {
    render(id);
    window.scrollTo({ top: 0, behavior: 'auto' });
    main.classList.remove('swapping');
    replayHero();
  };
  if (push) history.pushState({ id }, '', detailURL(id));
  if (motionPaused()) { doRender(); return; }
  main.classList.add('swapping');
  setTimeout(doRender, 250);
}
function replayHero() {
  if (motionPaused()) return;
  $$('.d-hero .up').forEach(e => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-service]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (!SERVICES[a.dataset.service]) return;
  e.preventDefault();
  if (a.dataset.service === currentId()) return;
  go(a.dataset.service);
});
window.addEventListener('popstate', () => go(currentId(), false));

/* ---------- First render ---------- */
render(currentId());

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

/* ---------- CTA glow follows the pointer ---------- */
const ctaCard = $('#cta-card');
ctaCard?.addEventListener('pointermove', e => {
  const r = ctaCard.getBoundingClientRect();
  ctaCard.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`);
  ctaCard.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`);
});