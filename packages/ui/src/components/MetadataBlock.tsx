import { cn } from "../index";

export interface MetadataBlockProps {
  items: { label: string; value: string }[];
  className?: string;
}

export function MetadataBlock({ items, className }: MetadataBlockProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-xl",
        "bg-surface-elevated border border-border-subtle",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label}>
          <span className="block text-xs font-mono tracking-wider text-text-muted uppercase mb-1">
            {item.label}
          </span>
          <span className="text-sm text-text-primary font-medium">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
