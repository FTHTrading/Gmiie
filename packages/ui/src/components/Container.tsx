import { cn } from "../index";
import { type HTMLAttributes, forwardRef } from "react";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide" | "full";
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          size === "narrow" && "max-w-3xl",
          size === "default" && "max-w-6xl",
          size === "wide" && "max-w-7xl",
          size === "full" && "max-w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = "Container";
