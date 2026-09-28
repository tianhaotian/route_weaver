export const primaryPages = [
  { id: 'overview', file: 'index.html', label: '路线总览', short: '总览', icon: 'route' },
  { id: 'itinerary', file: 'itinerary.html', label: '每日行程', short: '行程', icon: 'calendar' },
  { id: 'attractions', file: 'attractions.html', label: '景点攻略', short: '景点', icon: 'pin' },
  { id: 'charging', file: 'charging.html', label: '住宿补电', short: '补电', icon: 'bolt' },
  { id: 'preparation', file: 'preparation.html', label: '行前准备', short: '准备', icon: 'check' },
];

// Only known local routes are accepted as return destinations.
export function returnTarget(page, search = '', guideId = '') {
  const params = new URLSearchParams(search);
  const from = params.get('from');
  if ((page === 'guide' || page === 'charging') && /^day-[1-8]$/.test(from ?? '')) {
    return { href: `./${from}.html`, label: '返回当天行程' };
  }
  if (page === 'guide') {
    const day = params.get('day');
    const query = /^[456]$/.test(day ?? '') ? `?day=${day}` : '';
    const anchor = /^[a-z]+$/.test(guideId) ? `#guide-${guideId}` : '';
    return { href: `./attractions.html${query}${anchor}`, label: '返回景点列表' };
  }
  if (page === 'day') {
    const day = params.get('day');
    return { href: `./itinerary.html${/^[1-8]$/.test(day ?? '') ? `#day-${day}` : ''}`, label: '返回八日行程' };
  }
  return { href: './index.html', label: '返回路线总览' };
}

export function legacyTarget(hash, guideIds = []) {
  const day = /^#day-([1-8])$/.exec(hash);
  if (day) return `./day-${day[1]}.html`;
  const guide = /^#guide-([a-z]+)$/.exec(hash);
  if (guide && guideIds.includes(guide[1])) return `./guide-${guide[1]}.html`;
  return ({ '#itinerary': './itinerary.html', '#attractions': './attractions.html', '#charging': './charging.html', '#hotel-charging': './charging.html#hotels', '#preparation': './preparation.html' })[hash] ?? null;
}
