import { cn } from "../index";

export interface TopicBadgeProps {
  name: string;
  href?: string;
  color?: string;
  count?: number;
}

export function TopicBadge({ name, href, color, count }: TopicBadgeProps) {
  const Component = href ? "a" : "span";
  return (
    <Component
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
        "bg-surface border border-border-subtle",
        "text-sm text-text-secondary hover:text-text-primary",
        "hover:border-gold/30 transition-all duration-200",
        href && "cursor-pointer"
      )}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {name}
      {count !== undefined && (
        <span className="text-xs text-text-muted ml-1">({count})</span>
      )}
    </Component>
  );
}
