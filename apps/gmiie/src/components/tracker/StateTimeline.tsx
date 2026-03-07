import { BillStatusBadge } from "./BillStatusBadge";
import type { BillListItem, BillUpdateItem, StateUpdateItem } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   STATE TIMELINE
   Chronological history of all bill actions and state updates.
   Merges bill updates + state-level updates into one timeline.
   ═══════════════════════════════════════════════════════════════ */

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string | null;
  status: string | null;
  sourceUrl: string | null;
  category: string | null;
  billNumber?: string;
}

interface StateTimelineProps {
  bills: BillListItem[];
  stateUpdates: StateUpdateItem[];
}

export function StateTimeline({ bills, stateUpdates }: StateTimelineProps) {
  // Merge bill updates and state updates into one sorted timeline
  const entries: TimelineEntry[] = [];

  for (const bill of bills) {
    for (const update of bill.updates) {
      entries.push({
        id: update.id,
        date: update.date,
        title: update.title,
        description: update.description,
        status: update.status,
        sourceUrl: update.sourceUrl,
        category: "legislation",
        billNumber: bill.billNumber,
      });
    }
  }

  for (const update of stateUpdates) {
    entries.push({
      id: update.id,
      date: update.date,
      title: update.title,
      description: update.description,
      status: null,
      sourceUrl: update.sourceUrl,
      category: update.category,
    });
  }

  // Sort newest-first
  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-body-sm text-text-muted">
        No timeline events recorded yet.
      </div>
    );
  }

  const CATEGORY_ICON: Record<string, string> = {
    legislation: "⬡",
    executive: "◆",
    implementation: "◈",
    pilot: "◉",
  };

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle" />

      <div className="space-y-0">
        {entries.map((entry, i) => {
          const date = new Date(entry.date);
          const isFirst = i === 0;

          return (
            <div key={entry.id} className="relative pl-10 pb-6">
              {/* Dot */}
              <div className={`absolute left-3 top-1.5 w-3 h-3 rounded-full border-2 ${
                isFirst ? "bg-gold border-gold" : "bg-background border-border-subtle"
              }`} />

              {/* Date */}
              <div className="text-caption font-mono text-text-muted mb-1">
                {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                {entry.billNumber && (
                  <span className="ml-2 text-gold/70">{entry.billNumber}</span>
                )}
                {entry.category && (
                  <span className="ml-2 text-text-muted/50">
                    {CATEGORY_ICON[entry.category] ?? "·"} {entry.category}
                  </span>
                )}
              </div>

              {/* Title + status */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="text-body-sm font-semibold text-text-primary">
                  {entry.sourceUrl ? (
                    <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
                      {entry.title} ↗
                    </a>
                  ) : (
                    entry.title
                  )}
                </h4>
                {entry.status && (
                  <BillStatusBadge status={entry.status} size="sm" />
                )}
              </div>

              {/* Description */}
              {entry.description && (
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  {entry.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
