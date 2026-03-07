export interface SignalGaugeProps {
  label: string;
  score: number; // 0-100
  trend?: string; // e.g. "+3", "-1"
  compact?: boolean;
}

export function SignalGauge({
  label,
  score,
  trend,
  compact = false,
}: SignalGaugeProps) {
  const segments = 10;
  const filled = Math.round(score / 10);

  const getColor = (s: number) => {
    if (s >= 80) return { bar: "bg-green", text: "text-green" };
    if (s >= 60) return { bar: "bg-gold", text: "text-gold" };
    if (s >= 40) return { bar: "bg-blue", text: "text-blue" };
    return { bar: "bg-text-muted", text: "text-text-muted" };
  };

  const colors = getColor(score);

  return (
    <div className={compact ? "py-2" : "py-2.5"}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`${compact ? "text-body-sm" : "text-body"} text-text-secondary font-medium`}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${compact ? "text-body-sm" : "text-body"} ${colors.text}`}>
            {score.toFixed(1)}
          </span>
          {trend && (
            <span
              className={`text-label font-mono ${
                trend.startsWith("+") ? "text-green" : trend.startsWith("-") ? "text-red" : "text-text-muted"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-sm transition-colors duration-500 ${
              i < filled ? colors.bar : "bg-surface-elevated"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
