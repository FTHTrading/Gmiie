import { cn } from "../index";

export interface SignalScoreProps {
  label: string;
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
}

export function SignalScore({ label, score, size = "md" }: SignalScoreProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green";
    if (s >= 60) return "text-gold";
    if (s >= 40) return "text-blue-light";
    if (s >= 20) return "text-purple";
    return "text-text-muted";
  };

  const getBarColor = (s: number) => {
    if (s >= 80) return "bg-green";
    if (s >= 60) return "bg-gold";
    if (s >= 40) return "bg-blue";
    if (s >= 20) return "bg-purple";
    return "bg-text-muted";
  };

  return (
    <div className={cn("flex flex-col gap-1.5", size === "sm" && "gap-1")}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-medium text-text-secondary",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "font-mono font-bold",
            getColor(score),
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-lg"
          )}
        >
          {score}
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", getBarColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
