// Check for slug collisions in the seed data
import { readFileSync } from 'fs';

const src = readFileSync('packages/db/prisma/seed.ts', 'utf8');
const titles = [...src.matchAll(/title: '([^']+)'/g)].map(m => m[1]);

// Only check article titles (first 53)
const articleTitles = titles.slice(0, 53);

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const slugMap = new Map();
for (const title of articleTitles) {
  const s = slug(title);
  if (slugMap.has(s)) {
    console.log(`⚠ SLUG COLLISION: "${s}"`);
    console.log(`  1: ${slugMap.get(s)}`);
    console.log(`  2: ${title}`);
  }
  slugMap.set(s, title);
}

console.log(`\nTotal unique slugs: ${slugMap.size} / ${articleTitles.length} titles`);

// List missing articles (articles 36-53)
console.log('\n--- Expected articles 36-53 ---');
articleTitles.slice(35).forEach((t, i) => {
  console.log(`${i + 36}. ${t} → slug: ${slug(t).substring(0, 50)}`);
});
