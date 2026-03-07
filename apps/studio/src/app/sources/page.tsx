'use client';

import { useState } from 'react';

const tierColor: Record<string, string> = {
  TIER_1: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  TIER_2: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  TIER_3: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  TIER_4: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const typeColor: Record<string, string> = {
  RSS: 'bg-cyan-500/10 text-cyan-400',
  Scrape: 'bg-purple-500/10 text-purple-400',
  API: 'bg-gold/10 text-gold',
};

interface Source {
  name: string;
  type: 'RSS' | 'Scrape' | 'API';
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  url: string;
  lastPolled: string;
  articles: number;
  active: boolean;
}

const SOURCES: Source[] = [
  { name: 'Federal Reserve', type: 'RSS', tier: 'TIER_1', url: 'federalreserve.gov/feeds', lastPolled: '2 min ago', articles: 342, active: true },
  { name: 'SEC EDGAR', type: 'API', tier: 'TIER_1', url: 'efts.sec.gov/LATEST', lastPolled: '5 min ago', articles: 528, active: true },
  { name: 'CoinDesk', type: 'RSS', tier: 'TIER_2', url: 'coindesk.com/arc/outboundfeeds', lastPolled: '3 min ago', articles: 891, active: true },
  { name: 'Bloomberg', type: 'Scrape', tier: 'TIER_1', url: 'bloomberg.com/markets', lastPolled: '12 min ago', articles: 234, active: true },
  { name: 'BIS', type: 'RSS', tier: 'TIER_1', url: 'bis.org/doclist/cbdc.rss', lastPolled: '1 hr ago', articles: 67, active: true },
  { name: 'IMF', type: 'API', tier: 'TIER_1', url: 'imf.org/en/Publications', lastPolled: '4 hr ago', articles: 89, active: false },
  { name: 'Chainalysis', type: 'API', tier: 'TIER_2', url: 'api.chainalysis.com/v1', lastPolled: '15 min ago', articles: 156, active: true },
  { name: 'Messari', type: 'API', tier: 'TIER_3', url: 'data.messari.io/api/v2', lastPolled: '8 min ago', articles: 412, active: true },
];

export default function SourcesPage() {
  const [sources, setSources] = useState(SOURCES);

  const toggleSource = (index: number) => {
    setSources((prev) =>
      prev.map((s, i) => (i === index ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Source Management</h1>
          <p className="text-white/40 text-sm mt-1">Configure data ingestion sources and credibility tiers</p>
        </div>
        <button className="bg-gold text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gold-light transition-colors">
          Add Source
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <div
            key={source.name}
            className={`bg-surface border rounded-xl p-6 transition-all ${
              source.active ? 'border-white/5' : 'border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-white/90">{source.name}</h3>
                <p className="text-xs font-mono text-white/25 mt-0.5">{source.url}</p>
              </div>
              <button
                onClick={() => toggleSource(i)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  source.active ? 'bg-emerald-500/30' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                    source.active ? 'left-5 bg-emerald-400' : 'left-0.5 bg-white/30'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`rounded-full px-2 py-0.5 text-xs ${typeColor[source.type]}`}>
                {source.type}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${tierColor[source.tier]}`}>
                {source.tier}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-white/40">
              <div>
                <span className="text-white/25">Last polled:</span>{' '}
                <span className="font-mono">{source.lastPolled}</span>
              </div>
              <div>
                <span className="text-white/25">Articles:</span>{' '}
                <span className="font-mono text-white/60">{source.articles}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
