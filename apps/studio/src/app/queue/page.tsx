'use client';

const QUEUE_STATS = [
  { label: 'Waiting', value: 12, color: 'text-amber-400' },
  { label: 'Active', value: 3, color: 'text-blue-400' },
  { label: 'Completed', value: '1,847', color: 'text-emerald-400' },
  { label: 'Failed', value: 23, color: 'text-red-400' },
];

const ACTIVE_JOBS = [
  { id: 'JOB-8839', type: 'Draft Generation', progress: 68, started: '1m 32s ago' },
  { id: 'JOB-8843', type: 'Web Scrape — Bloomberg', progress: 42, started: '45s ago' },
  { id: 'JOB-8844', type: 'RSS Poll — CoinDesk', progress: 87, started: '12s ago' },
];

const FAILED_JOBS = [
  { id: 'JOB-8837', type: 'Classification', error: 'OpenAI rate limit exceeded — retry after 60s cooldown', failed: '2026-03-06 08:30:00', attempts: 2 },
  { id: 'JOB-8835', type: 'Web Scrape', error: 'Bloomberg paywall detected — scraper blocked by Cloudflare challenge', failed: '2026-03-05 23:01:05', attempts: 3 },
  { id: 'JOB-8829', type: 'Draft Generation', error: 'Context window exceeded — article source text too long (128K+ tokens)', failed: '2026-03-05 18:12:33', attempts: 1 },
  { id: 'JOB-8821', type: 'Entity Extraction', error: 'Unexpected entity format from SEC EDGAR filing — parse failure', failed: '2026-03-05 14:45:00', attempts: 2 },
];

const CONFIG = [
  { label: 'Max Concurrent Workers', value: '5' },
  { label: 'Job Timeout', value: '300s' },
  { label: 'Retry Attempts', value: '3' },
  { label: 'Retry Delay', value: '60s' },
  { label: 'Dead Letter Queue', value: 'Enabled' },
  { label: 'Queue Backend', value: 'BullMQ / Redis' },
];

export default function QueuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Job Queue</h1>
        <p className="text-white/40 text-sm mt-1">Monitor real-time job processing and queue health</p>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUEUE_STATS.map((stat) => (
          <div key={stat.label} className="bg-surface border border-white/5 rounded-xl p-5 text-center">
            <span className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
            <p className="text-xs text-white/30 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active Jobs */}
      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Active Jobs</h2>
        <div className="space-y-4">
          {ACTIVE_JOBS.map((job) => (
            <div key={job.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-white/40">{job.id}</span>
                  <span className="text-sm text-white/70">{job.type}</span>
                </div>
                <span className="text-xs text-white/30 font-mono">{job.started}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-blue-400 w-10 text-right">{job.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failed Jobs */}
      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Failed Jobs</h2>
        <div className="space-y-3">
          {FAILED_JOBS.map((job) => (
            <div key={job.id} className="bg-red-500/[0.03] border border-red-500/10 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-white/40">{job.id}</span>
                    <span className="text-sm text-white/60">{job.type}</span>
                    <span className="text-[10px] text-white/20 font-mono">Attempts: {job.attempts}</span>
                  </div>
                  <p className="text-xs text-red-400/70">{job.error}</p>
                  <p className="text-[10px] font-mono text-white/20 mt-1">Failed: {job.failed}</p>
                </div>
                <button className="text-xs text-gold/60 hover:text-gold px-3 py-1.5 rounded-lg border border-gold/20 hover:bg-gold/5 transition-colors shrink-0 ml-4">
                  Retry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Configuration */}
      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">Queue Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CONFIG.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-xs text-white/30">{item.label}</span>
              <span className="text-sm font-mono text-white/60">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
