import { BillStatusBadge } from "./BillStatusBadge";
import type { BillListItem } from "@/lib/models";

/* ═══════════════════════════════════════════════════════════════
   BILL TRACKER TABLE
   Serious-user view: sortable table of all bills for a state.
   Shows: bill number, title, status, chamber, last action, sponsor
   ═══════════════════════════════════════════════════════════════ */

interface BillTrackerTableProps {
  bills: BillListItem[];
}

export function BillTrackerTable({ bills }: BillTrackerTableProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-8 text-body-sm text-text-muted">
        No bills currently tracked for this state.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="bg-surface border-b border-border-subtle">
            <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase">Bill</th>
            <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase">Title</th>
            <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase">Status</th>
            <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase hidden sm:table-cell">Chamber</th>
            <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase hidden md:table-cell">Last Action</th>
            <th className="text-left px-4 py-3 font-mono text-label text-text-muted tracking-wider uppercase hidden lg:table-cell">Sponsor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {bills.map((bill) => (
            <tr key={bill.id} className="hover:bg-surface-elevated transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-gold whitespace-nowrap">
                {bill.sourceUrl ? (
                  <a href={bill.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {bill.billNumber} ↗
                  </a>
                ) : (
                  bill.billNumber
                )}
              </td>
              <td className="px-4 py-3 text-text-secondary max-w-[300px]">
                <div className="line-clamp-2">{bill.title}</div>
              </td>
              <td className="px-4 py-3">
                <BillStatusBadge status={bill.status} size="sm" />
              </td>
              <td className="px-4 py-3 text-text-muted font-mono hidden sm:table-cell">
                {bill.chamber ?? "—"}
              </td>
              <td className="px-4 py-3 text-text-muted font-mono hidden md:table-cell whitespace-nowrap">
                {bill.lastActionDate
                  ? new Date(bill.lastActionDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </td>
              <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                {bill.sponsorName ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
