'use client';

import { useState } from 'react';

const ACTION_TYPES = ['All', 'Create', 'Update', 'Delete', 'Publish', 'Login', 'Config Change'];

const actionColor: Record<string, string> = {
  Create: 'bg-emerald-500/10 text-emerald-400',
  Update: 'bg-blue-500/10 text-blue-400',
  Delete: 'bg-red-500/10 text-red-400',
  Publish: 'bg-gold/10 text-gold',
  Login: 'bg-white/5 text-white/50',
  'Config Change': 'bg-purple-500/10 text-purple-400',
};

const AUDIT_ENTRIES = [
  { timestamp: '2026-03-06 09:15:42', user: 'admin@xxxiii.io', action: 'Publish', resource: 'Article ART-2847', details: 'Published "BlackRock Tokenized Treasury Fund Surpasses $1B AUM"' },
  { timestamp: '2026-03-06 09:12:18', user: 'admin@xxxiii.io', action: 'Create', resource: 'Article ART-2847', details: 'AI draft generated and saved to article queue' },
  { timestamp: '2026-03-06 08:55:03', user: 'editor@xxxiii.io', action: 'Update', resource: 'Entity: Circle', details: 'Updated canonical URL and description fields' },
  { timestamp: '2026-03-06 08:45:00', user: 'system', action: 'Create', resource: 'Source Poll SEC-EDGAR', details: 'Ingested 3 new SEC filings from EDGAR API' },
  { timestamp: '2026-03-06 08:30:11', user: 'admin@xxxiii.io', action: 'Config Change', resource: 'AI Configuration', details: 'Changed primary model from gpt-4 to gpt-4-turbo' },
  { timestamp: '2026-03-06 08:15:00', user: 'system', action: 'Publish', resource: 'Article ART-2845', details: 'Auto-published — signal score 8.2 exceeded threshold 8.0' },
  { timestamp: '2026-03-06 07:30:22', user: 'editor@xxxiii.io', action: 'Update', resource: 'Taxonomy Cluster', details: 'Added topic "On-Chain Credit Markets" to Tokenization & RWA cluster' },
  { timestamp: '2026-03-06 07:00:00', user: 'admin@xxxiii.io', action: 'Login', resource: 'Session', details: 'Login from 192.168.1.42 — Chrome / macOS' },
  { timestamp: '2026-03-06 00:00:00', user: 'system', action: 'Create', resource: 'Sitemap', details: 'Regenerated sitemap.xml — 2,847 URLs indexed' },
  { timestamp: '2026-03-05 23:01:05', user: 'system', action: 'Delete', resource: 'Job JOB-8835', details: 'Moved failed scrape job to dead letter queue after 3 attempts' },
];

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState('All');

  const filtered = AUDIT_ENTRIES.filter((e) =>
    actionFilter === 'All' ? true : e.action === actionFilter
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-white/40 text-sm mt-1">System activity trail — all administrative actions logged</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-gold/40"
        >
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>{a === 'All' ? 'All Actions' : a}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Filter by user…"
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-gold/40"
        />
        <input
          type="date"
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-gold/40"
        />
        <span className="text-white/20">→</span>
        <input
          type="date"
          className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-gold/40"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Timestamp</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">User</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Action</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Resource</th>
              <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((entry, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-white/40">{entry.timestamp}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-white/50">{entry.user}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${actionColor[entry.action] ?? 'bg-white/5 text-white/50'}`}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-white/50 font-mono">{entry.resource}</span>
                </td>
                <td className="px-4 py-3 max-w-md">
                  <span className="text-xs text-white/40 truncate block">{entry.details}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
