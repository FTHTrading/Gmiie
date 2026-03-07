import { cn } from "../index";
import { type HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "gold" | "blue" | "green" | "red" | "purple" | "cyan" | "outline";
  size?: "sm" | "md";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          size === "sm" && "px-2.5 py-0.5 text-xs",
          size === "md" && "px-3 py-1 text-sm",
          variant === "default" && "bg-surface-elevated text-text-secondary",
          variant === "gold" && "bg-gold/15 text-gold border border-gold/20",
          variant === "blue" && "bg-blue/15 text-blue-light border border-blue/20",
          variant === "green" && "bg-green/15 text-green border border-green/20",
          variant === "red" && "bg-red/15 text-red border border-red/20",
          variant === "purple" && "bg-purple/15 text-purple border border-purple/20",
          variant === "cyan" && "bg-cyan/15 text-cyan border border-cyan/20",
          variant === "outline" && "border border-border text-text-secondary",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
