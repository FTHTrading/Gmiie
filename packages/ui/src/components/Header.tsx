"use client";

import { cn } from "../index";
import { BRAND } from "@xxxiii/config";
import { type HTMLAttributes } from "react";

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  variant: "root" | "gmiie" | "lps" | "studio";
  navigation: ReadonlyArray<{
    label: string;
    href: string;
    external?: boolean;
  }>;
}

export function Header({ variant, navigation, className, ...props }: HeaderProps) {
  const brandLabel =
    variant === "gmiie"
      ? BRAND.gmiie
      : variant === "lps"
        ? BRAND.lps
        : variant === "studio"
          ? "STUDIO"
          : BRAND.name;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/80 backdrop-blur-xl border-b border-border-subtle",
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <span className="text-gold font-mono font-bold text-lg tracking-widest">
              XXXIII
            </span>
            {variant !== "root" && (
              <>
                <span className="text-border">|</span>
                <span className="text-text-secondary font-mono text-sm tracking-wider uppercase">
                  {brandLabel}
                </span>
              </>
            )}
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "px-3 py-2 text-sm font-medium tracking-wide uppercase",
                  "text-text-secondary hover:text-text-primary transition-colors duration-200",
                  "hover:bg-surface-elevated rounded-lg"
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile menu trigger */}
          <button className="md:hidden text-text-secondary hover:text-text-primary p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
