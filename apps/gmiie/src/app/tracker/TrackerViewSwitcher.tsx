"use client";

import { useState } from "react";
import { StateCard } from "@/components/tracker/StateCard";
import { StateStatusBadge, BillStatusBadge } from "@/components/tracker/BillStatusBadge";
import type { StateTrackerListItem } from "@/lib/models";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   TRACKER VIEW SWITCHER
   Three views:
     A — Grid: Fast visual scan of state cards
     B — Table: Serious-user sortable overview
     C — Narrative: Plain-English explainer for broader readers
   ═══════════════════════════════════════════════════════════════ */

type ViewMode = "grid" | "table" | "narrative";

interface TrackerViewSwitcherProps {
  states: StateTrackerListItem[];
}

export function TrackerViewSwitcher({ states }: TrackerViewSwitcherProps) {
  const [view, setView] = useState<ViewMode>("grid");

  const views: { key: ViewMode; label: string }[] = [
    { key: "grid", label: "State Grid" },
    { key: "table", label: "Bill Tracker" },
    { key: "narrative", label: "Explainer" },
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

      {/* View A: State Grid */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {states.map((state) => (
            <StateCard key={state.slug} state={state} />
          ))}
          {states.length === 0 && (
            <div className="col-span-full text-center py-12 text-body-sm text-text-muted">
              No states currently tracked. Tracker data will appear once the system is seeded.
            </div>
          )}
        </div>
      )}

      {/* View B: Bill Tracker Table */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="bg-surface border-b border-border-subtle">
                <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase">State</th>
                <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase">Status</th>
                <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase">Bills</th>
                <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase hidden sm:table-cell">Latest Bill</th>
                <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase hidden md:table-cell">Last Action</th>
                <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase hidden lg:table-cell">Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {states.map((state) => (
                <tr key={state.slug} className="hover:bg-surface-elevated transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/tracker/${state.slug}`} className="font-semibold text-text-primary hover:text-gold transition-colors">
                      {state.name}
                    </Link>
                    <span className="text-caption font-mono text-text-muted ml-1.5">{state.abbreviation}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StateStatusBadge status={state.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">
                    {state.billCount}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {state.latestBillStatus ? (
                      <BillStatusBadge status={state.latestBillStatus} size="sm" />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-text-muted hidden md:table-cell whitespace-nowrap">
                    {state.lastActionDate
                      ? new Date(state.lastActionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden lg:table-cell max-w-[200px]">
                    <span className="line-clamp-1">{state.nextExpectedStep ?? "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {states.length === 0 && (
            <div className="text-center py-12 text-body-sm text-text-muted">
              No states currently tracked.
            </div>
          )}
        </div>
      )}

      {/* View C: Narrative Explainer */}
      {view === "narrative" && (
        <div className="space-y-6 max-w-3xl">
          {states.length === 0 && (
            <div className="text-center py-12 text-body-sm text-text-muted">
              No states currently tracked.
            </div>
          )}

          {states.map((state) => (
            <div key={state.slug} className="p-5 sm:p-6 rounded-xl bg-surface border border-border-subtle">
              <div className="flex items-start justify-between gap-3 mb-3">
                <Link href={`/tracker/${state.slug}`} className="group">
                  <h3 className="text-body sm:text-headline font-serif font-bold text-text-primary group-hover:text-gold transition-colors">
                    {state.name}
                  </h3>
                </Link>
                <StateStatusBadge status={state.status} size="md" />
              </div>

              {state.summary && (
                <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
                  {state.summary}
                </p>
              )}

              {state.whyItMatters && (
                <div className="mb-3">
                  <h4 className="text-caption font-mono font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Why It Matters
                  </h4>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    {state.whyItMatters}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-subtle text-caption font-mono text-text-muted">
                <span>{state.billCount} bill{state.billCount !== 1 ? "s" : ""} tracked</span>
                {state.latestBillStatus && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <BillStatusBadge status={state.latestBillStatus} size="sm" />
                  </>
                )}
                {state.nextExpectedStep && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>
                      <span className="text-gold/70">Next → </span>
                      {state.nextExpectedStep}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-3">
                <Link
                  href={`/tracker/${state.slug}`}
                  className="text-caption font-mono text-gold/70 hover:text-gold transition-colors"
                >
                  Full state profile + bill timeline →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
