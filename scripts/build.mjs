import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPages } from '../src/pages.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = renderPages();
for (const [file, html] of pages) writeFileSync(resolve(root, 'docs', file), html);
console.log(`Built ${pages.size} static pages for GitHub Pages.`);
