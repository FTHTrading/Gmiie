import Link from "next/link";
import { BillStatusBadge, StateStatusBadge } from "./BillStatusBadge";
import type { StateTrackerListItem } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   STATE CARD
   Compact card for the state tracker grid view.
   Shows: state name, status badge, summary, bill count,
   last action date, next expected step.
   ═══════════════════════════════════════════════════════════════ */

interface StateCardProps {
  state: StateTrackerListItem;
}

export function StateCard({ state }: StateCardProps) {
  const lastAction = state.lastActionDate
    ? new Date(state.lastActionDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <Link href={`/tracker/${state.slug}`}>
      <div className="group p-5 rounded-xl bg-surface border border-border-subtle hover:border-gold/30 transition-all cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors">
              {state.name}
            </h3>
            <span className="text-caption font-mono text-text-muted">{state.abbreviation}</span>
          </div>
          <StateStatusBadge status={state.status} size="sm" />
        </div>

        {/* Summary */}
        {state.summary && (
          <p className="text-body-sm text-text-secondary line-clamp-2 mb-3 flex-1">
            {state.summary}
          </p>
        )}

        {/* Bill status */}
        {state.latestBillStatus && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-caption text-text-muted">Latest bill:</span>
            <BillStatusBadge status={state.latestBillStatus} size="sm" />
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-caption font-mono text-text-muted">
              {state.billCount} bill{state.billCount !== 1 ? "s" : ""}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-caption font-mono text-text-muted">
              {lastAction}
            </span>
          </div>
        </div>

        {/* Next step */}
        {state.nextExpectedStep && (
          <div className="mt-2 text-caption text-text-muted">
            <span className="text-gold/70 mr-1">Next →</span>
            {state.nextExpectedStep}
          </div>
        )}
      </div>
    </Link>
  );
}
