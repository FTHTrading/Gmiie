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
 *   - 50 sources (regulators, banks, exchanges, media)
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
  console.log('  Creating 50 sources...');
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
    type: string;
    assetClass?: string;
    source: string;
    importance: number;
    daysAgo: number;
    topicNames: string[];
    entityNames: string[];
    tagSlugs: string[];
    signal: number[];
  }> = [
    {
      title: 'BlackRock BUIDL Fund Surpasses $2 Billion in Tokenized Assets',
      headline: 'BlackRock tokenized fund BUIDL crosses $2B milestone on Ethereum',
      summary: 'BlackRock\'s tokenized money market fund BUIDL has crossed $2 billion in assets under management, representing the largest single tokenized fund product globally. The fund, operated in partnership with Securitize, provides institutional investors with on-chain exposure to US Treasury securities.',
      content: 'BlackRock\'s BUIDL (BlackRock USD Institutional Digital Liquidity Fund) has surpassed $2 billion in tokenized assets under management, establishing itself as the dominant tokenized fund product in global capital markets.\n\nThe fund, launched in March 2024 on Ethereum, allows qualified institutional investors to hold tokenized shares representing ownership in a pool of US Treasury bills, repurchase agreements, and cash. Securitize serves as the transfer agent and tokenization platform.\n\nThis milestone represents a significant validation of institutional tokenization infrastructure.',
      type: 'DEEP_DIVE',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Bloomberg',
      importance: 9.2,
      daysAgo: 1,
      topicNames: ['Tokenized Funds', 'Tokenized Treasuries'],
      entityNames: ['BlackRock', 'Securitize', 'Ethereum Foundation'],
      tagSlugs: ['tokenization', 'funds', 'treasuries', 'institutional'],
      signal: [8.5, 7.0, 9.0, 8.0, 7.5, 6.0, 5.0, 8.5, 9.0],
    },
    {
      title: 'SEC Issues Framework for Tokenized Securities Classification',
      headline: 'SEC publishes comprehensive guidance on tokenized security classification',
      summary: 'The US Securities and Exchange Commission has released a framework outlining how tokenized financial instruments will be classified under existing securities law. The guidance addresses registration requirements, custody rules, and transfer agent obligations for blockchain-based securities.',
      content: 'The SEC has issued a comprehensive framework clarifying the regulatory treatment of tokenized securities under federal securities law.\n\nThe guidance establishes that tokenized representations of traditional securities remain subject to the same registration, disclosure, and reporting requirements as their conventional counterparts. The framework specifically addresses custody obligations for digital asset securities and outlines requirements for transfer agents handling blockchain-based instruments.\n\nMarket participants have welcomed the clarity, with several major financial institutions indicating they will accelerate tokenization programs in response.',
      type: 'REGULATOR_TRACKER',
      source: 'US Securities and Exchange Commission',
      importance: 9.5,
      daysAgo: 2,
      topicNames: ['Securities Regulation', 'Tokenized Equities'],
      entityNames: ['US Securities and Exchange Commission', 'DTCC'],
      tagSlugs: ['regulation', 'securities', 'compliance', 'tokenization'],
      signal: [9.5, 8.0, 7.0, 8.5, 9.0, 5.0, 7.0, 6.5, 9.5],
    },
    {
      title: 'DTCC Completes Digital Settlement Pilot with Major Banks',
      headline: 'DTCC tests T+0 settlement for tokenized securities with consortium',
      summary: 'The Depository Trust and Clearing Corporation has completed a pilot program testing same-day settlement for tokenized securities with participation from JPMorgan, Citigroup, and BNY Mellon.',
      content: 'DTCC has successfully completed a pilot program demonstrating T+0 (same-day) settlement for tokenized securities.\n\nThe pilot involved JPMorgan Chase, Citigroup, and BNY Mellon testing the settlement of tokenized equity and fixed income instruments through DTCC\'s digital infrastructure. The system processed over 1,000 simulated transactions with a 99.97% success rate.\n\nThis represents a major step toward shortening the settlement cycle for tokenized instruments beyond the current T+1 standard.',
      type: 'INFRA_ANALYSIS',
      source: 'DTCC',
      importance: 9.0,
      daysAgo: 3,
      topicNames: ['Digital Settlement', 'Exchange Infrastructure'],
      entityNames: ['DTCC', 'JPMorgan Chase', 'Citigroup', 'BNY Mellon'],
      tagSlugs: ['settlement', 'infrastructure', 'institutional', 'tokenization'],
      signal: [7.5, 9.0, 9.5, 9.5, 7.0, 6.0, 8.5, 5.0, 8.0],
    },
    {
      title: 'European Central Bank Advances Digital Euro Pilot Phase',
      headline: 'ECB selects technology partners for digital euro pilot expansion',
      summary: 'The European Central Bank has selected five technology providers to participate in the expanded pilot phase of the digital euro project, moving closer to a potential launch decision in 2027.',
      content: 'The ECB has advanced its digital euro project to an expanded pilot phase, selecting five technology providers to test retail CBDC infrastructure across the eurozone.\n\nThe pilot will test offline payments, cross-border transactions, and privacy-preserving identity verification. A final decision on whether to launch the digital euro is expected by late 2027.\n\nThe digital euro would serve as a complement to physical cash, providing European citizens with a risk-free digital payment option backed directly by the central bank.',
      type: 'BRIEF',
      assetClass: 'CBDC',
      source: 'European Central Bank',
      importance: 8.8,
      daysAgo: 3,
      topicNames: ['Central Bank Digital Currencies', 'Payment Infrastructure'],
      entityNames: ['European Central Bank'],
      tagSlugs: ['CBDC', 'central-bank', 'payment-rails', 'policy'],
      signal: [9.0, 8.5, 7.0, 8.0, 8.0, 8.5, 7.0, 5.5, 7.0],
    },
    {
      title: 'MUFG Launches $500M Tokenized Real Estate Security',
      headline: 'Japan largest bank issues blockchain-based real estate security',
      summary: 'MUFG has issued a $500 million tokenized real estate security on its Progmat blockchain platform, the largest single tokenized real estate issuance in Asia.',
      content: 'Mitsubishi UFJ Financial Group (MUFG) has launched a $500 million tokenized real estate security through its Progmat digital asset platform.\n\nThe security represents fractional ownership in a portfolio of commercial real estate assets across Tokyo and Osaka. The issuance uses Progmat\'s permissioned blockchain infrastructure with settlement in Japanese yen stablecoins.\n\nThis is the largest tokenized real estate transaction in the Asia-Pacific region and signals growing institutional confidence in blockchain-based property investment vehicles.',
      type: 'DEEP_DIVE',
      assetClass: 'TOKENIZED_REAL_ESTATE',
      source: 'Nikkei Asia',
      importance: 8.5,
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
      content: 'Kraken has launched xStocks, a platform allowing users to trade tokenized versions of publicly listed equities on its exchange.\n\nThe platform initially supports over 50 US-listed stocks and ETFs, with settlement occurring on blockchain rails rather than traditional clearinghouse infrastructure. The service is available to users in select jurisdictions pending regulatory approvals.\n\nThis launch positions Kraken as one of the first major crypto exchanges to offer tokenized equity trading at scale.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_EQUITIES',
      source: 'The Block',
      importance: 8.0,
      daysAgo: 4,
      topicNames: ['Tokenized Equities', 'Exchange Infrastructure'],
      entityNames: ['Kraken', 'Nasdaq'],
      tagSlugs: ['equities', 'tokenization', 'blockchain'],
      signal: [7.0, 8.0, 6.0, 8.0, 9.0, 5.0, 7.0, 6.0, 7.0],
    },
    {
      title: 'Northern Trust Tokenizes Money Market Fund on Polygon',
      headline: 'Northern Trust deploys tokenized MMF on Polygon blockchain',
      summary: 'Northern Trust has launched a tokenized money market fund on Polygon, providing institutional clients with on-chain access to short-duration fixed income.',
      content: 'Northern Trust has tokenized a money market fund on the Polygon blockchain, providing institutional investors with a blockchain-native vehicle for short-duration Treasury exposure.\n\nThe fund uses smart contracts for automated subscription and redemption, with settlement finalizing within minutes rather than the traditional T+1 cycle. The tokenized shares are interoperable with other DeFi protocols, enabling collateral posting and lending use cases.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Global Custodian',
      importance: 7.8,
      daysAgo: 5,
      topicNames: ['Tokenized Funds', 'Digital Custody'],
      entityNames: ['Northern Trust', 'Polygon Labs'],
      tagSlugs: ['tokenization', 'funds', 'custody', 'institutional'],
      signal: [6.5, 7.5, 8.0, 7.5, 6.5, 5.0, 7.0, 5.0, 6.5],
    },
    {
      title: 'BIS Innovation Hub Completes Project Agor Cross-Border CBDC Test',
      headline: 'BIS tests wholesale CBDC for cross-border settlement with 7 central banks',
      summary: 'The Bank for International Settlements Innovation Hub has completed Project Agor, testing wholesale CBDC integration for cross-border payments with seven central banks.',
      content: 'The BIS Innovation Hub has completed Project Agor, a multi-central bank initiative testing the use of wholesale CBDCs for cross-border settlement.\n\nSeven central banks participated including the Federal Reserve, ECB, Bank of Japan, Bank of England, Swiss National Bank, Reserve Bank of Australia, and Monetary Authority of Singapore. The project tested atomic DvP (delivery versus payment) settlement across different CBDC platforms.\n\nResults demonstrated a 90% reduction in settlement time and significant cost savings compared to existing correspondent banking infrastructure.',
      type: 'RESEARCH_ARTICLE',
      assetClass: 'CBDC',
      source: 'Bank for International Settlements',
      importance: 9.0,
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
      content: 'Franklin Templeton has deployed its OnChain US Government Money Fund (FOBXX) on both Stellar and Avalanche, in addition to its existing deployment on Polygon.\n\nThe multi-chain expansion allows investors to access the tokenized fund through their preferred blockchain ecosystem. The fund now holds over $400 million in tokenized shares and processes subscriptions and redemptions using on-chain transfer agent records.\n\nThis multi-chain approach reflects growing demand for blockchain-agnostic institutional products.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Ledger Insights',
      importance: 7.5,
      daysAgo: 6,
      topicNames: ['Tokenized Funds', 'Interoperability'],
      entityNames: ['Franklin Templeton', 'Stellar Development Foundation', 'Avalanche', 'Polygon Labs'],
      tagSlugs: ['tokenization', 'funds', 'blockchain', 'interoperability'],
      signal: [6.0, 7.5, 8.0, 8.0, 7.0, 6.0, 8.0, 4.5, 6.0],
    },
    {
      title: 'MAS Launches Framework for Institutional DeFi Access',
      headline: 'Singapore regulator creates regulatory sandbox for institutional DeFi',
      summary: 'The Monetary Authority of Singapore has introduced a regulatory framework allowing regulated financial institutions to access DeFi protocols under supervised conditions.',
      content: 'The Monetary Authority of Singapore has launched a regulatory sandbox framework specifically designed for institutional participation in decentralized finance.\n\nThe framework, developed under Project Guardian, allows licensed financial institutions to interact with approved DeFi protocols for tokenized asset trading, lending, and foreign exchange. Participating institutions must maintain full KYC/AML compliance and report transactions to MAS.\n\nThis positions Singapore as the first major financial center to create a formal pathway for institutional DeFi access.',
      type: 'REGULATOR_TRACKER',
      source: 'Monetary Authority of Singapore',
      importance: 8.8,
      daysAgo: 6,
      topicNames: ['DeFi Regulation', 'Securities Regulation'],
      entityNames: ['Monetary Authority of Singapore', 'DBS Bank', 'JPMorgan Chase'],
      tagSlugs: ['regulation', 'DeFi', 'institutional', 'compliance'],
      signal: [9.0, 8.0, 8.0, 7.5, 8.0, 7.5, 9.0, 5.5, 8.0],
    },
    // 10 more articles with varied types and topics
    {
      title: 'UBS Issues CHF 375M Digital Bond on SIX Digital Exchange',
      headline: 'UBS launches largest Swiss franc digital bond on SDX',
      summary: 'UBS has issued a CHF 375 million digital bond on SIX Digital Exchange, the largest digital-native bond issuance on a regulated exchange.',
      content: 'UBS has issued a CHF 375 million digital bond on SIX Digital Exchange (SDX), marking the largest regulated digital bond issuance in Swiss francs.\n\nThe bond was settled through SDX\'s integrated CSD using atomic DvP, with settlement completing in under 30 minutes compared to the typical T+2 cycle for traditional bonds. Institutional investors including pension funds and insurance companies participated in the offering.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_BONDS',
      source: 'Financial Times',
      importance: 8.2,
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
      title: 'Broadridge Processes $1 Trillion in DLT Repo Transactions',
      headline: 'Broadridge repo platform hits $1T cumulative volume on DLT',
      summary: 'Broadridge has reported over $1 trillion in cumulative repurchase agreement transactions processed through its distributed ledger platform.',
      content: 'Broadridge Financial Solutions has surpassed $1 trillion in cumulative repo transactions processed on its distributed ledger technology (DLT) platform.\n\nThe platform, used by major dealers including UBS, Goldman Sachs, and Societe Generale, enables intraday repo settlement and automated collateral management. Monthly volumes now exceed $50 billion, demonstrating institutional blockchain adoption at scale.',
      type: 'INFRA_ANALYSIS',
      source: 'Securities Finance Times',
      importance: 8.5,
      daysAgo: 8,
      topicNames: ['Digital Settlement', 'Exchange Infrastructure'],
      entityNames: ['Broadridge Financial Solutions', 'UBS', 'Goldman Sachs', 'Societe Generale'],
      tagSlugs: ['infrastructure', 'settlement', 'institutional', 'derivatives'],
      signal: [5.5, 8.5, 9.0, 9.0, 6.0, 5.5, 7.0, 4.0, 6.0],
    },
    {
      title: 'FCA Publishes Digital Securities Sandbox Rules',
      headline: 'UK regulator finalizes rules for digital securities sandbox',
      summary: 'The Financial Conduct Authority has published final rules for the UK Digital Securities Sandbox, allowing firms to test tokenized financial instruments under relaxed regulatory conditions.',
      content: 'The UK Financial Conduct Authority has published the final rulebook for the Digital Securities Sandbox (DSS).\n\nThe sandbox allows approved firms to issue, trade, and settle tokenized securities using distributed ledger technology without requiring full compliance with existing CSDR-derived rules. Participating firms can operate for up to five years under modified requirements.\n\nThe FCA has received over 40 applications from exchanges, custodians, and technology firms seeking to participate.',
      type: 'REGULATOR_TRACKER',
      source: 'UK Financial Conduct Authority',
      importance: 8.0,
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
      content: 'SWIFT has successfully tested interoperability connections between its existing financial messaging infrastructure and six tokenization platforms.\n\nThe initiative allows SWIFT\'s 11,000+ member institutions to send instructions for tokenized asset transactions using existing SWIFT message types. Connected platforms include Chainlink CCIP, SIX Digital Exchange, DTCC, and three additional platforms.\n\nThis represents a significant bridge between traditional financial infrastructure and emerging tokenized asset markets.',
      type: 'INFRA_ANALYSIS',
      source: 'Bloomberg',
      importance: 8.8,
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
    },
    {
      title: 'Circle USDC Stablecoin Reaches $45 Billion Market Capitalization',
      headline: 'USDC market cap surges to $45B as institutional adoption accelerates',
      summary: 'Circle\'s USDC stablecoin has reached $45 billion in market capitalization, driven by institutional adoption for settlement and collateral use cases.',
      content: 'USDC has reached $45 billion in circulating supply, its highest level since the 2022 bank run event.\n\nGrowth is driven by institutional adoption for cross-border settlement, collateral posting in DeFi, and as a payment rail for tokenized asset transactions. Circle has obtained regulatory approvals in multiple jurisdictions and established banking partnerships with JPMorgan and BNY Mellon.',
      type: 'BRIEF',
      assetClass: 'STABLECOINS',
      source: 'Bloomberg',
      importance: 7.8,
      daysAgo: 10,
      topicNames: ['Stablecoins', 'Payment Infrastructure'],
      entityNames: ['Circle', 'JPMorgan Chase', 'BNY Mellon'],
      tagSlugs: ['stablecoin', 'payment-rails', 'institutional'],
      signal: [7.5, 8.0, 8.5, 7.0, 7.5, 7.0, 6.0, 5.0, 6.5],
    },
    {
      title: 'Fnality Processes First Live Wholesale Digital Payment',
      headline: 'Fnality completes first real wholesale payment on regulated DLT',
      summary: 'Fnality International has processed its first live wholesale digital payment using tokenized central bank money on its distributed ledger platform.',
      content: 'Fnality International has completed its first real-money wholesale digital payment between two major banks using its sterling Utility Settlement Coin (USC).\n\nThe payment, backed by segregated reserves at the Bank of England, represents the first live transaction using tokenized central bank money on a regulated DLT platform. Fnality\'s shareholders include 17 global banks including Goldman Sachs, BNP Paribas, and Nomura.',
      type: 'INFRA_ANALYSIS',
      source: 'Financial Times',
      importance: 8.5,
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
      content: 'The People\'s Bank of China has expanded its e-CNY digital currency pilot to include cross-border trade finance settlement. The expansion involves bilateral arrangements with central banks in Thailand, Malaysia, and Indonesia for trade-related payments using the digital yuan on the mBridge platform.',
      type: 'BRIEF',
      assetClass: 'CBDC',
      source: 'Reuters',
      importance: 8.2,
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
      content: 'ESMA has published the Regulatory Technical Standards (RTS) implementing the Markets in Crypto-Assets (MiCA) regulation across the European Union. The standards address authorization requirements, prudential rules, and market abuse provisions for crypto-asset service providers operating in the EU.',
      type: 'REGULATOR_TRACKER',
      source: 'International Financial Law Review',
      importance: 8.0,
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
      content: 'Fidelity Investments has launched its first tokenized money market fund on the Ethereum blockchain, providing institutional investors with on-chain access to a diversified portfolio of short-term US Treasury securities and repurchase agreements.',
      type: 'BRIEF',
      assetClass: 'TOKENIZED_FUNDS',
      source: 'Wall Street Journal',
      importance: 8.0,
      daysAgo: 22,
      topicNames: ['Tokenized Funds', 'Tokenized Treasuries'],
      entityNames: ['Fidelity Investments', 'Ethereum Foundation'],
      tagSlugs: ['tokenization', 'funds', 'treasuries'],
      signal: [6.0, 8.0, 8.5, 7.5, 7.5, 5.0, 6.5, 4.5, 7.0],
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
      content: 'The Commodity Futures Trading Commission has opened a rulemaking process to allow tokenized assets, including tokenized Treasury bills and stablecoins, to be posted as collateral for futures and swaps positions. The proposal would expand eligible collateral beyond cash and traditional securities.',
      type: 'REGULATOR_TRACKER',
      source: 'Commodity Futures Trading Commission',
      importance: 8.0,
      daysAgo: 30,
      topicNames: ['Securities Regulation', 'Clearing and Netting'],
      entityNames: ['Commodity Futures Trading Commission', 'CME Group'],
      tagSlugs: ['regulation', 'derivatives', 'compliance'],
      signal: [9.0, 8.0, 7.0, 7.0, 6.5, 5.0, 6.5, 5.0, 7.0],
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

    // Create article
    const article = await prisma.article.upsert({
      where: { slug: articleSlug },
      update: {},
      create: {
        slug: articleSlug,
        canonicalHash,
        title: a.title,
        headline: a.headline,
        executiveSummary: a.summary,
        content: a.content,
        articleType: a.type as any,
        assetClass: (a.assetClass as any) || null,
        status: 'PUBLISHED',
        importanceScore: a.importance,
        confidenceScore: randomFloat(7, 9.5),
        sentimentScore: randomFloat(4, 8),
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
    { entityName: 'US Securities and Exchange Commission', title: 'SEC publishes tokenized securities framework', description: 'SEC issues comprehensive guidance on classification of tokenized financial instruments.', date: daysAgo(2) },
    { entityName: 'DTCC', title: 'DTCC completes T+0 settlement pilot', description: 'DTCC tests same-day settlement with JPM, Citi, BNY in pilot program.', date: daysAgo(3) },
    { entityName: 'European Central Bank', title: 'ECB advances digital euro pilot phase', description: 'ECB selects five technology partners for expanded digital euro testing.', date: daysAgo(3) },
    { entityName: 'MUFG', title: 'MUFG launches $500M tokenized real estate security', description: 'Largest tokenized real estate issuance in Asia-Pacific on Progmat platform.', date: daysAgo(4) },
    { entityName: 'Kraken', title: 'Kraken launches xStocks tokenized equity platform', description: 'Crypto exchange debuts tokenized trading of 50+ US-listed equities.', date: daysAgo(4) },
    { entityName: 'Northern Trust', title: 'Northern Trust tokenizes MMF on Polygon', description: 'Institutional custodian launches tokenized money market fund on Polygon.', date: daysAgo(5) },
    { entityName: 'Bank for International Settlements', title: 'BIS completes Project Agor with 7 central banks', description: 'Wholesale CBDC cross-border settlement test with 7 central banks.', date: daysAgo(5) },
    { entityName: 'Franklin Templeton', title: 'FOBXX expands to Stellar and Avalanche', description: 'Multi-chain deployment of tokenized government money fund.', date: daysAgo(6) },
    { entityName: 'Monetary Authority of Singapore', title: 'MAS launches institutional DeFi framework', description: 'Regulatory sandbox for institutional participation in DeFi.', date: daysAgo(6) },
    { entityName: 'UBS', title: 'UBS issues CHF 375M digital bond on SDX', description: 'Largest digital bond on regulated Swiss exchange.', date: daysAgo(7) },
    { entityName: 'Societe Generale', title: 'SG-FORGE issues EUR 10M green digital bond', description: 'Green bond issued on public Ethereum with stablecoin settlement.', date: daysAgo(7) },
    { entityName: 'Broadridge Financial Solutions', title: 'Broadridge DLT repo crosses $1T cumulative', description: 'Distributed ledger repo platform reaches $1 trillion milestone.', date: daysAgo(8) },
    { entityName: 'Financial Conduct Authority', title: 'FCA publishes Digital Securities Sandbox rules', description: 'UK regulator finalizes sandbox for tokenized securities.', date: daysAgo(8) },
    { entityName: 'SWIFT', title: 'SWIFT connects to 6 tokenization platforms', description: 'Bridges traditional messaging to tokenized asset networks.', date: daysAgo(9) },
    { entityName: 'DBS Bank', title: 'DBS digital exchange crosses $1B quarterly volume', description: 'Institutional digital exchange reaches trading milestone.', date: daysAgo(9) },
    { entityName: 'Ondo Finance', title: 'Ondo treasury products reach $800M TVL', description: 'OUSG and USDY cross $800M in tokenized Treasury value.', date: daysAgo(10) },
    { entityName: 'Circle', title: 'USDC reaches $45B market cap', description: 'Institutional adoption drives USDC to highest level since 2022.', date: daysAgo(10) },
    { entityName: 'Fnality International', title: 'Fnality processes first live wholesale payment', description: 'First real-money payment using tokenized central bank reserves.', date: daysAgo(11) },
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
