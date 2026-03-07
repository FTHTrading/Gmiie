"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "@/components/search/SearchBar";
import { ThemeToggle } from "@xxxiii/ui/src/components/ThemeProvider";

const NAV_ITEMS = [
  { label: "Signals", href: "/signals" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Topics", href: "/topics" },
  { label: "Entities", href: "/entities" },
  { label: "Regulators", href: "/regulators" },
  { label: "Reports", href: "/reports" },
] as const;

export function PlatformHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border-subtle">
      <div className="flex items-center h-14 px-5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 mr-8 group">
          <span className="text-gold font-mono font-bold text-base tracking-[0.15em]">
            GMIIE
          </span>
          <span className="hidden lg:inline text-label font-mono text-text-muted tracking-wider uppercase">
            Intelligence Engine
          </span>
        </Link>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mr-6">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse-slow" />
          <span className="text-label font-mono text-text-muted tracking-wider">
            LIVE
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3.5 py-2 text-body-sm font-medium tracking-wide uppercase rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-gold bg-gold/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
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
          <div className="w-px h-5 bg-border-subtle" />
          <ThemeToggle />
          <div className="w-px h-5 bg-border-subtle hidden lg:block" />
          <span className="text-caption font-mono text-text-muted hidden lg:block">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <div className="w-px h-5 bg-border-subtle hidden lg:block" />
          <Link
            href="https://xxxiii.io"
            className="text-caption font-mono text-text-muted hover:text-gold transition-colors hidden lg:block"
          >
            XXXIII.IO
          </Link>
        </div>
      </div>
    </header>
  );
}
