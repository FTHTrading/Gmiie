'use client';

import { useState } from 'react';

const typeColor: Record<string, string> = {
  Institution: 'bg-blue-500/10 text-blue-400',
  Regulator: 'bg-red-500/10 text-red-400',
  Protocol: 'bg-purple-500/10 text-purple-400',
  Stablecoin: 'bg-emerald-500/10 text-emerald-400',
  Framework: 'bg-amber-500/10 text-amber-400',
  'Central Bank': 'bg-cyan-500/10 text-cyan-400',
};

const TYPE_FILTERS = ['All', 'Institution', 'Protocol', 'Regulator', 'Stablecoin', 'Framework', 'Central Bank'];

const ENTITIES = [
  { name: 'BlackRock', type: 'Institution', articles: 247, url: 'xxxiii.io/entities/blackrock', updated: '2026-03-06 09:00' },
  { name: 'SEC', type: 'Regulator', articles: 312, url: 'xxxiii.io/entities/sec', updated: '2026-03-06 08:45' },
  { name: 'Ethereum', type: 'Protocol', articles: 534, url: 'xxxiii.io/entities/ethereum', updated: '2026-03-06 07:30' },
  { name: 'JPMorgan', type: 'Institution', articles: 189, url: 'xxxiii.io/entities/jpmorgan', updated: '2026-03-05 22:15' },
  { name: 'Circle', type: 'Stablecoin', articles: 156, url: 'xxxiii.io/entities/circle', updated: '2026-03-05 18:40' },
  { name: 'Ripple', type: 'Protocol', articles: 203, url: 'xxxiii.io/entities/ripple', updated: '2026-03-05 16:20' },
  { name: 'MiCA', type: 'Framework', articles: 97, url: 'xxxiii.io/entities/mica', updated: '2026-03-05 14:00' },
  { name: 'Federal Reserve', type: 'Central Bank', articles: 278, url: 'xxxiii.io/entities/federal-reserve', updated: '2026-03-05 12:30' },
];

export default function EntitiesPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ENTITIES.filter((e) => {
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entity Directory</h1>
        <p className="text-white/40 text-sm mt-1">Manage named entities referenced across the intelligence corpus</p>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search entities…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-gold/40 min-w-[220px]"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-gold/40"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
          ))}
        </select>
      </div>

      {/* Entity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((entity) => (
          <div
            key={entity.name}
            className="bg-surface border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold text-white/90">{entity.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${typeColor[entity.type] ?? 'bg-white/5 text-white/50'}`}>
                {entity.type}
              </span>
            </div>
            <div className="space-y-2 text-xs text-white/40">
              <div className="flex justify-between">
                <span>Articles</span>
                <span className="font-mono text-white/60">{entity.articles}</span>
              </div>
              <div className="flex justify-between">
                <span>Canonical URL</span>
                <span className="font-mono text-white/30 truncate ml-2 max-w-[140px]">{entity.url}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="font-mono text-white/30">{entity.updated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
