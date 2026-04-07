"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════
   MOBILE BOTTOM NAVIGATION
   Replaces sidebar on screens < lg. Fixed bottom bar with
   primary navigation items. Bloomberg discipline, touch-friendly.
   ═══════════════════════════════════════════════════════════════ */

const MOBILE_NAV_ITEMS = [
  { label: "Feed", href: "/", icon: "◉" },
  { label: "Alerts", href: "/alerts", icon: "◎" },
  { label: "Signals", href: "/signals", icon: "◈" },
  { label: "Backtest", href: "/backtest", icon: "◆" },
  { label: "More", href: "/methodology", icon: "◇" },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border-subtle safe-area-bottom">
      <div className="flex items-stretch justify-around h-14">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 min-w-[64px] py-1.5 transition-colors duration-150 ${
                isActive
                  ? "text-gold"
                  : "text-text-muted active:text-text-secondary"
              }`}
            >
              <span className={`text-base mb-0.5 ${isActive ? "opacity-100" : "opacity-50"}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-mono tracking-wider uppercase ${
                isActive ? "font-semibold" : ""
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
