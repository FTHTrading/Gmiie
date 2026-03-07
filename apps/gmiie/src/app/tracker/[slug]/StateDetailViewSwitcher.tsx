"use client";

import { useState } from "react";
import { BillTrackerTable } from "@/components/tracker/BillTrackerTable";
import { BillDetailCard } from "@/components/tracker/BillDetailCard";
import { StateTimeline } from "@/components/tracker/StateTimeline";
import type { StateTrackerDetail } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   STATE DETAIL VIEW SWITCHER
   Tabs: Bills (table) / Narrative (cards) / Timeline
   ═══════════════════════════════════════════════════════════════ */

type ViewMode = "table" | "narrative" | "timeline";

interface StateDetailViewSwitcherProps {
  state: StateTrackerDetail;
}

export function StateDetailViewSwitcher({ state }: StateDetailViewSwitcherProps) {
  const [view, setView] = useState<ViewMode>("table");

  const views: { key: ViewMode; label: string }[] = [
    { key: "table", label: "Bill Tracker" },
    { key: "narrative", label: "Narrative" },
    { key: "timeline", label: "Timeline" },
  ];

  return (
    <div>
      {/* View tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-surface rounded-lg border border-border-subtle w-fit">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-3 py-1.5 text-caption font-mono font-semibold rounded-md transition-all ${
              view === v.key
                ? "bg-gold/10 text-gold border border-gold/20"
                : "text-text-muted hover:text-text-secondary border border-transparent"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* View: Bill Tracker Table */}
      {view === "table" && (
        <BillTrackerTable bills={state.bills} />
      )}

      {/* View: Narrative Cards */}
      {view === "narrative" && (
        <div className="space-y-4">
          {state.bills.length === 0 ? (
            <div className="text-center py-8 text-body-sm text-text-muted">
              No bills currently tracked for this state.
            </div>
          ) : (
            state.bills.map((bill) => (
              <BillDetailCard key={bill.id} bill={bill} />
            ))
          )}
        </div>
      )}

      {/* View: Timeline */}
      {view === "timeline" && (
        <StateTimeline bills={state.bills} stateUpdates={state.updates} />
      )}
    </div>
  );
}
