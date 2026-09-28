import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { days, hotelCharging, stations, preparations, mapUrl, dayFromHash } from '../docs/trip-data.mjs';
import { attractions, guidePlans } from '../docs/attractions.mjs';
import { primaryPages, returnTarget, legacyTarget } from '../docs/navigation.mjs';
import { renderPages } from '../src/pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = resolve(root, 'docs');
for (const file of ['docs/app.mjs', 'docs/navigation.mjs', 'docs/trip-data.mjs', 'docs/attractions.mjs', 'src/pages.mjs', 'scripts/build.mjs']) {
  execFileSync(process.execPath, ['--check', resolve(root, file)]);
}
const pages = renderPages();
assert.equal(pages.size, 21);
assert.deepEqual(readdirSync(docs).filter((file) => file.endsWith('.html')).sort(), [...pages.keys()].sort());
const idsByPage = new Map();
const titles = new Set();
for (const [file, expected] of pages) {
  const html = readFileSync(resolve(docs, file), 'utf8');
  assert.equal(html, expected, `${file}: regenerate with node scripts/build.mjs`);
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /viewport-fit=cover/);
  assert.doesNotMatch(html, /user-scalable=no|maximum-scale=1/);
  assert.equal([...html.matchAll(/<h1[ >]/g)].length, 1, `${file}: one main heading`);
  const title = /<title>(.*?)<\/title>/.exec(html)?.[1];
  assert.ok(title && !titles.has(title), `${file}: unique title`);
  titles.add(title);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate id`);
  idsByPage.set(file, ids);
  for (const item of primaryPages) assert.ok(html.includes(`href="./${item.file}"`), `${file}: missing menu ${item.label}`);
  assert.match(html, /class="bottom-nav"/);
  assert.match(html, /<dialog id="site-menu"/);
  assert.doesNotMatch(html, /<table[ >]/, `${file}: phone content should use cards`);
}
let linkCount = 0;
const origin = 'https://tianhaotian.github.io';
for (const [file, html] of pages) {
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = raw.replaceAll('&amp;', '&');
    if (/^https?:/.test(href)) continue;
    const url = new URL(href, `${origin}/route_weaver/${file}`);
    assert.equal(url.origin, origin);
    assert.ok(url.pathname.startsWith('/route_weaver/'), `${file}: URL escapes project base`);
    const target = url.pathname.slice('/route_weaver/'.length);
    assert.ok(existsSync(resolve(docs, target)), `${file}: missing ${href}`);
    if (url.hash && pages.has(target)) assert.ok(idsByPage.get(target).includes(decodeURIComponent(url.hash.slice(1))), `${file}: missing fragment ${href}`);
    linkCount++;
  }
  for (const [, controlledId] of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)) {
    for (const id of controlledId.split(' ')) assert.ok(idsByPage.get(file).includes(id), `${file}: missing accessible reference ${id}`);
  }
}
const app = readFileSync(resolve(docs, 'app.mjs'), 'utf8');
for (const [, path] of app.matchAll(/from '(\.\/[^']+)'/g)) assert.ok(existsSync(resolve(docs, path.split('?')[0])));
assert.equal(days.length, 8);
assert.equal(days.reduce((sum, day) => sum + day.distance[0], 0), 2970);
assert.equal(days.reduce((sum, day) => sum + day.distance[1], 0), 3350);
for (const day of days) {
  const iso = `2026-${day.date.replace('.', '-')}`;
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(`${iso}T12:00:00Z`).getUTCDay()];
  assert.equal(day.weekday, weekday);
  assert.ok(pages.get(`day-${day.id}.html`).includes(day.stay));
  assert.equal(dayFromHash(`#day-${day.id}`), day.id);
  assert.equal(legacyTarget(`#day-${day.id}`), `./day-${day.id}.html`);
  assert.equal(returnTarget('day', `?day=${day.id}`).href, `./itinerary.html#day-${day.id}`);
  for (const [, place, city] of day.places) {
    const url = new URL(mapUrl(place, city));
    assert.equal(url.searchParams.get('keyword'), place);
    assert.equal(url.searchParams.get('city'), city);
  }
}
assert.equal(hotelCharging.length, 7);
assert.equal(stations.length, 9);
assert.equal(preparations.length, 6);
assert.ok(days[3].route.indexOf('白狼峰') < days[3].route.indexOf('阿尔山国家森林公园'));
const guideIds = attractions.map(({ id }) => id);
assert.equal(new Set(guideIds).size, 8);
for (const guide of attractions) {
  assert.equal(legacyTarget(`#guide-${guide.id}`, guideIds), `./guide-${guide.id}.html`);
  assert.ok(pages.get(`guide-${guide.id}.html`).includes(guide.name));
  for (const [, url] of guide.sources) assert.equal(new URL(url).protocol, 'https:');
}
for (const plan of guidePlans) for (const id of plan.ids) assert.ok(attractions.some((guide) => guide.id === id && guide.days.includes(plan.day)));
assert.equal(returnTarget('guide', '?from=day-4', 'bailang').href, './day-4.html');
assert.equal(returnTarget('charging', '?from=day-5').href, './day-5.html');
assert.equal(returnTarget('guide', '?day=6', 'moa').href, './attractions.html?day=6#guide-moa');
assert.equal(returnTarget('guide', '?from=https://evil.example&day=99', 'tuofeng').href, './attractions.html#guide-tuofeng');
assert.equal(returnTarget('guide', '?from=../index.html', '../oops').href, './attractions.html');
assert.equal(legacyTarget('#guide-unknown', guideIds), null);
assert.equal(legacyTarget('#day-9', guideIds), null);
assert.equal(legacyTarget('#charging', guideIds), './charging.html');
assert.ok(existsSync(resolve(docs, '.nojekyll')));
console.log(`Validated ${pages.size} static pages, ${linkCount} local links, return destinations, legacy links, 8 days, 7 hotels, and 8 attraction guides.`);
