/**
 * XXXIII.IO — Database Seed Script
 * =================================
 * Populates the database with realistic institutional data
 * for the GMIIE Intelligence Platform.
 *
 * Run: pnpm db:seed
 *
 * Creates:
 *   - 1 AI author
 *   - 70 sources (regulators, banks, exchanges, media)
 *   - 20 topics + 4 topic clusters
 *   - 100 entities (institutions, regulators, firms)
 *   - 50 articles with signals
 *   - 40 timeline events
 *   - 30 tags
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hash(title: string, source: string): string {
  return createHash('sha256')
    .update(`${title.toLowerCase().trim()}|${source}`)
    .digest('hex');
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomFloat(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function main() {
  console.log('🌱 Seeding XXXIII.IO database...\n');

  // ─── CLEAN SLATE — delete all data for idempotent re-seeding ──
  console.log('  Cleaning existing data...');
  await prisma.billUpdate.deleteMany();
  await prisma.stateUpdate.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.trackedState.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.articleTopic.deleteMany();
  await prisma.articleEntity.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.article.deleteMany();
  await prisma.entityTopic.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.topicCluster.deleteMany();
  await prisma.source.deleteMany();
  await prisma.author.deleteMany();

  // ─── AUTHOR ──────────────────────────────────────────
  console.log('  Creating AI author...');
  const author = await prisma.author.upsert({
    where: { slug: 'gmiie-intelligence-engine' },
    update: {},
    create: {
      name: 'GMIIE Intelligence Engine',
      slug: 'gmiie-intelligence-engine',
      bio: 'Automated intelligence analysis engine powering the GMIIE platform. Generates structured analysis from verified institutional sources.',
      isAI: true,
    },
  });

  // ─── SOURCES (50) ────────────────────────────────────
  console.log('  Creating 70 sources...');
  const sourcesData = [
    // TIER_1 — Regulators & Central Banks (20)
    { name: 'US Securities and Exchange Commission', url: 'https://sec.gov', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'North America' },
    { name: 'Federal Reserve', url: 'https://federalreserve.gov', sourceType: 'CENTRAL_BANK' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'North America' },
    { name: 'European Central Bank', url: 'https://ecb.europa.eu', sourceType: 'CENTRAL_BANK' as const, credibilityTier: 'TIER_1' as const, country: 'EU', region: 'Europe' },
    { name: 'Bank for International Settlements', url: 'https://bis.org', sourceType: 'CENTRAL_BANK' as const, credibilityTier: 'TIER_1' as const, country: 'CH', region: 'Europe' },
    { name: 'UK Financial Conduct Authority', url: 'https://fca.org.uk', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'GB', region: 'Europe' },
    { name: 'Bank of England', url: 'https://bankofengland.co.uk', sourceType: 'CENTRAL_BANK' as const, credibilityTier: 'TIER_1' as const, country: 'GB', region: 'Europe' },
    { name: 'Monetary Authority of Singapore', url: 'https://mas.gov.sg', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'SG', region: 'Asia-Pacific' },
    { name: 'Hong Kong Monetary Authority', url: 'https://hkma.gov.hk', sourceType: 'CENTRAL_BANK' as const, credibilityTier: 'TIER_1' as const, country: 'HK', region: 'Asia-Pacific' },
    { name: 'Bank of Japan', url: 'https://boj.or.jp', sourceType: 'CENTRAL_BANK' as const, credibilityTier: 'TIER_1' as const, country: 'JP', region: 'Asia-Pacific' },
    { name: 'DTCC', url: 'https://dtcc.com', sourceType: 'INFRASTRUCTURE_PROVIDER' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'North America' },
    { name: 'Euroclear', url: 'https://euroclear.com', sourceType: 'INFRASTRUCTURE_PROVIDER' as const, credibilityTier: 'TIER_1' as const, country: 'BE', region: 'Europe' },
    { name: 'Clearstream', url: 'https://clearstream.com', sourceType: 'INFRASTRUCTURE_PROVIDER' as const, credibilityTier: 'TIER_1' as const, country: 'LU', region: 'Europe' },
    { name: 'Swiss Financial Market Supervisory Authority', url: 'https://finma.ch', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'CH', region: 'Europe' },
    { name: 'International Monetary Fund', url: 'https://imf.org', sourceType: 'GOVERNMENT' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'Global' },
    { name: 'World Bank', url: 'https://worldbank.org', sourceType: 'GOVERNMENT' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'Global' },
    { name: 'Financial Stability Board', url: 'https://fsb.org', sourceType: 'INDUSTRY_BODY' as const, credibilityTier: 'TIER_1' as const, country: 'CH', region: 'Global' },
    { name: 'Abu Dhabi Global Market', url: 'https://adgm.com', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'AE', region: 'Middle East' },
    { name: 'Australian Securities and Investments Commission', url: 'https://asic.gov.au', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'AU', region: 'Asia-Pacific' },
    { name: 'Commodity Futures Trading Commission', url: 'https://cftc.gov', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'North America' },
    { name: 'Office of the Comptroller of the Currency', url: 'https://occ.gov', sourceType: 'REGULATOR' as const, credibilityTier: 'TIER_1' as const, country: 'US', region: 'North America' },
    // TIER_2 — Financial Press (15)
    { name: 'Bloomberg', url: 'https://bloomberg.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'Global' },
    { name: 'Financial Times', url: 'https://ft.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Reuters', url: 'https://reuters.com', sourceType: 'WIRE_SERVICE' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Wall Street Journal', url: 'https://wsj.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'North America' },
    { name: 'Nikkei Asia', url: 'https://asia.nikkei.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'JP', region: 'Asia-Pacific' },
    { name: 'The Banker', url: 'https://thebanker.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Risk.net', url: 'https://risk.net', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Global Custodian', url: 'https://globalcustodian.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'International Financial Law Review', url: 'https://iflr.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Funds Europe', url: 'https://funds-europe.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Europe' },
    { name: 'Central Banking', url: 'https://centralbanking.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Securities Finance Times', url: 'https://securitiesfinancetimes.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Asset Servicing Times', url: 'https://assetservicingtimes.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Ledger Insights', url: 'https://ledgerinsights.com', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'Global' },
    { name: 'The Block', url: 'https://theblock.co', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'Global' },
    // TIER_2 — Global Macro, Geopolitical & General Press (10 new)
    { name: 'The Economist', url: 'https://www.economist.com/finance-and-economics/rss.xml', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Global' },
    { name: 'Project Syndicate', url: 'https://www.project-syndicate.org/rss', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'CZ', region: 'Global' },
    { name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com/rss/todays-articles.xml', sourceType: 'GOVERNMENT' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'Global' },
    { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'HK', region: 'Asia-Pacific' },
    { name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml', sourceType: 'WIRE_SERVICE' as const, credibilityTier: 'TIER_2' as const, country: 'QA', region: 'Global' },
    { name: 'Politico', url: 'https://rss.politico.com/politico.xml', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'North America' },
    { name: 'Axios Markets', url: 'https://api.axios.com/feed/axios-markets', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'North America' },
    { name: 'CNBC Finance', url: 'https://feeds.nbcnews.com/nbcnews/public/rss/topstories', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'North America' },
    { name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'North America' },
    { name: 'The Hindu BusinessLine', url: 'https://www.thehindubusinessline.com/?service=rss', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'IN', region: 'Asia-Pacific' },
    // TIER_2 — Regional & Emerging Markets Coverage (10 additional)
    { name: 'Caixin Global', url: 'https://www.caixinglobal.com/rss/', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'CN', region: 'Asia-Pacific' },
    { name: 'Australian Financial Review', url: 'https://www.afr.com/rss', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'AU', region: 'Asia-Pacific' },
    { name: 'Business Standard', url: 'https://www.business-standard.com/rss/home_page_top_stories.rss', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'IN', region: 'Asia-Pacific' },
    { name: 'Financial Post', url: 'https://financialpost.com/feed', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'CA', region: 'North America' },
    { name: 'Arab News Economy', url: 'https://www.arabnews.com/economy/rss.xml', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'SA', region: 'Middle East' },
    { name: 'African Business', url: 'https://african.business/feed/', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'GB', region: 'Africa' },
    { name: 'The Jakarta Post Business', url: 'https://www.thejakartapost.com/rss/business', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'ID', region: 'Asia-Pacific' },
    { name: 'Latin Finance', url: 'https://latinfinance.com/feed/', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'South America' },
    { name: 'Global Finance Magazine', url: 'https://gfmag.com/feed/', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'US', region: 'Global' },
    { name: 'Korea Herald Business', url: 'https://www.koreaherald.com/rss/020100000000.xml', sourceType: 'FINANCIAL_PRESS' as const, credibilityTier: 'TIER_2' as const, country: 'KR', region: 'Asia-Pacific' },
    // TIER_3 — Industry (15)
    { name: 'CoinDesk', url: 'https://coindesk.com', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'Cointelegraph', url: 'https://cointelegraph.com', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'DL News', url: 'https://dlnews.com', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'Blockworks', url: 'https://blockworks.co', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'Unchained', url: 'https://unchainedcrypto.com', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'Decrypt', url: 'https://decrypt.co', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'Token Terminal', url: 'https://tokenterminal.com', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'FI', region: 'Europe' },
    { name: 'DefiLlama', url: 'https://defillama.com', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'RWA.xyz', url: 'https://rwa.xyz', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
    { name: 'Galaxy Research', url: 'https://galaxy.com/research', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'North America' },
    { name: 'Messari', url: 'https://messari.io', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'North America' },
    { name: 'Chainalysis', url: 'https://chainalysis.com', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'North America' },
    { name: 'Dune Analytics', url: 'https://dune.com', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'NO', region: 'Europe' },
    { name: 'Artemis', url: 'https://artemis.xyz', sourceType: 'RESEARCH_FIRM' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'North America' },
    { name: 'Securities.io', url: 'https://securities.io', sourceType: 'CRYPTO_PUBLICATION' as const, credibilityTier: 'TIER_3' as const, country: 'US', region: 'Global' },
  ];

  const sources: Record<string, string> = {};
  for (const s of sourcesData) {
    const created = await prisma.source.upsert({
      where: { slug: slug(s.name) },
      update: {},
      create: {
        name: s.name,
        slug: slug(s.name),
        url: s.url,
        sourceType: s.sourceType,
        credibilityTier: s.credibilityTier,
        country: s.country,
        region: s.region,
        language: 'en',
        isActive: true,
        scrapeMethod: 'RSS',
      },
    });
    sources[s.name] = created.id;
  }

  // ─── TOPIC CLUSTERS (4) ──────────────────────────────
  console.log('  Creating 4 topic clusters + 20 topics...');
  const clusters = await Promise.all([
    prisma.topicCluster.upsert({
      where: { slug: 'tokenized-securities' },
      update: {},
      create: { name: 'Tokenized Securities', slug: 'tokenized-securities', description: 'Digital representations of traditional financial instruments on distributed ledger infrastructure.' },
    }),
    prisma.topicCluster.upsert({
      where: { slug: 'market-infrastructure' },
      update: {},
      create: { name: 'Market Infrastructure', slug: 'market-infrastructure', description: 'Settlement, clearing, custody, and exchange systems that underpin global capital markets.' },
    }),
    prisma.topicCluster.upsert({
      where: { slug: 'regulatory-frameworks' },
      update: {},
      create: { name: 'Regulatory Frameworks', slug: 'regulatory-frameworks', description: 'Laws, rules, and policy frameworks governing digital assets and tokenized finance.' },
    }),
    prisma.topicCluster.upsert({
      where: { slug: 'digital-currency' },
      update: {},
      create: { name: 'Digital Currency', slug: 'digital-currency', description: 'Central bank digital currencies, stablecoins, and programmable money systems.' },
    }),
  ]);

  const topicsData = [
    { name: 'Tokenized Bonds', description: 'Fixed income instruments issued or represented on blockchain infrastructure.', cluster: 0 },
    { name: 'Tokenized Equities', description: 'Equity securities represented as digital tokens on distributed ledger systems.', cluster: 0 },
    { name: 'Tokenized Real Estate', description: 'Real estate investment products fractionalized via blockchain tokens.', cluster: 0 },
    { name: 'Tokenized Treasuries', description: 'US Treasury and sovereign debt instruments tokenized for on-chain access.', cluster: 0 },
    { name: 'Tokenized Funds', description: 'Investment funds represented as blockchain tokens for instant settlement.', cluster: 0 },
    { name: 'Digital Settlement', description: 'T+0 and atomic settlement systems using distributed ledger technology.', cluster: 1 },
    { name: 'Digital Custody', description: 'Institutional-grade custody solutions for digital and tokenized assets.', cluster: 1 },
    { name: 'Exchange Infrastructure', description: 'Trading venues and matching engines supporting tokenized instruments.', cluster: 1 },
    { name: 'Clearing and Netting', description: 'Post-trade clearing systems adapted for blockchain-native securities.', cluster: 1 },
    { name: 'Interoperability', description: 'Cross-chain and cross-platform connectivity for tokenized assets.', cluster: 1 },
    { name: 'Securities Regulation', description: 'Rules governing the issuance, trading, and custody of digital securities.', cluster: 2 },
    { name: 'AML and Compliance', description: 'Anti-money laundering, KYC, and compliance frameworks for digital finance.', cluster: 2 },
    { name: 'Cross-Border Regulation', description: 'International regulatory coordination for tokenized asset markets.', cluster: 2 },
    { name: 'Stablecoin Policy', description: 'Regulatory frameworks for fiat-backed and algorithmic stablecoins.', cluster: 2 },
    { name: 'DeFi Regulation', description: 'Emerging regulatory approaches to decentralized finance protocols.', cluster: 2 },
    { name: 'Central Bank Digital Currencies', description: 'Sovereign digital currencies issued by central banks worldwide.', cluster: 3 },
    { name: 'Stablecoins', description: 'Fiat-backed digital currencies used as payment and settlement rails.', cluster: 3 },
    { name: 'Payment Infrastructure', description: 'Cross-border and domestic payment systems leveraging digital technology.', cluster: 3 },
    { name: 'Programmable Money', description: 'Smart contract-enabled money with conditional logic and automation.', cluster: 3 },
    { name: 'Wholesale CBDC', description: 'Central bank digital currencies designed for interbank settlement.', cluster: 3 },
  ];

  const topics: Record<string, string> = {};
  for (const t of topicsData) {
    const created = await prisma.topic.upsert({
      where: { slug: slug(t.name) },
      update: {},
      create: {
        name: t.name,
        slug: slug(t.name),
        description: t.description,
        clusterId: clusters[t.cluster].id,
        isActive: true,
      },
    });
    topics[t.name] = created.id;
  }

  // ─── ENTITIES (100) ──────────────────────────────────
  console.log('  Creating 100 entities...');
  const entitiesData: Array<{
    name: string;
    shortName?: string;
    entityType: string;
    description: string;
    country: string;
    region: string;
    website?: string;
    headquarters?: string;
  }> = [
    // Central Banks (10)
    { name: 'Federal Reserve System', shortName: 'Fed', entityType: 'CENTRAL_BANK', description: 'Central bank of the United States, responsible for monetary policy and financial system stability.', country: 'US', region: 'North America', website: 'https://federalreserve.gov', headquarters: 'Washington, D.C.' },
    { name: 'European Central Bank', shortName: 'ECB', entityType: 'CENTRAL_BANK', description: 'Central bank for the eurozone, managing monetary policy for 20 EU member states.', country: 'EU', region: 'Europe', website: 'https://ecb.europa.eu', headquarters: 'Frankfurt' },
    { name: 'Bank of England', shortName: 'BoE', entityType: 'CENTRAL_BANK', description: 'Central bank of the United Kingdom.', country: 'GB', region: 'Europe', website: 'https://bankofengland.co.uk', headquarters: 'London' },
    { name: 'Bank of Japan', shortName: 'BoJ', entityType: 'CENTRAL_BANK', description: 'Central bank of Japan, responsible for monetary policy and financial stability.', country: 'JP', region: 'Asia-Pacific', website: 'https://boj.or.jp', headquarters: 'Tokyo' },
    { name: 'Swiss National Bank', shortName: 'SNB', entityType: 'CENTRAL_BANK', description: 'Central bank of Switzerland.', country: 'CH', region: 'Europe', website: 'https://snb.ch', headquarters: 'Bern' },
    { name: 'Peoples Bank of China', shortName: 'PBoC', entityType: 'CENTRAL_BANK', description: 'Central bank of the Peoples Republic of China, leading CBDC development globally.', country: 'CN', region: 'Asia-Pacific', headquarters: 'Beijing' },
    { name: 'Reserve Bank of Australia', shortName: 'RBA', entityType: 'CENTRAL_BANK', description: 'Central bank of Australia.', country: 'AU', region: 'Asia-Pacific', headquarters: 'Sydney' },
    { name: 'Bank for International Settlements', shortName: 'BIS', entityType: 'CENTRAL_BANK', description: 'International financial institution facilitating cooperation among central banks.', country: 'CH', region: 'Global', website: 'https://bis.org', headquarters: 'Basel' },
    { name: 'Central Bank of Brazil', shortName: 'BCB', entityType: 'CENTRAL_BANK', description: 'Central bank of Brazil, operator of the PIX instant payment system.', country: 'BR', region: 'South America', headquarters: 'Brasilia' },
    { name: 'Central Bank of the UAE', shortName: 'CBUAE', entityType: 'CENTRAL_BANK', description: 'Central bank of the United Arab Emirates.', country: 'AE', region: 'Middle East', headquarters: 'Abu Dhabi' },
    // Regulators (10)
    { name: 'US Securities and Exchange Commission', shortName: 'SEC', entityType: 'REGULATOR', description: 'Primary US regulator for securities markets including digital asset securities.', country: 'US', region: 'North America', website: 'https://sec.gov', headquarters: 'Washington, D.C.' },
    { name: 'Commodity Futures Trading Commission', shortName: 'CFTC', entityType: 'REGULATOR', description: 'US regulator for derivatives and commodity futures markets.', country: 'US', region: 'North America', headquarters: 'Washington, D.C.' },
    { name: 'Financial Conduct Authority', shortName: 'FCA', entityType: 'REGULATOR', description: 'UK financial services regulator overseeing digital asset regulation.', country: 'GB', region: 'Europe', headquarters: 'London' },
    { name: 'Monetary Authority of Singapore', shortName: 'MAS', entityType: 'REGULATOR', description: 'Singapore financial regulator and central bank, leading tokenization initiatives.', country: 'SG', region: 'Asia-Pacific', headquarters: 'Singapore' },
    { name: 'Hong Kong Securities and Futures Commission', shortName: 'HKSFC', entityType: 'REGULATOR', description: 'Hong Kong securities regulator developing virtual asset licensing frameworks.', country: 'HK', region: 'Asia-Pacific', headquarters: 'Hong Kong' },
    { name: 'European Securities and Markets Authority', shortName: 'ESMA', entityType: 'REGULATOR', description: 'EU-level securities markets regulator implementing MiCA framework.', country: 'EU', region: 'Europe', headquarters: 'Paris' },
    { name: 'Swiss Financial Market Supervisory Authority', shortName: 'FINMA', entityType: 'REGULATOR', description: 'Swiss financial regulator with advanced digital asset regulatory frameworks.', country: 'CH', region: 'Europe', headquarters: 'Bern' },
    { name: 'Financial Stability Board', shortName: 'FSB', entityType: 'REGULATOR', description: 'International body monitoring global financial system stability.', country: 'CH', region: 'Global', headquarters: 'Basel' },
    { name: 'Office of the Comptroller of the Currency', shortName: 'OCC', entityType: 'REGULATOR', description: 'US regulator for national banks and federal savings associations.', country: 'US', region: 'North America', headquarters: 'Washington, D.C.' },
    { name: 'Abu Dhabi Global Market', shortName: 'ADGM', entityType: 'REGULATOR', description: 'International financial center in Abu Dhabi with progressive digital asset regulation.', country: 'AE', region: 'Middle East', headquarters: 'Abu Dhabi' },
    // Banks (15)
    { name: 'JPMorgan Chase', shortName: 'JPM', entityType: 'BANK', description: 'Largest US bank by assets, operating Onyx digital asset platform and JPM Coin.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Goldman Sachs', shortName: 'GS', entityType: 'BANK', description: 'Global investment bank with active digital asset and tokenization initiatives.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'MUFG', entityType: 'BANK', description: 'Mitsubishi UFJ Financial Group, Japans largest bank, pioneering tokenized securities.', country: 'JP', region: 'Asia-Pacific', headquarters: 'Tokyo' },
    { name: 'HSBC', entityType: 'BANK', description: 'Global banking group deploying tokenized gold and digital asset custody services.', country: 'GB', region: 'Global', headquarters: 'London' },
    { name: 'UBS', entityType: 'BANK', description: 'Swiss global bank with significant tokenized bond issuance programs.', country: 'CH', region: 'Europe', headquarters: 'Zurich' },
    { name: 'Societe Generale', shortName: 'SocGen', entityType: 'BANK', description: 'French bank operating SG-FORGE digital asset subsidiary for tokenized bonds.', country: 'FR', region: 'Europe', headquarters: 'Paris' },
    { name: 'Deutsche Bank', entityType: 'BANK', description: 'German global bank developing digital custody and tokenization capabilities.', country: 'DE', region: 'Europe', headquarters: 'Frankfurt' },
    { name: 'Citigroup', shortName: 'Citi', entityType: 'BANK', description: 'US global bank with token services for trade finance and cash management.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Standard Chartered', entityType: 'BANK', description: 'International bank with digital asset custodian Zodia and tokenization ventures.', country: 'GB', region: 'Global', headquarters: 'London' },
    { name: 'DBS Bank', shortName: 'DBS', entityType: 'BANK', description: 'Southeast Asias largest bank operating a digital asset exchange.', country: 'SG', region: 'Asia-Pacific', headquarters: 'Singapore' },
    { name: 'BNY Mellon', entityType: 'CUSTODIAN', description: 'Worlds largest custodian bank, building digital asset custody infrastructure.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'State Street', entityType: 'CUSTODIAN', description: 'Major custodian bank developing digital asset services and tokenization.', country: 'US', region: 'North America', headquarters: 'Boston' },
    { name: 'Northern Trust', entityType: 'CUSTODIAN', description: 'Institutional custodian with digital asset custody and tokenized fund capabilities.', country: 'US', region: 'North America', headquarters: 'Chicago' },
    { name: 'BNP Paribas', entityType: 'BANK', description: 'French banking group with digital asset custody and tokenization services.', country: 'FR', region: 'Europe', headquarters: 'Paris' },
    { name: 'Nomura', entityType: 'BANK', description: 'Japanese bank operating Laser Digital subsidiary for institutional digital assets.', country: 'JP', region: 'Asia-Pacific', headquarters: 'Tokyo' },
    // Infrastructure (10)
    { name: 'DTCC', entityType: 'CLEARING_HOUSE', description: 'Depository Trust and Clearing Corporation, primary US post-trade infrastructure.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Euroclear', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'International central securities depository, settling over EUR 1T daily.', country: 'BE', region: 'Europe', headquarters: 'Brussels' },
    { name: 'Clearstream', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Deutsche Borse subsidiary providing post-trade services for digital and traditional assets.', country: 'LU', region: 'Europe', headquarters: 'Luxembourg' },
    { name: 'SIX Digital Exchange', shortName: 'SDX', entityType: 'EXCHANGE', description: 'Swiss stock exchange digital asset platform for tokenized securities issuance and trading.', country: 'CH', region: 'Europe', headquarters: 'Zurich' },
    { name: 'SWIFT', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Global financial messaging network connecting 11,000+ institutions.', country: 'BE', region: 'Global', headquarters: 'Brussels' },
    { name: 'CLS Group', shortName: 'CLS', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Multi-currency settlement system for FX transactions.', country: 'US', region: 'Global', headquarters: 'New York' },
    { name: 'Broadridge Financial Solutions', shortName: 'Broadridge', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Fintech providing post-trade processing and distributed ledger repo platform.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Fnality International', shortName: 'Fnality', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Consortium building wholesale digital payment systems backed by central bank money.', country: 'GB', region: 'Global', headquarters: 'London' },
    { name: 'Partior', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Blockchain-based cross-border clearing and settlement network backed by DBS, JPM, Temasek.', country: 'SG', region: 'Asia-Pacific', headquarters: 'Singapore' },
    { name: 'HQLAx', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Digital collateral registry enabling frictionless securities lending on DLT.', country: 'LU', region: 'Europe', headquarters: 'Luxembourg' },
    // Exchanges (10)
    { name: 'Nasdaq', entityType: 'EXCHANGE', description: 'Global exchange operator developing digital asset custody and tokenized marketplace services.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'London Stock Exchange Group', shortName: 'LSEG', entityType: 'EXCHANGE', description: 'Major exchange group exploring blockchain-based issuance and settlement.', country: 'GB', region: 'Europe', headquarters: 'London' },
    { name: 'CME Group', shortName: 'CME', entityType: 'EXCHANGE', description: 'Worlds largest derivatives exchange with crypto futures and options products.', country: 'US', region: 'North America', headquarters: 'Chicago' },
    { name: 'Deutsche Borse', entityType: 'EXCHANGE', description: 'German exchange group operating Clearstream and digital asset initiatives.', country: 'DE', region: 'Europe', headquarters: 'Frankfurt' },
    { name: 'Singapore Exchange', shortName: 'SGX', entityType: 'EXCHANGE', description: 'Singapore stock exchange developing tokenized fixed income capabilities.', country: 'SG', region: 'Asia-Pacific', headquarters: 'Singapore' },
    { name: 'Hong Kong Exchanges and Clearing', shortName: 'HKEX', entityType: 'EXCHANGE', description: 'Major Asian exchange exploring digital asset integration.', country: 'HK', region: 'Asia-Pacific', headquarters: 'Hong Kong' },
    { name: 'SIX Swiss Exchange', shortName: 'SIX', entityType: 'EXCHANGE', description: 'Swiss stock exchange with fully regulated digital asset exchange subsidiary SDX.', country: 'CH', region: 'Europe', headquarters: 'Zurich' },
    { name: 'Kraken', entityType: 'EXCHANGE', description: 'US crypto exchange expanding into tokenized equities and institutional services.', country: 'US', region: 'North America', headquarters: 'San Francisco' },
    { name: 'Coinbase', entityType: 'EXCHANGE', description: 'Publicly traded US crypto exchange and custodian building institutional infrastructure.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Binance', entityType: 'EXCHANGE', description: 'Global crypto exchange with tokenized stock trading and institutional services.', country: 'MT', region: 'Global', headquarters: 'Dubai' },
    // Asset Managers (10)
    { name: 'BlackRock', entityType: 'ASSET_MANAGER', description: 'Worlds largest asset manager with $10T+ AUM, tokenizing funds via BUIDL.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Fidelity Investments', shortName: 'Fidelity', entityType: 'ASSET_MANAGER', description: 'Major asset manager with institutional crypto custody and digital asset products.', country: 'US', region: 'North America', headquarters: 'Boston' },
    { name: 'Franklin Templeton', entityType: 'ASSET_MANAGER', description: 'Global asset manager tokenizing money market funds on public blockchains.', country: 'US', region: 'North America', headquarters: 'San Mateo' },
    { name: 'WisdomTree', entityType: 'ASSET_MANAGER', description: 'Asset manager issuing blockchain-native fund tokens.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Hamilton Lane', entityType: 'ASSET_MANAGER', description: 'Private markets firm tokenizing private equity fund access.', country: 'US', region: 'North America', headquarters: 'Philadelphia' },
    { name: 'KKR', entityType: 'ASSET_MANAGER', description: 'Global investment firm that tokenized a healthcare fund on Avalanche blockchain.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Apollo Global Management', shortName: 'Apollo', entityType: 'ASSET_MANAGER', description: 'Alternative asset manager exploring tokenized credit products.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Invesco', entityType: 'ASSET_MANAGER', description: 'Global asset manager developing digital asset investment products.', country: 'US', region: 'North America', headquarters: 'Atlanta' },
    { name: 'Schroders', entityType: 'ASSET_MANAGER', description: 'UK asset manager exploring tokenization of fund products.', country: 'GB', region: 'Europe', headquarters: 'London' },
    { name: 'Amundi', entityType: 'ASSET_MANAGER', description: 'Europes largest asset manager investigating tokenized fund distribution.', country: 'FR', region: 'Europe', headquarters: 'Paris' },
    // Tokenization Firms (10)
    { name: 'Securitize', entityType: 'TOKENIZATION_FIRM', description: 'SEC-registered transfer agent and tokenization platform powering BlackRock BUIDL.', country: 'US', region: 'North America', headquarters: 'Miami' },
    { name: 'Ondo Finance', shortName: 'Ondo', entityType: 'TOKENIZATION_FIRM', description: 'Tokenized real-world asset protocol providing on-chain US Treasuries access.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Centrifuge', entityType: 'TOKENIZATION_FIRM', description: 'Protocol for tokenizing real-world assets and connecting DeFi to traditional finance.', country: 'US', region: 'North America', headquarters: 'San Francisco' },
    { name: 'Maple Finance', shortName: 'Maple', entityType: 'TOKENIZATION_FIRM', description: 'Institutional lending protocol for on-chain credit markets.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Tokeny Solutions', shortName: 'Tokeny', entityType: 'TOKENIZATION_FIRM', description: 'Luxembourg-based tokenization infrastructure for compliant digital securities.', country: 'LU', region: 'Europe', headquarters: 'Luxembourg' },
    { name: 'Fireblocks', entityType: 'INFRASTRUCTURE_PROVIDER', description: 'Digital asset custody and transfer platform serving 1,800+ institutions.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Anchorage Digital', shortName: 'Anchorage', entityType: 'CUSTODIAN', description: 'Federally chartered digital asset bank providing institutional custody.', country: 'US', region: 'North America', headquarters: 'San Francisco' },
    { name: 'Copper Technologies', shortName: 'Copper', entityType: 'CUSTODIAN', description: 'Digital asset custody and prime brokerage for institutional investors.', country: 'GB', region: 'Europe', headquarters: 'London' },
    { name: 'Circle', entityType: 'PAYMENT_PROVIDER', description: 'USDC stablecoin issuer and payments infrastructure company.', country: 'US', region: 'North America', headquarters: 'Boston' },
    { name: 'Tether', entityType: 'PAYMENT_PROVIDER', description: 'Issuer of USDT, the largest stablecoin by market capitalization.', country: 'VG', region: 'Global', headquarters: 'British Virgin Islands' },
    // Chains / Protocols (5)
    { name: 'Ethereum Foundation', shortName: 'Ethereum', entityType: 'PROTOCOL', description: 'Primary smart contract platform hosting majority of tokenized asset infrastructure.', country: 'CH', region: 'Global', headquarters: 'Zug' },
    { name: 'Polygon Labs', shortName: 'Polygon', entityType: 'PROTOCOL', description: 'Ethereum scaling solution widely adopted for institutional tokenization projects.', country: 'US', region: 'Global', headquarters: 'New York' },
    { name: 'Avalanche', entityType: 'PROTOCOL', description: 'Layer-1 blockchain with subnet architecture used for institutional tokenization.', country: 'US', region: 'North America', headquarters: 'New York' },
    { name: 'Stellar Development Foundation', shortName: 'Stellar', entityType: 'PROTOCOL', description: 'Blockchain network focused on payments and tokenized asset settlement.', country: 'US', region: 'North America', headquarters: 'San Francisco' },
    { name: 'Canton Network', shortName: 'Canton', entityType: 'PROTOCOL', description: 'Privacy-enabled blockchain for institutional financial applications backed by Digital Asset.', country: 'US', region: 'North America', headquarters: 'New York' },
  ];

  const entities: Record<string, string> = {};
  for (const e of entitiesData) {
    const created = await prisma.entity.upsert({
      where: { slug: slug(e.name) },
      update: {},
      create: {
        name: e.name,
        slug: slug(e.name),
        shortName: e.shortName,
        entityType: e.entityType as any,
        description: e.description,
        country: e.country,
        region: e.region,
        website: e.website,
        headquarters: e.headquarters,
        isActive: true,
      },
    });
    entities[e.name] = created.id;
  }

  // ─── TAGS (30) ───────────────────────────────────────
  console.log('  Creating 30 tags...');
  const tagNames = [
    'tokenization', 'settlement', 'custody', 'regulation', 'CBDC',
    'stablecoin', 'DeFi', 'securities', 'bonds', 'equities',
    'real-estate', 'treasuries', 'compliance', 'AML', 'KYC',
    'cross-border', 'payment-rails', 'institutional', 'retail',
    'blockchain', 'Ethereum', 'smart-contracts', 'interoperability',
    'liquidity', 'derivatives', 'funds', 'private-markets',
    'central-bank', 'policy', 'infrastructure',
  ];

  const tags: Record<string, string> = {};
  for (const name of tagNames) {
    const created = await prisma.tag.upsert({
      where: { slug: name },
      update: {},
      create: { name: name.replace(/-/g, ' '), slug: name },
    });
    tags[name] = created.id;
  }

  // ─── ARTICLES (50) + SIGNALS ─────────────────────────
  console.log('  Creating 50 articles with signals...');

  const articlesData: Array<{
    title: string;
    headline: string;
    summary: string;
    content: string;
    whatHappened?: string;
    whyItMatters?: string;
    marketImplications?: string;
    infraImplications?: string;
    regulatoryImplications?: string;
    dek?: string;
    type: string;
    assetClass?: string;
    source: string;
    importance: number;
    confidence?: number;
    daysAgo: number;
    topicNames: string[];
    entityNames: string[];
    tagSlugs: string[];
    signal: number[];
    eventFamily?: string;
  }> = [
    // ═══════════════════════════════════════════════════════════
    // 1. KRAKEN / FED — BREAKING NEWS (Hero story)
    // ═══════════════════════════════════════════════════════════
    {
      title: 'Kraken Financial Wins Limited-Purpose Federal Reserve Account in First for Crypto',
      headline: 'Kraken Financial approved for limited-purpose Federal Reserve account by Kansas City Fed — first digital-asset bank to secure direct payment-system access',
      dek: 'Kraken\'s Wyoming-chartered banking arm has been approved for a limited-purpose account at the Federal Reserve Bank of Kansas City, giving the firm direct access to core U.S. payment infrastructure under restrictions and an initial one-year term.',
      summary: 'Kraken Financial, Kraken\'s Wyoming-chartered banking arm, has been approved for a limited-purpose Federal Reserve account by the Kansas City Fed, according to Reuters, Bloomberg, and company statements. The approval gives the firm direct access to core U.S. payment infrastructure, making it the first digital-asset bank to achieve this milestone. The arrangement is restricted and initially limited to one year.',
      content: 'On March 4, 2026, Kraken Financial — the Wyoming-chartered banking subsidiary of cryptocurrency exchange Kraken — was approved for a limited-purpose account at the Federal Reserve Bank of Kansas City, making it the first digital-asset bank to gain this form of direct access to U.S. central-bank payment infrastructure.\n\nThe limited-purpose master account gives Kraken Financial direct access to Fedwire, the real-time gross settlement system used by banks to transfer funds. Previously, crypto exchanges relied on intermediary banking relationships — often fragile arrangements that could be severed at short notice, as the industry learned during the 2023 banking crisis that shuttered Silvergate and Signature Bank.\n\nKraken Financial is a Wyoming-chartered special purpose depository institution (SPDI) that received its state trust charter in 2020. The Federal Reserve had been deliberating on the application for over two years, with the decision closely watched across both crypto and traditional banking. Multiple sources describe the arrangement as restricted and initially limited to one year.\n\nKraken CEO Dave Ripley said in a company blog post: "Kraken becomes first digital asset bank to receive a Federal Reserve master account." The company framed the approval as removing structural dependency on intermediary banking relationships.\n\nThe implications are significant but bounded by the account\'s limited-purpose designation. With this access, Kraken Financial can:\n\n• Settle USD transactions through Fedwire without routing through correspondent banks\n• Hold reserves directly at the Federal Reserve\n• Access core Federal Reserve payment rails under the terms of the limited-purpose arrangement\n\nThe decision has drawn immediate reaction from the banking lobby. The Bank Policy Institute (BPI) and Independent Community Bankers of America (ICBA) both published statements criticizing the move, expressing concern about extending Fed payment access to digital-asset institutions. Reuters reports that traditional banking trade groups have objected to the approval.\n\nFor the broader crypto industry, the account addresses what executives have long described as the "debanking" problem — the challenge where regulators criticize exchanges for inadequate banking relationships, while banks face supervisory pressure not to serve crypto firms. Other crypto companies are known to have master account applications pending.\n\nKraken is privately held. Reuters reports the company was valued at roughly $20 billion in its most recent funding round.',
      whatHappened: 'On March 4, 2026, the Federal Reserve Bank of Kansas City approved Kraken Financial — a Wyoming-chartered special purpose depository institution and subsidiary of Kraken — for a limited-purpose master account, giving the firm direct access to Fedwire and the ability to hold reserves at the Fed. The arrangement is described as restricted and initially limited to one year. Kraken Financial is the first digital-asset bank to secure this form of direct Fed payment-system access.',
      whyItMatters: 'A Federal Reserve master account is the foundational piece of infrastructure connecting any financial institution to the US payment system. Without one, crypto exchanges must route all dollar transactions through intermediary banks — relationships that proved dangerously fragile during the 2023 banking crisis. Kraken Financial\'s limited-purpose access removes this structural dependency and sets a precedent for other crypto-native firms chartered as state trust companies. The approval is restricted and time-limited, so it does not represent full parity with traditional bank access, but it establishes that digital-asset institutions can meet Federal Reserve standards for account eligibility.',
      marketImplications: 'Direct Fed access could reduce Kraken\'s operating costs for fiat settlement and removes counterparty risk from intermediary banking. This competitive advantage is expected to pressure other exchanges to pursue similar arrangements or risk losing institutional clients who prioritize settlement reliability. Kraken is privately held (valued at roughly $20 billion in its last funding round according to Reuters), so there is no publicly traded equity to reflect the market reaction. Other crypto firms have pending master account applications, and the Kansas City Fed\'s decision may influence how those are reviewed.',
      infraImplications: 'Kraken Financial can now settle customer transactions through Fedwire under the terms of its limited-purpose account. Reuters mentions direct access to core payment systems like Fedwire, though the exact scope of additional payment rail access (such as FedNow) under the limited-purpose designation has not been independently confirmed. The arrangement does not represent full infrastructure parity with traditional banks, but it removes the most critical intermediary dependency for fiat settlement.',
      regulatoryImplications: 'The decision establishes that crypto-native entities chartered as state trust companies can qualify for limited-purpose Federal Reserve accounts. The Bank Policy Institute and Independent Community Bankers of America have both published criticism, arguing the move extends Fed access to insufficiently supervised entities. The one-year initial term suggests ongoing supervisory review. The precedent may also influence pending applications from other crypto firms seeking similar access.',
      type: 'DEEP_DIVE',
      assetClass: 'TOKENIZED_EQUITIES',
      source: 'Reuters',
      importance: 9.8,
      confidence: 92,
      daysAgo: 0,
      topicNames: ['Exchange Infrastructure', 'Securities Regulation', 'Payment Infrastructure'],
      entityNames: ['Kraken', 'Federal Reserve System', 'Coinbase', 'Circle', 'JPMorgan Chase'],
      tagSlugs: ['institutional', 'regulation', 'payment-rails', 'infrastructure', 'policy'],
      signal: [9.5, 9.0, 9.5, 9.5, 9.0, 8.0, 7.5, 8.5, 9.5],
      eventFamily: 'kraken-crypto-banking',
    },
    // ═══════════════════════════════════════════════════════════
    // 2. BLACKROCK BUIDL $2B — Full rewrite
    // ═══════════════════════════════════════════════════════════
    {
      title: 'BlackRock BUIDL Fund Surpasses $2 Billion in Tokenized Treasury Assets',
      headline: 'BlackRock BUIDL crosses $2B — tokenized fund market enters institutional scale',
      dek: 'The largest tokenized fund product globally now manages more than some traditional Treasury ETFs launched in the past decade.',
      summary: 'BlackRock\'s BUIDL tokenized money market fund has crossed $2 billion in assets under management, establishing it as the dominant tokenized fund product in global capital markets. The milestone validates two years of institutional tokenization infrastructure built with Securitize on Ethereum.',
      content: 'BlackRock\'s BUIDL fund — the BlackRock USD Institutional Digital Liquidity Fund — has surpassed $2 billion in tokenized assets under management, a milestone that marks the transition of tokenized finance from proof-of-concept to institutional reality.\n\nThe fund, launched in March 2024 on Ethereum through a partnership with Securitize as transfer agent, allows qualified institutional investors to hold tokenized shares representing ownership in a portfolio of US Treasury bills, overnight repurchase agreements, and cash. Each BUIDL token is redeemable at $1.00 face value and pays daily accrued yield directly to holders\' wallets.\n\nThe growth trajectory has been remarkable. BUIDL reached $500 million within its first six months, $1 billion by December 2024, and has now doubled again. Over 80 institutional investors hold BUIDL tokens, including pension funds, endowments, crypto-native treasuries, and at least two sovereign wealth funds.\n\n"We are seeing institutional allocators treat BUIDL as a genuine cash management instrument, not a crypto experiment," said Robert Mitchnick, BlackRock\'s Head of Digital Assets. "The question from clients has shifted from \'why should we tokenize\' to \'what else can we tokenize.\'"\n\nThe fund\'s success has triggered a wave of competitive responses. Franklin Templeton\'s FOBXX fund on Stellar and Polygon holds $650 million. Fidelity launched its own tokenized Treasury vehicle in January 2026, accumulating $180 million in eight weeks. WisdomTree, Invesco, and Amundi have all filed for tokenized fund products with the SEC.\n\nBUILD\'s architecture has become a template. The fund uses Ethereum as its settlement layer with Securitize handling KYC/AML, investor onboarding, and transfer agent record-keeping. Circle\'s USDC serves as the primary on/off ramp. BNY Mellon provides fund administration, and PwC serves as auditor.\n\nCritics note that at $2 billion, BUIDL remains small relative to BlackRock\'s $10.5 trillion in total AUM. But proponents argue the significance is structural: BUIDL demonstrates that tokenized instruments can operate within existing regulatory frameworks, interact with DeFi protocols (it is composable with Aave and Compound), and settle instantly rather than on T+1 cycles.\n\nThe tokenized fund market globally now exceeds $5 billion, according to RWA.xyz, with BlackRock commanding roughly 40% market share.',
      whatHappened: 'BlackRock\'s BUIDL tokenized money market fund crossed $2 billion in AUM, doubling from $1 billion in December 2024. The fund holds US Treasury bills and repos tokenized on Ethereum, with Securitize as transfer agent. Over 80 institutional investors now hold BUIDL tokens, including pension funds and at least two sovereign wealth funds.',
      whyItMatters: 'BUIDL at $2 billion validates that tokenized instruments can attract serious institutional capital — not as a novelty, but as a genuine cash management tool. The fund\'s success has triggered competitive entries from Franklin Templeton, Fidelity, WisdomTree, and others, establishing tokenized Treasuries as a confirmed asset class. The total tokenized fund market now exceeds $5 billion.',
      marketImplications: 'BlackRock commands roughly 40% of the tokenized fund market. The competitive pressure is accelerating product launches: Fidelity\'s tokenized Treasury fund raised $180M in its first eight weeks. Expect at least four more major asset managers to launch tokenized products by year-end 2026. The convergence of DeFi composability (BUIDL interacts with Aave, Compound) with institutional-grade custody creates a new asset distribution paradigm.',
      infraImplications: 'BUIDL\'s architecture — Ethereum settlement, Securitize transfer agent, USDC on/off ramp, BNY Mellon administration — has become the template for institutional tokenization. This standardization reduces integration costs for subsequent launches and establishes a de facto technology stack for the industry.',
      type: 'DEEP_DIVE',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Bloomberg',
      importance: 9.2,
      confidence: 95,
      daysAgo: 1,
      topicNames: ['Tokenized Funds', 'Tokenized Treasuries'],
      entityNames: ['BlackRock', 'Securitize', 'Ethereum Foundation', 'BNY Mellon', 'Circle'],
      tagSlugs: ['tokenization', 'funds', 'treasuries', 'institutional'],
      signal: [8.5, 7.0, 9.0, 8.0, 7.5, 6.0, 5.0, 8.5, 9.0],
      eventFamily: 'tokenized-treasury-funds',
    },
    // ═══════════════════════════════════════════════════════════
    // 3. SEC FRAMEWORK — Full rewrite
    // ═══════════════════════════════════════════════════════════
    {
      title: 'SEC Expected to Release Comprehensive Framework for Tokenized Securities',
      headline: 'SEC reportedly finalizing guidance on tokenized securities — draft framework said to address registration, custody, and transfer agent rules',
      dek: 'The anticipated framework would resolve years of regulatory ambiguity, establishing that tokenized instruments are subject to existing securities law with specific accommodations for blockchain-based settlement.',
      summary: 'The SEC is expected to release a comprehensive framework establishing how tokenized financial instruments will be classified, registered, and custodied under federal securities law. Sources indicate the guidance is in advanced drafting and would address obligations of issuers, transfer agents, broker-dealers, and custodians handling blockchain-based securities.',
      content: 'The SEC under Chairman Paul Atkins is widely expected to issue comprehensive guidance addressing the regulatory treatment of tokenized securities under existing federal securities law. Multiple industry sources and regulatory observers indicate that SEC staff are in advanced stages of drafting a framework that would clarify obligations for issuers, transfer agents, broker-dealers, and custodians handling blockchain-based securities.\n\nChairman Atkins, who took office in 2025 with a stated commitment to regulatory clarity for digital assets, has publicly called tokenization one of the most promising developments in capital markets. The SEC\'s Crypto Task Force, established in early 2025, has been engaging with market participants on key questions: whether tokenized representations of existing securities alter their legal classification, what standards transfer agents must meet when maintaining blockchain-based registries, and how qualified custody requirements apply to digital asset securities.\n\nIndustry participants expect the guidance to address several core issues:\n\n• Confirmation that tokenized instruments remain securities under the Securities Act of 1933 and Securities Exchange Act of 1934, regardless of the technology used for issuance and settlement\n• Standards for transfer agents maintaining blockchain records as official share registries\n• Qualified custody requirements for institutions holding tokenized securities\n• A principle of technological neutrality that does not favor or disfavor particular blockchain platforms\n\nThe anticipated guidance has drawn significant attention from major financial institutions with active or planned tokenization programs. DTCC, Goldman Sachs, BNY Mellon, and Securitize are among the firms that have engaged with the SEC\'s Crypto Task Force on these issues. Industry groups including SIFMA have described the expected framework as one of the most important regulatory developments for institutional tokenization.\n\nThe timeline for publication remains uncertain. Sources indicate the guidance could take the form of Staff Guidance rather than formal rulemaking, which would allow faster issuance but would not carry the same legal weight as a formal SEC rule. No official publication date has been announced.',
      whatHappened: 'The SEC under Chairman Paul Atkins is expected to publish comprehensive guidance addressing the regulatory treatment of tokenized securities. SEC staff are reportedly in advanced stages of drafting a framework that would clarify obligations for issuers, transfer agents, broker-dealers, and custodians. The SEC\'s Crypto Task Force has been engaging with industry participants on key questions. No publication date has been confirmed.',
      whyItMatters: 'Regulatory ambiguity has been the single biggest constraint on institutional tokenization. Major financial institutions have delayed launching tokenized products pending clear SEC guidance on registration, custody, and transfer agent requirements. A comprehensive framework would remove this uncertainty and potentially trigger a wave of institutional tokenization activity. The expected guidance is also significant for its likely stance on technological neutrality — whether public blockchains can be used for regulated securities alongside permissioned systems.',
      marketImplications: 'Major institutions including Goldman Sachs, BNY Mellon, and DTCC have tokenization programs that are partially or fully paused pending regulatory clarity. Publication of comprehensive guidance is expected to accelerate product launches across the industry. The effect on tokenization platform providers like Securitize could be significant, as institutional demand for their services would increase substantially with regulatory certainty. Cross-border implications are also being evaluated — how such guidance interacts with the EU\'s MiCA framework will be closely watched.',
      regulatoryImplications: 'The anticipated framework would set a global benchmark for how securities regulators treat tokenized instruments. Other jurisdictions — particularly the EU, UK, and Singapore — are watching the SEC\'s approach closely. A key question is whether the guidance will treat blockchain records as legally equivalent to traditional book-entry systems, which would eliminate the dual record-keeping burden that has made many tokenization projects uneconomical. The form of the guidance (Staff Guidance vs. formal rulemaking) will also determine its legal durability.',
      type: 'REGULATOR_TRACKER',
      source: 'Reuters',
      importance: 9.5,
      confidence: 45,
      daysAgo: 2,
      topicNames: ['Securities Regulation', 'Tokenized Equities'],
      entityNames: ['US Securities and Exchange Commission', 'DTCC', 'Goldman Sachs', 'Securitize', 'BNY Mellon'],
      tagSlugs: ['regulation', 'securities', 'compliance', 'tokenization', 'policy'],
      signal: [9.5, 9.5, 8.0, 8.5, 9.0, 8.0, 7.0, 6.5, 9.5],
      eventFamily: 'sec-tokenized-framework',
    },
    {
      title: 'DTCC Advances Digital Settlement Pilot — T+0 Testing Underway for Tokenized Securities',
      headline: 'DTCC reports progress on T+0 settlement testing — tokenized securities pilot expanding to additional participants',
      dek: 'The pilot with JPMorgan, Citigroup, and BNY Mellon is testing same-day settlement capabilities, with a production launch targeted for Q4 2026.',
      summary: 'The Depository Trust and Clearing Corporation is advancing its Project Ion digital settlement platform through expanded testing of same-day (T+0) settlement for tokenized securities. The current phase reportedly involves major financial institutions including JPMorgan Chase, Citigroup, and BNY Mellon. DTCC has indicated aspirations for production-grade capabilities, though no confirmed production launch date has been publicly announced.',
      content: 'The Depository Trust and Clearing Corporation is advancing its Project Ion digital settlement platform toward expanded testing of same-day (T+0) settlement for tokenized securities, building on prior phases that demonstrated the technical feasibility of blockchain-based clearing and settlement.\n\nDTCC has publicly disclosed that Project Ion, which operates on a permissioned blockchain, is designed to enable T+0 settlement for tokenized equity and fixed income instruments. The platform has been in development since 2022, with earlier testing phases demonstrating successful settlement of tokenized securities in controlled environments.\n\nThe current phase is reported to involve expanded testing with major financial institutions including JPMorgan Chase, Citigroup, and BNY Mellon. Industry sources indicate the pilot is processing both simulated and live tokenized security transfers, testing scenarios including equity settlement, fixed income delivery-versus-payment, and multi-party netting.\n\nThe technology stack uses DTCC\'s Ion platform with a permissioned blockchain overlay. Unlike public chain tokenization (used by BlackRock\'s BUIDL), DTCC\'s approach operates within the existing regulatory and operational framework, using the same participant identifiers and message formats familiar to member firms. This design choice reduces integration costs and positions the platform as a natural extension of existing infrastructure.\n\nThe potential cost implications are significant. Industry analyses suggest that T+0 settlement could meaningfully reduce capital requirements for settlement risk margins across the industry. For individual firms, fewer failed trades and lower associated penalties could generate substantial savings.\n\nDTCC has indicated aspirations for a production-capable system, though no confirmed production launch date has been publicly announced. The broader industry context matters: the May 2024 shift from T+2 to T+1 for traditional securities demonstrated that settlement cycle compression is operationally feasible. Some market participants see tokenized T+0 as the logical next step, while others caution that same-day settlement must be weighed against the operational complexity of funding trades in real-time.',
      whatHappened: 'DTCC is advancing its Project Ion digital settlement platform through expanded testing with major financial institutions. The platform is designed to enable T+0 (same-day) settlement for tokenized securities, building on prior phases that demonstrated technical feasibility. Current testing reportedly involves JPMorgan Chase, Citigroup, and BNY Mellon across tokenized equity and fixed income scenarios. No production launch date has been confirmed.',
      whyItMatters: 'If DTCC successfully delivers production-grade T+0 settlement, it would represent the most significant change to US securities settlement infrastructure since the move from T+2 to T+1 in May 2024. Faster settlement reduces counterparty risk, lowers capital requirements for settlement risk margins, and could reduce the cost and frequency of failed trades. DTCC\'s position as the dominant US clearing and settlement infrastructure provider means its adoption of tokenized settlement would carry industry-wide implications.',
      marketImplications: 'Production T+0 settlement, if realized, would create a compelling case for issuers to tokenize securities — particularly in fixed income, where settlement risk and associated capital charges are most significant. DTCC\'s approach — integrating with existing message formats and participant identifiers — is designed to minimize disruption to member firms. The timeline for production readiness remains an open question that the industry is watching closely.',
      infraImplications: 'DTCC\'s Ion platform uses a permissioned blockchain with existing message formats and participant identifiers, positioning it as the institutional-grade option for tokenized settlement. This approach contrasts with public-chain tokenization (BlackRock/Securitize) and represents DTCC\'s strategy for maintaining its central infrastructure role as the industry moves toward blockchain-based settlement. Competitive dynamics with newer entrants like Fnality and Partior are relevant context.',
      type: 'INFRA_ANALYSIS',
      source: 'Bloomberg',
      importance: 9.0,
      confidence: 55,
      daysAgo: 3,
      topicNames: ['Digital Settlement', 'Exchange Infrastructure'],
      entityNames: ['DTCC', 'JPMorgan Chase', 'Citigroup', 'BNY Mellon'],
      tagSlugs: ['settlement', 'infrastructure', 'institutional', 'tokenization'],
      signal: [7.5, 9.0, 9.5, 9.5, 7.0, 6.0, 8.5, 5.0, 8.0],
      eventFamily: 'digital-settlement-infra',
    },
    // ═══════════════════════════════════════════════════════════
    // 4. ECB DIGITAL EURO — Full rewrite
    // ═══════════════════════════════════════════════════════════
    {
      title: 'European Central Bank Advances Digital Euro Preparation Phase',
      headline: 'ECB advances digital euro development — vendors selected to prototype infrastructure components',
      dek: 'The preparation phase continues with no formal decision to issue expected before late 2027. Technology procurement is underway but does not constitute a commitment to launch.',
      summary: 'The European Central Bank is progressing through the preparation phase of its digital euro project, having selected technology vendors to prototype core infrastructure components. The preparation phase does not constitute a decision to issue a retail CBDC — a formal go/no-go decision is not expected before late 2027.',
      content: 'The European Central Bank is progressing through the "preparation phase" of its digital euro project — the second major stage of development, following the two-year investigation phase that concluded in late 2023.\n\nThe ECB has selected technology vendors through a competitive procurement process to prototype infrastructure components. Contracted providers include Amazon Web Services, Nexi, Worldline, CaixaBank, and EPI (European Payments Initiative). The ECB has emphasized that these contracts cover prototyping and testing, and that vendor selection does not constitute a decision to issue a digital euro.\n\nThe preparation phase is expected to run through 2027, after which the ECB governing council would make a formal decision on whether to proceed with issuance. If approved, a launch could follow — but no specific timeline has been publicly committed to.\n\nThe digital euro, as currently designed, would be a liability of the ECB — meaning it carries zero credit risk, unlike commercial bank deposits or stablecoins. Design parameters under discussion include:\n\n• A holding limit (the level remains under debate, with €3,000 frequently cited)\n• Offline payment capability for privacy-preserving small transactions\n• Programmable payment functionality for B2B use cases\n• Interoperability with existing SEPA payment infrastructure\n\nThe project continues to face opposition from European commercial banks concerned about deposit outflows. Industry groups have argued that even modest holding limits could redirect significant deposits from the banking system.\n\nThe geopolitical dimension is increasingly prominent. ECB officials have framed the digital euro as a matter of European monetary sovereignty, noting the growing role of US dollar stablecoins in European cross-border payments. "Europe needs to ensure it is not dependent on foreign commercial payment solutions for its domestic transactions," ECB President Christine Lagarde has stated.\n\nThe Bank of England and Bank of Japan are maintaining their own CBDC research programs and are monitoring the ECB\'s progress closely.',
      whatHappened: 'The ECB is progressing through the preparation phase of digital euro development, having selected technology vendors (including AWS, Nexi, Worldline, CaixaBank, EPI) through competitive procurement to prototype infrastructure components. The phase runs through 2027, after which a formal go/no-go decision is expected. Vendor selection does not constitute a decision to issue.',
      whyItMatters: 'If issued, the digital euro would be the first retail CBDC from a major Western central bank, potentially serving eurozone citizens across 20 nations. The project addresses growing concern about European monetary sovereignty as US dollar stablecoins expand their role in European payments. The design and governance choices made during the preparation phase will shape how other advanced economies approach retail digital currency.',
      marketImplications: 'European commercial banks are concerned about potential deposit outflows, though the scale depends on the final holding limit still under negotiation. A programmable digital euro could create a native settlement currency for eurozone tokenized asset markets. The impact on the European payments industry will depend on fee structures and merchant acceptance rules that remain unresolved.',
      regulatoryImplications: 'The digital euro regulation proposed by the European Commission is still being finalized. Key outstanding issues include the precise holding limit, merchant acceptance mandates, and how the digital euro interacts with MiCA-regulated stablecoins. Legal tender status remains under legislative debate.',
      type: 'BRIEF',
      assetClass: 'CBDC',
      source: 'European Central Bank',
      importance: 8.8,
      confidence: 90,
      daysAgo: 3,
      topicNames: ['Central Bank Digital Currencies', 'Payment Infrastructure'],
      entityNames: ['European Central Bank'],
      tagSlugs: ['CBDC', 'central-bank', 'payment-rails', 'policy'],
      signal: [9.0, 8.5, 7.0, 8.0, 8.0, 8.5, 7.0, 5.5, 7.0],
    },
    // ═══════════════════════════════════════════════════════════
    // 5. US STABLECOIN ACT — New major article
    // ═══════════════════════════════════════════════════════════
    {
      title: 'US Senate Stablecoin Regulation Bill Advances Through Committee With Bipartisan Support',
      headline: 'Stablecoin regulation bill clears committee with bipartisan support — full Senate vote expected',
      dek: 'The legislation would establish federal licensing for stablecoin issuers, mandate 1:1 reserve backing with Treasury securities, and create a pathway for bank and non-bank issuers alike.',
      summary: 'The Payment Stablecoin Act has advanced through the Senate Banking Committee with bipartisan support, moving closer to establishing the first comprehensive federal regulatory framework for stablecoin issuers. The bill would mandate 1:1 reserve backing with US Treasury securities or insured deposits and create federal licensing requirements for issuers above $10 billion in circulation. A full Senate vote is expected in coming weeks.',
      content: 'Stablecoin regulation legislation has advanced through the Senate Banking Committee with bipartisan support, marking the most significant legislative progress to date toward establishing a federal regulatory framework for stablecoin issuers in the United States.\n\nThe bill — commonly referred to as the GENIUS Act (Guiding and Establishing National Innovation for US Stablecoins Act) — would establish the first comprehensive federal framework for stablecoin regulation. Key provisions under discussion include:\n\n• Federal oversight requirements for stablecoin issuers above a specified circulation threshold\n• Reserve backing requirements intended to ensure stablecoins are fully backed by high-quality liquid assets such as US Treasuries or insured deposits\n• Regular reserve attestation requirements by registered accounting firms\n• Consumer protection provisions including redemption rights\n• Preservation of state-level regulatory authority for smaller issuers\n\nThe legislation has attracted bipartisan support, reflecting an unusual political alignment: Republicans broadly view stablecoin regulation as reinforcing US dollar dominance in digital payments, while Democrats support the consumer protection and regulatory oversight provisions. Senator Cynthia Lummis (R-WY) has been a prominent advocate for the legislation.\n\nThe implications are most significant for large stablecoin issuers. Circle (USDC), which has emphasized regulatory compliance in its operations, is generally viewed as well-positioned under the proposed framework. Tether (USDT), the largest stablecoin issuer by circulation, faces questions about whether its reserve composition and audit practices would meet the bill\'s requirements.\n\nTraditional banks have shown growing interest in stablecoin issuance pending regulatory clarity. Several major banks are reported to be evaluating stablecoin products that they would launch once a federal framework is enacted.\n\nThe bill must still pass the full Senate and be reconciled with any House legislation before reaching the President\'s desk. The timeline for a floor vote remains subject to Senate scheduling and potential amendments. Industry observers expect additional debate on specific thresholds, the scope of federal versus state authority, and how the framework interacts with existing banking regulation.\n\nIf enacted, the legislation would give the Federal Reserve and other banking regulators implementing authority to develop detailed rules, a process that typically takes 12-18 months after a bill becomes law.',
      whatHappened: 'Stablecoin regulation legislation, known as the GENIUS Act, has advanced through the Senate Banking Committee with bipartisan support. The bill would establish the first federal regulatory framework for stablecoin issuers, including reserve backing requirements, federal oversight for large issuers, and consumer protection provisions. A full Senate floor vote has not yet been scheduled.',
      whyItMatters: 'This would be the first major federal legislation specifically addressing digital assets in the United States. By creating clear licensing and reserve requirements, the framework would legitimize stablecoins as a regulated payment instrument and extend US regulatory oversight to the broader stablecoin market. The mandatory reserve backing requirements strengthen the link between stablecoins and US government securities, which proponents argue reinforces dollar dominance in digital payments.',
      marketImplications: 'Circle and Paxos are generally viewed as well-positioned under the proposed requirements given their existing compliance practices. Tether faces questions about whether its reserve composition and audit practices would meet the bill\'s standards. If enacted, the regulatory clarity could attract new institutional entrants to stablecoin issuance, including traditional banks. The timeline for enactment remains uncertain pending Senate floor action and House reconciliation.',
      regulatoryImplications: 'The bill would create a dual federal/state framework similar to banking regulation — federal oversight for larger issuers, state authority preserved for smaller ones. Implementation would require the Federal Reserve and other banking regulators to develop detailed rules, a process that typically takes 12-18 months. Internationally, the legislation would establish one of two emerging global standards for stablecoin regulation alongside the EU\'s MiCA framework.',
      type: 'REGULATOR_TRACKER',
      assetClass: 'STABLECOINS',
      source: 'Bloomberg',
      importance: 9.6,
      confidence: 52,
      daysAgo: 1,
      topicNames: ['Stablecoin Policy', 'Securities Regulation', 'Payment Infrastructure'],
      entityNames: ['Circle', 'JPMorgan Chase', 'Federal Reserve System', 'Office of the Comptroller of the Currency'],
      tagSlugs: ['stablecoin', 'regulation', 'policy', 'payment-rails', 'compliance'],
      signal: [9.0, 9.5, 9.0, 7.5, 8.0, 9.0, 8.5, 8.0, 9.5],
      eventFamily: 'us-stablecoin-legislation',
    },
    // ═══════════════════════════════════════════════════════════
    // 6. BITCOIN STRATEGIC RESERVE — New major article
    // ═══════════════════════════════════════════════════════════
    {
      title: 'Reports Indicate US Treasury Evaluating Bitcoin Acquisition for Proposed Strategic Reserve',
      headline: 'US Treasury reportedly evaluating Bitcoin acquisition plan for Strategic Reserve — implementation timeline uncertain',
      dek: 'The Strategic Bitcoin Reserve, authorized by executive order in 2025, faces ongoing implementation questions as the Treasury evaluates acquisition strategies.',
      summary: 'Sources indicate the US Treasury Department is evaluating acquisition strategies for the Strategic Bitcoin Reserve authorized by executive order. While the executive order directs the Treasury to establish a Bitcoin reserve, the timeline, size, and execution method for any purchases remain under deliberation. No confirmed acquisitions have been publicly announced.',
      content: 'President Trump signed Executive Order 14128 in March 2025 establishing a Strategic Bitcoin Reserve, directing the US Treasury Department to develop a framework for holding Bitcoin as a strategic reserve asset. The implementation of this directive — including the scale, timeline, and method of any acquisitions — remains under active development.\n\nThe executive order authorized the Treasury to establish a Bitcoin reserve and evaluate acquisition strategies. Initial reporting indicated that the reserve would begin with Bitcoin already held by the federal government through law enforcement seizures and forfeitures. The government holds a significant quantity of Bitcoin from various enforcement actions, though the precise amount available for transfer to a formal reserve has not been publicly confirmed.\n\nWhether and when the Treasury would pursue open-market purchases beyond seized assets is a subject of ongoing deliberation. Treasury Secretary Scott Bessent has spoken publicly about the strategic rationale for the reserve, framing it in the context of maintaining US strategic optionality in the evolving global monetary landscape. However, no confirmed open-market Bitcoin acquisition by the Treasury has been publicly announced as of early March 2026.\n\nThe reserve concept has attracted both support and criticism. Proponents argue that early positioning in Bitcoin — which has a fixed 21 million supply cap — represents strategic foresight analogous to historical sovereign gold accumulation. Critics, including some former senior Treasury officials, have questioned whether public funds should be used to acquire a volatile digital asset.\n\nAt the state level, several US states have introduced or passed legislation establishing their own Bitcoin reserve programs. El Salvador, which began accumulating Bitcoin in 2021, continues to hold a significant national position. The international dimension is notable: if the US proceeds with meaningful Bitcoin accumulation, it could trigger similar reserve considerations by other sovereigns.\n\nThe key open questions are: what acquisition strategy the Treasury will ultimately adopt, whether Congress will appropriate funds for open-market purchases beyond seized assets, and what custody and security arrangements will govern the reserve. These implementation details remain unresolved.',
      whatHappened: 'Executive Order 14128, signed in March 2025, authorized the US Treasury to establish a Strategic Bitcoin Reserve. The directive instructed the Treasury to develop an acquisition framework, with initial discussion focusing on Bitcoin already held by the federal government through law enforcement seizures. Whether and when open-market purchases would occur remains under deliberation. No confirmed acquisitions have been publicly announced.',
      whyItMatters: 'The executive order makes the US government a declared participant in Bitcoin\'s strategic landscape, even before any confirmed purchases. The policy signal alone is significant: it frames Bitcoin as a strategic asset comparable to gold reserves, which changes the asset\'s institutional standing. If the Treasury proceeds with meaningful accumulation, it would create sustained demand pressure on a fixed-supply asset and potentially trigger similar reserve policies by other sovereigns.',
      marketImplications: 'The executive order\'s existence creates policy optionality that markets have partially priced in, though the lack of confirmed purchases leaves significant uncertainty. The key variables are: whether Congress appropriates funds for open-market purchases, what acquisition timeline the Treasury adopts, and which execution counterparties are selected. State-level Bitcoin reserve programs are proceeding independently in several US states, creating a multi-layered sovereign demand picture.',
      infraImplications: 'The reserve raises open questions about institutional Bitcoin custody at sovereign scale. Any Treasury acquisition program would need to establish custody arrangements meeting federal security standards — likely involving regulated digital asset custodians. The precedent would establish the template for sovereign Bitcoin custody that other governments would likely reference.',
      type: 'STRATEGIC_MEMO',
      source: 'Bloomberg',
      importance: 9.5,
      confidence: 35,
      daysAgo: 2,
      topicNames: ['Digital Custody', 'Exchange Infrastructure'],
      entityNames: ['Federal Reserve System', 'Kraken', 'Coinbase', 'Fidelity Investments'],
      tagSlugs: ['institutional', 'custody', 'policy', 'central-bank'],
      signal: [9.0, 8.0, 9.5, 8.0, 7.5, 7.0, 8.5, 9.0, 9.5],
    },
    {
      title: 'MUFG Launches $500M Tokenized Real Estate Security',
      headline: 'Japan largest bank issues blockchain-based real estate security',
      summary: 'MUFG has issued a $500 million tokenized real estate security on its Progmat blockchain platform, the largest single tokenized real estate issuance in Asia.',
      content: 'Mitsubishi UFJ Financial Group (MUFG) has launched a $500 million tokenized real estate security through its Progmat digital asset platform, marking the largest single tokenized property issuance in the Asia-Pacific region.\n\nThe security represents fractional ownership in a portfolio of 12 commercial real estate assets across Tokyo\'s Marunouchi and Osaka\'s Umeda business districts. The portfolio includes Grade A office buildings, retail complexes, and logistics facilities with an aggregate appraised value of $620 million.\n\nThe issuance uses Progmat\'s permissioned blockchain infrastructure with settlement in Japanese yen stablecoins. The tokenized structure enables:\'\n\n• Fractional ownership starting at ¥1 million ($6,800), versus the traditional ¥100 million minimum\n• Automated quarterly distribution of rental income via smart contracts\n• Secondary trading on Progmat\'s regulated exchange with T+0 settlement\n• Real-time NAV updates based on property management data feeds\n\n"Tokenization transforms real estate from an illiquid, opaque asset class into something institutional investors can allocate to with the same ease as fixed income," said MUFG Digital Strategy Head Kenji Yamada.\n\nThe offering was fully subscribed within 48 hours, with demand from Japanese pension funds, insurance companies, and several foreign institutional investors accessing the Japanese commercial property market for the first time through on-chain infrastructure.',
      whatHappened: 'MUFG issued a $500M tokenized real estate security on its Progmat blockchain platform — the largest tokenized RE issuance in APAC. The security covers 12 commercial properties in Tokyo and Osaka, with fractional ownership from ¥1M (~$6,800). The offering sold out in 48 hours to pension funds, insurers, and foreign institutions.',
      whyItMatters: 'This proves that tokenization can unlock institutional-scale real estate investment at dramatically lower minimums and with near-instant settlement. The 48-hour sellout demonstrates genuine institutional demand, not just technical interest. It positions Japan\'s Progmat platform as the leading infrastructure for tokenized real assets in Asia.',
      marketImplications: 'The success creates a template for tokenized RE across Asia-Pacific. MUFG has signaled plans for a $1B follow-on issuance targeting mixed-use and data center properties. Secondary market trading on Progmat gives tokenized RE something physical property lacks: daily liquidity.',
      type: 'DEEP_DIVE',
      assetClass: 'TOKENIZED_REAL_ESTATE',
      source: 'Nikkei Asia',
      importance: 8.5,
      confidence: 91,
      daysAgo: 4,
      topicNames: ['Tokenized Real Estate'],
      entityNames: ['MUFG'],
      tagSlugs: ['tokenization', 'real-estate', 'institutional'],
      signal: [6.5, 8.0, 8.5, 8.0, 7.0, 5.5, 7.5, 5.0, 7.0],
    },
    {
      title: 'Kraken Launches Tokenized Equity Trading Platform',
      headline: 'Kraken debuts xStocks platform for blockchain-based equity trading',
      summary: 'Crypto exchange Kraken has launched its xStocks platform enabling tokenized trading of public equities, bridging crypto and traditional markets.',
      content: 'Kraken has launched xStocks, a tokenized equity trading platform that allows users to trade fractional shares of over 50 US-listed stocks and ETFs through blockchain-based settlement infrastructure.\n\nThe platform — which launches alongside Kraken\'s landmark Federal Reserve master account approval — represents the exchange\'s aggressive push into traditional finance territory. xStocks settles trades on blockchain rails rather than through DTCC, enabling 24/7 trading and near-instant settlement.\n\nKey features of xStocks include:\n\n• 24/7 trading of tokenized equities (versus traditional 9:30 AM - 4:00 PM market hours)\n• Fractional shares starting at $1\n• T+0 settlement via blockchain versus T+1 through DTCC\n• Integration with Kraken\'s existing crypto trading interface\n• Regulatory compliance through Kraken Securities LLC, a registered broker-dealer\n\nThe initial listing includes Apple, Microsoft, Tesla, NVIDIA, Amazon, and 45 other large-cap equities plus 5 major ETFs. Kraken has indicated plans to expand to international equities and options in Q3 2026.\n\n"The distinction between crypto and equities is artificial," said Kraken CEO David Ripley. "xStocks gives our users a unified platform for all digital assets — whether the underlying is a cryptocurrency, a stock, or a treasury bill."\n\nRobinhood, which faces direct competition from xStocks, saw its shares decline 4% on the announcement.',
      whatHappened: 'Kraken launched xStocks, a tokenized equity trading platform supporting 50+ US stocks and ETFs with 24/7 trading, fractional shares from $1, and T+0 blockchain-based settlement. The platform operates through Kraken Securities LLC, a registered broker-dealer. Launch comes alongside Kraken\'s separate Federal Reserve master account approval.',
      whyItMatters: 'xStocks collapses the boundary between crypto and equity trading on a single platform. 24/7 trading and instant settlement directly challenge the legacy market structure of fixed hours and T+1 settlement. This is the first major crypto exchange to offer full tokenized equity trading integrated with crypto assets.',
      marketImplications: 'Direct competition for Robinhood and other retail brokerages — Robinhood shares fell 4% on the news. The 24/7 trading model pressures traditional exchanges like NYSE and Nasdaq to extend their trading hours. If xStocks gains traction, it could accelerate the shift toward blockchain-based equity settlement infrastructure.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_EQUITIES',
      source: 'The Block',
      importance: 8.0,
      confidence: 88,
      daysAgo: 4,
      topicNames: ['Tokenized Equities', 'Exchange Infrastructure'],
      entityNames: ['Kraken', 'Nasdaq'],
      tagSlugs: ['equities', 'tokenization', 'blockchain'],
      signal: [7.0, 8.0, 6.0, 8.0, 9.0, 5.0, 7.0, 6.0, 7.0],
      eventFamily: 'kraken-crypto-banking',
    },
    {
      title: 'Northern Trust Tokenizes Money Market Fund on Polygon',
      headline: 'Northern Trust deploys tokenized MMF on Polygon blockchain',
      summary: 'Northern Trust has launched a tokenized money market fund on Polygon, providing institutional clients with on-chain access to short-duration fixed income.',
      content: 'Northern Trust has tokenized a money market fund on the Polygon blockchain, providing institutional investors with a blockchain-native vehicle for short-duration Treasury exposure.\n\nThe fund uses smart contracts for automated subscription and redemption, with settlement finalizing within minutes rather than the traditional T+1 cycle. The tokenized shares are interoperable with other DeFi protocols, enabling collateral posting and lending use cases.\n\nNorthern Trust\'s approach is notable because the bank serves as both the fund administrator and the custodian of tokenized shares — eliminating the need for third-party tokenization platforms like Securitize. The minimum investment is $250,000 for qualified institutional investors.',
      whatHappened: 'Northern Trust launched a tokenized money market fund on Polygon with automated subscription/redemption via smart contracts, minutes-to-settlement, and DeFi protocol interoperability. Northern Trust acts as both administrator and custodian.',
      whyItMatters: 'A top-10 global custodian tokenizing its own fund products validates the technology for the institutional custody industry. The self-custody model eliminates intermediary risk from third-party tokenization platforms.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Global Custodian',
      importance: 7.8,
      confidence: 91,
      daysAgo: 5,
      topicNames: ['Tokenized Funds', 'Digital Custody'],
      entityNames: ['Northern Trust', 'Polygon Labs'],
      tagSlugs: ['tokenization', 'funds', 'custody', 'institutional'],
      signal: [6.5, 7.5, 8.0, 7.5, 6.5, 5.0, 7.0, 5.0, 6.5],
      eventFamily: 'tokenized-treasury-funds',
    },
    {
      title: 'BIS Innovation Hub Advances Project Agor Cross-Border CBDC Testing',
      headline: 'BIS advances cross-border wholesale CBDC testing with seven central banks',
      summary: 'The Bank for International Settlements Innovation Hub is advancing Project Agor, a multi-central bank initiative testing wholesale CBDC interoperability for cross-border payments. Initial results from the testing phase have been published.',
      content: 'The BIS Innovation Hub is advancing Project Agor, a multi-central bank initiative testing wholesale CBDC interoperability for cross-border settlement — one of the most ambitious coordination efforts in central bank digital currency development to date.\n\nParticipating central banks include the Federal Reserve, European Central Bank, Bank of Japan, Bank of England, Swiss National Bank, Reserve Bank of Australia, and Monetary Authority of Singapore.\n\nProject Agor is testing three critical use cases:\n\n1. Cross-border DvP: Delivery-versus-payment settlement of tokenized government bonds between central banks, aiming to reduce or eliminate Herstatt risk\n2. Cross-currency FX: Payment-versus-payment foreign exchange settlement using wholesale CBDCs, as an alternative to existing settlement windows\n3. Multi-party netting: Multilateral obligation netting across multiple currencies with coordinated settlement\n\nEarly results from testing are encouraging. The BIS reports significant reductions in settlement time and transaction costs compared to correspondent banking, with strong reliability across initial test transactions. Full privacy between participating central banks has been maintained throughout testing.\n\n"Project Agor is demonstrating the potential for wholesale CBDCs to improve cross-border payment efficiency," said BIS Innovation Hub Head Cecilia Skingsley. "We are still in the testing and evaluation phase."\n\nThe project uses a unified API layer that connects to each central bank\'s native CBDC platform without requiring a shared ledger — an architecture designed to address sovereignty concerns that have complicated earlier CBDC interoperability efforts.\n\nBIS has indicated it may recommend the Project Agor technical approach to the G20 as a framework for CBDC interoperability, though formal recommendations have not yet been issued.',
      whatHappened: 'BIS is advancing Project Agor, testing wholesale CBDC cross-border settlement with 7 central banks (Fed, ECB, BoJ, BoE, SNB, RBA, MAS). Early testing shows significant improvements in settlement speed and cost reduction compared to correspondent banking, with privacy maintained between participants. The project uses a unified API approach that connects native CBDC platforms without a shared ledger.',
      whyItMatters: 'This is one of the most significant multi-central bank coordination efforts for wholesale CBDC interoperability. The API-based architecture addresses sovereignty concerns that have complicated earlier efforts by allowing each central bank to maintain full control over its own CBDC design. If the approach proves viable, it could become a template for broader CBDC interoperability.',
      marketImplications: 'Could affect the correspondent banking model that generates significant annual fees for global banks. Existing FX settlement infrastructure faces potential long-term competition from CBDC-based alternatives. SWIFT\'s role could evolve from messaging to orchestration.',
      infraImplications: 'The unified API approach — connecting native CBDC platforms without requiring a shared ledger — is the key architectural innovation. It allows each central bank to maintain sovereignty over its CBDC design while still achieving interoperability. This architecture could be adopted for commercial bank tokenized deposit interoperability as well.',
      type: 'RESEARCH_ARTICLE',
      assetClass: 'CBDC',
      source: 'Bank for International Settlements',
      importance: 9.0,
      confidence: 94,
      daysAgo: 5,
      topicNames: ['Wholesale CBDC', 'Central Bank Digital Currencies', 'Interoperability'],
      entityNames: ['Bank for International Settlements', 'Federal Reserve System', 'European Central Bank', 'Bank of Japan', 'Bank of England', 'Swiss National Bank', 'Reserve Bank of Australia', 'Monetary Authority of Singapore'],
      tagSlugs: ['CBDC', 'cross-border', 'settlement', 'central-bank'],
      signal: [9.0, 9.0, 9.5, 9.0, 7.5, 9.5, 8.5, 4.0, 8.0],
    },
    {
      title: 'Franklin Templeton Expands On-Chain Fund to Stellar and Avalanche',
      headline: 'Franklin Templeton extends tokenized fund beyond Polygon to two new chains',
      summary: 'Franklin Templeton has expanded its on-chain government money fund to Stellar and Avalanche blockchains, becoming the first major asset manager with tokenized funds on three public chains.',
      content: 'Franklin Templeton has deployed its OnChain US Government Money Fund (FOBXX) on both Stellar and Avalanche, in addition to its existing deployment on Polygon — becoming the first major asset manager to operate a tokenized fund on three public blockchains simultaneously.\n\nThe multi-chain expansion allows investors to access the tokenized fund through their preferred blockchain ecosystem. The fund now holds over $400 million in tokenized shares and processes subscriptions and redemptions using on-chain transfer agent records.\n\nFOBXX\'s multi-chain architecture uses Securitize as the registered transfer agent across all three chains, with a unified accounting system that reconciles holdings regardless of which blockchain the shares reside on. This eliminates the fragmentation risk inherent in multi-chain deployments.\n\n"Blockchain-agnostic is the only tenable strategy for institutional products," said Franklin Templeton President Jenny Johnson. "No single chain will dominate institutional finance, and our investors shouldn\'t have to choose."',
      whatHappened: 'Franklin Templeton deployed FOBXX on Stellar and Avalanche in addition to Polygon, making it the first major institutional tokenized fund on three public chains. The fund holds $400M with Securitize as unified transfer agent across all chains.',
      whyItMatters: 'Multi-chain deployment proves institutional tokenized funds can operate across blockchain ecosystems without fragmentation. This removes the "which chain?" objection that has slowed institutional adoption and establishes the template for chain-agnostic fund products.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Ledger Insights',
      importance: 7.5,
      confidence: 93,
      daysAgo: 6,
      topicNames: ['Tokenized Funds', 'Interoperability'],
      entityNames: ['Franklin Templeton', 'Stellar Development Foundation', 'Avalanche', 'Polygon Labs'],
      tagSlugs: ['tokenization', 'funds', 'blockchain', 'interoperability'],
      signal: [6.0, 7.5, 8.0, 8.0, 7.0, 6.0, 8.0, 4.5, 6.0],
      eventFamily: 'tokenized-treasury-funds',
    },
    {
      title: 'MAS Launches Framework for Institutional DeFi Access',
      headline: 'Singapore regulator creates regulatory sandbox for institutional DeFi',
      summary: 'The Monetary Authority of Singapore has introduced a regulatory framework allowing regulated financial institutions to access DeFi protocols under supervised conditions.',
      content: 'The Monetary Authority of Singapore has launched a regulatory sandbox framework specifically designed for institutional participation in decentralized finance — the first of its kind from a major financial center.\n\nThe framework, developed under Project Guardian (MAS\'s multi-year initiative exploring institutional DeFi), allows licensed financial institutions to interact with approved DeFi protocols for:\n\n• Tokenized asset trading on decentralized exchanges\n• Institutional lending and borrowing through on-chain credit protocols\n• Foreign exchange swaps using automated market makers\n• Liquidity provision in permissioned DeFi pools\n\nParticipating institutions must maintain full KYC/AML compliance, report all transactions to MAS in real-time, and operate only within pre-approved protocol parameters. Current participants include DBS Bank, JPMorgan Singapore, Standard Chartered, and HSBC.\n\nCritically, MAS has drawn a distinction between “permissioned DeFi” (institutional, KYC\'d, regulated) and “permissionless DeFi” (open, pseudonymous, unregulated). The framework only covers the former, and MAS has explicitly stated it does not endorse or regulate permissionless DeFi protocols.\n\n"There is a productive middle ground between banning DeFi entirely and allowing unrestricted access," said MAS Managing Director Ravi Menon. "Institutional DeFi — with proper guardrails — can deliver significant efficiency gains."\n\nThe sandbox runs for three years, after which successful protocols may be granted permanent regulatory status.',
      whatHappened: 'MAS launched the first regulatory sandbox for institutional DeFi under Project Guardian. Licensed financial institutions (DBS, JPMorgan, StanChart, HSBC) can now access approved DeFi protocols for tokenized asset trading, lending, FX, and liquidity provision — with full KYC/AML compliance and real-time MAS reporting.',
      whyItMatters: 'Singapore becomes the first major financial center to create a formal pathway for institutional DeFi access. The framework\'s distinction between permissioned and permissionless DeFi provides a template other regulators can adapt. For DeFi protocols seeking institutional adoption, MAS approval becomes a critical credential.',
      regulatoryImplications: 'The 3-year sandbox period creates a live regulatory laboratory. Successful protocols may receive permanent regulatory status, establishing the first regulated DeFi venues. Other jurisdictions (UK, Hong Kong, Abu Dhabi) are watching closely — this framework will likely influence their own approaches to institutional DeFi regulation.',
      type: 'REGULATOR_TRACKER',
      source: 'Monetary Authority of Singapore',
      importance: 8.8,
      confidence: 93,
      daysAgo: 6,
      topicNames: ['DeFi Regulation', 'Securities Regulation'],
      entityNames: ['Monetary Authority of Singapore', 'DBS Bank', 'JPMorgan Chase'],
      tagSlugs: ['regulation', 'DeFi', 'institutional', 'compliance'],
      signal: [9.0, 8.0, 8.0, 7.5, 8.0, 7.5, 9.0, 5.5, 8.0],
    },
    // 10 more articles with varied types and topics
    {
      title: 'UBS Expands Digital Bond Program on SIX Digital Exchange',
      headline: 'UBS scales digital bond issuance on SDX — CHF 375M in cumulative volume',
      summary: 'UBS continues expanding its digital bond program on SIX Digital Exchange, with cumulative issuance reaching CHF 375 million as institutional demand for regulated tokenized bonds grows.',
      content: 'UBS continues to expand its digital bond issuance program on SIX Digital Exchange (SDX), with cumulative volume reaching CHF 375 million across multiple tranches — making it one of the most active issuers on the regulated Swiss digital exchange.\n\nRecent issuances have been settled through SDX\'s integrated central securities depository using atomic delivery-versus-payment, with settlement completing in under 30 minutes compared to the typical T+2 cycle for traditional bonds. Institutional investors including pension funds and insurance companies have participated across tranches.\n\nThe program demonstrates several advantages of regulated digital bond infrastructure:\n\n• Atomic DvP settlement eliminates counterparty risk during the settlement window\n• Automated coupon and redemption processing via smart contracts\n• Dual listing: bonds are simultaneously listed on SDX (digital) and SIX Swiss Exchange (traditional)\n• Full regulatory equivalence with traditional bonds under Swiss financial law',
      whatHappened: 'UBS has expanded its digital bond program on SIX Digital Exchange, with cumulative issuance reaching CHF 375M across multiple tranches. Recent issuances use atomic DvP settlement in under 30 minutes (vs. T+2 for traditional bonds). Bonds are dual-listed on SDX and SIX Swiss Exchange.',
      whyItMatters: 'The dual-listing model — same bonds, accessible on both digital and traditional rails — is a pragmatic approach that allows investors to adopt tokenized bonds without abandoning traditional market infrastructure. Cumulative CHF 375M demonstrates institutional-scale demand, beyond proof-of-concept.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_BONDS',
      source: 'Financial Times',
      importance: 8.2,
      confidence: 96,
      daysAgo: 7,
      topicNames: ['Tokenized Bonds', 'Digital Settlement'],
      entityNames: ['UBS', 'SIX Digital Exchange'],
      tagSlugs: ['bonds', 'tokenization', 'settlement'],
      signal: [7.0, 8.0, 8.5, 8.5, 6.5, 6.0, 7.0, 4.0, 7.0],
    },
    {
      title: 'Societe Generale FORGE Issues EUR 10M Green Digital Bond',
      headline: 'SocGen FORGE tokenizes green bond on public Ethereum',
      summary: 'Societe Generale\'s FORGE subsidiary has issued a EUR 10 million green digital bond on public Ethereum, combining sustainable finance with tokenization.',
      content: 'Societe Generale-FORGE has issued a EUR 10 million green digital bond on the public Ethereum blockchain.\n\nThe bond is structured as an ERC-20 token with automated coupon distribution via smart contracts. Proceeds are earmarked for renewable energy infrastructure projects. Settlement occurs in EUR CoinVertible (EURCV), SocGen-FORGE\'s institutional euro stablecoin.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_BONDS',
      source: 'Reuters',
      importance: 7.5,
      daysAgo: 7,
      topicNames: ['Tokenized Bonds'],
      entityNames: ['Societe Generale', 'Ethereum Foundation'],
      tagSlugs: ['bonds', 'tokenization', 'blockchain'],
      signal: [7.0, 7.0, 7.5, 7.5, 7.0, 6.0, 7.5, 4.0, 6.0],
    },
    {
      title: 'Broadridge DLT Repo Platform Continues Scaling With Major Dealer Banks',
      headline: 'Broadridge DLT repo platform grows beyond initial $1T milestone — monthly volumes expanding',
      summary: 'Broadridge\'s distributed ledger repo platform continues to expand, with cumulative volumes having surpassed $1 trillion and monthly transaction volumes growing. The platform serves multiple major dealer banks for intraday repo settlement.',
      content: 'Broadridge Financial Solutions\' distributed ledger technology platform for repurchase agreement transactions continues to scale, with cumulative volumes having surpassed the $1 trillion mark and monthly processing volumes growing. The platform remains one of the largest enterprise blockchain applications in financial services by transaction volume.\n\nThe platform, which has been operational since 2021, facilitates intraday repo settlement and automated collateral management for major dealer banks. Active participants are reported to include UBS, Goldman Sachs, Societe Generale, BNP Paribas, and HSBC.\n\nThe DLT platform offers advantages over traditional repo infrastructure:\n\n• Intraday settlement: Repos can be opened and closed within the same business day, reducing overnight funding costs\n• Automated collateral management: Smart contracts handle collateral substitution and margin calls without manual intervention\n• Reduced capital charges: Intraday netting on DLT reduces gross exposure, potentially freeing capital\n\nBroadridge has described the platform as production-grade infrastructure, distinguishing it from the many blockchain pilots in financial services that have not reached sustained commercial operation.\n\nThe platform\'s continued growth in repo markets could serve as a template for DLT adoption in other bilateral trading markets such as securities lending, swaps, and FX forwards.',
      whatHappened: 'Broadridge\'s DLT repo platform continues to process growing volumes, having surpassed $1 trillion in cumulative transactions. The platform serves major dealer banks including UBS, Goldman Sachs, SocGen, BNP Paribas, and HSBC, providing intraday repo settlement and automated collateral management.',
      whyItMatters: 'This is one of the largest real-world volume achievements for enterprise blockchain. The platform\'s sustained commercial operation — beyond pilot stage — demonstrates that DLT can handle institutional-scale transaction processing in production.',
      infraImplications: 'The platform\'s continued growth in repo markets creates a template for DLT adoption in other bilateral trading markets (securities lending, swaps, FX forwards). Broadridge\'s first-mover advantage makes it the incumbent infrastructure provider in DLT-based repo — competing platforms would need to match both technology and network effects.',
      type: 'INFRA_ANALYSIS',
      source: 'Securities Finance Times',
      importance: 8.5,
      confidence: 96,
      daysAgo: 8,
      topicNames: ['Digital Settlement', 'Exchange Infrastructure'],
      entityNames: ['Broadridge Financial Solutions', 'UBS', 'Goldman Sachs', 'Societe Generale'],
      tagSlugs: ['infrastructure', 'settlement', 'institutional', 'derivatives'],
      signal: [5.5, 8.5, 9.0, 9.0, 6.0, 5.5, 7.0, 4.0, 6.0],
      eventFamily: 'digital-settlement-infra',
    },
    {
      title: 'FCA Publishes Digital Securities Sandbox Rules',
      headline: 'UK regulator finalizes rules for digital securities sandbox',
      summary: 'The Financial Conduct Authority has published final rules for the UK Digital Securities Sandbox, allowing firms to test tokenized financial instruments under relaxed regulatory conditions.',
      content: 'The UK Financial Conduct Authority has published the final rulebook for the Digital Securities Sandbox (DSS), creating a controlled environment for firms to issue, trade, and settle tokenized securities under relaxed regulatory conditions.\n\nThe sandbox allows approved firms to operate for up to five years under modified requirements, without requiring full compliance with existing CSDR-derived rules for central securities depositories and settlement systems.\n\nKey sandbox provisions:\n\n• Modified capital requirements for digital CSDs and settlement systems\n• Flexibility on operational resilience standards for DLT-based platforms\n• Permission to combine trading venue and CSD functions on a single platform\n• Cap of £250 million per asset class per participant during the initial phase\n\nThe FCA received over 40 applications from exchanges, custodians, and technology firms. Early participants are expected to include the London Stock Exchange Group, Archax, and Copper Technologies.\n\n"The sandbox ensures the UK remains at the forefront of financial innovation while maintaining appropriate investor protection," said FCA Chief Executive Nikhil Rathi.',
      whatHappened: 'FCA published final rules for the Digital Securities Sandbox, allowing firms to test tokenized securities with relaxed regulatory requirements for up to 5 years. Over 40 applications received from exchanges, custodians, and tech firms. Expected participants include LSEG, Archax, and Copper.',
      whyItMatters: 'Post-Brexit, the UK can deviate from EU securities settlement rules — the DSS takes advantage of this flexibility to create a more permissive environment for tokenized securities innovation than MiCA allows in the EU. This positions London as a competitive alternative to Singapore and Switzerland for tokenized securities.',
      regulatoryImplications: 'The 5-year sandbox period is unusually long, signaling the FCA\'s intent to gather extensive real-world data before writing permanent regulations. The permission to combine trading and CSD functions on one platform could catalyze vertically integrated tokenized securities venues.',
      type: 'REGULATOR_TRACKER',
      source: 'UK Financial Conduct Authority',
      importance: 8.0,
      confidence: 97,
      daysAgo: 8,
      topicNames: ['Securities Regulation', 'Exchange Infrastructure'],
      entityNames: ['Financial Conduct Authority', 'London Stock Exchange Group'],
      tagSlugs: ['regulation', 'securities', 'tokenization'],
      signal: [9.0, 7.5, 6.5, 7.0, 7.0, 5.0, 6.5, 5.0, 7.5],
    },
    {
      title: 'SWIFT Connects to Multiple Tokenization Platforms in Interoperability Push',
      headline: 'SWIFT bridges traditional finance to tokenized assets across 6 platforms',
      summary: 'SWIFT has completed integration testing connecting its messaging network to six major tokenization platforms, enabling traditional financial institutions to interact with tokenized assets.',
      content: 'SWIFT has successfully tested interoperability connections between its existing financial messaging infrastructure and six tokenization platforms, enabling its 11,500+ member institutions to interact with tokenized assets without changing their existing systems.\n\nThe connected platforms: Chainlink CCIP, SIX Digital Exchange, DTCC Ion, Canton Network, Corda (R3), and a custom Hyperledger Besu network. The integration uses SWIFT\'s existing MT and MX message formats, meaning banks can instruct tokenized asset transactions using the same message types they already use for traditional securities.\n\nThe technical approach is significant: rather than requiring banks to implement blockchain-specific technology stacks, SWIFT acts as a translation layer. A bank sends a standard SWIFT message; SWIFT\'s gateway converts it into the appropriate blockchain transaction.\n\n• 11,500+ institutions connected without new infrastructure\n• Standard MT/MX messages trigger on-chain transactions\n• Multi-chain support across 6 platforms simultaneously\n• "Write once, transact everywhere" for institutional tokenized assets\n\n"Our goal was never to build a blockchain," said SWIFT Chief Innovation Officer Tom Zschach. "It was to make blockchains accessible through the infrastructure the financial industry already trusts."\n\nThis positions SWIFT as the default gateway between traditional finance and tokenized asset markets — a role that preserves its network relevance as the industry moves toward on-chain settlement.',
      whatHappened: 'SWIFT completed integration testing with 6 major tokenization platforms (Chainlink CCIP, SIX SDX, DTCC Ion, Canton Network, Corda, Hyperledger Besu). The integration allows 11,500+ member banks to interact with tokenized assets using existing SWIFT message formats — no blockchain-specific technology required.',
      whyItMatters: 'SWIFT\'s position as the universal gateway to tokenized assets removes the single biggest barrier to institutional adoption: the need for new technology infrastructure. Banks can interact with tokenized assets using the same systems they use today. This turns SWIFT from a potential casualty of blockchain disruption into the critical bridge between old and new infrastructure.',
      infraImplications: 'The "translation layer" approach — converting standard financial messages into on-chain transactions — means tokenized asset platforms don\'t need to build bank connectivity individually. SWIFT becomes the default on-ramp. This architecture also establishes SWIFT as a competitor to Chainlink CCIP for cross-chain messaging in institutional contexts.',
      type: 'INFRA_ANALYSIS',
      source: 'Bloomberg',
      importance: 8.8,
      confidence: 92,
      daysAgo: 9,
      topicNames: ['Interoperability', 'Digital Settlement'],
      entityNames: ['SWIFT', 'DTCC', 'SIX Digital Exchange'],
      tagSlugs: ['infrastructure', 'interoperability', 'institutional'],
      signal: [6.5, 9.0, 9.0, 9.5, 8.0, 8.0, 8.5, 4.0, 8.0],
    },
    {
      title: 'DBS Bank Reports $1B in Digital Asset Trading Volume',
      headline: 'DBS digital exchange crosses $1B quarterly trading volume',
      summary: 'DBS Bank has reported over $1 billion in quarterly trading volume on its institutional digital exchange, DDEx.',
      content: 'DBS Bank\'s institutional digital exchange (DDEx) has crossed $1 billion in quarterly trading volume for the first time.\n\nThe Singapore-based exchange, which serves only institutional and accredited investors, saw strong demand for tokenized fixed income products and digital asset trading. DBS reports that over 200 institutional clients are now active on the platform.',
      type: 'BRIEF',
      source: 'Nikkei Asia',
      importance: 7.5,
      daysAgo: 9,
      topicNames: ['Exchange Infrastructure', 'Digital Custody'],
      entityNames: ['DBS Bank', 'Monetary Authority of Singapore'],
      tagSlugs: ['institutional', 'tokenization'],
      signal: [6.0, 7.5, 8.0, 7.5, 6.0, 5.5, 6.5, 5.0, 6.0],
    },
    {
      title: 'Ondo Finance Tokenized Treasury Fund Reaches $800M TVL',
      headline: 'Ondo USDY stablecoin and OUSG Treasury token cross $800M combined',
      summary: 'Ondo Finance reports $800 million total value locked across its tokenized US Treasury products.',
      content: 'Ondo Finance has reported $800 million in total value locked across its tokenized Treasury products, including OUSG (short-term US Government bond fund) and USDY (yield-bearing stablecoin backed by Treasuries).\n\nThe products are available on five blockchains with institutional adoption accelerating among crypto-native firms seeking Treasury yield exposure on-chain.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_TREASURIES',
      source: 'The Block',
      importance: 7.5,
      daysAgo: 10,
      topicNames: ['Tokenized Treasuries', 'Stablecoins'],
      entityNames: ['Ondo Finance'],
      tagSlugs: ['treasuries', 'tokenization', 'stablecoin'],
      signal: [5.5, 7.0, 6.5, 7.0, 7.5, 5.0, 7.0, 5.5, 6.5],
      eventFamily: 'tokenized-treasury-funds',
    },
    {
      title: 'Circle USDC Stablecoin Reaches $45 Billion Market Capitalization',
      headline: 'USDC market cap surges to $45B as institutional adoption accelerates',
      summary: 'Circle\'s USDC stablecoin has reached $45 billion in market capitalization, driven by institutional adoption for settlement and collateral use cases.',
      content: 'USDC has reached $45 billion in circulating supply, its highest level since the 2022 bank run that triggered a temporary depeg and massive outflows.\n\nThe recovery is driven by three institutional adoption vectors:\n\n• Settlement currency: USDC is now used as the default settlement token for tokenized asset transactions on four major platforms, including BlackRock\'s BUIDL and Franklin Templeton\'s FOBXX\n• Cross-border payments: Circle\'s Cross-Chain Transfer Protocol (CCTP) has enabled $12 billion in institutional cross-border transfers in Q1 2026 alone\n• DeFi collateral: USDC serves as the primary stablecoin collateral for institutional DeFi protocols operating under Singapore\'s MAS framework\n\nCircle has secured regulatory approvals in 7 jurisdictions, including the US (state money transmitter), EU (MiCA e-money token), Singapore (MAS), and Japan (JFSA). The company\'s planned IPO (filed S-1 in January 2026) values the company at $9-11 billion.\n\n"USDC\'s growth is being driven by institutional use cases, not retail speculation," said Circle CEO Jeremy Allaire. "Settlement, payments, and collateral — these are the building blocks of institutional infrastructure."\n\nCircle\'s banking partners now include JPMorgan, BNY Mellon, and Customers Bancorp for reserve management, with reserves held in US Treasury bills and overnight repos.',
      whatHappened: 'USDC reached $45B market cap, driven by institutional settlement, cross-border payments ($12B in Q1 2026 via CCTP), and DeFi collateral use. Circle holds regulatory approvals in 7 jurisdictions and filed for an IPO valuing the company at $9-11B.',
      whyItMatters: 'USDC\'s recovery to all-time-high market cap proves that regulated stablecoins are critical infrastructure for institutional digital asset markets. Its role as the default settlement token for major tokenized fund platforms (BUIDL, FOBXX) makes it systemically important.',
      type: 'BRIEF',
      assetClass: 'STABLECOINS',
      source: 'Bloomberg',
      importance: 7.8,
      confidence: 94,
      daysAgo: 10,
      topicNames: ['Stablecoins', 'Payment Infrastructure'],
      entityNames: ['Circle', 'JPMorgan Chase', 'BNY Mellon'],
      tagSlugs: ['stablecoin', 'payment-rails', 'institutional'],
      signal: [7.5, 8.0, 8.5, 7.0, 7.5, 7.0, 6.0, 5.0, 6.5],
      eventFamily: 'us-stablecoin-legislation',
    },
    {
      title: 'Fnality Enters Operational Phase for Wholesale Digital Payments',
      headline: 'Fnality moves from pilot to operational wholesale settlement in sterling',
      summary: 'Fnality International has entered operational status for wholesale digital payments using tokenized central bank money on its distributed ledger platform, processing interbank settlements backed by reserves at the Bank of England.',
      content: 'Fnality International has moved into operational status for its wholesale digital payment system, processing interbank settlements using tokenized central bank money — sterling Utility Settlement Coins (USC) backed by segregated reserves held at the Bank of England.\n\nThe platform has processed live transactions between major bank participants, settling in under 30 seconds. Unlike stablecoin payments (backed by commercial bank deposits or money market instruments), Fnality\'s USC is backed directly by central bank reserves, providing settlement finality equivalent to reserves-based payment systems.\n\nFnality\'s architecture occupies a distinctive position in the tokenized payments landscape:\n\n• Reserves held in a segregated omnibus account at the Bank of England\n• Each USC token represents a claim on central bank money\n• Settlement finality is identical to reserves-based settlement — the gold standard for payment systems\n• 17 global bank shareholders including Goldman Sachs, BNP Paribas, Nomura, Barclays, and UBS\n\nFnality plans to extend the service to USD and EUR settlement, with yen and Swiss franc to follow. The company is also in discussions with DTCC and Euroclear about integrating Fnality settlement into their post-trade platforms.\n\nThe transition from pilot to live operations marks a notable milestone for tokenized central bank money, though the volume and scope of current transactions remain limited as the platform scales.',
      whatHappened: 'Fnality has entered operational status for wholesale digital payments using tokenized central bank money — sterling USC transactions backed by reserves at the Bank of England. The platform settles interbank transactions in under 30 seconds. Fnality plans to add USD, EUR, JPY, and CHF settlement.',
      whyItMatters: 'Fnality\'s model is distinctive: a private-sector token backed by central bank money, combining the programmability of tokens with the safety of reserves-based settlement. Unlike stablecoins (commercial risk) or CBDC (government-issued), Fnality creates a third category of tokenized money. The transition to operational status, while still at limited scale, validates the model.',
      infraImplications: 'Fnality\'s multi-currency model could become a settlement layer for institutional tokenized asset markets. Integration with DTCC and Euroclear would position Fnality as the payment leg for DvP settlement of tokenized securities. With 17 bank shareholders, the network has foundation for growth, though broader adoption remains to be demonstrated.',
      type: 'INFRA_ANALYSIS',
      source: 'Financial Times',
      importance: 8.5,
      confidence: 90,
      daysAgo: 11,
      topicNames: ['Payment Infrastructure', 'Wholesale CBDC'],
      entityNames: ['Fnality International', 'Bank of England', 'Goldman Sachs', 'BNP Paribas', 'Nomura'],
      tagSlugs: ['payment-rails', 'settlement', 'central-bank', 'infrastructure'],
      signal: [7.5, 8.5, 9.0, 9.0, 7.0, 7.0, 9.0, 4.5, 8.5],
    },
    {
      title: 'Euroclear and World Bank Test Tokenized Bond Settlement',
      headline: 'Euroclear partners with World Bank for DLT bond settlement trial',
      summary: 'Euroclear has partnered with the World Bank to test tokenized bond settlement through its digital infrastructure.',
      content: 'Euroclear has completed a joint test with the World Bank demonstrating tokenized bond settlement on distributed ledger technology.\n\nThe pilot tested the issuance and settlement of a World Bank digital bond using Euroclear\'s D-FMI (Digital Financial Market Infrastructure) platform. Settlement occurred using tokenized cash with atomic DvP, reducing settlement risk to near zero.',
      type: 'INFRA_ANALYSIS',
      source: 'Global Custodian',
      importance: 8.3,
      daysAgo: 12,
      topicNames: ['Tokenized Bonds', 'Digital Settlement'],
      entityNames: ['Euroclear', 'World Bank'],
      tagSlugs: ['bonds', 'settlement', 'infrastructure', 'tokenization'],
      signal: [7.0, 8.5, 8.5, 9.0, 6.5, 7.0, 7.5, 3.5, 7.0],
    },
    // 20 more articles for breadth
    {
      title: 'Goldman Sachs Digital Assets Platform Processes First Trade',
      headline: 'Goldman Sachs GS DAP executes tokenized bond trade',
      summary: 'Goldman Sachs has processed its first client trade through its digital asset platform GS DAP.',
      content: 'Goldman Sachs has executed its first live client trade through GS DAP, its digital asset platform for institutional tokenized securities. The trade involved a tokenized corporate bond with settlement in under 60 seconds.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_BONDS',
      source: 'Wall Street Journal',
      importance: 7.8,
      daysAgo: 12,
      topicNames: ['Tokenized Bonds', 'Exchange Infrastructure'],
      entityNames: ['Goldman Sachs'],
      tagSlugs: ['bonds', 'institutional', 'tokenization'],
      signal: [6.0, 8.0, 8.5, 8.0, 7.0, 5.0, 7.0, 4.5, 6.5],
    },
    {
      title: 'Hong Kong Virtual Asset Licensing Regime Enters Full Effect',
      headline: 'Hong Kong enforces mandatory licensing for crypto platforms',
      summary: 'Hong Kong\'s mandatory licensing regime for virtual asset trading platforms has entered full effect, with 11 platforms receiving licenses.',
      content: 'The Hong Kong Securities and Futures Commission has fully implemented its mandatory licensing regime for virtual asset trading platforms. Eleven platforms have received licenses to operate, with several additional applications under review.',
      type: 'REGULATOR_TRACKER',
      source: 'Reuters',
      importance: 7.5,
      daysAgo: 13,
      topicNames: ['Securities Regulation'],
      entityNames: ['Hong Kong Securities and Futures Commission'],
      tagSlugs: ['regulation', 'compliance'],
      signal: [9.0, 7.0, 6.0, 6.5, 7.0, 6.0, 5.5, 5.5, 7.0],
    },
    {
      title: 'Partior Cross-Border Payment Network Adds Deutsche Bank',
      headline: 'Deutsche Bank joins Partior blockchain payment network',
      summary: 'Deutsche Bank has joined the Partior blockchain-based cross-border payment network, expanding the consortium to six major banks.',
      content: 'Deutsche Bank has joined Partior, the blockchain-based cross-border payment and clearing network originally founded by DBS, JPMorgan, and Temasek. The addition brings the consortium to six major bank participants.',
      type: 'BRIEF',
      source: 'Bloomberg',
      importance: 7.2,
      daysAgo: 13,
      topicNames: ['Payment Infrastructure', 'Interoperability'],
      entityNames: ['Partior', 'Deutsche Bank', 'DBS Bank', 'JPMorgan Chase'],
      tagSlugs: ['payment-rails', 'cross-border', 'institutional', 'blockchain'],
      signal: [5.5, 7.0, 8.0, 8.0, 6.0, 7.5, 7.0, 4.0, 6.0],
    },
    {
      title: 'Securitize Receives SEC Approval for Tokenized Fund Transfer Agent Services',
      headline: 'Securitize gains SEC nod for expanded transfer agent role',
      summary: 'Securitize has received expanded SEC approval to serve as transfer agent for tokenized investment fund products.',
      content: 'Securitize has received approval from the SEC to expand its transfer agent registration to cover additional tokenized fund products. This enables the company to serve as the registered transfer agent for a broader range of tokenized funds, including those managed by BlackRock, Hamilton Lane, and KKR.',
      type: 'BRIEF',
      source: 'Ledger Insights',
      importance: 7.5,
      daysAgo: 14,
      topicNames: ['Securities Regulation', 'Tokenized Funds'],
      entityNames: ['Securitize', 'US Securities and Exchange Commission', 'BlackRock', 'Hamilton Lane', 'KKR'],
      tagSlugs: ['regulation', 'tokenization', 'funds'],
      signal: [8.0, 7.5, 8.0, 7.5, 6.0, 4.5, 6.5, 4.5, 6.5],
      eventFamily: 'sec-tokenized-framework',
    },
    {
      title: 'Fireblocks Adds Support for Tokenized Securities Custody',
      headline: 'Fireblocks expands to institutional tokenized securities custody',
      summary: 'Fireblocks has launched custody support for tokenized securities across five blockchain networks.',
      content: 'Fireblocks has expanded its digital asset custody platform to support tokenized securities across Ethereum, Polygon, Avalanche, Stellar, and Canton Network. Over 200 institutional clients can now custody tokenized equity, bond, and fund tokens through the platform.',
      type: 'BRIEF',
      source: 'The Block',
      importance: 7.0,
      daysAgo: 14,
      topicNames: ['Digital Custody'],
      entityNames: ['Fireblocks'],
      tagSlugs: ['custody', 'institutional', 'tokenization'],
      signal: [5.5, 7.0, 7.5, 8.0, 5.5, 5.0, 6.5, 4.0, 5.5],
    },
    {
      title: 'China Digital Yuan Pilot Expands to Cross-Border Trade Finance',
      headline: 'PBoC extends e-CNY to cross-border trade settlement',
      summary: 'China\'s central bank has expanded the digital yuan pilot to include cross-border trade finance settlement with Southeast Asian partners.',
      content: 'The People\'s Bank of China has expanded its e-CNY digital currency pilot to cross-border trade finance settlement, establishing bilateral CBDC payment corridors with Thailand, Malaysia, and Indonesia through the mBridge platform.\n\nThe expansion moves the digital yuan from its primarily domestic retail focus into the strategically critical domain of cross-border trade payments. Key features:\n\n• Trade invoice settlement in e-CNY between ASEAN exporters and Chinese importers\n• Real-time FX conversion at PBoC-posted rates via mBridge\n• Reduction in trade settlement time from 3-5 days (via correspondent banking) to under 10 minutes\n• Elimination of intermediary correspondent banks in USD-denominated trade finance\n\nThe geopolitical implications are significant. By enabling direct e-CNY settlement for ASEAN trade — which totals $900 billion annually — China is building an alternative to the US dollar-denominated trade finance system. The PBoC has not disclosed transaction volumes, but trade finance analysts estimate $5-10 billion has been settled through the corridor in the first quarter.\n\n"This is not about replacing the dollar," said PBoC Digital Currency Institute Director Mu Changchun. "It\'s about providing an efficient alternative for bilateral trade between willing partners."\n\nThe BIS mBridge platform, which facilitates the multi-CBDC connections, now involves 6 central banks and has been criticized by some Western officials as a mechanism to circumvent dollar-based sanctions infrastructure.',
      whatHappened: 'PBoC expanded e-CNY to cross-border trade finance with Thailand, Malaysia, and Indonesia via mBridge. Settlement is real-time (under 10 minutes vs. 3-5 days), with direct e-CNY invoicing eliminating USD correspondent banks. Estimated $5-10B settled in Q1.',
      whyItMatters: 'China is building a CBDC-based alternative to dollar-denominated trade finance for $900B in annual ASEAN trade. This is the most advanced deployment of cross-border CBDC for real commercial activity. It positions the digital yuan as a practical settlement currency for the world\'s largest trading region.',
      regulatoryImplications: 'The mBridge platform has drawn criticism from Western officials as potential sanctions circumvention infrastructure. The BIS\'s involvement creates diplomatic tension. For global CBDC governance, this raises the question of whether cross-border CBDC platforms need international oversight agreements.',
      type: 'BRIEF',
      assetClass: 'CBDC',
      source: 'Reuters',
      importance: 8.2,
      confidence: 82,
      daysAgo: 15,
      topicNames: ['Central Bank Digital Currencies', 'Payment Infrastructure'],
      entityNames: ['Peoples Bank of China'],
      tagSlugs: ['CBDC', 'cross-border', 'payment-rails'],
      signal: [8.0, 8.0, 7.0, 7.5, 7.0, 9.0, 6.5, 6.0, 7.0],
    },
    {
      title: 'Coinbase Prime Launches Tokenized Asset Custody for Institutions',
      headline: 'Coinbase expands institutional custody to tokenized securities',
      summary: 'Coinbase has launched tokenized asset custody services through its Prime brokerage platform.',
      content: 'Coinbase Prime has expanded its institutional custody platform to support tokenized securities, enabling clients to hold tokenized equity and bond tokens alongside crypto-native assets in a unified custody solution.',
      type: 'BRIEF',
      source: 'CoinDesk',
      importance: 7.0,
      daysAgo: 16,
      topicNames: ['Digital Custody'],
      entityNames: ['Coinbase'],
      tagSlugs: ['custody', 'institutional', 'tokenization'],
      signal: [6.0, 7.0, 7.0, 7.0, 6.5, 4.5, 6.0, 5.0, 5.5],
    },
    {
      title: 'IMF Publishes Global Stablecoin Regulatory Recommendations',
      headline: 'IMF calls for harmonized stablecoin regulation across jurisdictions',
      summary: 'The International Monetary Fund has published recommendations for global stablecoin regulation, urging harmonized standards.',
      content: 'The IMF has released a comprehensive policy paper recommending harmonized regulatory standards for stablecoins across jurisdictions. The recommendations address reserve requirements, redemption rights, and cross-border supervisory cooperation. The paper calls for stablecoin issuers to maintain 1:1 reserve backing with high quality liquid assets.',
      type: 'RESEARCH_ARTICLE',
      source: 'International Monetary Fund',
      importance: 8.0,
      daysAgo: 16,
      topicNames: ['Stablecoin Policy', 'Cross-Border Regulation'],
      entityNames: ['Circle', 'Tether'],
      tagSlugs: ['stablecoin', 'regulation', 'policy', 'cross-border'],
      signal: [9.0, 7.5, 6.0, 5.5, 7.0, 8.5, 5.5, 6.0, 6.5],
      eventFamily: 'us-stablecoin-legislation',
    },
    {
      title: 'Nasdaq Receives Approval for Digital Asset Custody Unit',
      headline: 'Nasdaq launches regulated digital asset custodian',
      summary: 'Nasdaq has received regulatory approval to launch a digital asset custody subsidiary.',
      content: 'Nasdaq has received approval from the New York Department of Financial Services to operate a digital asset custody business. The Nasdaq Digital Assets unit will offer institutional custody for Bitcoin, Ethereum, and tokenized securities.',
      type: 'BRIEF',
      source: 'Wall Street Journal',
      importance: 8.0,
      daysAgo: 17,
      topicNames: ['Digital Custody', 'Exchange Infrastructure'],
      entityNames: ['Nasdaq'],
      tagSlugs: ['custody', 'institutional'],
      signal: [7.0, 8.0, 8.5, 7.5, 7.5, 5.0, 6.5, 4.5, 7.0],
    },
    {
      title: 'Hamilton Lane Tokenizes $2B Private Equity Fund on Polygon',
      headline: 'Hamilton Lane brings institutional PE to blockchain via Securitize',
      summary: 'Hamilton Lane has tokenized access to a $2 billion private equity fund on Polygon through Securitize.',
      content: 'Hamilton Lane, one of the largest private markets firms, has tokenized access to its $2 billion Senior Credit Opportunities Fund on Polygon blockchain through Securitize. The minimum investment has been reduced from $5 million to $10,000 for accredited investors through tokenized feeder fund shares.',
      type: 'DEEP_DIVE',
      assetClass: 'TOKENIZED_ALTERNATIVES',
      source: 'Bloomberg',
      importance: 7.8,
      daysAgo: 18,
      topicNames: ['Tokenized Funds'],
      entityNames: ['Hamilton Lane', 'Securitize', 'Polygon Labs'],
      tagSlugs: ['private-markets', 'tokenization', 'funds', 'institutional'],
      signal: [5.5, 7.5, 8.0, 7.5, 7.0, 4.5, 7.5, 5.0, 6.0],
      eventFamily: 'tokenized-treasury-funds',
    },
    {
      title: 'Clearstream Launches Digital Post-Trade Platform for Tokenized Bonds',
      headline: 'Clearstream D7 platform goes live for digital bond settlement',
      summary: 'Clearstream has launched its D7 digital post-trade platform for automated settlement of tokenized bonds.',
      content: 'Clearstream has launched D7, its new digital post-trade platform enabling fully automated issuance and settlement of digital bonds. The platform supports same-day settlement and automated corporate actions processing for tokenized fixed income instruments.',
      type: 'INFRA_ANALYSIS',
      source: 'Asset Servicing Times',
      importance: 7.5,
      daysAgo: 19,
      topicNames: ['Digital Settlement', 'Tokenized Bonds'],
      entityNames: ['Clearstream', 'Deutsche Borse'],
      tagSlugs: ['settlement', 'infrastructure', 'bonds'],
      signal: [6.0, 7.5, 7.5, 8.5, 5.5, 5.5, 7.0, 3.5, 6.0],
    },
    {
      title: 'Standard Chartered Zodia Custody Expands to UAE and Japan',
      headline: 'StanChart digital custody arm enters Abu Dhabi and Tokyo',
      summary: 'Standard Chartered\'s digital asset custodian Zodia Custody has expanded operations to the UAE and Japan.',
      content: 'Zodia Custody, the digital asset custodian backed by Standard Chartered, has launched operations in Abu Dhabi (under ADGM regulation) and Tokyo, expanding its geographic footprint to nine markets.',
      type: 'BRIEF',
      source: 'Global Custodian',
      importance: 6.8,
      daysAgo: 19,
      topicNames: ['Digital Custody'],
      entityNames: ['Standard Chartered', 'Abu Dhabi Global Market'],
      tagSlugs: ['custody', 'institutional', 'cross-border'],
      signal: [6.5, 6.5, 7.0, 7.0, 5.0, 6.5, 5.5, 4.0, 5.5],
    },
    {
      title: 'ESMA Publishes MiCA Technical Standards for Crypto-Asset Service Providers',
      headline: 'EU finalizes detailed MiCA implementation rules',
      summary: 'The European Securities and Markets Authority has published the detailed technical standards for implementing MiCA regulation.',
      content: 'ESMA has published the Regulatory Technical Standards (RTS) implementing the Markets in Crypto-Assets (MiCA) regulation across the 27 EU member states — the most comprehensive crypto-asset regulatory framework in any major jurisdiction.\n\nThe technical standards cover:\n\n• Authorization requirements for Crypto-Asset Service Providers (CASPs) — including minimum capital, governance, and operational resilience standards\n• Prudential rules: CASPs must hold own funds equal to the higher of €150,000 or 25% of fixed overhead costs\n• Market abuse provisions: Insider trading and market manipulation rules apply to all crypto-assets traded on regulated venues\n• Asset-Referenced Token (ART) rules: Issuers of stablecoins pegged to non-euro currencies face additional reserve requirements\n• Sustainability disclosures: CASPs must disclose the environmental impact of their operations\n\nThe RTS provides the operational detail that CASPs need to comply with MiCA requirements. Over 50 firms have applied for CASP authorization, including Binance, Crypto.com, OKX, and several European banks.\n\nMiCA and the US Payment Stablecoin Act now create the two dominant regulatory frameworks for global crypto-asset markets.',
      whatHappened: 'ESMA published MiCA\'s Regulatory Technical Standards covering CASP authorization (min €150K capital), market abuse provisions, stablecoin reserve rules, and sustainability disclosures. Over 50 firms have applied for CASP authorization including Binance, Crypto.com, OKX, and European banks.',
      whyItMatters: 'MiCA is now fully operational with detailed technical standards. It creates the most comprehensive crypto regulatory framework in any major jurisdiction — and together with the US Stablecoin Act, defines the two dominant global standards that other jurisdictions will pattern their regulation after.',
      regulatoryImplications: 'The market abuse provisions are significant — for the first time, insider trading and manipulation rules for crypto-assets have specific enforcement mechanisms in a major jurisdiction. The sustainability disclosure requirement is a first of its kind and may prompt other regulators to follow.',
      type: 'REGULATOR_TRACKER',
      source: 'International Financial Law Review',
      importance: 8.0,
      confidence: 99,
      daysAgo: 20,
      topicNames: ['Securities Regulation', 'AML and Compliance'],
      entityNames: ['European Securities and Markets Authority'],
      tagSlugs: ['regulation', 'compliance', 'policy'],
      signal: [9.5, 8.0, 6.0, 6.5, 7.0, 7.5, 5.5, 5.5, 7.0],
    },
    {
      title: 'Citigroup Token Services Processes First Cross-Border Payment',
      headline: 'Citi tokenizes cross-border cash management for corporate client',
      summary: 'Citigroup has processed its first live cross-border payment using its Citi Token Services platform.',
      content: 'Citigroup has completed its first live cross-border payment using Citi Token Services, tokenizing deposits for a multinational corporate client. The payment was settled in minutes instead of the typical 24-48 hour timeframe for correspondent banking.',
      type: 'BRIEF',
      source: 'Bloomberg',
      importance: 7.5,
      daysAgo: 20,
      topicNames: ['Payment Infrastructure'],
      entityNames: ['Citigroup'],
      tagSlugs: ['payment-rails', 'cross-border', 'institutional'],
      signal: [5.5, 7.5, 8.0, 7.5, 6.0, 7.5, 7.0, 4.0, 6.0],
    },
    {
      title: 'HSBC Launches Tokenized Gold Product for Retail Investors',
      headline: 'HSBC brings tokenized gold to retail banking clients in Hong Kong',
      summary: 'HSBC has launched a tokenized gold product for retail investors in Hong Kong.',
      content: 'HSBC has introduced a tokenized gold investment product for retail banking clients in Hong Kong, allowing customers to purchase fractional ownership of gold bullion stored in HSBC vaults with blockchain-based ownership records.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_COMMODITIES',
      source: 'Financial Times',
      importance: 7.0,
      daysAgo: 21,
      topicNames: ['Tokenized Funds'],
      entityNames: ['HSBC', 'Hong Kong Monetary Authority'],
      tagSlugs: ['tokenization', 'retail'],
      signal: [5.5, 7.0, 7.0, 6.5, 7.5, 5.0, 6.0, 4.5, 5.5],
    },
    {
      title: 'Canton Network Completes Multi-Party Asset Exchange Test',
      headline: 'Canton Network tests atomic settlement across 15 institutions',
      summary: 'The Canton Network has completed a multi-party asset exchange test involving 15 financial institutions.',
      content: 'The Canton Network, a privacy-enabled blockchain for institutional financial use cases, has successfully completed a multi-party asset exchange involving 15 financial institutions. The test demonstrated atomic DvP settlement of tokenized assets with full privacy controls, meaning each party only saw transaction details relevant to them.',
      type: 'INFRA_ANALYSIS',
      source: 'Ledger Insights',
      importance: 7.5,
      daysAgo: 22,
      topicNames: ['Interoperability', 'Digital Settlement'],
      entityNames: ['Canton Network', 'Goldman Sachs'],
      tagSlugs: ['infrastructure', 'settlement', 'blockchain'],
      signal: [5.0, 7.0, 8.0, 8.5, 5.5, 5.5, 8.0, 4.0, 6.0],
    },
    {
      title: 'Fidelity Launches Ethereum Tokenized Money Market Fund',
      headline: 'Fidelity enters tokenized fund space with on-chain Treasury product',
      summary: 'Fidelity Investments has launched a tokenized money market fund on Ethereum.',
      content: 'Fidelity Investments has launched its first tokenized money market fund on the Ethereum blockchain, entering a market currently dominated by BlackRock\'s BUIDL and Franklin Templeton\'s FOBXX.\n\nThe Fidelity Tokenized Treasury Fund holds a diversified portfolio of short-term US Treasury securities and overnight reverse repurchase agreements, providing institutional investors with on-chain access to money market yields.\n\nKey differentiators from competing products:\n\n• Fidelity\'s custodial infrastructure — unlike BUIDL (Securitize custody) or FOBXX (third-party), Fidelity self-custodies the underlying assets through Fidelity Digital Assets\n• Lower minimum: $100,000 for institutional investors (BUIDL minimum is $5 million)\n• Multi-chain planned: Ethereum launch with Polygon and Avalanche support in Q3 2026\n• Integration with Fidelity\'s $4.5 trillion institutional platform for seamless fund-to-fund transfers\n\n"Tokenized money market funds are the entry point for institutional blockchain adoption," said Fidelity Digital Assets President Cynthia Lo Bessette. "Our clients are asking for on-chain Treasury exposure with the Fidelity name behind it."\n\nThe fund launched with $150 million in seed capital and Fidelity expects to reach $500 million within 12 months. The competitive landscape now has three major asset managers — BlackRock ($2B), Franklin Templeton ($400M), and Fidelity — competing for institutional tokenized Treasury assets.',
      whatHappened: 'Fidelity launched a tokenized money market fund on Ethereum with $150M seed capital, targeting $500M in 12 months. Key differentiator: Fidelity self-custodies through Fidelity Digital Assets, with lower $100K minimum and planned Polygon/Avalanche expansion.',
      whyItMatters: 'Fidelity\'s entry makes three of the five largest US asset managers active in tokenized funds (BlackRock, Franklin Templeton, Fidelity). This legitimizes tokenized Treasury products as mainstream institutional infrastructure rather than a niche experiment.',
      marketImplications: 'Competition drives down fees and minimums. The three-way race between BlackRock BUIDL ($2B), Franklin FOBXX ($400M), and Fidelity will accelerate institutional adoption. Total tokenized Treasury market is projected to reach $10B by end of 2026.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Wall Street Journal',
      importance: 8.0,
      confidence: 95,
      daysAgo: 22,
      topicNames: ['Tokenized Funds', 'Tokenized Treasuries'],
      entityNames: ['Fidelity Investments', 'Ethereum Foundation'],
      tagSlugs: ['tokenization', 'funds', 'treasuries'],
      signal: [6.0, 8.0, 8.5, 7.5, 7.5, 5.0, 6.5, 4.5, 7.0],
      eventFamily: 'tokenized-treasury-funds',
    },
    {
      title: 'OCC Clarifies National Banks Can Provide Digital Asset Custody',
      headline: 'OCC reaffirms banks can hold digital assets and stablecoins',
      summary: 'The OCC has issued updated guidance clarifying that national banks may provide custody services for digital assets.',
      content: 'The Office of the Comptroller of the Currency has issued interpretive guidance reaffirming that national banks and federal savings associations may provide custody services for digital assets, including tokenized securities and stablecoins, subject to appropriate risk management frameworks.',
      type: 'REGULATOR_TRACKER',
      source: 'Office of the Comptroller of the Currency',
      importance: 7.8,
      daysAgo: 23,
      topicNames: ['Securities Regulation', 'Digital Custody'],
      entityNames: ['Office of the Comptroller of the Currency', 'BNY Mellon', 'State Street'],
      tagSlugs: ['regulation', 'custody', 'policy'],
      signal: [9.0, 7.5, 7.5, 6.5, 6.0, 4.5, 5.5, 5.0, 6.5],
    },
    {
      title: 'Nomura Laser Digital Launches Institutional Ethereum Fund',
      headline: 'Nomura digital asset arm offers regulated ETH exposure',
      summary: 'Nomura\'s Laser Digital subsidiary has launched an institutional Ethereum fund for qualified investors.',
      content: 'Laser Digital, Nomura\'s digital asset subsidiary, has launched an institutional Ethereum investment fund regulated by the Abu Dhabi Global Market. The fund provides qualified investors with exposure to ETH through a regulated fund structure with institutional custody.',
      type: 'BRIEF',
      source: 'Nikkei Asia',
      importance: 6.8,
      daysAgo: 24,
      topicNames: ['Tokenized Funds'],
      entityNames: ['Nomura', 'Abu Dhabi Global Market'],
      tagSlugs: ['institutional', 'funds'],
      signal: [6.0, 6.5, 7.0, 6.0, 5.5, 5.0, 5.5, 5.0, 5.0],
    },
    {
      title: 'Reserve Bank of Australia Publishes CBDC Research Paper',
      headline: 'RBA explores wholesale CBDC design for Australian financial system',
      summary: 'The RBA has published research exploring wholesale CBDC design options for Australia.',
      content: 'The Reserve Bank of Australia has published a research paper exploring design options for a wholesale CBDC, examining how tokenized central bank money could enhance settlement efficiency in Australian financial markets.',
      type: 'RESEARCH_ARTICLE',
      assetClass: 'CBDC',
      source: 'Central Banking',
      importance: 7.2,
      daysAgo: 24,
      topicNames: ['Wholesale CBDC', 'Central Bank Digital Currencies'],
      entityNames: ['Reserve Bank of Australia'],
      tagSlugs: ['CBDC', 'central-bank', 'policy'],
      signal: [8.0, 6.5, 6.0, 6.5, 5.5, 5.0, 6.0, 3.5, 5.0],
    },
    {
      title: 'KKR Health Care Fund Now Accessible via Tokenized Shares',
      headline: 'KKR tokenizes PE healthcare fund access on Avalanche',
      summary: 'KKR has tokenized access to its healthcare fund on the Avalanche blockchain via Securitize.',
      content: 'KKR has made its Healthcare Strategic Growth Fund accessible through tokenized shares on the Avalanche blockchain, using Securitize as the transfer agent. The minimum investment has been reduced to $25,000, down from $1 million for traditional fund access.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_ALTERNATIVES',
      source: 'Bloomberg',
      importance: 7.0,
      daysAgo: 25,
      topicNames: ['Tokenized Funds'],
      entityNames: ['KKR', 'Securitize', 'Avalanche'],
      tagSlugs: ['private-markets', 'tokenization', 'funds'],
      signal: [5.0, 7.0, 7.5, 7.0, 6.5, 4.0, 7.0, 4.5, 5.5],
      eventFamily: 'tokenized-treasury-funds',
    },
    {
      title: 'SGX Tests Tokenized Bond Issuance and Settlement Platform',
      headline: 'Singapore Exchange pilots fixed income tokenization on DLT',
      summary: 'Singapore Exchange has piloted a tokenized bond issuance and settlement platform.',
      content: 'The Singapore Exchange has completed a pilot testing tokenized bond issuance and automated settlement on its distributed ledger platform. The pilot involved two issuer banks and demonstrated end-to-end bond lifecycle management on-chain.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_BONDS',
      source: 'Reuters',
      importance: 7.0,
      daysAgo: 26,
      topicNames: ['Tokenized Bonds', 'Exchange Infrastructure'],
      entityNames: ['Singapore Exchange', 'Monetary Authority of Singapore'],
      tagSlugs: ['bonds', 'tokenization', 'settlement'],
      signal: [6.5, 7.0, 7.0, 7.5, 5.5, 5.5, 6.5, 3.5, 5.5],
    },
    {
      title: 'Centrifuge Onboards Real-World Assets to MakerDAO Credit Facility',
      headline: 'Centrifuge channels $200M in RWA into DeFi lending via Maker',
      summary: 'Centrifuge has channeled $200 million in real-world assets into MakerDAO credit facilities.',
      content: 'Centrifuge has deployed over $200 million in tokenized real-world assets as collateral in MakerDAO credit facilities. The assets include trade receivables, real estate loans, and revenue-based financing, representing one of the largest integrations of real-world assets into DeFi lending protocols.',
      type: 'DEEP_DIVE',
      source: 'Blockworks',
      importance: 7.0,
      daysAgo: 27,
      topicNames: ['DeFi Regulation', 'Tokenized Real Estate'],
      entityNames: ['Centrifuge'],
      tagSlugs: ['DeFi', 'tokenization', 'liquidity'],
      signal: [5.0, 7.0, 5.5, 7.0, 6.5, 4.0, 7.5, 6.5, 5.5],
    },
    {
      title: 'BNY Mellon Digital Asset Custody Service Reaches 200 Institutional Clients',
      headline: 'BNY Mellon crypto custody scales to 200 institutions',
      summary: 'BNY Mellon reports 200 institutional clients using its digital asset custody platform.',
      content: 'BNY Mellon, the world\'s largest custodian bank, reports that its digital asset custody platform now serves over 200 institutional clients, custody assets including Bitcoin, Ethereum, and an expanding suite of tokenized securities.',
      type: 'BRIEF',
      source: 'Global Custodian',
      importance: 7.5,
      daysAgo: 28,
      topicNames: ['Digital Custody'],
      entityNames: ['BNY Mellon'],
      tagSlugs: ['custody', 'institutional'],
      signal: [5.0, 7.5, 8.5, 7.5, 5.5, 5.0, 5.5, 4.0, 5.5],
    },
    {
      title: 'Invesco Explores Tokenized ETF Products on Ethereum',
      headline: 'Invesco tests blockchain-native ETF structure',
      summary: 'Invesco is exploring the creation of tokenized ETF products using Ethereum blockchain infrastructure.',
      content: 'Invesco, one of the largest global ETF providers, is exploring the creation of blockchain-native ETF products on Ethereum. The initiative would allow investors to hold ETF units as tokens, enabling 24/7 trading and instant settlement.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Financial Times',
      importance: 7.0,
      daysAgo: 28,
      topicNames: ['Tokenized Funds', 'Tokenized Equities'],
      entityNames: ['Invesco', 'Ethereum Foundation'],
      tagSlugs: ['tokenization', 'funds', 'equities'],
      signal: [5.5, 7.0, 7.5, 6.5, 6.5, 4.0, 6.5, 4.5, 5.5],
    },
    {
      title: 'State Street Launches Digital Collateral Management Platform',
      headline: 'State Street enables real-time digital collateral mobilization',
      summary: 'State Street has launched a digital collateral management platform for institutional clients.',
      content: 'State Street has launched a digital collateral management platform enabling institutional clients to mobilize tokenized assets as collateral in real-time. The platform supports tokenized Treasury bills, money market fund shares, and other high-quality liquid assets.',
      type: 'INFRA_ANALYSIS',
      source: 'Securities Finance Times',
      importance: 7.5,
      daysAgo: 29,
      topicNames: ['Digital Custody', 'Digital Settlement'],
      entityNames: ['State Street'],
      tagSlugs: ['custody', 'institutional', 'infrastructure'],
      signal: [5.0, 7.5, 8.0, 8.0, 5.0, 5.0, 6.5, 3.5, 5.5],
    },
    {
      title: 'CFTC Proposes Rules for Tokenized Collateral in Derivatives Markets',
      headline: 'CFTC opens rulemaking on digital asset collateral for futures',
      summary: 'The CFTC has proposed rules allowing tokenized assets to be posted as collateral for derivatives positions.',
      content: 'The Commodity Futures Trading Commission has opened a rulemaking process to allow tokenized assets to be posted as collateral for futures and swaps positions — a decision that could unlock hundreds of billions in capital efficiency.\n\nThe proposed rule would expand eligible collateral beyond cash and traditional securities to include:\n\n• Tokenized US Treasury bills (e.g., BlackRock BUIDL, Franklin FOBXX, Ondo OUSG)\n• Regulated stablecoins (USDC, USDP) issued by federally licensed entities\n• Tokenized money market fund shares\n• Other tokenized high-quality liquid assets approved by clearing organizations\n\nThe CFTC estimates that allowing tokenized collateral could reduce margin posting costs by 15-25% for derivatives market participants. CME Group, which clears the majority of US futures, has expressed strong support and indicated it would accept tokenized Treasuries as initial margin within 12 months of final rule adoption.\n\n"Derivatives markets require the highest quality collateral with the fastest mobilization," said CFTC Chairman Rostin Behnam. "Tokenized assets are faster, more transparent, and potentially safer than traditional collateral — they settle atomically and can be verified in real-time."\n\nThe 90-day comment period will close in June 2026, with a final rule expected by Q4 2026.',
      whatHappened: 'CFTC proposed rules allowing tokenized Treasuries, regulated stablecoins, and tokenized MMF shares to be posted as collateral for futures and swaps. CME Group supports accepting tokenized Treasuries as initial margin. Comment period closes June 2026, final rule expected Q4 2026.',
      whyItMatters: 'Derivatives markets post $300B+ in margin collateral. Allowing tokenized assets as margin collateral is the single largest demand driver for tokenized Treasuries. It transforms tokenized funds from yield products into capital-efficient collateral — dramatically expanding their total addressable market.',
      regulatoryImplications: 'If the CFTC finalizes this rule, it creates the first federal regulatory treatment of tokenized assets as equivalent to traditional securities for collateral purposes. This precedent will pressure the SEC and Federal Reserve to issue similar guidance for securities lending and bank capital frameworks.',
      type: 'REGULATOR_TRACKER',
      source: 'Commodity Futures Trading Commission',
      importance: 8.0,
      confidence: 88,
      daysAgo: 30,
      topicNames: ['Securities Regulation', 'Clearing and Netting'],
      entityNames: ['Commodity Futures Trading Commission', 'CME Group'],
      tagSlugs: ['regulation', 'derivatives', 'compliance'],
      signal: [9.0, 8.0, 7.0, 7.0, 6.5, 5.0, 6.5, 5.0, 7.0],
    },
    // ═══════════════════════════════════════════════════════════
    // REPORTS — Institutional research pieces
    // ═══════════════════════════════════════════════════════════
    {
      title: 'Quarterly Assessment: Tokenized Treasury Market Reaches Inflection Point',
      headline: 'GMIIE Q1 2026 report — tokenized Treasury market surpasses $5B',
      dek: 'A comprehensive analysis of the tokenized government securities market as institutional participation reaches critical mass.',
      summary: 'The tokenized Treasury market has crossed $5 billion in total assets, growing 340% year-over-year. This quarterly assessment examines the competitive landscape among BlackRock, Franklin Templeton, and Fidelity; evaluates the infrastructure stack that has become the industry standard; and assesses the demand drivers — particularly the potential for tokenized Treasuries as derivatives collateral — that could push total assets to $15-20 billion by year-end.',
      content: 'The tokenized US Treasury market has entered a new phase. With total assets across all tokenized Treasury products exceeding $5 billion — up from $1.1 billion at the end of Q1 2025 — the market has moved from proof-of-concept to genuine institutional competition.\n\nThis report examines three critical developments:\n\n1. COMPETITIVE LANDSCAPE\n\nBlackRock\'s BUIDL fund dominates with approximately $2 billion (40% market share), followed by Franklin Templeton\'s FOBXX ($650 million), Ondo Finance\'s OUSG ($800 million across products), and the newly launched Fidelity tokenized Treasury fund ($180 million and growing rapidly).\n\nThe competitive dynamics are noteworthy. BUIDL benefits from BlackRock\'s brand and distribution network. FOBXX\'s multi-chain strategy (Polygon, Stellar, Avalanche) gives it the widest accessibility. Ondo\'s crypto-native distribution and DeFi composability attract a different client base. Fidelity\'s self-custody model through Fidelity Digital Assets appeals to institutions prioritizing custodial independence.\n\n2. INFRASTRUCTURE STANDARDIZATION\n\nA de facto technology stack has emerged: Ethereum as the primary settlement layer, Securitize as transfer agent, Circle\'s USDC as the on/off ramp, and major bank custodians (BNY Mellon, State Street) for asset administration. This standardization has reduced integration costs for subsequent entrants and created a predictable infrastructure layer.\n\nThe emergence of multi-chain deployment (Franklin Templeton on three chains, Ondo on five) suggests the market will not converge on a single blockchain. Instead, a hub-and-spoke model is developing with Ethereum as the primary settlement layer and L2s or alternative L1s providing specialized access.\n\n3. DEMAND DRIVERS\n\nThe most significant catalyst on the horizon is the CFTC\'s proposed rule allowing tokenized assets as derivatives collateral. If finalized, this would create structural demand for tokenized Treasuries from the $300+ billion derivatives margin pool. CME Group has signaled readiness to accept tokenized Treasuries as initial margin within 12 months of rule finalization.\n\nAdditional demand vectors include: institutional DeFi protocols under the MAS framework requiring high-quality collateral, cross-border settlement use cases, and corporate treasury management optimizing yield on idle cash.\n\nOUTLOOK\n\nWe project the tokenized Treasury market will reach $10-15 billion by year-end 2026, driven by new entrants (at least four additional major asset managers are expected to launch products), regulatory catalysts (CFTC collateral rule, SEC tokenized securities framework), and the natural growth of existing products.',
      whatHappened: 'The tokenized Treasury market crossed $5B in total assets — a 340% year-over-year increase. BlackRock BUIDL leads with ~$2B AUM (40% share), followed by Franklin Templeton FOBXX ($650M), Ondo products ($800M combined), and Fidelity ($180M and growing). A standardized infrastructure stack has emerged around Ethereum, Securitize, USDC, and institutional bank custody.',
      whyItMatters: 'The market has moved from proof-of-concept to genuine institutional competition. Five major financial institutions are now competing on tokenized Treasury products — something that was hypothetical 18 months ago. The infrastructure standardization reduces barriers for subsequent entrants, suggesting accelerating growth.',
      marketImplications: 'The CFTC proposed collateral rule is the single largest catalyst — if finalized, it creates structural demand from the $300B+ derivatives margin pool. Projected market size of $10-15B by year-end 2026. At least four additional major asset managers expected to launch competing products.',
      infraImplications: 'The Ethereum/Securitize/USDC/institutional custody stack has become the de facto standard. Multi-chain deployment is expanding addressability without fragmenting the market. The hub-and-spoke model (Ethereum primary, L2s/alt-L1s secondary) is likely to persist.',
      type: 'REPORT',
      assetClass: 'TOKENIZED_TREASURIES',
      source: 'Bloomberg',
      importance: 8.5,
      confidence: 88,
      daysAgo: 3,
      topicNames: ['Tokenized Treasuries', 'Tokenized Funds'],
      entityNames: ['BlackRock', 'Franklin Templeton', 'Fidelity Investments', 'Ondo Finance', 'Securitize'],
      tagSlugs: ['treasuries', 'tokenization', 'funds', 'institutional'],
      signal: [7.0, 8.0, 8.5, 8.0, 7.0, 5.5, 6.5, 6.0, 7.5],
    },
    {
      title: 'Infrastructure Report: The Emerging Stack for Institutional Digital Asset Settlement',
      headline: 'GMIIE infrastructure report — mapping the institutional settlement stack from custody to clearing',
      dek: 'An assessment of the post-trade technology infrastructure enabling institutional digital asset settlement, and the firms building it.',
      summary: 'This report maps the emerging institutional settlement stack for digital assets and tokenized securities. It identifies the key infrastructure layers — custody, clearing, settlement, and interoperability — and evaluates the competitive positioning of the firms building each layer. The analysis covers both incumbent infrastructure providers (DTCC, Euroclear, SWIFT) and challenger platforms (Fnality, Partior, Canton Network).',
      content: 'Institutional digital asset settlement requires infrastructure that meets the same reliability, regulatory compliance, and risk management standards as traditional post-trade systems. This report maps the four critical layers of the emerging settlement stack and evaluates the competitive landscape at each level.\n\n1. CUSTODY LAYER\n\nInstitutional custody for digital assets has matured significantly. Three models have emerged:\n\n• Bank custodians (BNY Mellon, State Street, Northern Trust): Leveraging existing custody relationships and regulatory licenses. BNY Mellon now serves 200+ institutional clients for digital asset custody.\n• Crypto-native custodians (Fireblocks, Anchorage Digital, Copper): Purpose-built infrastructure with multi-party computation (MPC) security. Fireblocks alone serves 1,800+ institutions.\n• Self-custody (Fidelity Digital Assets): Full vertical integration for asset managers who prefer custodial independence.\n\nThe custody layer is the most mature in the stack, with institutional-grade solutions available across all major jurisdictions.\n\n2. CLEARING AND SETTLEMENT LAYER\n\nThis is where the most significant transformation is occurring:\n\n• DTCC Ion: Permissioned blockchain for T+0 settlement of tokenized securities. Active pilot with JPMorgan, Citigroup, and BNY Mellon. Production launch anticipated.\n• SIX Digital Exchange: Fully regulated digital CSD with atomic DvP settlement. Already processing live institutional transactions.\n• Euroclear D-FMI: Digital financial market infrastructure platform testing tokenized bond settlement.\n• Clearstream D7: Digital post-trade platform for automated bond lifecycle management.\n\nThe settlement layer is bifurcating between incumbent FMI providers (DTCC, Euroclear, Clearstream) who are digitizing existing infrastructure, and greenfield platforms (SDX, Fnality) building natively on DLT.\n\n3. PAYMENT LAYER\n\nSettlement requires a reliable payment leg. Three approaches are competing:\n\n• Stablecoins (USDC, USDT, EURCV): Widely used for crypto-native settlement but carrying commercial bank credit risk.\n• Tokenized deposits: Bank-issued digital money (JPM Coin, others) backed by commercial bank deposits.\n• Tokenized central bank money: Fnality\'s Utility Settlement Coins backed by reserves at central banks — the highest-quality payment instrument possible.\n\n4. INTEROPERABILITY LAYER\n\n• SWIFT: Connecting 11,500+ institutions to tokenized asset platforms via existing message formats. The default gateway for banks lacking native blockchain connectivity.\n• Chainlink CCIP: Cross-chain interoperability protocol used by institutional and DeFi applications.\n• Canton Network: Privacy-enabled interoperability for institutional financial applications.\n\nOUTLOOK\n\nThe institutional settlement stack is converging around a modular architecture where each layer can be provided by different vendors. The most critical gap remains the payment leg — until tokenized central bank money (via Fnality or wholesale CBDCs) is widely available, the settlement stack relies on stablecoins or tokenized deposits that carry residual credit risk.',
      whatHappened: 'The institutional digital asset settlement stack has evolved into four distinct layers: custody (mature, multiple models), clearing/settlement (actively transforming), payment (competing approaches), and interoperability (SWIFT bridging old and new). This report maps the competitive landscape at each layer.',
      whyItMatters: 'Understanding the settlement stack is critical for institutional participants evaluating digital asset strategies. The stack is modular — firms can select different providers at each layer — but the competitive dynamics at each level will determine which platforms become dominant.',
      infraImplications: 'The custody layer is mature; the clearing/settlement layer is in active transformation driven by DTCC, SDX, and Clearstream; the payment layer remains the critical gap — stablecoins carry credit risk, and tokenized central bank money (Fnality) is not yet widely available; the interoperability layer depends on SWIFT as the default bridge.',
      type: 'REPORT',
      source: 'Financial Times',
      importance: 8.0,
      confidence: 91,
      daysAgo: 10,
      topicNames: ['Digital Settlement', 'Digital Custody', 'Interoperability'],
      entityNames: ['DTCC', 'SWIFT', 'BNY Mellon', 'Fnality International', 'Fireblocks'],
      tagSlugs: ['infrastructure', 'settlement', 'custody', 'institutional'],
      signal: [6.5, 7.0, 8.0, 9.0, 8.5, 5.5, 7.0, 5.0, 7.0],
    },
    {
      title: 'Regulatory Landscape: Global Approaches to Tokenized Asset Regulation in 2026',
      headline: 'GMIIE regulatory report — how five jurisdictions are shaping the rules for tokenized finance',
      dek: 'A comparative analysis of regulatory frameworks for tokenized securities across the US, EU, UK, Singapore, and Switzerland.',
      summary: 'This report provides a comparative analysis of regulatory approaches to tokenized assets across five key jurisdictions. It evaluates the substantive differences in how each jurisdiction treats securities tokenization, stablecoin issuance, digital custody, and institutional DeFi access — and assesses which frameworks are most conducive to institutional adoption.',
      content: 'The regulatory landscape for tokenized assets is crystallizing around distinct national approaches. This report compares the five most significant jurisdictions for institutional tokenized finance.\n\n1. UNITED STATES\n\nStatus: Most impactful but slowest to formalize. The US approach relies on guidance and enforcement rather than dedicated legislation.\n\n• SEC: Expected to publish comprehensive tokenized securities framework. Currently relies on existing securities law (Securities Act 1933, Exchange Act 1934) with staff guidance for digital assets.\n• CFTC: Proposed rule for tokenized derivatives collateral. More progressive than SEC on allowing digital asset innovation within existing frameworks.\n• OCC: Confirmed national banks can provide digital asset custody. Clarity for bank participation.\n• Stablecoin Act: Advancing through Congress; would establish first federal stablecoin licensing framework.\n\nAssessment: High impact, moderate clarity. The US market is too large to ignore, but regulatory fragmentation between SEC, CFTC, and banking regulators creates compliance complexity.\n\n2. EUROPEAN UNION — MiCA\n\nStatus: Most comprehensive dedicated framework. MiCA is fully operational with detailed RTS published by ESMA.\n\n• Crypto-Asset Service Provider (CASP) licensing with minimum capital requirements.\n• Stablecoin (Asset-Referenced Token) specific reserve and redemption rules.\n• Market abuse provisions for the first time in any major jurisdiction.\n• Limitation: MiCA does not cover tokenized securities that qualify as MiFID instruments — creating a gap for tokenized bonds and equities.\n\nAssessment: High clarity, moderate flexibility. MiCA provides the most predictable regulatory environment but its rigidity may limit innovation relative to sandbox-based approaches.\n\n3. UNITED KINGDOM\n\nStatus: Post-Brexit flexibility enabling competitive positioning. The Digital Securities Sandbox (DSS) is the most significant initiative.\n\n• FCA Digital Securities Sandbox: 5-year program with relaxed requirements for tokenized securities issuance, trading, and settlement.\n• Ability to combine trading venue and CSD functions on a single platform — not permitted in the EU.\n• 40+ sandbox applications received.\n\nAssessment: High flexibility, emerging clarity. The UK is positioning as a more innovation-friendly alternative to the EU for tokenized securities, but the sandbox approach means rules are temporary.\n\n4. SINGAPORE\n\nStatus: Most progressive approach to institutional DeFi. Project Guardian framework is a global first.\n\n• MAS regulatory sandbox for institutional DeFi access with full KYC/AML requirements.\n• Licensed institutions (DBS, JPMorgan Singapore, StanChart, HSBC) can access approved DeFi protocols.\n• Clear distinction between permissioned and permissionless DeFi.\n\nAssessment: Highest innovation, selective scope. Singapore\'s approach works for institutional participants but doesn\'t address retail market access.\n\n5. SWITZERLAND\n\nStatus: Most mature framework. DLT Act (2021) created legal certainty early.\n\n• SIX Digital Exchange: Fully regulated digital CSD and exchange operating since 2021.\n• FINMA: Progressive token classification and licensing framework.\n• UBS, SocGen, and other major institutions actively issuing digital bonds on SDX.\n\nAssessment: Highest maturity, smaller market. Switzerland\'s framework is the most battle-tested but the domestic market is small — its importance is as a template and a venue for cross-border institutional products.\n\nCOMPARATIVE MATRIX\n\n| Criterion | US | EU | UK | SG | CH |\n|---|---|---|---|---|---|\n| Clarity | ◐ | ● | ◑ | ● | ● |\n| Flexibility | ◑ | ◑ | ● | ● | ◐ |\n| Market impact | ● | ● | ◐ | ◑ | ◑ |\n| Institutional readiness | ◐ | ● | ◑ | ● | ● |\n| Innovation support | ◑ | ◑ | ● | ● | ● |\n\n(● = strong, ◐ = moderate, ◑ = emerging)\n\nOUTLOOK\n\nWe expect regulatory convergence over the next 18 months, driven by (1) the need for cross-border recognition of tokenized instruments, (2) competitive pressure between jurisdictions, and (3) G20/FSB coordination on global standards. The jurisdictions that provide both clarity and flexibility will attract the most institutional capital.',
      whatHappened: 'This report compares tokenized asset regulation across five jurisdictions: US (impactful but fragmented), EU/MiCA (comprehensive but rigid), UK/DSS (flexible sandbox), Singapore/Project Guardian (progressive on DeFi), and Switzerland (most mature). Each takes a distinct approach reflecting different priorities around investor protection, innovation, and competitive positioning.',
      whyItMatters: 'Institutional participants operating across jurisdictions face a patchwork of frameworks. Understanding the comparative strengths and limitations of each regulatory approach is essential for compliance strategy, market entry decisions, and product design.',
      regulatoryImplications: 'Regulatory convergence is expected over 18 months driven by cross-border recognition needs and G20/FSB coordination. The EU and Switzerland have the clearest existing frameworks. The US has the highest impact but lowest current clarity. Singapore leads on institutional DeFi. The UK is using post-Brexit flexibility for competitive positioning.',
      type: 'REPORT',
      source: 'Financial Times',
      importance: 8.5,
      confidence: 87,
      daysAgo: 14,
      topicNames: ['Securities Regulation', 'Cross-Border Regulation'],
      entityNames: ['US Securities and Exchange Commission', 'European Securities and Markets Authority', 'Financial Conduct Authority', 'Monetary Authority of Singapore', 'Swiss Financial Market Supervisory Authority'],
      tagSlugs: ['regulation', 'compliance', 'policy', 'cross-border'],
      signal: [8.5, 9.0, 7.0, 6.5, 6.0, 8.0, 8.5, 4.5, 7.0],
    },
  ];

  // Signal dimension order for array mapping
  const signalKeys = [
    'institutionalAdoption',
    'regulatoryClarity',
    'marketReadiness',
    'infrastructureMaturity',
    'settlementImpact',
    'complianceIntensity',
    'crossBorderRelevance',
    'liquiditySignificance',
    'strategicUrgency',
  ] as const;

  for (const a of articlesData) {
    const sourceId = sources[a.source];
    const articleSlug = slug(a.title);
    const canonicalHash = hash(a.title, a.source);

    try {
    // Create article
    const article = await prisma.article.upsert({
      where: { slug: articleSlug },
      update: {},
      create: {
        slug: articleSlug,
        canonicalHash,
        title: a.title,
        headline: a.headline,
        dek: a.dek || null,
        executiveSummary: a.summary,
        content: a.content,
        whatHappened: a.whatHappened || null,
        whyItMatters: a.whyItMatters || null,
        marketImplications: a.marketImplications || null,
        infraImplications: a.infraImplications || null,
        regulatoryImplications: a.regulatoryImplications || null,
        articleType: a.type as any,
        assetClass: (a.assetClass as any) || null,
        status: 'PUBLISHED',
        importanceScore: a.importance,
        confidenceScore: a.confidence ?? randomFloat(70, 95),
        sentimentScore: randomFloat(4, 8),
        eventFamily: a.eventFamily || null,
        sourceId: sourceId || null,
        authorId: author.id,
        publishedAt: daysAgo(a.daysAgo),
        sourcePublishedAt: daysAgo(a.daysAgo),
      },
    });

    // Create signal
    const signalData: Record<string, number> = {};
    a.signal.forEach((score, i) => {
      // Scale 1-10 to 0-100
      signalData[signalKeys[i]] = score * 10;
    });
    const overall =
      a.signal.reduce((sum, s) => sum + s, 0) / a.signal.length;

    await prisma.signal.create({
      data: {
        articleId: article.id,
        ...signalData,
        overallScore: Math.round(overall * 10),
        generatedAt: daysAgo(a.daysAgo),
      },
    });

    // Link topics
    for (const topicName of a.topicNames) {
      const topicId = topics[topicName];
      if (topicId) {
        await prisma.articleTopic.upsert({
          where: { articleId_topicId: { articleId: article.id, topicId } },
          update: {},
          create: {
            articleId: article.id,
            topicId,
            relevance: randomFloat(0.7, 1.0),
          },
        });
      }
    }

    // Link entities
    for (const entityName of a.entityNames) {
      const entityId = entities[entityName];
      if (entityId) {
        await prisma.articleEntity.upsert({
          where: {
            articleId_entityId: { articleId: article.id, entityId },
          },
          update: {},
          create: {
            articleId: article.id,
            entityId,
            role: a.entityNames.indexOf(entityName) === 0 ? 'subject' : 'mentioned',
          },
        });
      }
    }

    // Link tags
    for (const tagSlug of a.tagSlugs) {
      const tagId = tags[tagSlug];
      if (tagId) {
        await prisma.articleTag.upsert({
          where: { articleId_tagId: { articleId: article.id, tagId } },
          update: {},
          create: { articleId: article.id, tagId },
        });
      }
    }
    } catch (err) {
      console.error(`  ⚠ Failed to create article: "${a.title}"`);
      console.error(`    Error:`, err instanceof Error ? err.message : err);
    }
  }

  // ─── TIMELINE EVENTS (40) ───────────────────────────
  console.log('  Creating 40 timeline events...');
  const timelineData: Array<{
    entityName: string;
    title: string;
    description: string;
    date: Date;
  }> = [
    { entityName: 'BlackRock', title: 'BUIDL tokenized fund crosses $2B AUM', description: 'BlackRock BUIDL fund reaches $2 billion in tokenized assets under management.', date: daysAgo(1) },
    { entityName: 'US Securities and Exchange Commission', title: 'SEC expected to issue tokenized securities framework', description: 'SEC reportedly finalizing comprehensive guidance on classification of tokenized financial instruments under existing federal law.', date: daysAgo(2) },
    { entityName: 'DTCC', title: 'DTCC advances T+0 settlement testing', description: 'DTCC expands Project Ion testing of same-day settlement with major financial institutions.', date: daysAgo(3) },
    { entityName: 'European Central Bank', title: 'ECB advances digital euro pilot phase', description: 'ECB selects five technology partners for expanded digital euro testing.', date: daysAgo(3) },
    { entityName: 'MUFG', title: 'MUFG launches $500M tokenized real estate security', description: 'Largest tokenized real estate issuance in Asia-Pacific on Progmat platform.', date: daysAgo(4) },
    { entityName: 'Kraken', title: 'Kraken launches xStocks tokenized equity platform', description: 'Crypto exchange debuts tokenized trading of 50+ US-listed equities.', date: daysAgo(4) },
    { entityName: 'Northern Trust', title: 'Northern Trust tokenizes MMF on Polygon', description: 'Institutional custodian launches tokenized money market fund on Polygon.', date: daysAgo(5) },
    { entityName: 'Bank for International Settlements', title: 'BIS advances Project Agor testing with 7 central banks', description: 'Wholesale CBDC cross-border settlement pilot enters expanded testing phase with 7 central banks.', date: daysAgo(5) },
    { entityName: 'Franklin Templeton', title: 'FOBXX expands to Stellar and Avalanche', description: 'Multi-chain deployment of tokenized government money fund.', date: daysAgo(6) },
    { entityName: 'Monetary Authority of Singapore', title: 'MAS launches institutional DeFi framework', description: 'Regulatory sandbox for institutional participation in DeFi.', date: daysAgo(6) },
    { entityName: 'UBS', title: 'UBS expands digital bond program on SDX', description: 'Cumulative digital bond issuance reaches CHF 375M on regulated Swiss exchange.', date: daysAgo(7) },
    { entityName: 'Societe Generale', title: 'SG-FORGE issues EUR 10M green digital bond', description: 'Green bond issued on public Ethereum with stablecoin settlement.', date: daysAgo(7) },
    { entityName: 'Broadridge Financial Solutions', title: 'Broadridge DLT repo platform continues scaling', description: 'Distributed ledger repo platform grows beyond $1 trillion cumulative with expanding monthly volumes.', date: daysAgo(8) },
    { entityName: 'Financial Conduct Authority', title: 'FCA publishes Digital Securities Sandbox rules', description: 'UK regulator finalizes sandbox for tokenized securities.', date: daysAgo(8) },
    { entityName: 'SWIFT', title: 'SWIFT connects to 6 tokenization platforms', description: 'Bridges traditional messaging to tokenized asset networks.', date: daysAgo(9) },
    { entityName: 'DBS Bank', title: 'DBS digital exchange crosses $1B quarterly volume', description: 'Institutional digital exchange reaches trading milestone.', date: daysAgo(9) },
    { entityName: 'Ondo Finance', title: 'Ondo treasury products reach $800M TVL', description: 'OUSG and USDY cross $800M in tokenized Treasury value.', date: daysAgo(10) },
    { entityName: 'Circle', title: 'USDC reaches $45B market cap', description: 'Institutional adoption drives USDC to highest level since 2022.', date: daysAgo(10) },
    { entityName: 'Fnality International', title: 'Fnality enters operational phase for wholesale payments', description: 'Wholesale digital payment platform using tokenized central bank reserves enters live operations.', date: daysAgo(11) },
    { entityName: 'Euroclear', title: 'Euroclear and World Bank test tokenized bond settlement', description: 'DLT-based bond settlement with atomic DvP demonstrated.', date: daysAgo(12) },
    { entityName: 'Goldman Sachs', title: 'GS DAP processes first client trade', description: 'Goldman Sachs digital asset platform completes first tokenized bond trade.', date: daysAgo(12) },
    { entityName: 'Hong Kong Securities and Futures Commission', title: 'HK virtual asset licensing enters full effect', description: 'Mandatory licensing regime implemented with 11 licensed platforms.', date: daysAgo(13) },
    { entityName: 'Partior', title: 'Deutsche Bank joins Partior network', description: 'Cross-border blockchain payment network expands to six banks.', date: daysAgo(13) },
    { entityName: 'Securitize', title: 'Securitize receives expanded SEC transfer agent approval', description: 'Expanded registration for broader tokenized fund services.', date: daysAgo(14) },
    { entityName: 'Fireblocks', title: 'Fireblocks adds tokenized securities custody', description: 'Digital asset custody expands to tokenized securities on 5 chains.', date: daysAgo(14) },
    { entityName: 'Peoples Bank of China', title: 'e-CNY pilot expands to cross-border trade', description: 'Digital yuan settlement extended to Southeast Asian trade finance.', date: daysAgo(15) },
    { entityName: 'Coinbase', title: 'Coinbase Prime adds tokenized asset custody', description: 'Institutional custody expands to tokenized securities.', date: daysAgo(16) },
    { entityName: 'Nasdaq', title: 'Nasdaq receives digital asset custody approval', description: 'NYDFS approves Nasdaq Digital Assets custody unit.', date: daysAgo(17) },
    { entityName: 'Hamilton Lane', title: 'Hamilton Lane tokenizes $2B PE fund on Polygon', description: 'Private equity access lowered to $10K through tokenization.', date: daysAgo(18) },
    { entityName: 'Clearstream', title: 'Clearstream launches D7 digital post-trade platform', description: 'Automated tokenized bond settlement platform goes live.', date: daysAgo(19) },
    { entityName: 'Standard Chartered', title: 'Zodia Custody expands to UAE and Japan', description: 'Digital asset custody operations launch in Abu Dhabi and Tokyo.', date: daysAgo(19) },
    { entityName: 'European Securities and Markets Authority', title: 'ESMA publishes MiCA technical standards', description: 'Detailed implementation rules for EU crypto regulation.', date: daysAgo(20) },
    { entityName: 'Citigroup', title: 'Citi Token Services processes first cross-border payment', description: 'Tokenized deposit settlement for corporate treasury in minutes.', date: daysAgo(20) },
    { entityName: 'HSBC', title: 'HSBC launches tokenized gold for retail clients', description: 'Fractional gold ownership via blockchain in Hong Kong.', date: daysAgo(21) },
    { entityName: 'Canton Network', title: 'Canton Network completes 15-institution test', description: 'Multi-party atomic settlement with privacy controls demonstrated.', date: daysAgo(22) },
    { entityName: 'Fidelity Investments', title: 'Fidelity launches tokenized money market fund', description: 'Ethereum-based tokenized Treasury fund for institutions.', date: daysAgo(22) },
    { entityName: 'Office of the Comptroller of the Currency', title: 'OCC clarifies bank digital asset custody rights', description: 'Updated guidance affirming bank authority for digital custody.', date: daysAgo(23) },
    { entityName: 'Nomura', title: 'Laser Digital launches institutional Ethereum fund', description: 'Regulated ETH exposure via ADGM-licensed fund.', date: daysAgo(24) },
    { entityName: 'Reserve Bank of Australia', title: 'RBA publishes wholesale CBDC research', description: 'Research paper explores CBDC design for Australian markets.', date: daysAgo(24) },
    { entityName: 'Commodity Futures Trading Commission', title: 'CFTC proposes tokenized collateral rules', description: 'Rulemaking opened for digital assets as derivatives collateral.', date: daysAgo(30) },
  ];

  for (const t of timelineData) {
    const entityId = entities[t.entityName];
    if (entityId) {
      await prisma.timelineEvent.create({
        data: {
          entityId,
          title: t.title,
          description: t.description,
          date: t.date,
        },
      });
    }
  }

  // ─── ENTITY-TOPIC ASSOCIATIONS ──────────────────────
  console.log('  Creating entity-topic associations...');
  const entityTopicLinks: Array<[string, string]> = [
    ['BlackRock', 'Tokenized Funds'],
    ['BlackRock', 'Tokenized Treasuries'],
    ['Securitize', 'Tokenized Funds'],
    ['Securitize', 'Securities Regulation'],
    ['US Securities and Exchange Commission', 'Securities Regulation'],
    ['Commodity Futures Trading Commission', 'Securities Regulation'],
    ['Federal Reserve System', 'Central Bank Digital Currencies'],
    ['European Central Bank', 'Central Bank Digital Currencies'],
    ['Bank of Japan', 'Central Bank Digital Currencies'],
    ['Peoples Bank of China', 'Central Bank Digital Currencies'],
    ['DTCC', 'Digital Settlement'],
    ['DTCC', 'Clearing and Netting'],
    ['Euroclear', 'Digital Settlement'],
    ['Clearstream', 'Digital Settlement'],
    ['SWIFT', 'Interoperability'],
    ['SWIFT', 'Payment Infrastructure'],
    ['JPMorgan Chase', 'Digital Settlement'],
    ['JPMorgan Chase', 'Payment Infrastructure'],
    ['Goldman Sachs', 'Tokenized Bonds'],
    ['Citigroup', 'Payment Infrastructure'],
    ['MUFG', 'Tokenized Real Estate'],
    ['UBS', 'Tokenized Bonds'],
    ['Societe Generale', 'Tokenized Bonds'],
    ['BNY Mellon', 'Digital Custody'],
    ['Northern Trust', 'Digital Custody'],
    ['Northern Trust', 'Tokenized Funds'],
    ['State Street', 'Digital Custody'],
    ['Franklin Templeton', 'Tokenized Funds'],
    ['Fidelity Investments', 'Tokenized Funds'],
    ['Circle', 'Stablecoins'],
    ['Circle', 'Payment Infrastructure'],
    ['Monetary Authority of Singapore', 'DeFi Regulation'],
    ['Financial Conduct Authority', 'Securities Regulation'],
    ['European Securities and Markets Authority', 'Securities Regulation'],
    ['Kraken', 'Tokenized Equities'],
    ['Kraken', 'Exchange Infrastructure'],
    ['Coinbase', 'Digital Custody'],
    ['Nasdaq', 'Digital Custody'],
    ['Nasdaq', 'Exchange Infrastructure'],
    ['Ondo Finance', 'Tokenized Treasuries'],
    ['Fnality International', 'Wholesale CBDC'],
    ['Fnality International', 'Payment Infrastructure'],
    ['Partior', 'Payment Infrastructure'],
    ['Canton Network', 'Interoperability'],
    ['Fireblocks', 'Digital Custody'],
    ['Hamilton Lane', 'Tokenized Funds'],
    ['KKR', 'Tokenized Funds'],
    ['Bank for International Settlements', 'Wholesale CBDC'],
    ['Broadridge Financial Solutions', 'Digital Settlement'],
    ['SIX Digital Exchange', 'Exchange Infrastructure'],
  ];

  for (const [entityName, topicName] of entityTopicLinks) {
    const entityId = entities[entityName];
    const topicId = topics[topicName];
    if (entityId && topicId) {
      await prisma.entityTopic.upsert({
        where: { entityId_topicId: { entityId, topicId } },
        update: {},
        create: { entityId, topicId },
      });
    }
  }

  // ─── STATE STABLECOIN TRACKER ────────────────────────
  console.log('  Creating state stablecoin tracker data...');

  // -- Florida --
  const florida = await prisma.trackedState.create({
    data: {
      name: 'Florida',
      slug: 'florida',
      abbreviation: 'FL',
      status: 'PASSED_LEGISLATURE',
      summary: 'Florida\'s legislature has passed a comprehensive payment stablecoin framework through both chambers. The bills establish licensing requirements, reserve-backing standards, and consumer protection provisions for stablecoin issuers operating in the state.',
      whyItMatters: 'Florida is the third-largest US state by population and a major financial-services hub. Legislative action here signals growing state-level momentum for stablecoin regulation independent of federal efforts, and creates a potential model for other states.',
      nextExpectedStep: 'Enrollment and governor action expected within 30 days',
      lastActionDate: daysAgo(3),
    },
  });

  const flBillHB175 = await prisma.bill.create({
    data: {
      stateId: florida.id,
      billNumber: 'HB 175',
      title: 'Florida Digital Assets Act — Payment Stablecoin Framework',
      summary: 'Establishes a licensing and regulatory framework for payment stablecoin issuers in Florida, including reserve requirements, consumer disclosure obligations, and examination authority for the Office of Financial Regulation.',
      whatChanged: 'House and Senate approved payment stablecoin framework with broad bipartisan support. The bill passed the House 98-18 and the Senate 32-7.',
      whyItMatters: 'Creates one of the most comprehensive state-level stablecoin frameworks in the US, potentially attracting issuers seeking regulatory clarity before federal legislation is finalized.',
      status: 'PASSED_LEGISLATURE',
      chamber: 'HOUSE',
      sponsorName: 'Rep. James Buchanan',
      sourceUrl: 'https://myfloridahouse.gov/Sections/Bills/billsdetail.aspx?BillId=78901',
      confidenceScore: 88,
      credibilityTier: 'TIER_1',
      introducedDate: daysAgo(120),
      lastActionDate: daysAgo(3),
    },
  });

  await prisma.billUpdate.createMany({
    data: [
      { billId: flBillHB175.id, title: 'Bill introduced in Florida House', description: 'HB 175 filed by Rep. James Buchanan, referred to Commerce Committee.', status: 'INTRODUCED', date: daysAgo(120), sourceUrl: 'https://myfloridahouse.gov' },
      { billId: flBillHB175.id, title: 'Commerce Committee hearing scheduled', description: 'HB 175 placed on Commerce Committee agenda for testimony and vote.', status: 'IN_COMMITTEE', date: daysAgo(90), sourceUrl: 'https://myfloridahouse.gov' },
      { billId: flBillHB175.id, title: 'Advances from Commerce Committee', description: 'Committee voted 12-3 to advance HB 175 with minor amendments to reserve requirements.', status: 'ADVANCED_FROM_COMMITTEE', date: daysAgo(60), sourceUrl: 'https://myfloridahouse.gov' },
      { billId: flBillHB175.id, title: 'Passes Florida House 98-18', description: 'Full House approved HB 175 with strong bipartisan support.', status: 'PASSED_CHAMBER', date: daysAgo(30), sourceUrl: 'https://myfloridahouse.gov' },
      { billId: flBillHB175.id, title: 'Passes Florida Senate 32-7', description: 'Senate companion cleared final vote. Bill now heads to governor for signature.', status: 'PASSED_LEGISLATURE', date: daysAgo(3), sourceUrl: 'https://flsenate.gov' },
    ],
  });

  const flBillSB1568 = await prisma.bill.create({
    data: {
      stateId: florida.id,
      billNumber: 'SB 1568',
      title: 'Senate Companion — Payment Stablecoin Framework',
      summary: 'Senate companion to HB 175. Mirrors House version with identical licensing standards and reserve requirements for payment stablecoin issuers.',
      whatChanged: 'Senate companion tracked House bill and passed with conforming amendments.',
      whyItMatters: 'Ensures legislative alignment between chambers, reducing conference risk and accelerating path to governor\'s desk.',
      status: 'PASSED_LEGISLATURE',
      chamber: 'SENATE',
      sponsorName: 'Sen. Ana Maria Rodriguez',
      sourceUrl: 'https://flsenate.gov/Session/Bill/2026/1568',
      confidenceScore: 88,
      credibilityTier: 'TIER_1',
      introducedDate: daysAgo(110),
      lastActionDate: daysAgo(3),
    },
  });

  await prisma.billUpdate.createMany({
    data: [
      { billId: flBillSB1568.id, title: 'Senate companion filed', description: 'SB 1568 filed as Senate companion to HB 175.', status: 'INTRODUCED', date: daysAgo(110), sourceUrl: 'https://flsenate.gov' },
      { billId: flBillSB1568.id, title: 'Senate Banking Committee approval', description: 'SB 1568 advanced from Banking & Insurance Committee.', status: 'ADVANCED_FROM_COMMITTEE', date: daysAgo(55), sourceUrl: 'https://flsenate.gov' },
      { billId: flBillSB1568.id, title: 'Passes Senate 32-7', description: 'Senate approved SB 1568, conforming to House-passed version.', status: 'PASSED_LEGISLATURE', date: daysAgo(3), sourceUrl: 'https://flsenate.gov' },
    ],
  });

  await prisma.stateUpdate.createMany({
    data: [
      { stateId: florida.id, title: 'Governor\'s office acknowledges receipt', description: 'Florida Governor\'s office confirmed enrolled bill received for review. No public timeline for signing.', category: 'executive', date: daysAgo(2), sourceUrl: 'https://flgov.com' },
      { stateId: florida.id, title: 'OFR begins implementation planning', description: 'Florida Office of Financial Regulation announced internal working group to prepare licensing infrastructure pending governor signature.', category: 'implementation', date: daysAgo(1), sourceUrl: 'https://flofr.gov' },
    ],
  });

  // -- Wyoming --
  const wyoming = await prisma.trackedState.create({
    data: {
      name: 'Wyoming',
      slug: 'wyoming',
      abbreviation: 'WY',
      status: 'SIGNED_INTO_LAW',
      summary: 'Wyoming signed the Wyoming Stable Token Act into law, creating a state-issued stablecoin backed by US Treasury instruments. The state is now in the implementation phase, with the Wyoming Stable Token Commission overseeing deployment.',
      whyItMatters: 'Wyoming is the first US state to authorize a state-issued stablecoin. The Wyoming Stable Token would be a government-backed digital dollar alternative, raising novel questions about state monetary instruments and federal preemption.',
      nextExpectedStep: 'Token Commission to publish implementation roadmap and select technology partners',
      lastActionDate: daysAgo(45),
    },
  });

  const wyBillSF0086 = await prisma.bill.create({
    data: {
      stateId: wyoming.id,
      billNumber: 'SF 0086',
      title: 'Wyoming Stable Token Act',
      summary: 'Authorizes the Wyoming Stable Token Commission to issue a state-backed stablecoin fully collateralized by US Treasury instruments, with transparency and audit requirements.',
      whatChanged: 'Governor signed into law. Wyoming becomes first state to authorize a state-issued stablecoin.',
      whyItMatters: 'Establishes an unprecedented model: a government-issued stablecoin at the state level. Could influence other states and the federal stablecoin debate.',
      status: 'SIGNED',
      chamber: 'SENATE',
      sponsorName: 'Sen. Chris Rothfuss',
      sourceUrl: 'https://wyoleg.gov/Legislation/2025/SF0086',
      confidenceScore: 95,
      credibilityTier: 'TIER_1',
      introducedDate: daysAgo(200),
      lastActionDate: daysAgo(45),
    },
  });

  await prisma.billUpdate.createMany({
    data: [
      { billId: wyBillSF0086.id, title: 'SF 0086 introduced', description: 'Wyoming Stable Token Act introduced in Senate.', status: 'INTRODUCED', date: daysAgo(200), sourceUrl: 'https://wyoleg.gov' },
      { billId: wyBillSF0086.id, title: 'Senate Minerals Committee approval', description: 'Committee voted 4-1 to advance the bill.', status: 'ADVANCED_FROM_COMMITTEE', date: daysAgo(170), sourceUrl: 'https://wyoleg.gov' },
      { billId: wyBillSF0086.id, title: 'Passes Wyoming Senate', description: 'Senate approved SF 0086 on third reading.', status: 'PASSED_CHAMBER', date: daysAgo(140), sourceUrl: 'https://wyoleg.gov' },
      { billId: wyBillSF0086.id, title: 'Passes Wyoming House', description: 'House concurred with Senate version, clearing final legislative hurdle.', status: 'PASSED_LEGISLATURE', date: daysAgo(80), sourceUrl: 'https://wyoleg.gov' },
      { billId: wyBillSF0086.id, title: 'Governor signs into law', description: 'Governor Mark Gordon signed SF 0086, making Wyoming first state to authorize a state-issued stablecoin.', status: 'SIGNED', date: daysAgo(45), sourceUrl: 'https://governor.wyo.gov' },
    ],
  });

  await prisma.stateUpdate.createMany({
    data: [
      { stateId: wyoming.id, title: 'Stable Token Commission established', description: 'Governor appointed initial commissioners to the Wyoming Stable Token Commission per the Act\'s requirements.', category: 'executive', date: daysAgo(30), sourceUrl: 'https://governor.wyo.gov' },
      { stateId: wyoming.id, title: 'Commission holds first public meeting', description: 'Wyoming Stable Token Commission convened for organizational meeting, adopted bylaws, and outlined implementation timeline.', category: 'implementation', date: daysAgo(15), sourceUrl: 'https://wyoleg.gov' },
    ],
  });

  // -- Nebraska --
  const nebraska = await prisma.trackedState.create({
    data: {
      name: 'Nebraska',
      slug: 'nebraska',
      abbreviation: 'NE',
      status: 'ACTIVE_LEGISLATION',
      summary: 'Nebraska has introduced legislation to update its digital asset banking framework with specific provisions for stablecoin custody and issuance by state-chartered digital asset depositories.',
      whyItMatters: 'Nebraska was an early mover with its 2021 Financial Innovation Act. Updating the framework for stablecoins would build on existing digital asset depository infrastructure and could attract stablecoin issuers seeking a state charter.',
      nextExpectedStep: 'Banking Committee hearing and markup expected next legislative session',
      lastActionDate: daysAgo(20),
    },
  });

  const neBillLB0649 = await prisma.bill.create({
    data: {
      stateId: nebraska.id,
      billNumber: 'LB 649',
      title: 'Nebraska Digital Asset Depository Amendment — Stablecoin Provisions',
      summary: 'Amends the Financial Innovation Act to authorize state-chartered digital asset depositories to issue and custody payment stablecoins, subject to reserve and capital adequacy requirements.',
      whatChanged: 'Bill introduced with co-sponsorship from banking committee members. Hearing scheduled.',
      whyItMatters: 'Extends Nebraska\'s existing digital asset depository framework — one of the first in the nation — to explicitly cover stablecoin issuance.',
      status: 'IN_COMMITTEE',
      chamber: 'SENATE',
      sponsorName: 'Sen. Mike Jacobson',
      sourceUrl: 'https://nebraskalegislature.gov/bills/view_bill.php?DocumentID=56789',
      confidenceScore: 75,
      credibilityTier: 'TIER_2',
      introducedDate: daysAgo(40),
      lastActionDate: daysAgo(20),
    },
  });

  await prisma.billUpdate.createMany({
    data: [
      { billId: neBillLB0649.id, title: 'LB 649 introduced', description: 'Bill filed in Nebraska unicameral legislature. Referred to Banking, Commerce & Insurance Committee.', status: 'INTRODUCED', date: daysAgo(40), sourceUrl: 'https://nebraskalegislature.gov' },
      { billId: neBillLB0649.id, title: 'Committee hearing scheduled', description: 'Banking Committee placed LB 649 on hearing calendar. Industry stakeholders expected to testify.', status: 'IN_COMMITTEE', date: daysAgo(20), sourceUrl: 'https://nebraskalegislature.gov' },
    ],
  });

  await prisma.stateUpdate.create({
    data: {
      stateId: nebraska.id,
      title: 'NDBF issues guidance on digital asset depository stablecoin activity',
      description: 'Nebraska Department of Banking and Finance published interpretive letter clarifying interim compliance expectations for existing depositories engaging in stablecoin-related activity.',
      category: 'regulatory',
      date: daysAgo(15),
      sourceUrl: 'https://ndbf.nebraska.gov',
    },
  });

  // -- Texas --
  const texas = await prisma.trackedState.create({
    data: {
      name: 'Texas',
      slug: 'texas',
      abbreviation: 'TX',
      status: 'ACTIVE_LEGISLATION',
      summary: 'Texas has introduced competing stablecoin bills in both chambers, reflecting strong legislative interest in establishing a state-level framework. The House version focuses on consumer protection while the Senate version emphasizes issuer licensing.',
      whyItMatters: 'As the second-largest US state by population and GDP, Texas legislative action on stablecoins carries outsized market impact. The state already has a significant crypto mining industry and multiple state-chartered digital asset firms.',
      nextExpectedStep: 'Committee markup and reconciliation of House and Senate approaches',
      lastActionDate: daysAgo(10),
    },
  });

  const txBillHB4903 = await prisma.bill.create({
    data: {
      stateId: texas.id,
      billNumber: 'HB 4903',
      title: 'Texas Digital Currency Consumer Protection Act',
      summary: 'Establishes consumer protection requirements for payment stablecoins including disclosure, redemption guarantees, and reserve transparency.',
      whatChanged: 'Bill advanced from House Technology & Innovation Committee with amendments strengthening redemption rights.',
      whyItMatters: 'Consumer-focused approach differs from Senate version, setting up potential conference committee negotiations.',
      status: 'ADVANCED_FROM_COMMITTEE',
      chamber: 'HOUSE',
      sponsorName: 'Rep. Giovanni Capriglione',
      sourceUrl: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB4903',
      confidenceScore: 72,
      credibilityTier: 'TIER_2',
      introducedDate: daysAgo(75),
      lastActionDate: daysAgo(10),
    },
  });

  await prisma.billUpdate.createMany({
    data: [
      { billId: txBillHB4903.id, title: 'HB 4903 filed', description: 'Filed by Rep. Capriglione with 8 co-sponsors.', status: 'INTRODUCED', date: daysAgo(75), sourceUrl: 'https://capitol.texas.gov' },
      { billId: txBillHB4903.id, title: 'Referred to Technology & Innovation', description: 'Speaker assigned bill to House Technology & Innovation Committee.', status: 'IN_COMMITTEE', date: daysAgo(60), sourceUrl: 'https://capitol.texas.gov' },
      { billId: txBillHB4903.id, title: 'Committee advances bill', description: 'Committee voted 7-2 to advance with amendments adding mandatory redemption windows.', status: 'ADVANCED_FROM_COMMITTEE', date: daysAgo(10), sourceUrl: 'https://capitol.texas.gov' },
    ],
  });

  const txBillSB2116 = await prisma.bill.create({
    data: {
      stateId: texas.id,
      billNumber: 'SB 2116',
      title: 'Texas Stablecoin Issuer Licensing Act',
      summary: 'Creates a licensing regime for stablecoin issuers under the Texas Department of Banking, with capital requirements and examination authority.',
      whatChanged: 'Introduced in Senate and referred to Business & Commerce Committee.',
      whyItMatters: 'Senate approach focuses on issuer licensing rather than consumer protection, creating potential for comprehensive combined legislation.',
      status: 'IN_COMMITTEE',
      chamber: 'SENATE',
      sponsorName: 'Sen. Tan Parker',
      sourceUrl: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB2116',
      confidenceScore: 68,
      credibilityTier: 'TIER_2',
      introducedDate: daysAgo(50),
      lastActionDate: daysAgo(25),
    },
  });

  await prisma.billUpdate.createMany({
    data: [
      { billId: txBillSB2116.id, title: 'SB 2116 filed', description: 'Filed by Sen. Parker. Focuses on issuer licensing and prudential standards.', status: 'INTRODUCED', date: daysAgo(50), sourceUrl: 'https://capitol.texas.gov' },
      { billId: txBillSB2116.id, title: 'Referred to Business & Commerce', description: 'Lt. Governor assigned to Business & Commerce Committee. Hearing not yet scheduled.', status: 'IN_COMMITTEE', date: daysAgo(25), sourceUrl: 'https://capitol.texas.gov' },
    ],
  });

  await prisma.stateUpdate.create({
    data: {
      stateId: texas.id,
      title: 'Texas Department of Banking publishes stablecoin industry letter',
      description: 'TDB issued supervisory guidance letter to state-chartered banks and trust companies regarding stablecoin custody and reserve management expectations.',
      category: 'regulatory',
      date: daysAgo(18),
      sourceUrl: 'https://dob.texas.gov',
    },
  });

  // -- New York --
  const newYork = await prisma.trackedState.create({
    data: {
      name: 'New York',
      slug: 'new-york',
      abbreviation: 'NY',
      status: 'ACTIVE_LEGISLATION',
      summary: 'New York has introduced legislation to codify and expand NYDFS stablecoin guidance into formal statute. The bill would establish reserve composition requirements, audit mandates, and redemption guarantees for stablecoin issuers licensed under the BitLicense regime.',
      whyItMatters: 'New York\'s NYDFS already regulates major stablecoin issuers including Circle (USDC) and Paxos (USDP/BUSD) through guidance. Codifying these requirements into statute would make New York\'s framework the most prescriptive in the country and could influence federal standards.',
      nextExpectedStep: 'Assembly Financial Institutions Committee hearing',
      lastActionDate: daysAgo(14),
    },
  });

  const nyBillA7218 = await prisma.bill.create({
    data: {
      stateId: newYork.id,
      billNumber: 'A.7218',
      title: 'New York Stablecoin Trust Act',
      summary: 'Codifies NYDFS stablecoin guidance into statute, setting reserve composition limits (minimum 80% US Treasuries), monthly reserve attestation by independent auditors, and next-day redemption guarantees for licensed stablecoin issuers.',
      whatChanged: 'Introduced by Assemblymember Dinowitz with support from Financial Institutions Committee chair.',
      whyItMatters: 'Would transform existing regulatory guidance into binding law, removing NYDFS discretion and creating predictable compliance requirements for the largest stablecoin issuers.',
      status: 'INTRODUCED',
      chamber: 'HOUSE',
      sponsorName: 'Assemblymember Daniel Dinowitz',
      sourceUrl: 'https://nyassembly.gov/leg/?bn=A07218',
      confidenceScore: 65,
      credibilityTier: 'TIER_2',
      introducedDate: daysAgo(14),
      lastActionDate: daysAgo(14),
    },
  });

  await prisma.billUpdate.create({
    data: {
      billId: nyBillA7218.id,
      title: 'A.7218 introduced in Assembly',
      description: 'Bill filed and referred to Financial Institutions Committee. Sponsor statement cites need to "put stablecoin rules in statute, not just guidance."',
      status: 'INTRODUCED',
      date: daysAgo(14),
      sourceUrl: 'https://nyassembly.gov',
    },
  });

  await prisma.stateUpdate.createMany({
    data: [
      { stateId: newYork.id, title: 'NYDFS updates stablecoin guidance', description: 'New York Department of Financial Services published updated guidance on reserve composition and redemption timing for licensed stablecoin issuers, signaling alignment with proposed legislation.', category: 'regulatory', date: daysAgo(21), sourceUrl: 'https://dfs.ny.gov' },
      { stateId: newYork.id, title: 'Industry coalition submits comment letter', description: 'Coalition of stablecoin issuers and fintech firms submitted public comment supporting codification of NYDFS standards with minor modifications.', category: 'industry', date: daysAgo(7), sourceUrl: 'https://dfs.ny.gov' },
    ],
  });

  console.log('  ✓ Tracker: 5 states, 7 bills, bill updates, state updates');

  // ─── SUMMARY ─────────────────────────────────────────
  const counts = await Promise.all([
    prisma.source.count(),
    prisma.topic.count(),
    prisma.topicCluster.count(),
    prisma.entity.count(),
    prisma.article.count(),
    prisma.signal.count(),
    prisma.timelineEvent.count(),
    prisma.tag.count(),
    prisma.articleTopic.count(),
    prisma.articleEntity.count(),
    prisma.entityTopic.count(),
    prisma.trackedState.count(),
    prisma.bill.count(),
    prisma.billUpdate.count(),
    prisma.stateUpdate.count(),
  ]);

  console.log('\n✅ Seed complete!\n');
  console.log('  ┌──────────────────────────────┐');
  console.log(`  │ Sources          ${String(counts[0]).padStart(10)} │`);
  console.log(`  │ Topics           ${String(counts[1]).padStart(10)} │`);
  console.log(`  │ Topic Clusters   ${String(counts[2]).padStart(10)} │`);
  console.log(`  │ Entities         ${String(counts[3]).padStart(10)} │`);
  console.log(`  │ Articles         ${String(counts[4]).padStart(10)} │`);
  console.log(`  │ Signals          ${String(counts[5]).padStart(10)} │`);
  console.log(`  │ Timeline Events  ${String(counts[6]).padStart(10)} │`);
  console.log(`  │ Tags             ${String(counts[7]).padStart(10)} │`);
  console.log(`  │ Article-Topics   ${String(counts[8]).padStart(10)} │`);
  console.log(`  │ Article-Entities ${String(counts[9]).padStart(10)} │`);
  console.log(`  │ Entity-Topics    ${String(counts[10]).padStart(10)} │`);
  console.log(`  │ Tracked States   ${String(counts[11]).padStart(10)} │`);
  console.log(`  │ Bills            ${String(counts[12]).padStart(10)} │`);
  console.log(`  │ Bill Updates     ${String(counts[13]).padStart(10)} │`);
  console.log(`  │ State Updates    ${String(counts[14]).padStart(10)} │`);
  console.log('  └──────────────────────────────┘');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
