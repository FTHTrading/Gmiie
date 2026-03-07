import Link from "next/link";
import type { SignalDimension, CompositeIndexModel } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   MOBILE SIGNALS SUMMARY
   Compact inline signals block shown on mobile where the
   full SignalsPanel sidebar is hidden (< xl breakpoint).
   Shows: Composite index score + top 3 signals + link to full view.
   ═══════════════════════════════════════════════════════════════ */

interface MobileSignalsSummaryProps {
  signals?: SignalDimension[];
  compositeIndex?: CompositeIndexModel | null;
}

export function MobileSignalsSummary({ signals, compositeIndex }: MobileSignalsSummaryProps) {
  const displayIndex = compositeIndex || { score: 7.4, sampleSize: 0, dimensions: [] };

  // Show top 3 signals by score
  const topSignals = signals
    ? [...signals].sort((a, b) => b.score - a.score).slice(0, 3)
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 7.5) return "text-green";
    if (score >= 5.0) return "text-gold";
    return "text-red";
  };

  return (
    <div className="xl:hidden bg-surface rounded-xl border border-border-subtle p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase">
          GMIIE Index
        </h3>
        <Link
          href="/signals"
          className="text-caption text-gold/70 hover:text-gold transition-colors"
        >
          Full Signals →
        </Link>
      </div>

      {/* Composite score + top signals in a row */}
      <div className="flex items-center gap-4">
        {/* Big score */}
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-mono font-bold ${getScoreColor(displayIndex.score)}`}>
            {displayIndex.score.toFixed(1)}
          </span>
          <span className="text-caption font-mono text-text-muted">/10</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border-subtle" />

        {/* Top signals */}
        <div className="flex-1 flex items-center gap-3 overflow-x-auto">
          {topSignals.map((signal) => (
            <div key={signal.key} className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-caption text-text-muted truncate max-w-[80px]">
                {signal.label.replace("Institutional ", "Inst. ").replace("Infrastructure ", "Infra. ")}
              </span>
              <span className={`text-caption font-mono font-bold ${getScoreColor(signal.score)}`}>
                {signal.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence disclaimer */}
      <p className="text-[10px] font-mono text-text-muted/50 mt-2">
        Model-generated · Not investment advice
      </p>
    </div>
  );
}
