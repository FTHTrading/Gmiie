import { readFileSync, writeFileSync } from "fs";

const SEED = "packages/db/prisma/seed.ts";
let src = readFileSync(SEED, "utf-8");

function replaceField(source, title, field, value) {
  const ti = source.indexOf("title: '" + title + "'");
  if (ti === -1) throw new Error("not found: " + title);
  const fp = field + ": '";
  const fi = source.indexOf(fp, ti);
  if (fi === -1) throw new Error("field not found: " + field + " in " + title);
  const start = fi + fp.length;
  let i = start;
  while (i < source.length) {
    if (source[i] === "'") {
      let bs = 0, j = i - 1;
      while (j >= 0 && source[j] === "\\") { bs++; j--; }
      if (bs % 2 === 0) break;
    }
    i++;
  }
  const old = source.slice(start, i);
  source = source.slice(0, start) + value + source.slice(i);
  console.log("  " + field + ": " + old.length + " -> " + value.length);
  return source;
}

// ═══ 1. SEC FRAMEWORK ═══
console.log("\nSEC Framework:");
const SEC = "SEC Expected to Release Comprehensive Framework for Tokenized Securities";

src = replaceField(src, SEC, "content",
  "The SEC under Chairman Paul Atkins is widely expected to issue comprehensive guidance addressing the regulatory treatment of tokenized securities under existing federal securities law. Multiple industry sources and regulatory observers indicate that SEC staff are in advanced stages of drafting a framework that would clarify obligations for issuers, transfer agents, broker-dealers, and custodians handling blockchain-based securities.\\n\\nChairman Atkins, who took office in 2025 with a stated commitment to regulatory clarity for digital assets, has publicly called tokenization one of the most promising developments in capital markets. The SEC\\'s Crypto Task Force, established in early 2025, has been engaging with market participants on key questions: whether tokenized representations of existing securities alter their legal classification, what standards transfer agents must meet when maintaining blockchain-based registries, and how qualified custody requirements apply to digital asset securities.\\n\\nIndustry participants expect the guidance to address several core issues:\\n\\n\u2022 Confirmation that tokenized instruments remain securities under the Securities Act of 1933 and Securities Exchange Act of 1934, regardless of the technology used for issuance and settlement\\n\u2022 Standards for transfer agents maintaining blockchain records as official share registries\\n\u2022 Qualified custody requirements for institutions holding tokenized securities\\n\u2022 A principle of technological neutrality that does not favor or disfavor particular blockchain platforms\\n\\nThe anticipated guidance has drawn significant attention from major financial institutions with active or planned tokenization programs. DTCC, Goldman Sachs, BNY Mellon, and Securitize are among the firms that have engaged with the SEC\\'s Crypto Task Force on these issues. Industry groups including SIFMA have described the expected framework as one of the most important regulatory developments for institutional tokenization.\\n\\nThe timeline for publication remains uncertain. Sources indicate the guidance could take the form of Staff Guidance rather than formal rulemaking, which would allow faster issuance but would not carry the same legal weight as a formal SEC rule. No official publication date has been announced."
);

src = replaceField(src, SEC, "whatHappened",
  "The SEC under Chairman Paul Atkins is expected to publish comprehensive guidance addressing the regulatory treatment of tokenized securities. SEC staff are reportedly in advanced stages of drafting a framework that would clarify obligations for issuers, transfer agents, broker-dealers, and custodians. The SEC\\'s Crypto Task Force has been engaging with industry participants on key questions. No publication date has been confirmed."
);

src = replaceField(src, SEC, "whyItMatters",
  "Regulatory ambiguity has been the single biggest constraint on institutional tokenization. Major financial institutions have delayed launching tokenized products pending clear SEC guidance on registration, custody, and transfer agent requirements. A comprehensive framework would remove this uncertainty and potentially trigger a wave of institutional tokenization activity. The expected guidance is also significant for its likely stance on technological neutrality \u2014 whether public blockchains can be used for regulated securities alongside permissioned systems."
);

src = replaceField(src, SEC, "marketImplications",
  "Major institutions including Goldman Sachs, BNY Mellon, and DTCC have tokenization programs that are partially or fully paused pending regulatory clarity. Publication of comprehensive guidance is expected to accelerate product launches across the industry. The effect on tokenization platform providers like Securitize could be significant, as institutional demand for their services would increase substantially with regulatory certainty. Cross-border implications are also being evaluated \u2014 how such guidance interacts with the EU\\'s MiCA framework will be closely watched."
);

src = replaceField(src, SEC, "regulatoryImplications",
  "The anticipated framework would set a global benchmark for how securities regulators treat tokenized instruments. Other jurisdictions \u2014 particularly the EU, UK, and Singapore \u2014 are watching the SEC\\'s approach closely. A key question is whether the guidance will treat blockchain records as legally equivalent to traditional book-entry systems, which would eliminate the dual record-keeping burden that has made many tokenization projects uneconomical. The form of the guidance (Staff Guidance vs. formal rulemaking) will also determine its legal durability."
);


// ═══ 2. DTCC T+0 PILOT ═══
console.log("\nDTCC T+0 Pilot:");
const DTCC = "DTCC Advances Digital Settlement Pilot \u2014 T+0 Testing Underway for Tokenized Securities";

src = replaceField(src, DTCC, "summary",
  "The Depository Trust and Clearing Corporation is advancing its Project Ion digital settlement platform through expanded testing of same-day (T+0) settlement for tokenized securities. The current phase reportedly involves major financial institutions including JPMorgan Chase, Citigroup, and BNY Mellon. DTCC has indicated aspirations for production-grade capabilities, though no confirmed production launch date has been publicly announced."
);

src = replaceField(src, DTCC, "content",
  "The Depository Trust and Clearing Corporation is advancing its Project Ion digital settlement platform toward expanded testing of same-day (T+0) settlement for tokenized securities, building on prior phases that demonstrated the technical feasibility of blockchain-based clearing and settlement.\\n\\nDTCC has publicly disclosed that Project Ion, which operates on a permissioned blockchain, is designed to enable T+0 settlement for tokenized equity and fixed income instruments. The platform has been in development since 2022, with earlier testing phases demonstrating successful settlement of tokenized securities in controlled environments.\\n\\nThe current phase is reported to involve expanded testing with major financial institutions including JPMorgan Chase, Citigroup, and BNY Mellon. Industry sources indicate the pilot is processing both simulated and live tokenized security transfers, testing scenarios including equity settlement, fixed income delivery-versus-payment, and multi-party netting.\\n\\nThe technology stack uses DTCC\\'s Ion platform with a permissioned blockchain overlay. Unlike public chain tokenization (used by BlackRock\\'s BUIDL), DTCC\\'s approach operates within the existing regulatory and operational framework, using the same participant identifiers and message formats familiar to member firms. This design choice reduces integration costs and positions the platform as a natural extension of existing infrastructure.\\n\\nThe potential cost implications are significant. Industry analyses suggest that T+0 settlement could meaningfully reduce capital requirements for settlement risk margins across the industry. For individual firms, fewer failed trades and lower associated penalties could generate substantial savings.\\n\\nDTCC has indicated aspirations for a production-capable system, though no confirmed production launch date has been publicly announced. The broader industry context matters: the May 2024 shift from T+2 to T+1 for traditional securities demonstrated that settlement cycle compression is operationally feasible. Some market participants see tokenized T+0 as the logical next step, while others caution that same-day settlement must be weighed against the operational complexity of funding trades in real-time."
);

src = replaceField(src, DTCC, "whatHappened",
  "DTCC is advancing its Project Ion digital settlement platform through expanded testing with major financial institutions. The platform is designed to enable T+0 (same-day) settlement for tokenized securities, building on prior phases that demonstrated technical feasibility. Current testing reportedly involves JPMorgan Chase, Citigroup, and BNY Mellon across tokenized equity and fixed income scenarios. No production launch date has been confirmed."
);

src = replaceField(src, DTCC, "whyItMatters",
  "If DTCC successfully delivers production-grade T+0 settlement, it would represent the most significant change to US securities settlement infrastructure since the move from T+2 to T+1 in May 2024. Faster settlement reduces counterparty risk, lowers capital requirements for settlement risk margins, and could reduce the cost and frequency of failed trades. DTCC\\'s position as the dominant US clearing and settlement infrastructure provider means its adoption of tokenized settlement would carry industry-wide implications."
);

src = replaceField(src, DTCC, "marketImplications",
  "Production T+0 settlement, if realized, would create a compelling case for issuers to tokenize securities \u2014 particularly in fixed income, where settlement risk and associated capital charges are most significant. DTCC\\'s approach \u2014 integrating with existing message formats and participant identifiers \u2014 is designed to minimize disruption to member firms. The timeline for production readiness remains an open question that the industry is watching closely."
);

src = replaceField(src, DTCC, "infraImplications",
  "DTCC\\'s Ion platform uses a permissioned blockchain with existing message formats and participant identifiers, positioning it as the institutional-grade option for tokenized settlement. This approach contrasts with public-chain tokenization (BlackRock/Securitize) and represents DTCC\\'s strategy for maintaining its central infrastructure role as the industry moves toward blockchain-based settlement. Competitive dynamics with newer entrants like Fnality and Partior are relevant context."
);


// ═══ 3. US STABLECOIN ACT ═══
console.log("\nUS Stablecoin Act:");
const STABLE = "US Senate Stablecoin Regulation Bill Advances Through Committee With Bipartisan Support";

src = replaceField(src, STABLE, "content",
  "Stablecoin regulation legislation has advanced through the Senate Banking Committee with bipartisan support, marking the most significant legislative progress to date toward establishing a federal regulatory framework for stablecoin issuers in the United States.\\n\\nThe bill \u2014 commonly referred to as the GENIUS Act (Guiding and Establishing National Innovation for US Stablecoins Act) \u2014 would establish the first comprehensive federal framework for stablecoin regulation. Key provisions under discussion include:\\n\\n\u2022 Federal oversight requirements for stablecoin issuers above a specified circulation threshold\\n\u2022 Reserve backing requirements intended to ensure stablecoins are fully backed by high-quality liquid assets such as US Treasuries or insured deposits\\n\u2022 Regular reserve attestation requirements by registered accounting firms\\n\u2022 Consumer protection provisions including redemption rights\\n\u2022 Preservation of state-level regulatory authority for smaller issuers\\n\\nThe legislation has attracted bipartisan support, reflecting an unusual political alignment: Republicans broadly view stablecoin regulation as reinforcing US dollar dominance in digital payments, while Democrats support the consumer protection and regulatory oversight provisions. Senator Cynthia Lummis (R-WY) has been a prominent advocate for the legislation.\\n\\nThe implications are most significant for large stablecoin issuers. Circle (USDC), which has emphasized regulatory compliance in its operations, is generally viewed as well-positioned under the proposed framework. Tether (USDT), the largest stablecoin issuer by circulation, faces questions about whether its reserve composition and audit practices would meet the bill\\'s requirements.\\n\\nTraditional banks have shown growing interest in stablecoin issuance pending regulatory clarity. Several major banks are reported to be evaluating stablecoin products that they would launch once a federal framework is enacted.\\n\\nThe bill must still pass the full Senate and be reconciled with any House legislation before reaching the President\\'s desk. The timeline for a floor vote remains subject to Senate scheduling and potential amendments. Industry observers expect additional debate on specific thresholds, the scope of federal versus state authority, and how the framework interacts with existing banking regulation.\\n\\nIf enacted, the legislation would give the Federal Reserve and other banking regulators implementing authority to develop detailed rules, a process that typically takes 12-18 months after a bill becomes law."
);

src = replaceField(src, STABLE, "whatHappened",
  "Stablecoin regulation legislation, known as the GENIUS Act, has advanced through the Senate Banking Committee with bipartisan support. The bill would establish the first federal regulatory framework for stablecoin issuers, including reserve backing requirements, federal oversight for large issuers, and consumer protection provisions. A full Senate floor vote has not yet been scheduled."
);

src = replaceField(src, STABLE, "whyItMatters",
  "This would be the first major federal legislation specifically addressing digital assets in the United States. By creating clear licensing and reserve requirements, the framework would legitimize stablecoins as a regulated payment instrument and extend US regulatory oversight to the broader stablecoin market. The mandatory reserve backing requirements strengthen the link between stablecoins and US government securities, which proponents argue reinforces dollar dominance in digital payments."
);

src = replaceField(src, STABLE, "marketImplications",
  "Circle and Paxos are generally viewed as well-positioned under the proposed requirements given their existing compliance practices. Tether faces questions about whether its reserve composition and audit practices would meet the bill\\'s standards. If enacted, the regulatory clarity could attract new institutional entrants to stablecoin issuance, including traditional banks. The timeline for enactment remains uncertain pending Senate floor action and House reconciliation."
);

src = replaceField(src, STABLE, "regulatoryImplications",
  "The bill would create a dual federal/state framework similar to banking regulation \u2014 federal oversight for larger issuers, state authority preserved for smaller ones. Implementation would require the Federal Reserve and other banking regulators to develop detailed rules, a process that typically takes 12-18 months. Internationally, the legislation would establish one of two emerging global standards for stablecoin regulation alongside the EU\\'s MiCA framework."
);


// ═══ 4. BTC STRATEGIC RESERVE ═══
console.log("\nBTC Strategic Reserve:");
const BTC = "Reports Indicate US Treasury Evaluating Bitcoin Acquisition for Proposed Strategic Reserve";

src = replaceField(src, BTC, "content",
  "President Trump signed Executive Order 14128 in March 2025 establishing a Strategic Bitcoin Reserve, directing the US Treasury Department to develop a framework for holding Bitcoin as a strategic reserve asset. The implementation of this directive \u2014 including the scale, timeline, and method of any acquisitions \u2014 remains under active development.\\n\\nThe executive order authorized the Treasury to establish a Bitcoin reserve and evaluate acquisition strategies. Initial reporting indicated that the reserve would begin with Bitcoin already held by the federal government through law enforcement seizures and forfeitures. The government holds a significant quantity of Bitcoin from various enforcement actions, though the precise amount available for transfer to a formal reserve has not been publicly confirmed.\\n\\nWhether and when the Treasury would pursue open-market purchases beyond seized assets is a subject of ongoing deliberation. Treasury Secretary Scott Bessent has spoken publicly about the strategic rationale for the reserve, framing it in the context of maintaining US strategic optionality in the evolving global monetary landscape. However, no confirmed open-market Bitcoin acquisition by the Treasury has been publicly announced as of early March 2026.\\n\\nThe reserve concept has attracted both support and criticism. Proponents argue that early positioning in Bitcoin \u2014 which has a fixed 21 million supply cap \u2014 represents strategic foresight analogous to historical sovereign gold accumulation. Critics, including some former senior Treasury officials, have questioned whether public funds should be used to acquire a volatile digital asset.\\n\\nAt the state level, several US states have introduced or passed legislation establishing their own Bitcoin reserve programs. El Salvador, which began accumulating Bitcoin in 2021, continues to hold a significant national position. The international dimension is notable: if the US proceeds with meaningful Bitcoin accumulation, it could trigger similar reserve considerations by other sovereigns.\\n\\nThe key open questions are: what acquisition strategy the Treasury will ultimately adopt, whether Congress will appropriate funds for open-market purchases beyond seized assets, and what custody and security arrangements will govern the reserve. These implementation details remain unresolved."
);

src = replaceField(src, BTC, "whatHappened",
  "Executive Order 14128, signed in March 2025, authorized the US Treasury to establish a Strategic Bitcoin Reserve. The directive instructed the Treasury to develop an acquisition framework, with initial discussion focusing on Bitcoin already held by the federal government through law enforcement seizures. Whether and when open-market purchases would occur remains under deliberation. No confirmed acquisitions have been publicly announced."
);

src = replaceField(src, BTC, "whyItMatters",
  "The executive order makes the US government a declared participant in Bitcoin\\'s strategic landscape, even before any confirmed purchases. The policy signal alone is significant: it frames Bitcoin as a strategic asset comparable to gold reserves, which changes the asset\\'s institutional standing. If the Treasury proceeds with meaningful accumulation, it would create sustained demand pressure on a fixed-supply asset and potentially trigger similar reserve policies by other sovereigns."
);

src = replaceField(src, BTC, "marketImplications",
  "The executive order\\'s existence creates policy optionality that markets have partially priced in, though the lack of confirmed purchases leaves significant uncertainty. The key variables are: whether Congress appropriates funds for open-market purchases, what acquisition timeline the Treasury adopts, and which execution counterparties are selected. State-level Bitcoin reserve programs are proceeding independently in several US states, creating a multi-layered sovereign demand picture."
);

src = replaceField(src, BTC, "infraImplications",
  "The reserve raises open questions about institutional Bitcoin custody at sovereign scale. Any Treasury acquisition program would need to establish custody arrangements meeting federal security standards \u2014 likely involving regulated digital asset custodians. The precedent would establish the template for sovereign Bitcoin custody that other governments would likely reference."
);

// ═══ Write ═══
writeFileSync(SEED, src, "utf-8");
console.log("\nDone. All 4 articles rewritten.");
