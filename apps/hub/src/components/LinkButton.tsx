import { cn } from "@xxxiii/ui";

interface LinkButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
}: LinkButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        // Variants
        variant === "primary" && "bg-gold text-background hover:bg-gold-light",
        variant === "secondary" && "bg-surface-elevated text-text-primary hover:bg-border",
        variant === "ghost" && "text-text-secondary hover:text-text-primary hover:bg-surface-elevated",
        variant === "outline" && "border border-border text-text-primary hover:bg-surface-elevated",
        variant === "gold" && "bg-gradient-to-r from-gold to-gold-light text-background font-semibold",
        // Sizes
        size === "sm" && "h-8 px-3 text-xs rounded-md",
        size === "md" && "h-10 px-5 text-sm rounded-lg",
        size === "lg" && "h-12 px-8 text-base rounded-lg",
        className
      )}
    >
      {children}
    </a>
  );
}
