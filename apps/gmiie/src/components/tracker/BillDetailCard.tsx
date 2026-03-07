import { BillStatusBadge } from "./BillStatusBadge";
import type { BillListItem } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   BILL DETAIL CARD
   Narrative explainer for a single bill — plain-English clarity.
   Shows: bill number, title, what changed, why it matters,
   status, confidence, next steps.
   ═══════════════════════════════════════════════════════════════ */

interface BillDetailCardProps {
  bill: BillListItem;
}

export function BillDetailCard({ bill }: BillDetailCardProps) {
  const lastAction = bill.lastActionDate
    ? new Date(bill.lastActionDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const introduced = bill.introducedDate
    ? new Date(bill.introducedDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const TIER_LABELS: Record<string, string> = {
    TIER_1: "Official source",
    TIER_2: "Major media",
    TIER_3: "Crypto-native",
    TIER_4: "Unverified",
  };

  return (
    <div className="p-5 rounded-xl bg-surface border border-border-subtle">
      {/* Header: bill number + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body font-mono font-bold text-gold">
              {bill.sourceUrl ? (
                <a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {bill.billNumber} ↗
                </a>
              ) : (
                bill.billNumber
              )}
            </span>
            {bill.chamber && (
              <span className="text-caption font-mono text-text-muted">
                {bill.chamber}
              </span>
            )}
          </div>
          <h3 className="text-body font-semibold text-text-primary">
            {bill.title}
          </h3>
        </div>
        <BillStatusBadge status={bill.status} size="md" />
      </div>

      {/* Summary */}
      {bill.summary && (
        <p className="text-body-sm text-text-secondary leading-relaxed mb-3">
          {bill.summary}
        </p>
      )}

      {/* What changed */}
      {bill.whatChanged && (
        <div className="mb-3">
          <h4 className="text-caption font-mono font-semibold text-text-muted uppercase tracking-wider mb-1">
            What Changed
          </h4>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {bill.whatChanged}
          </p>
        </div>
      )}

      {/* Why it matters */}
      {bill.whyItMatters && (
        <div className="mb-3">
          <h4 className="text-caption font-mono font-semibold text-text-muted uppercase tracking-wider mb-1">
            Why It Matters
          </h4>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {bill.whyItMatters}
          </p>
        </div>
      )}

      {/* Metadata footer */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-subtle text-caption font-mono text-text-muted">
        {introduced && (
          <span>Introduced: {introduced}</span>
        )}
        {lastAction && (
          <span>Last action: {lastAction}</span>
        )}
        {bill.sponsorName && (
          <>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Sponsor: {bill.sponsorName}</span>
          </>
        )}
        {bill.credibilityTier && (
          <>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{TIER_LABELS[bill.credibilityTier] ?? bill.credibilityTier}</span>
          </>
        )}
      </div>
    </div>
  );
}
