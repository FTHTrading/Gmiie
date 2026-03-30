import Link from "next/link";
import type { SignalDimension, CompositeIndexModel } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   MOBILE SIGNALS SUMMARY
   Phone-first inline signals block shown where the full
   SignalsPanel sidebar is hidden (< xl breakpoint).
   Composite score + 4-signal grid + link to full view.
   ═══════════════════════════════════════════════════════════════ */

interface MobileSignalsSummaryProps {
  signals?: SignalDimension[];
  compositeIndex?: CompositeIndexModel | null;
}

function scoreColor(score: number) {
  if (score >= 7.5) return "text-green";
  if (score >= 5.0) return "text-gold";
  return "text-red";
}

function scoreBg(score: number) {
  if (score >= 7.5) return "bg-green/10 border-green/20";
  if (score >= 5.0) return "bg-gold/10 border-gold/20";
  return "bg-red/10 border-red/20";
}

function shortenLabel(label: string) {
  return label
    .replace("Institutional ", "Inst. ")
    .replace("Infrastructure ", "Infra. ")
    .replace("Cross-Border ", "Intl. ")
    .replace("Settlement ", "Settle. ");
}

export function MobileSignalsSummary({ signals, compositeIndex }: MobileSignalsSummaryProps) {
  const displayIndex = compositeIndex ?? { score: 7.4, sampleSize: 0, dimensions: [] };

  // Sort by extremity (most deviated from center 5.0) so noteworthy signals surface first
  const topSignals = signals
    ? [...signals].sort((a, b) => Math.abs(b.score - 5) - Math.abs(a.score - 5)).slice(0, 4)
    : [];

  return (
    <div className="xl:hidden bg-surface rounded-xl border border-border-subtle p-4 mb-6">

      {/* ── Header row: label + link ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase">
            GMIIE Market Index
          </h3>
          <p className="text-[10px] font-mono text-text-muted/50 mt-0.5">
            Model-generated · not investment advice
          </p>
        </div>
        <Link
          href="/signals"
          className="text-label font-mono text-gold/70 hover:text-gold transition-colors flex items-center gap-1 whitespace-nowrap ml-3 mt-0.5"
        >
          Full view →
        </Link>
      </div>

      {/* ── Composite score block ── */}
      <div className="flex items-end gap-4 mb-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-4xl font-mono font-bold ${scoreColor(displayIndex.score)}`}>
              {displayIndex.score.toFixed(1)}
            </span>
            <span className="text-body-sm font-mono text-text-muted">/10</span>
          </div>
          <p className="text-caption font-mono text-text-muted mt-0.5">Composite score</p>
        </div>

        {displayIndex.sampleSize > 0 && (
          <div className="ml-auto text-right">
            <div className="text-heading-sm font-mono font-bold text-text-primary">
              {displayIndex.sampleSize}
            </div>
            <div className="text-caption font-mono text-text-muted">signals</div>
          </div>
        )}
      </div>

      {/* ── Signal dimensions grid — 2 columns ── */}
      {topSignals.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {topSignals.map((signal) => (
            <div
              key={signal.key}
              className={`rounded-lg border p-3 ${scoreBg(signal.score)}`}
            >
              <div className="text-[10px] font-mono text-text-muted uppercase tracking-wide leading-tight mb-1.5">
                {shortenLabel(signal.label)}
              </div>
              <span className={`text-lg font-mono font-bold leading-none ${scoreColor(signal.score)}`}>
                {signal.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback when no live signals loaded */
        <p className="text-caption font-mono text-text-muted/60 text-center py-2">
          Signals loading…
        </p>
      )}
    </div>
  );
}
