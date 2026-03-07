'use client';

import { useState } from 'react';

const STATUS_OPTIONS = ['All', 'Draft', 'In Review', 'Published', 'Archived'];
const TYPE_OPTIONS = ['All', 'Brief', 'Analysis', 'Deep Dive', 'Market Update', 'Regulatory Alert'];

const statusColor: Record<string, string> = {
  Draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'In Review': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Published: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Archived: 'bg-white/5 text-white/30 border border-white/10',
};

const typeColor: Record<string, string> = {
  Brief: 'bg-cyan-500/10 text-cyan-400',
  Analysis: 'bg-purple-500/10 text-purple-400',
  'Deep Dive': 'bg-gold/10 text-gold',
  'Market Update': 'bg-blue-500/10 text-blue-400',
  'Regulatory Alert': 'bg-red-500/10 text-red-400',
};

const ARTICLES = [
  { id: 'ART-2847', title: 'BlackRock Tokenized Treasury Fund Surpasses $1B AUM Milestone', type: 'Deep Dive', status: 'Published', signal: 9.4, source: 'Bloomberg', created: '2026-03-06 09:12' },
  { id: 'ART-2846', title: 'SEC Issues Updated Guidance on Digital Asset Securities Classification', type: 'Regulatory Alert', status: 'In Review', signal: 8.7, source: 'SEC EDGAR', created: '2026-03-06 08:45' },
  { id: 'ART-2845', title: 'JPMorgan Onyx Platform Processes $2B in Daily Tokenized Repo Volume', type: 'Analysis', status: 'Published', signal: 8.2, source: 'Reuters', created: '2026-03-06 07:30' },
  { id: 'ART-2844', title: 'EU MiCA Framework: Implementation Timeline and Market Impact Assessment', type: 'Deep Dive', status: 'Draft', signal: 7.8, source: 'BIS', created: '2026-03-06 06:15' },
  { id: 'ART-2843', title: 'Circle USDC Reserve Composition Update — Q1 2026 Attestation', type: 'Brief', status: 'Published', signal: 7.5, source: 'CoinDesk', created: '2026-03-05 22:10' },
  { id: 'ART-2842', title: 'Ethereum Pectra Upgrade: Implications for Institutional Staking Infrastructure', type: 'Analysis', status: 'In Review', signal: 7.1, source: 'Messari', created: '2026-03-05 18:40' },
  { id: 'ART-2841', title: 'Chainalysis: Tokenized RWA On-Chain Volume Reaches $14B Weekly Average', type: 'Market Update', status: 'Draft', signal: 6.9, source: 'Chainalysis', created: '2026-03-05 16:20' },
  { id: 'ART-2840', title: 'Federal Reserve CBDC Research Paper: Wholesale vs Retail Architecture Tradeoffs', type: 'Deep Dive', status: 'Archived', signal: 6.4, source: 'Federal Reserve', created: '2026-03-05 14:00' },
];

export default function ArticlesPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ARTICLES.filter((a) => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (typeFilter !== 'All' && a.type !== typeFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Article Queue</h1>
        <p className="text-white/40 text-sm mt-1">Manage content pipeline — draft, review, publish</p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-gold/40"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-gold/40"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-gold/40 flex-1 min-w-[200px]"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Title</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Type</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Status</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Signal</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Source</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Created</th>
              <th className="text-right text-xs uppercase text-white/30 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm text-white/80 truncate">{a.title}</div>
                  <div className="text-[10px] font-mono text-white/25 mt-0.5">{a.id}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${typeColor[a.type] ?? 'bg-white/5 text-white/50'}`}>
                    {a.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusColor[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-gold">{a.signal}</span>
                </td>
                <td className="px-4 py-3 text-sm text-white/50">{a.source}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-white/40">{a.created}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors">Edit</button>
                    <button className="text-xs text-gold/60 hover:text-gold px-2 py-1 rounded hover:bg-gold/5 transition-colors">Publish</button>
                    <button className="text-xs text-white/25 hover:text-white/50 px-2 py-1 rounded hover:bg-white/5 transition-colors">Archive</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30 font-mono">
          Showing {filtered.length} of {ARTICLES.length} articles
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 text-xs text-white/30 hover:text-white/60 bg-white/5 rounded-lg transition-colors">Prev</button>
          <button className="px-3 py-1.5 text-xs bg-gold/10 text-gold rounded-lg border border-gold/20">1</button>
          <button className="px-3 py-1.5 text-xs text-white/30 hover:text-white/60 bg-white/5 rounded-lg transition-colors">2</button>
          <button className="px-3 py-1.5 text-xs text-white/30 hover:text-white/60 bg-white/5 rounded-lg transition-colors">3</button>
          <button className="px-3 py-1.5 text-xs text-white/30 hover:text-white/60 bg-white/5 rounded-lg transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
