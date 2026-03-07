/* ═══════════════════════════════════════════════════════════════
   BILL STATUS BADGE
   Crisp lifecycle-state badge for legislation tracking.
   Uses clear, meaningful status language — not vague headlines.
   ═══════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  INTRODUCED:              { label: "Introduced",           className: "bg-surface-elevated text-text-muted border-border-subtle" },
  IN_COMMITTEE:            { label: "In Committee",         className: "bg-blue/10 text-blue border-blue/20" },
  ADVANCED_FROM_COMMITTEE: { label: "Advanced",             className: "bg-cyan/10 text-cyan border-cyan/20" },
  PASSED_CHAMBER:          { label: "Passed Chamber",       className: "bg-purple/10 text-purple border-purple/20" },
  PASSED_LEGISLATURE:      { label: "Passed Legislature",   className: "bg-gold/10 text-gold border-gold/20" },
  AWAITING_GOVERNOR:       { label: "Awaiting Governor",    className: "bg-gold/15 text-gold border-gold/30" },
  SIGNED:                  { label: "Signed into Law",      className: "bg-green/10 text-green border-green/20" },
  EFFECTIVE:               { label: "Effective",            className: "bg-green/15 text-green border-green/30" },
  STALLED:                 { label: "Stalled",              className: "bg-red/10 text-red border-red/20" },
  DEAD:                    { label: "Dead",                 className: "bg-surface-elevated text-text-muted line-through border-border-subtle" },
};

interface BillStatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function BillStatusBadge({ status, size = "sm" }: BillStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status.replace(/_/g, " "), className: "bg-surface-elevated text-text-muted border-border-subtle" };

  const sizeClass = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-caption px-2.5 py-1";

  return (
    <span className={`inline-flex items-center font-mono font-semibold tracking-wide uppercase rounded border ${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  );
}

/* ── State-level status badge ── */

const STATE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  MONITORING:           { label: "Monitoring",          className: "bg-surface-elevated text-text-muted border-border-subtle" },
  ACTIVE_LEGISLATION:   { label: "Active Legislation",  className: "bg-blue/10 text-blue border-blue/20" },
  PASSED_LEGISLATURE:   { label: "Passed Legislature",  className: "bg-gold/10 text-gold border-gold/20" },
  SIGNED_INTO_LAW:      { label: "Signed into Law",     className: "bg-green/10 text-green border-green/20" },
  EFFECTIVE:            { label: "Effective",            className: "bg-green/15 text-green border-green/30" },
  STALLED:              { label: "Stalled",              className: "bg-red/10 text-red border-red/20" },
  NO_ACTIVITY:          { label: "No Activity",         className: "bg-surface-elevated text-text-muted border-border-subtle" },
};

export function StateStatusBadge({ status, size = "sm" }: BillStatusBadgeProps) {
  const config = STATE_STATUS_CONFIG[status] ?? STATE_STATUS_CONFIG.MONITORING!;

  const sizeClass = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-caption px-2.5 py-1";

  return (
    <span className={`inline-flex items-center font-mono font-semibold tracking-wide uppercase rounded border ${config.className} ${sizeClass}`}>
      {config.label}
    </span>
  );
}
