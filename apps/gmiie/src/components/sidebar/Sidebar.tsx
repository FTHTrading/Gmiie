"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOPIC_CLUSTERS } from "@xxxiii/config";

const SIDEBAR_SECTIONS = [
  {
    title: "Intelligence",
    items: [
      { label: "Live Feed", href: "/", icon: "◉" },
      { label: "Timeline", href: "/timeline", icon: "◔" },
      { label: "Signals", href: "/signals", icon: "◈" },
      { label: "State Tracker", href: "/tracker", icon: "⬡" },
      { label: "Reports", href: "/reports", icon: "◇" },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Topics", href: "/topics", icon: "▣" },
      { label: "Entities", href: "/entities", icon: "◎" },
      { label: "Regulators", href: "/regulators", icon: "⬡" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Methodology", href: "/methodology", icon: "◆" },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] h-[calc(100vh-76px)] sticky top-[76px] overflow-y-auto border-r border-border-subtle bg-background px-3 py-5 hidden lg:block">
      {/* Navigation sections */}
      {SIDEBAR_SECTIONS.map((section) => (
        <div key={section.title} className="mb-7">
          <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3 px-3">
            {section.title}
          </h3>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm transition-colors duration-150 ${
                      isActive
                        ? "text-gold bg-gold/8 font-medium"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                    }`}
                  >
                    <span className="text-sm opacity-60">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Topic Clusters */}
      <div className="mb-7">
        <h3 className="text-label font-mono font-semibold tracking-[0.15em] text-text-muted uppercase mb-3 px-3">
          Topic Clusters
        </h3>
        <ul className="space-y-1">
          {TOPIC_CLUSTERS.map((cluster) => {
            const href = `/topics?cluster=${cluster.slug}`;
            const isActive = pathname === `/topics` && false; // simplified
            return (
              <li key={cluster.slug}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm transition-colors duration-150 ${
                    isActive
                      ? "text-gold bg-gold/8"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-gold/40" />
                  {cluster.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-5 border-t border-border-subtle px-3">
        <p className="text-label font-mono text-text-muted leading-relaxed">
          GMIIE continuously monitors {">"}58 institutional sources across 12 jurisdictions.
        </p>
      </div>
    </aside>
  );
}
