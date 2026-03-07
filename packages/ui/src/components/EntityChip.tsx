import { cn } from "../index";

export interface EntityChipProps {
  name: string;
  type?: string;
  href?: string;
  size?: "sm" | "md";
}

export function EntityChip({ name, type, href, size = "sm" }: EntityChipProps) {
  const Component = href ? "a" : "span";
  return (
    <Component
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        "bg-surface-elevated border border-border-subtle",
        "text-text-secondary hover:text-text-primary hover:border-gold/30",
        "transition-all duration-200",
        href && "cursor-pointer",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm"
      )}
    >
      {type && (
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
      )}
      {name}
    </Component>
  );
}
