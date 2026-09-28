import { days, hotelCharging, hotelChargingCheckedAt, stations, preparations, mapUrl, dayFromHash } from './trip-data.mjs?v=hotel-charging-1';

const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let selectedDay = dayFromHash(location.hash) ?? 1;
const destinationLabels = ['张家口', '东乌旗', '阿尔山', '白狼峰 · 天池', '柴河', '乌兰浩特', '赤峰', '北京'];
const sourceLinks = (sources) => sources.map(([title, url]) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(title)} ↗</a>`).join(' · ');

function hotelChargeNote(dayId) {
  const item = hotelCharging.find(({ day }) => day === dayId);
  if (!item) return '';
  return `<div class="hotel-charge-note ${escape(item.tone)}"><h3>住宿充电 · ${escape(item.status)}</h3><p>${escape(item.plan)}</p><p class="charge-evidence">${escape(item.evidence)}</p><div class="charging-sources">${sourceLinks(item.sources)}</div><a class="hotel-charge-more" href="#hotel-charging">查看酒店充电总表与备用方案 ↓</a></div>`;
}

$('#day-tabs').innerHTML = days.map((day) => `<button type="button" class="day-tab" id="tab-${day.id}" role="tab" aria-controls="day-summary" aria-selected="false" tabindex="-1" data-day="${day.id}"><span class="day-number">DAY ${String(day.id).padStart(2, '0')}</span><strong>${day.date}</strong><small>${day.weekday}</small><span class="day-place">${destinationLabels[day.id - 1]}</span></button>`).join('');

function renderDay(id, { updateHash = false, focusTab = false } = {}) {
  const day = days.find((item) => item.id === id);
  if (!day) return;
  selectedDay = id;
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    const active = Number(tab.dataset.day) === id;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll('[data-segment]').forEach((segment) => segment.classList.toggle('is-selected', Number(segment.dataset.segment) === id));
  $('#day-summary').setAttribute('aria-labelledby', `tab-${id}`);
  $('#day-summary').innerHTML = `
    <div class="summary-content">
      <div class="summary-top"><span class="day-badge">DAY ${String(id).padStart(2, '0')} / ${day.date}</span><span class="pill ${day.type}">${escape(day.tag)}</span></div>
      <h3>${escape(day.title)}</h3><p>${escape(day.intro)}</p>
      <div class="summary-facts"><div><span>${id === 4 || id === 5 ? '原方案参考里程' : '预计自驾'}</span><strong>${day.distance.join('—')} 公里</strong>${day.extra ? `<small>${escape(day.extra)}</small>` : ''}</div><div><span>${id === 8 ? '目的地' : `今晚住宿 · ${escape(day.stayStatus)}`}</span><strong>${escape(day.stay)}</strong>${day.stayNote ? `<small>${escape(day.stayNote)}</small>` : ''}</div></div>
      <a class="view-day-link" href="#itinerary">查看当天具体安排 <span aria-hidden="true">↓</span></a>
    </div>
    <figure class="day-photo"><img src="./assets/autumn-forest.jpg" alt="大兴安岭根河一带的金色秋林与粉色暮空，作为区域秋色参考" width="1400" height="933"><figcaption><span>大兴安岭 · 根河秋色参考</span><a href="./credits.html" target="_blank" rel="noopener noreferrer" aria-label="查看照片作者和许可">图片来源 ↗</a></figcaption></figure>`;
  $('#selected-date').textContent = `${day.date} ${day.weekday} · DAY ${String(id).padStart(2, '0')}`;
  $('#day-detail').innerHTML = `
    <div class="timeline-panel"><div class="route-breadcrumb" aria-label="当天路线">${day.route.map(escape).join(' <span aria-hidden="true">→</span> ')}</div><ol class="timeline">${day.schedule.map(([time, title, text]) => `<li><time>${escape(time)}</time><div class="timeline-step"><h3>${escape(title)}</h3><p>${escape(text)}</p></div></li>`).join('')}</ol></div>
    <aside class="detail-aside"><div class="daily-charge"><h3>⚡ 当天补电节奏</h3><ol class="charge-route">${day.charge.map(([place, target]) => `<li><span>${escape(place)}</span><strong>${escape(target)}</strong></li>`).join('')}</ol></div>${hotelChargeNote(id)}<div class="condition-note"><span>PLAN WITH ROOM</span><h3>${escape(day.note[0])}</h3><p>${escape(day.note[1])}</p></div><div class="places-panel"><h3>地点与充电线索</h3>${day.places.map(([label, place, city]) => `<a href="${escape(mapUrl(place, city))}" target="_blank" rel="noopener noreferrer"><span><small>${escape(label)}</small>${escape(place)}</span><span aria-hidden="true">↗</span></a>`).join('')}<p class="places-note">高德关键词搜索；出发前核对实际位置与营业状态。</p></div></aside>`;
  $('#previous-day').disabled = id === 1;
  $('#next-day').disabled = id === days.length;
  $('#day-counter').textContent = `DAY ${String(id).padStart(2, '0')} / 08`;
  if (updateHash) history.replaceState(null, '', `#day-${id}`);
  if (focusTab) {
    const tab = $(`#tab-${id}`);
    tab.focus({ preventScroll: true });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
  }
}

$('#day-tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('[data-day]');
  if (tab) renderDay(Number(tab.dataset.day), { updateHash: true });
});
$('#day-tabs').addEventListener('keydown', (event) => {
  const movement = { ArrowRight: selectedDay === 8 ? 1 : selectedDay + 1, ArrowLeft: selectedDay === 1 ? 8 : selectedDay - 1, Home: 1, End: 8 };
  if (!(event.key in movement)) return;
  event.preventDefault();
  renderDay(movement[event.key], { updateHash: true, focusTab: true });
});
for (const [selector, direction] of [['#previous-day', -1], ['#next-day', 1]]) {
  $(selector).addEventListener('click', () => {
    renderDay(selectedDay + direction, { updateHash: true });
    $('#itinerary').scrollIntoView({ block: 'start' });
  });
}
window.addEventListener('hashchange', () => {
  const day = dayFromHash(location.hash);
  if (day) renderDay(day);
});

$('#overview-rows').innerHTML = days.map((day) => `<tr><td>${day.date}<small>D${day.id} · ${day.weekday}</small></td><td><button type="button" data-day="${day.id}" aria-label="查看 ${day.date} ${escape(day.short)} 的安排">${escape(day.short)}</button></td><td>${day.distance.join('—')} km${day.extra ? `<small>${escape(day.extra)}</small>` : ''}</td><td>${escape(day.stay)}${day.stayStatus ? `<small>${escape(day.stayStatus)} · ${escape(day.stayNote)}</small>` : ''}</td></tr>`).join('');
$('#overview-rows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-day]');
  if (!button) return;
  renderDay(Number(button.dataset.day), { updateHash: true });
  $('#itinerary').scrollIntoView({ block: 'start' });
});
$('#hotel-charging-date').textContent = `公开页面查询：${hotelChargingCheckedAt}`;
$('#hotel-charging-rows').innerHTML = hotelCharging.map((item) => {
  const day = days.find(({ id }) => id === item.day);
  return `<tr><td>${day.date}</td><td><strong>${escape(day.stay)}</strong><span class="charging-status ${escape(item.tone)}">${escape(item.status)}</span><p>${escape(item.evidence)}</p><div class="charging-sources">${sourceLinks(item.sources)}</div></td><td><p>${escape(item.plan)}</p><p class="charging-fallback"><strong>备用：</strong>${escape(item.fallback)}</p><a class="backup-link" href="${escape(mapUrl(item.backupQuery, item.city))}" target="_blank" rel="noopener noreferrer">搜索备用充电位置 ↗</a></td></tr>`;
}).join('');
$('#station-list').innerHTML = stations.map(([area, name, source, note, city]) => `<article class="station-card"><div class="station-top"><span>${escape(area)}</span><span>${escape(source)} · 待确认</span></div><h3>${escape(name)}</h3><p>${escape(note)}</p><a href="${escape(mapUrl(name, city))}" target="_blank" rel="noopener noreferrer" aria-label="在高德搜索 ${escape(name)}">在高德搜索 ↗</a></article>`).join('');
$('#prep-list').innerHTML = preparations.map(([title, when, text]) => `<li><div><h4>${escape(title)}<span>${escape(when)}</span></h4><p>${escape(text)}</p></div></li>`).join('');
renderDay(selectedDay);
