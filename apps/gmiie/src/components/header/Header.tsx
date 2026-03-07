"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { ThemeToggle } from "@xxxiii/ui/src/components/ThemeProvider";

/* ═══════════════════════════════════════════════════════════════
   PLATFORM HEADER — Design Doctrine
   Two-tier: Utility bar (thin) + Brand/Nav bar
   Bloomberg discipline + WSJ clarity + FT calm
   Mobile: Compact single-tier with hamburger menu
   ═══════════════════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { label: "Intelligence", href: "/intelligence" },
  { label: "Topics", href: "/topics" },
  { label: "Entities", href: "/entities" },
  { label: "Signals", href: "/signals" },
  { label: "Reports", href: "/reports" },
] as const;

export function PlatformHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── Tier 1: Utility bar — hidden on mobile ── */}
      <div className="bg-background border-b border-border-subtle hidden md:block">
        <div className="flex items-center justify-between h-7 px-5 text-[11px] font-mono tracking-wide">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-slow" />
              <span className="text-text-muted uppercase">Monitored</span>
            </div>
            <span className="text-text-muted hidden md:inline">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/methodology"
              className="text-text-muted hover:text-text-secondary transition-colors uppercase"
            >
              Methodology
            </Link>
            <Link
              href="https://xxxiii.io"
              className="text-text-muted hover:text-text-secondary transition-colors uppercase"
            >
              XXXIII.IO
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Tier 2: Brand bar + Navigation ── */}
      <div className="bg-background/95 backdrop-blur-xl border-b border-border-subtle">
        <div className="flex items-center h-12 px-4 md:px-5">
          {/* Mobile: Status dot */}
          <div className="flex items-center gap-1.5 mr-3 md:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-slow" />
          </div>

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 mr-8 group">
            <span className="text-gold font-mono font-bold text-base tracking-[0.2em]">
              GMIIE
            </span>
            <span className="hidden lg:inline text-[11px] font-mono text-text-muted tracking-[0.15em] uppercase border-l border-border-subtle pl-2 ml-1">
              Intelligence Engine
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 text-[13px] font-medium tracking-wide uppercase transition-colors duration-150 ${
                    isActive
                      ? "text-gold border-b-2 border-gold pb-[5px]"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <SearchBar />
            {/* Mobile: Theme toggle (moved from utility bar) */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1"
              aria-label="Toggle navigation menu"
            >
              <span className={`block w-4 h-0.5 bg-text-secondary transition-transform duration-200 ${
                mobileMenuOpen ? "rotate-45 translate-y-[3px]" : ""
              }`} />
              <span className={`block w-4 h-0.5 bg-text-secondary transition-opacity duration-200 ${
                mobileMenuOpen ? "opacity-0" : ""
              }`} />
              <span className={`block w-4 h-0.5 bg-text-secondary transition-transform duration-200 ${
                mobileMenuOpen ? "-rotate-45 -translate-y-[3px]" : ""
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border-subtle">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors ${
                    isActive
                      ? "text-gold bg-gold/8"
                      : "text-text-secondary active:bg-surface-elevated"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border-subtle mt-2">
              <Link
                href="/methodology"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-body-sm text-text-muted"
              >
                Methodology
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
