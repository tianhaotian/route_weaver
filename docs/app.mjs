import { returnTarget, legacyTarget } from './navigation.mjs?v=mobile-pages-1';

const body = document.body;
const page = body.dataset.page;

function initNavigation() {
  if (page === 'overview') {
    const redirectLegacy = () => {
      const target = legacyTarget(location.hash, (body.dataset.guideIds ?? '').split(','));
      if (target) location.replace(target);
      return Boolean(target);
    };
    if (redirectLegacy()) return false;
    window.addEventListener('hashchange', redirectLegacy);
  }
  if (page !== 'overview') {
    const search = page === 'day' ? `?day=${body.dataset.day}` : location.search;
    const target = returnTarget(page, search, body.dataset.guide);
    document.querySelectorAll('[data-context-back]').forEach((link) => {
      link.setAttribute('href', target.href);
      link.setAttribute('aria-label', target.label);
      const label = link.querySelector('[data-back-label]');
      if (label) label.textContent = target.label;
    });
  }
  const menu = document.querySelector('#site-menu');
  const trigger = document.querySelector('.menu-button');
  if (typeof menu.showModal === 'function') {
    trigger.hidden = false;
    trigger.addEventListener('click', () => {
      menu.showModal();
      trigger.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('menu-is-open');
    });
    menu.querySelector('.menu-close').addEventListener('click', () => menu.close());
    menu.addEventListener('click', (event) => {
      if (event.target === menu || event.target.closest('a')) menu.close();
    });
    menu.addEventListener('close', () => {
      trigger.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-is-open');
    });
  }
  const map = document.querySelector('.map-fold');
  if (map && matchMedia('(max-width: 760px)').matches) map.open = false;
  return true;
}

function initPanels() {
  const panels = [...document.querySelectorAll('[data-panel]')];
  if (!panels.length) return;
  const links = [...document.querySelectorAll('[data-panel-link]')];
  function selectPanel() {
    const hash = location.hash.slice(1);
    const hotel = /^hotel-[1-7]$/.test(hash) ? document.getElementById(hash) : null;
    const selected = hotel ? 'hotels' : panels.find((panel) => panel.id === hash)?.id ?? panels[0].id;
    panels.forEach((panel) => { panel.hidden = panel.id !== selected; });
    links.forEach((link) => {
      if (link.dataset.panelLink === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (hotel) {
      hotel.open = true;
      requestAnimationFrame(() => hotel.scrollIntoView({ block: 'start' }));
    }
  }
  window.addEventListener('hashchange', selectPanel);
  selectPanel();
}

function initGuideFilter() {
  if (page !== 'attractions') return;
  const day = new URLSearchParams(location.search).get('day');
  const selected = /^[456]$/.test(day ?? '') ? day : 'all';
  document.querySelectorAll('[data-guide-filter]').forEach((link) => {
    if (link.dataset.guideFilter === selected) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-guide-days]').forEach((card) => {
    card.hidden = selected !== 'all' && !card.dataset.guideDays.split(',').includes(selected);
    if (selected !== 'all') {
      const link = card.querySelector('[data-guide-link]');
      link.setAttribute('href', `${link.getAttribute('href')}?day=${selected}`);
    }
  });
  document.querySelectorAll('[data-plan-day]').forEach((plan) => {
    plan.hidden = selected !== 'all' && plan.dataset.planDay !== selected;
    plan.open = selected !== 'all' && plan.dataset.planDay === selected;
  });
}

if (initNavigation()) {
  initPanels();
  initGuideFilter();
}
