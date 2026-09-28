import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { days, stations, preparations, mapUrl, dayFromHash } from '../docs/trip-data.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = resolve(root, 'docs');
for (const name of ['app.mjs', 'trip-data.mjs']) execFileSync(process.execPath, ['--check', resolve(docs, name)]);
const index = readFileSync(resolve(docs, 'index.html'), 'utf8');
const app = readFileSync(resolve(docs, 'app.mjs'), 'utf8');
for (const name of ['index.html', 'credits.html']) {
  const html = readFileSync(resolve(docs, name), 'utf8');
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /name="viewport"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${name}: duplicate id`);
  for (const [, path] of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)) assert.ok(existsSync(resolve(docs, path)), `${name}: missing ${path}`);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), `${name}: unknown anchor ${id}`);
}
for (const [, path] of app.matchAll(/src="(\.\/[^"#]+)"/g)) assert.ok(existsSync(resolve(docs, path)), `app: missing ${path}`);
for (const [, id] of app.matchAll(/\$\('#([a-z-]+)'\)/g)) assert.ok(index.includes(`id="${id}"`), `app: missing mount ${id}`);
assert.equal(days.length, 8);
assert.deepEqual(days.map(({ id }) => id), [1, 2, 3, 4, 5, 6, 7, 8]);
assert.equal(days.reduce((sum, day) => sum + day.distance[0], 0), 2970);
assert.equal(days.reduce((sum, day) => sum + day.distance[1], 0), 3350);
for (const day of days) {
  const iso = `2026-${day.date.replace('.', '-')}`;
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(`${iso}T12:00:00Z`).getUTCDay()];
  assert.equal(day.weekday, weekday, `${iso}: weekday`);
  assert.ok(day.schedule.length >= 3 && day.charge.length >= 2 && day.places.length >= 2);
  assert.ok(day.distance[0] <= day.distance[1]);
  assert.ok(index.includes(`data-segment="${day.id}"`));
  assert.equal(dayFromHash(`#day-${day.id}`), day.id);
  for (const [, place, city] of day.places) {
    const link = new URL(mapUrl(place, city));
    assert.equal(link.origin, 'https://uri.amap.com');
    assert.equal(link.searchParams.get('keyword'), place);
    assert.equal(link.searchParams.get('city'), city);
  }
}
assert.equal(dayFromHash('#day-9'), null);
assert.equal(dayFromHash('#preparation'), null);
assert.equal(dayFromHash('#day-1<script>'), null);
assert.ok(days[3].route.indexOf('白狼峰') < days[3].route.indexOf('阿尔山国家森林公园'));
assert.equal(stations.length, 9);
assert.equal(preparations.length, 6);
assert.ok(existsSync(resolve(root, 'ITINERARY.md')));
assert.ok(existsSync(resolve(docs, '.nojekyll')));
console.log('Validated: 8 consecutive itinerary days, 2,970–3,350 km, 9 station leads, 6 preparation items, JS syntax, local assets, anchors, and map links.');
