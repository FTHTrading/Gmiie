// ═══════════════════════════════════════════════════════════════
// @xxxiii/config — Shared Configuration
// Domain routing, brand constants, taxonomy seeds
// ═══════════════════════════════════════════════════════════════

export const DOMAINS = {
  root: process.env.ROOT_DOMAIN || "xxxiii.io",
  gmiie: process.env.GMIIE_DOMAIN || "gmiie.xxxiii.io",
  lps: process.env.LPS_DOMAIN || "lps.xxxiii.io",
  news: process.env.NEWS_DOMAIN || "news.xxxiii.io",
  research: process.env.RESEARCH_DOMAIN || "research.xxxiii.io",
  signals: process.env.SIGNALS_DOMAIN || "signals.xxxiii.io",
  studio: process.env.STUDIO_DOMAIN || "studio.xxxiii.io",
  api: process.env.API_DOMAIN || "api.xxxiii.io",
} as const;

export const BRAND = {
  name: "XXXIII",
  fullName: "XXXIII.IO",
  gmiie: "GMIIE",
  gmiieFull: "Global Monetary Infrastructure Intelligence Engine",
  lps: "LPS-1",
  lpsFull: "Literary Publishing Standard",
  tagline: "The Intelligence Layer for the Future of Capital Markets",
  lpsTagline: "The Open Standard for Verifiable Digital Publishing",
  description:
    "GMIIE is an AI-powered global intelligence platform tracking how money, markets, regulation, tokenization, and digital financial infrastructure are evolving worldwide.",
  lpsDescription:
    "A deterministic protocol that proves authorship, content integrity, and AI disclosure using cryptographic hashing, Merkle trees, IPFS, and on-chain anchoring.",
} as const;

export const COLORS = {
  // Core palette
  background: "#0A0A0F",
  surface: "#12121A",
  surfaceElevated: "#1A1A25",
  border: "#2A2A3A",
  borderSubtle: "#1F1F2E",

  // Text
  textPrimary: "#F0F0F5",
  textSecondary: "#9090A8",
  textMuted: "#606078",

  // Accents
  gold: "#C9A84C",
  goldLight: "#E0C878",
  blue: "#4A7AFF",
  blueLight: "#7AA0FF",
  green: "#2DD4A8",
  red: "#FF4A6E",
  purple: "#8B5CF6",
  cyan: "#06B6D4",

  // Category colors
  categories: {
    tokenizedSecurities: "#4A7AFF",
    stablecoins: "#2DD4A8",
    regulation: "#FF4A6E",
    custody: "#8B5CF6",
    settlement: "#06B6D4",
    infrastructure: "#C9A84C",
    cbdc: "#F59E0B",
    realEstate: "#EC4899",
    funds: "#10B981",
    payments: "#6366F1",
  },
} as const;

export const CREDIBILITY_TIERS = {
  1: { label: "Tier 1 — Official", description: "Regulators, exchanges, banks, DTCC-class institutions", color: COLORS.gold },
  2: { label: "Tier 2 — Major Media", description: "Major business media and industry publications", color: COLORS.blue },
  3: { label: "Tier 3 — Crypto Native", description: "Crypto-native publications with mixed reliability", color: COLORS.purple },
  4: { label: "Tier 4 — Unverified", description: "Social or unverified commentary", color: COLORS.textMuted },
} as const;

// ─── Initial Topic Taxonomy ───

export const TOPIC_TAXONOMY = [
  { name: "Tokenized Securities", slug: "tokenized-securities", cluster: "tokenization" },
  { name: "Tokenized Real Estate", slug: "tokenized-real-estate", cluster: "tokenization" },
  { name: "Tokenized Funds", slug: "tokenized-funds", cluster: "tokenization" },
  { name: "Tokenized Equities", slug: "tokenized-equities", cluster: "tokenization" },
  { name: "Tokenized Treasuries", slug: "tokenized-treasuries", cluster: "tokenization" },
  { name: "Stablecoins", slug: "stablecoins", cluster: "digital-assets" },
  { name: "CBDC", slug: "cbdc", cluster: "digital-assets" },
  { name: "Digital Custody", slug: "digital-custody", cluster: "infrastructure" },
  { name: "Clearing & Settlement", slug: "clearing-settlement", cluster: "infrastructure" },
  { name: "Transfer Agency", slug: "transfer-agency", cluster: "infrastructure" },
  { name: "Broker-Dealer Activity", slug: "broker-dealer-activity", cluster: "market-structure" },
  { name: "Exchange Infrastructure", slug: "exchange-infrastructure", cluster: "market-structure" },
  { name: "Payment Rails", slug: "payment-rails", cluster: "payments" },
  { name: "Digital Asset Regulation", slug: "digital-asset-regulation", cluster: "regulation" },
  { name: "Compliance & AML", slug: "compliance-aml", cluster: "regulation" },
  { name: "Cross-Border Tokenization", slug: "cross-border-tokenization", cluster: "global" },
  { name: "Institutional Blockchain Adoption", slug: "institutional-blockchain", cluster: "adoption" },
  { name: "Market Infrastructure Interoperability", slug: "market-infra-interop", cluster: "infrastructure" },
  { name: "Sovereign Financial Infrastructure", slug: "sovereign-financial-infra", cluster: "global" },
  { name: "Settlement Modernization", slug: "settlement-modernization", cluster: "infrastructure" },
] as const;

export const TOPIC_CLUSTERS = [
  { name: "Tokenization", slug: "tokenization", description: "Asset tokenization across all classes" },
  { name: "Digital Assets", slug: "digital-assets", description: "Stablecoins, CBDCs, and native digital assets" },
  { name: "Infrastructure", slug: "infrastructure", description: "Custody, settlement, clearing, transfer agency" },
  { name: "Market Structure", slug: "market-structure", description: "Exchanges, broker-dealers, trading venues" },
  { name: "Payments", slug: "payments", description: "Payment rails and cross-border transfers" },
  { name: "Regulation", slug: "regulation", description: "Digital asset regulation and compliance" },
  { name: "Global", slug: "global", description: "Cross-border and sovereign financial systems" },
  { name: "Adoption", slug: "adoption", description: "Institutional and enterprise blockchain adoption" },
] as const;

// ─── Navigation ───

export const GMIIE_NAV = [
  { label: "Signals", href: "/signals" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Topics", href: "/topics" },
  { label: "Entities", href: "/entities" },
  { label: "Regulators", href: "/regulators" },
  { label: "Reports", href: "/reports" },
] as const;

export const LPS_NAV = [
  { label: "Spec", href: "/spec" },
  { label: "Stack", href: "/stack" },
  { label: "Verify", href: "/verify" },
  { label: "Reference", href: "/reference" },
  { label: "Compliance", href: "/compliance" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Implement", href: "/implement" },
  { label: "GitHub", href: "https://github.com/xxxiii-io", external: true },
] as const;

export const ROOT_NAV = [
  { label: "GMIIE", href: `https://gmiie.xxxiii.io`, external: true },
  { label: "LPS-1", href: `https://lps.xxxiii.io`, external: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
