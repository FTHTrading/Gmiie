import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

try {
  const arts = await p.article.findMany({
    select: { title: true, slug: true, articleType: true, confidenceScore: true },
    orderBy: { publishedAt: 'desc' },
  });
  
  console.log('Total articles in DB:', arts.length);
  console.log('---');
  arts.forEach((x, i) => {
    console.log(`${i+1}. [${x.articleType}] (conf:${x.confidenceScore}) ${x.title}`);
  });
  
  // Check for duplicate event families
  console.log('\n--- Duplicate check ---');
  const keywords = ['Kraken', 'BlackRock BUIDL', 'SEC', 'DTCC', 'Stablecoin'];
  for (const kw of keywords) {
    const matches = arts.filter(a => a.title.includes(kw));
    if (matches.length > 1) {
      console.log(`\n⚠ "${kw}" appears ${matches.length} times:`);
      matches.forEach(m => console.log(`  - ${m.title}`));
    }
  }
} finally {
  await p.$disconnect();
}
