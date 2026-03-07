'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: '◫' },
      { href: '/analytics', label: 'Analytics', icon: '◩' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/articles', label: 'Articles', icon: '◧' },
      { href: '/sources', label: 'Sources', icon: '◨' },
      { href: '/entities', label: 'Entities', icon: '▣' },
      { href: '/taxonomy', label: 'Taxonomy', icon: '◈' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/prompts', label: 'Prompts', icon: '◇' },
      { href: '/automations', label: 'Automations', icon: '⚙' },
      { href: '/queue', label: 'Job Queue', icon: '▤' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: '⚡' },
      { href: '/audit', label: 'Audit Log', icon: '◉' },
    ],
  },
];

export function StudioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#08080D] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
            <span className="text-gold font-bold text-lg font-mono">X</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">XXXIII</h1>
            <p className="text-[10px] font-mono text-gold/60 tracking-widest uppercase">Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="text-[10px] font-mono text-white/25 tracking-widest uppercase px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-gold/10 text-gold border border-gold/20'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-mono text-white/20">
          <span>v0.1.0</span>
          <span>XXXIII.IO</span>
        </div>
      </div>
    </aside>
  );
}
