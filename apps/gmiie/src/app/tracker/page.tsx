import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getTrackedStates } from "@/lib/data";
import { StateCard } from "@/components/tracker/StateCard";
import { TrackerViewSwitcher } from "./TrackerViewSwitcher";
import type { StateTrackerListItem } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "State Stablecoin Tracker",
  description: "Continuously monitored state-level stablecoin legislation. Status tracking for Florida, Wyoming, Nebraska, Texas, New York, and other active states.",
  path: "/tracker",
  domain: "gmiie.xxxiii.io",
});

/* ── Bill status lifecycle ordering for color-coded grid ── */
const STATUS_ORDER: Record<string, number> = {
  EFFECTIVE: 1,
  SIGNED_INTO_LAW: 2,
  PASSED_LEGISLATURE: 3,
  ACTIVE_LEGISLATION: 4,
  MONITORING: 5,
  STALLED: 6,
  NO_ACTIVITY: 7,
};

export default async function TrackerPage() {
  let states: StateTrackerListItem[] = [];

  try {
    states = await getTrackedStates();
  } catch {
    // DB not connected
  }

  // Sort by activity level
  const sorted = [...states].sort((a, b) => {
    const oa = STATUS_ORDER[a.status] ?? 99;
    const ob = STATUS_ORDER[b.status] ?? 99;
    return oa - ob;
  });

  const activeCount = sorted.filter((s) =>
    ["ACTIVE_LEGISLATION", "PASSED_LEGISLATURE", "SIGNED_INTO_LAW", "EFFECTIVE"].includes(s.status)
  ).length;

  const totalBills = sorted.reduce((sum, s) => sum + s.billCount, 0);

  return (
    <div>
      {/* ═══ Header ═══ */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-0.5 bg-gold" />
          <h1 className="text-headline sm:text-display font-serif font-bold text-text-primary">
            State Stablecoin Tracker
          </h1>
        </div>
        <p className="text-body-sm sm:text-body text-text-secondary max-w-2xl leading-relaxed">
          GMIIE continuously monitors state-level stablecoin legislation and publishes
          status changes when they are verified and meaningful.
        </p>
      </div>

      {/* ═══ Stats bar ═══ */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green" />
          <span className="meta-line">Continuously Monitored</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
          <StatPill label="States" value={sorted.length} />
          <StatPill label="Active" value={activeCount} />
          <StatPill label="Bills" value={totalBills} />
        </div>
        <span className="meta-line ml-auto hidden md:block text-text-muted/60">
          Cross-checked · Verification-assisted
        </span>
      </div>

      {/* ═══ View switcher (client component) + content ═══ */}
      <TrackerViewSwitcher states={sorted} />

      {/* ═══ Methodology note ═══ */}
      <div className="mt-8 sm:mt-12 p-5 rounded-xl bg-surface border border-border-subtle">
        <h3 className="meta-line text-gold mb-2">How This Tracker Works</h3>
        <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
          GMIIE monitors official state legislature sites, detects bill changes, compares
          versions, flags status changes, classifies by topic, and generates summary drafts
          for editorial review. Updates are published only when they are verified and meaningful.
        </p>
        <p className="text-caption font-mono text-text-muted/60">
          Source: Official state legislature records · Not legal advice · Last verified: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

/* ── Reusable stat pill (matches homepage) ── */
function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-body-sm font-mono font-semibold text-text-primary">{value}</span>
      <span className="text-caption text-text-muted">{label}</span>
    </div>
  );
}
