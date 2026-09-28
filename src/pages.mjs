import { readFileSync } from 'node:fs';
import { days, hotelCharging, hotelChargingCheckedAt, stations, preparations, mapUrl } from '../docs/trip-data.mjs';
import { attractions, guidePlans, guideIntro, guideCheckedAt, parkChecks, guideTradeoffs } from '../docs/attractions.mjs';
import { primaryPages } from '../docs/navigation.mjs';

const version = 'mobile-pages-1';
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const fragment = (name) => readFileSync(new URL(`./${name}.html`, import.meta.url), 'utf8');
const external = (label, href, className = '') => `<a class="${className}" href="${escape(href)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`;
const sources = (items) => `<div class="sources">${items.map(([label, href]) => external(label, href)).join('')}</div>`;
const badge = (text, tone = '') => `<span class="badge ${escape(tone)}">${escape(text)}</span>`;
const icons = {
  route: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h6a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
  check: '<rect x="4" y="3" width="16" height="19" rx="2"/><path d="m8 9 2 2 5-5m-7 10h8"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;

function layout({ page, category = page, title, subtitle = '', back = './index.html', backLabel = '返回路线总览', body, day = '', guide = '' }) {
  const nav = (mobile = false) => primaryPages.map((item) => `<a href="./${item.file}"${item.id === category ? ' aria-current="page"' : ''}>${icon(item.icon)}<span>${mobile ? item.short : item.label}</span></a>`).join('');
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#163e35">
  <meta name="description" content="${escape(`${title}。北京出发，9月29日至10月6日阿尔山秋日自驾：东乌进、柴河出。${subtitle}`)}">
  <title>${escape(title)} · 阿尔山秋日环线</title>
  <link rel="icon" href="./assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="./styles.css?v=${version}">
  <script type="module" src="./app.mjs?v=${version}"></script>
</head>
<body data-page="${page}" data-category="${category}"${day ? ` data-day="${day}"` : ''}${guide ? ` data-guide="${guide}"` : ''}${page === 'overview' ? ` data-guide-ids="${attractions.map(({ id }) => id).join(',')}"` : ''}>
  <a class="skip-link" href="#main">跳至正文</a>
  <header class="site-header">
    <a class="brand" href="./index.html" aria-label="Route Weaver 路线总览"><span class="brand-mark" aria-hidden="true">rw</span><span>ROUTE WEAVER<small>阿尔山 · 秋日环线</small></span></a>
    <nav class="desktop-nav" aria-label="主导航">${nav()}</nav>
    ${page === 'overview' ? '<span class="mobile-trip-title">阿尔山 · 秋日环线</span>' : `<a class="mobile-back" data-context-back href="${back}" aria-label="${backLabel}">${icon('back')}<span>返回</span></a><span class="mobile-page-title">${escape(primaryPages.find((item) => item.id === category)?.label ?? title)}</span>`}
    <button class="menu-button" type="button" aria-label="打开导航菜单" aria-haspopup="dialog" aria-controls="site-menu" aria-expanded="false" hidden>${icon('menu')}<span>菜单</span></button>
  </header>
  <dialog id="site-menu" class="site-menu" aria-labelledby="menu-title">
    <div class="menu-heading"><h2 id="menu-title">旅行手册</h2><button type="button" class="menu-close" aria-label="关闭导航菜单">${icon('close')}</button></div>
    <nav aria-label="完整菜单">${nav()}</nav>
    <p class="menu-caption">按日期查看行程</p><div class="menu-days">${days.map((d) => `<a href="./day-${d.id}.html">${d.date}<span>${escape(d.route.at(-1).replace('布谷名居度假酒店（森林公园店）', '森林公园'))}</span></a>`).join('')}</div>
    <p class="menu-footnote">09.29 — 10.06 · 10/7 休息或延误备用</p>
  </dialog>
  <main id="main">
    ${page === 'overview' ? '' : `<nav class="breadcrumb" aria-label="返回导航"><a data-context-back href="${back}">${icon('back')}<span data-back-label>${backLabel}</span></a></nav>`}
    <div class="page-heading"><div><p class="eyebrow">2026 / 09.29 — 10.06${day ? ` · DAY ${String(day).padStart(2, '0')}` : ''}</p><h1>${escape(title)}</h1>${subtitle ? `<p class="page-subtitle">${escape(subtitle)}</p>` : ''}</div>${page === 'overview' ? '<div class="trip-stamp"><strong>8 <span>天</span> 7 <span>晚</span></strong><small>东乌进 · 柴河出</small></div>' : ''}</div>
    ${body}
  </main>
  <footer><span>ROUTE WEAVER · 2026 秋日自驾</span><p>里程、票价、天气与充电线索为规划参考。</p>${external('GitHub', 'https://github.com/tianhaotian/route_weaver')}</footer>
  <nav class="bottom-nav" aria-label="手机主导航">${nav(true)}</nav>
  <noscript><style>[data-panel][hidden]{display:block!important}</style><p class="noscript-note">菜单与详情链接可直接使用；${external('完整文字手册', 'https://github.com/tianhaotian/route_weaver/blob/main/ITINERARY.md')}。</p></noscript>
</body>
</html>
`.replace(/^[ \t]+$/gm, '');
}

const dayNav = (current) => `<nav class="date-nav" aria-label="按日期查看行程">${days.map((d) => `<a href="./day-${d.id}.html"${d.id === current ? ' aria-current="page"' : ''}><small>D${d.id} · ${d.weekday}</small><strong>${d.date}</strong></a>`).join('')}</nav>`;
const heading = (title, note = '') => `<div class="section-heading"><h2>${escape(title)}</h2>${note ? `<span>${escape(note)}</span>` : ''}</div>`;
const notice = (title, text) => `<aside class="notice"><h3>${escape(title)}</h3><p>${escape(text)}</p></aside>`;
const sourceNote = `<p class="source-note">景点资料查询：${guideCheckedAt}。时长和取舍为本次规划建议，交通、排队另计；开放及接驳以当日为准。${external('完整文字攻略', 'https://github.com/tianhaotian/route_weaver/blob/main/ITINERARY.md#核心景点游览攻略')}</p>`;

function home() {
  return layout({ page: 'overview', title: '阿尔山 · 秋日环线', subtitle: '一名司机，一辆 YU7 Max。沿草原与林海往返北京。', body: `
    <div class="trip-stats"><div><small>里程预算</small><strong>3,200—3,500 <span>km</span></strong></div><div><small>实际高速续航</small><strong>约 450 <span>km</span></strong></div><div><small>返京日期</small><strong>10.06 <span>周二</span></strong></div></div>
    <section aria-labelledby="home-days"><div class="section-heading"><h2 id="home-days">按日期出发</h2><a href="./itinerary.html">八日行程与住宿 →</a></div>${dayNav(0)}</section>
    <div class="home-layout"><section class="home-entries" aria-label="常用入口">${[
      ['itinerary', '每天怎么走', '路线、时间安排与七晚已选酒店'],
      ['attractions', '核心景点怎么玩', '八处景观的推荐、顺序与取舍'],
      ['charging', '今晚在哪里充电', '酒店设施证据与沿途备用站'],
      ['preparation', '出发前看一眼', '待确认事项、天气、门票与行李'],
    ].map(([id, title, text]) => { const item = primaryPages.find((item) => item.id === id); return `<a class="entry-card" href="./${item.file}">${icon(item.icon)}<span><strong>${title}</strong><small>${text}</small></span><span class="entry-arrow" aria-hidden="true">→</span></a>`; }).join('')}</section>
    <section class="map-section"><details class="map-fold" open><summary>环线路线示意 <span aria-hidden="true">＋</span></summary>${fragment('route-map')}</details></section></div>
    ${notice('给这四段留好白天', 'G331 草原入林区、森林公园核心景点、蘑阿公路和柴河半日。白狼峰按天气与接驳决定，10/5 返程按疲劳程度调整。')}
    <p class="source-note">原方案里程合计 2,970—3,350 公里；预算包含部分余量。10/2—10/3 仍需按布谷名居实际位置及入园路线复核，找桩与临时绕行另计。10/7 留作休息或延误备用。</p>` });
}

function itinerary() {
  return layout({ page: 'itinerary', title: '八日行程', subtitle: '点开日期，查看当天安排、住宿和补电。', body: `<div class="itinerary-list">${days.map((d) => `<a class="day-card" id="day-${d.id}" href="./day-${d.id}.html"><div class="day-date"><span>DAY ${String(d.id).padStart(2, '0')}</span><strong>${d.date}</strong><small>${d.weekday}</small></div><div class="day-card-content"><div class="card-top"><h2>${escape(d.short)}</h2>${badge(d.tag, d.type)}</div><p>${escape(d.title)}</p><div class="day-card-facts"><span>${d.distance.join('—')} 公里${d.extra ? ' · 另留绕行余量' : ''}</span><span>${escape(d.stay)}</span></div></div><span class="entry-arrow" aria-hidden="true">→</span></a>`).join('')}</div><p class="source-note">酒店为已选地点，不表示本页核验过预订。10/2—10/3 里程按酒店实际位置复核；具体日程页保留沿途住宿和天气调整余地。</p>` });
}

function dayPage(d) {
  const hotel = hotelCharging.find((item) => item.day === d.id);
  const guides = attractions.filter((item) => item.days.includes(d.id));
  const hotelMap = d.places.find(([label]) => label === '已选酒店');
  const page = `day-${d.id}`;
  return layout({ page: 'day', category: 'itinerary', title: d.title, subtitle: `${d.date} ${d.weekday} · ${d.short}`, day: d.id, back: `./itinerary.html#day-${d.id}`, backLabel: '返回八日行程', body: `
    ${dayNav(d.id)}
    <div class="day-lead"><div>${badge(d.tag, d.type)}<p>${escape(d.intro)}</p></div><div class="day-distance"><small>${d.id === 4 || d.id === 5 ? '原方案参考里程' : '预计自驾'}</small><strong>${d.distance.join('—')} <span>km</span></strong>${d.extra ? `<p>${escape(d.extra)}</p>` : ''}</div></div>
    ${guides.length ? `<nav class="day-guide-links" aria-label="当天景点攻略"><span>当天攻略</span>${guides.map((item) => `<a href="./guide-${item.id}.html?from=${page}">${escape(item.name)} →</a>`).join('')}</nav>` : ''}
    <div class="day-layout"><section class="panel timeline-panel">${heading('当天怎么走')}<p class="route-breadcrumb">${d.route.map(escape).join(' → ')}</p><ol class="timeline">${d.schedule.map(([time, title, text]) => `<li><span class="timeline-time">${escape(time)}</span><div><h3>${escape(title)}</h3><p>${escape(text)}</p></div></li>`).join('')}</ol></section>
    <aside class="day-aside">
      <section class="panel stay-panel">${heading(d.id === 8 ? '回到北京' : '今晚住宿', d.stayStatus ?? '')}<h3>${escape(d.stay)}</h3>${d.stayNote ? `<p>${escape(d.stayNote)}</p>` : '<p>10/7 休息，或作为行程延误备用。</p>'}${hotelMap ? external('搜索酒店位置', mapUrl(hotelMap[1], hotelMap[2]), 'text-link') : ''}${hotel ? `<div class="hotel-mini">${badge(hotel.status, hotel.tone)}<p>${escape(hotel.plan)}</p><a class="text-link" href="./charging.html?from=${page}#hotel-${d.id}">充电设施来源与备用方案 →</a></div>` : ''}</section>
      <section class="charge-panel"><h2>当天补电节奏</h2><ol>${d.charge.map(([place, target]) => `<li><span>${escape(place)}</span><strong>${escape(target)}</strong></li>`).join('')}</ol></section>
      ${notice(d.note[0], d.note[1])}
    </aside></div>
    <details class="panel location-fold"><summary>地点与充电线索 <span aria-hidden="true">＋</span></summary><div class="details-body location-links">${d.places.map(([label, query, city]) => `<div><small>${escape(label)}</small>${external(query, mapUrl(query, city))}</div>`).join('')}<p class="source-note">高德关键词搜索，出发前核对位置与营业状态。</p></div></details>
    <nav class="page-pagination" aria-label="前后一天">${d.id > 1 ? `<a href="./day-${d.id - 1}.html">← ${days[d.id - 2].date} 前一天</a>` : '<span></span>'}<a href="./itinerary.html#day-${d.id}">八日目录</a>${d.id < 8 ? `<a href="./day-${d.id + 1}.html">后一天 ${days[d.id].date} →</a>` : '<span></span>'}</nav>` });
}

function attractionList() {
  return layout({ page: 'attractions', title: '核心景点攻略', subtitle: '驼峰岭天池优先，蘑阿公路留给白天，柴河按时间选一处。', body: `
    <nav class="filter-nav" aria-label="按游览日期筛选"><a href="./attractions.html" data-guide-filter="all" aria-current="true">全部 8 处</a>${guidePlans.map((plan) => `<a href="./attractions.html?day=${plan.day}" data-guide-filter="${plan.day}">${days[plan.day - 1].date}</a>`).join('')}</nav>
    <div class="compact-plans">${guidePlans.map((plan) => `<details class="panel" data-plan-day="${plan.day}"><summary>${escape(plan.label)} · 怎么取舍 <span aria-hidden="true">＋</span></summary><div class="details-body"><h2>${escape(plan.title)}</h2><p>${escape(plan.text)}</p><p class="inline-note">${escape(plan.decision)}</p><a class="text-link" href="./day-${plan.day}.html">查看当天完整安排 →</a></div></details>`).join('')}</div>
    <div class="guide-directory">${attractions.map((item, index) => `<article class="guide-card ${item.tone}" id="guide-${item.id}" data-guide-days="${item.days.join(',')}"><a data-guide-link href="./guide-${item.id}.html"><div class="card-top"><span class="guide-number">${String(index + 1).padStart(2, '0')}</span>${badge(item.priority, item.tone)}</div><small>${escape(item.area)} · ${item.days.map((id) => days[id - 1].date).join(' / ')}</small><h2>${escape(item.name)}</h2><p>${escape(item.reason)}</p><div class="guide-card-bottom"><span>${escape(item.duration)}</span><strong>查看攻略 →</strong></div></a></article>`).join('')}</div>
    <details class="panel guide-notes"><summary>季节、路线与天气取舍 <span aria-hidden="true">＋</span></summary><div class="details-body"><p>${escape(guideIntro)}</p>${guideTradeoffs.map(([title, text]) => `<h3>${escape(title)}</h3><p>${escape(text)}</p>`).join('')}</div></details>${sourceNote}` });
}

function guidePage(item) {
  const isPark = item.area === '森林公园';
  return layout({ page: 'guide', category: 'attractions', title: item.name, subtitle: `${item.area} · ${item.days.map((id) => days[id - 1].date).join(' / ')}`, guide: item.id, back: `./attractions.html#guide-${item.id}`, backLabel: '返回景点列表', body: `
    <div class="guide-detail-layout"><article class="panel guide-article">
      <div class="guide-lead">${badge(item.priority, item.tone)}<p>${escape(item.reason)}</p></div>
      <dl class="guide-facts"><div><dt>建议停留</dt><dd>${escape(item.duration)}</dd></div><div><dt>体力安排</dt><dd>${escape(item.effort)}</dd></div></dl><p class="source-note">时长为规划建议，景点间交通、排队与用餐另计。</p>
      <section><h2>建议这样游览</h2><ol class="guide-steps">${item.steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol></section>
      <section><h2>观景与拍照</h2><p>${escape(item.photo)}</p></section>
      ${notice('什么时候减掉或调整', item.skip)}
      <section><h2>交通与位置提醒</h2><p>${escape(item.logistics)}</p></section>
      <div class="guide-actions">${external(`搜索：${item.query}`, mapUrl(item.query, item.city), 'button-link')}<a data-context-back class="button-link secondary" href="./attractions.html#guide-${item.id}"><span data-back-label>返回景点列表</span></a></div><p class="source-note">关键词搜索，核对实际入口与停车点后再导航。</p>
      <details class="source-fold"><summary>景观与位置资料来源 <span aria-hidden="true">＋</span></summary><div class="details-body">${sources(item.sources)}${sourceNote}</div></details>
    </article><aside class="guide-side"><section class="panel"><h2>放进这一天</h2>${item.days.map((id) => { const plan = guidePlans.find((p) => p.day === id); return `<div class="related-day"><span>${days[id - 1].date}</span><h3>${escape(plan.title)}</h3><p>${escape(plan.text)}</p><a class="text-link" href="./day-${id}.html">查看当天行程 →</a></div>`; }).join('')}</section>
    ${isPark ? `<details class="panel"><summary>园内换乘与取车 <span aria-hidden="true">＋</span></summary><div class="details-body">${parkChecks.map(([title, text]) => `<h3>${escape(title)}</h3><p>${escape(text)}</p>`).join('')}<a class="text-link" href="./preparation.html#tickets">门票与交通准备 →</a></div></details>` : ''}</aside></div>` });
}

function panelNav(items) {
  return `<nav class="panel-nav" aria-label="页内分类" style="--panel-count:${items.length}">${items.map(([id, label], i) => `<a href="#${id}" data-panel-link="${id}" aria-controls="${id}"${i === 0 ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>`;
}

function charging() {
  return layout({ page: 'charging', title: '住宿与补电', subtitle: '酒店有可用桩就入住充；外部站点与未确认设施分别安排。', body: `
    ${panelNav([['hotels', '七晚酒店'], ['stations', '沿途站点'], ['rules', '补电原则']])}
    <section id="hotels" data-panel><p class="source-note">公开页面查询：${hotelChargingCheckedAt}。未电话确认，不代表当晚空闲、可用或实际功率。</p><div class="hotel-cards">${hotelCharging.map((item) => { const d = days[item.day - 1]; const place = d.places.find(([label]) => label === '已选酒店'); return `<details class="hotel-card panel" id="hotel-${item.day}"><summary><span class="hotel-date">${d.date}<small>D${item.day}</small></span><span class="hotel-title"><strong>${escape(d.stay)}</strong>${badge(item.status, item.tone)}</span><span class="fold-mark" aria-hidden="true">＋</span></summary><div class="details-body"><h3>当晚怎么充</h3><p>${escape(item.plan)}</p><div class="inline-note"><h3>备用方案</h3><p>${escape(item.fallback)}</p></div><h3>查到的信息</h3><p>${escape(item.evidence)}</p>${sources(item.sources)}<div class="card-actions">${external('搜索备用充电位置', mapUrl(item.backupQuery, item.city))}${external('搜索酒店', mapUrl(place[1], place[2]))}<a href="./day-${item.day}.html">当天行程 →</a></div></div></details>`; }).join('')}</div></section>
    <section id="stations" data-panel hidden><p class="source-note">原方案历史记录、地图及酒店页面线索，未代表实时营业或功率。其他酒店需先确认非住客能否使用。</p><div class="station-grid">${stations.map(([area, name, source, note, city]) => `<article class="panel station-card"><div class="card-top"><span>${escape(area)}</span>${badge('待确认', 'unknown')}</div><h2>${escape(name)}</h2><p>${escape(note)}</p><small>${escape(source)}</small>${external('高德搜索', mapUrl(name, city), 'text-link')}</article>`).join('')}</div></section>
    <section id="rules" data-panel hidden><div class="charge-principles">${[
      ['补电节奏', '200—250 km', '高速安排一次补电机会，同方向准备备用站。'],
      ['普通途中目标', '80%—90%', '缺少可靠补电的长路段，出发前充满并核算余量。'],
      ['每次停车预留', '40—60 min', '吃饭、走动与快充合并，排队另算；交流慢充按整晚安排。'],
      ['G331 到达目标', '至少 20%', '预测持续下降就重新判断，途中补电尚未确认。'],
    ].map(([title, value, text]) => `<article class="panel"><span>${title}</span><strong>${value}</strong><p>${text}</p></article>`).join('')}</div>${notice('酒店有桩，先核实可用性和位置', '张家口亚朵优先店内充；成悦与全季先核实所列设施。东乌、柴河及赤峰按店外站点安排；布谷名居确认前不预计可补入电量。各晚目标以实际能充到的电量为准。')}<article class="panel host-questions"><h2>联系住宿时直接问</h2><ul><li>桩在酒店内还是附近？准确位置在哪里？</li><li>支持 YU7 国标接口吗？交流还是直流、多少千瓦、几把枪？</li><li>住客如何使用，当晚能否安排？充电及停车费用多少？</li><li>请发桩照片和运营商名称；慢充按功率核算整晚能补多少电。</li></ul></article></section>` });
}

function preparation() {
  return layout({ page: 'preparation', title: '行前准备', subtitle: '先落实道路、补电与住宿，再按天气准备行李。', body: `
    ${panelNav([['checklist', '优先确认'], ['weather', '低温天气'], ['tickets', '门票交通'], ['packing', '行李装备']])}
    <section id="checklist" data-panel><ol class="prep-list">${preparations.map(([title, when, text], i) => `<li class="panel"><span class="list-number">${String(i + 1).padStart(2, '0')}</span><div><div class="card-top"><h2>${escape(title)}</h2>${badge(when)}</div><p>${escape(text)}</p></div></li>`).join('')}</ol><a class="button-link secondary" href="./charging.html">查看七晚酒店充电信息 →</a></section>
    <section id="weather" data-panel hidden>${fragment('weather')}</section>
    <section id="tickets" data-panel hidden><div class="practical-grid">${fragment('tickets')}</div></section>
    <section id="packing" data-panel hidden><div class="practical-grid">${fragment('packing')}</div></section>` });
}

export function renderPages() {
  const pages = new Map([
    ['index.html', home()], ['itinerary.html', itinerary()], ['attractions.html', attractionList()], ['charging.html', charging()], ['preparation.html', preparation()],
  ]);
  for (const day of days) pages.set(`day-${day.id}.html`, dayPage(day));
  for (const guide of attractions) pages.set(`guide-${guide.id}.html`, guidePage(guide));
  return pages;
}
