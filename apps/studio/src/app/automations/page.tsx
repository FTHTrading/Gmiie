'use client';

import { useState } from 'react';

const statusColor: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
  running: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

interface Automation {
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused';
  active: boolean;
}

const AUTOMATIONS: Automation[] = [
  { name: 'RSS Poll', schedule: '*/15 * * * *', lastRun: '2026-03-06 09:15', nextRun: '2026-03-06 09:30', status: 'active', active: true },
  { name: 'Web Scrape', schedule: '0 * * * *', lastRun: '2026-03-06 09:00', nextRun: '2026-03-06 10:00', status: 'active', active: true },
  { name: 'Classification', schedule: '*/30 * * * *', lastRun: '2026-03-06 09:00', nextRun: '2026-03-06 09:30', status: 'active', active: true },
  { name: 'Draft Generation', schedule: '0 */2 * * *', lastRun: '2026-03-06 08:00', nextRun: '2026-03-06 10:00', status: 'active', active: true },
  { name: 'Sitemap Regen', schedule: '0 0 * * *', lastRun: '2026-03-06 00:00', nextRun: '2026-03-07 00:00', status: 'active', active: true },
  { name: 'Newsletter', schedule: '0 8 * * 1', lastRun: '2026-03-03 08:00', nextRun: '2026-03-10 08:00', status: 'active', active: false },
];

const JOBS = [
  { id: 'JOB-8842', type: 'RSS Poll', status: 'completed' as const, duration: '12s', started: '2026-03-06 09:15:00', error: null },
  { id: 'JOB-8841', type: 'Classification', status: 'completed' as const, duration: '47s', started: '2026-03-06 09:00:12', error: null },
  { id: 'JOB-8840', type: 'Web Scrape', status: 'completed' as const, duration: '2m 14s', started: '2026-03-06 09:00:00', error: null },
  { id: 'JOB-8839', type: 'Draft Generation', status: 'running' as const, duration: '1m 32s', started: '2026-03-06 08:00:00', error: null },
  { id: 'JOB-8838', type: 'RSS Poll', status: 'completed' as const, duration: '9s', started: '2026-03-06 08:45:00', error: null },
  { id: 'JOB-8837', type: 'Classification', status: 'failed' as const, duration: '3s', started: '2026-03-06 08:30:00', error: 'OpenAI rate limit exceeded — retry scheduled' },
  { id: 'JOB-8836', type: 'Sitemap Regen', status: 'completed' as const, duration: '28s', started: '2026-03-06 00:00:00', error: null },
  { id: 'JOB-8835', type: 'Web Scrape', status: 'failed' as const, duration: '1m 05s', started: '2026-03-05 23:00:00', error: 'Bloomberg paywall detected — scraper blocked' },
  { id: 'JOB-8834', type: 'RSS Poll', status: 'completed' as const, duration: '11s', started: '2026-03-05 22:45:00', error: null },
  { id: 'JOB-8833', type: 'Draft Generation', status: 'completed' as const, duration: '3m 42s', started: '2026-03-05 22:00:00', error: null },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(AUTOMATIONS);

  const toggleAutomation = (index: number) => {
    setAutomations((prev) =>
      prev.map((a, i) => (i === index ? { ...a, active: !a.active } : a))
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Automations & Jobs</h1>
        <p className="text-white/40 text-sm mt-1">Manage scheduled tasks and monitor job execution</p>
      </div>

      {/* Active Automations */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Active Automations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((auto, i) => (
            <div
              key={auto.name}
              className={`bg-surface border rounded-xl p-5 transition-all ${
                auto.active ? 'border-white/5' : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">{auto.name}</h3>
                <button
                  onClick={() => toggleAutomation(i)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    auto.active ? 'bg-emerald-500/30' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      auto.active ? 'left-5 bg-emerald-400' : 'left-0.5 bg-white/30'
                    }`}
                  />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-white/40">
                <div className="flex justify-between">
                  <span>Schedule</span>
                  <span className="font-mono text-white/50">{auto.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Run</span>
                  <span className="font-mono">{auto.lastRun}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Run</span>
                  <span className="font-mono">{auto.nextRun}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Recent Jobs</h2>
        <div className="bg-surface border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Job ID</th>
                <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Type</th>
                <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Status</th>
                <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Duration</th>
                <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Started</th>
                <th className="text-left text-xs uppercase text-white/30 font-medium px-4 py-3">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {JOBS.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-white/50">{job.id}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">{job.type}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${statusColor[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-white/40">{job.duration}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-white/40">{job.started}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {job.error ? (
                      <span className="text-xs text-red-400/70 truncate block">{job.error}</span>
                    ) : (
                      <span className="text-xs text-white/15">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
