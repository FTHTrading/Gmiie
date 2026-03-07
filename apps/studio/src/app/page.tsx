'use client';

const STATS = [
  { label: 'Total Articles', value: '2,847', trend: '+12.3%', up: true },
  { label: 'Published Today', value: '12', trend: '+4', up: true },
  { label: 'Sources Active', value: '156', trend: '+3', up: true },
  { label: 'Queue Depth', value: '34', trend: '-8', up: false },
  { label: 'Avg Signal Score', value: '7.2', trend: '+0.4', up: true },
  { label: 'AI Drafts Pending', value: '8', trend: '+2', up: true },
];

const RECENT_ACTIVITY = [
  { time: '2 min ago', action: 'Article published: "BlackRock Tokenized Fund Surpasses $1B AUM"' },
  { time: '8 min ago', action: 'Source polled: SEC EDGAR — 3 new filings detected' },
  { time: '15 min ago', action: 'AI draft generated: "EU MiCA Framework Implementation Timeline"' },
  { time: '23 min ago', action: 'Entity created: Circle USDC Reserve Fund' },
  { time: '41 min ago', action: 'Classification job completed — 17 articles processed' },
];

const PIPELINE_STAGES = [
  { name: 'Ingestion', count: 47 },
  { name: 'Classification', count: 23 },
  { name: 'Drafting', count: 12 },
  { name: 'Review', count: 8 },
  { name: 'Published', count: 2847 },
];

const HEALTH = [
  { name: 'Database', status: 'green' as const },
  { name: 'Redis', status: 'green' as const },
  { name: 'AI Engine', status: 'yellow' as const },
  { name: 'Search', status: 'green' as const },
];

const statusColors = { green: 'bg-emerald-500', yellow: 'bg-amber-500', red: 'bg-red-500' };

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Command Center</h1>
        <p className="text-white/40 text-sm mt-1">Real-time overview of the XXXIII intelligence pipeline</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-white/5 rounded-xl p-6 flex flex-col gap-1"
          >
            <span className="text-xs text-white/30 uppercase tracking-wider">{stat.label}</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold font-mono">{stat.value}</span>
              <span
                className={`text-xs font-mono flex items-center gap-1 ${
                  stat.up ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {stat.up ? '↑' : '↓'} {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
            Recent Activity
          </h2>
          <div className="divide-y divide-white/5">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="py-3 flex items-start gap-3">
                <span className="text-[10px] font-mono text-white/25 whitespace-nowrap w-20 shrink-0 pt-0.5">
                  {item.time}
                </span>
                <span className="text-sm text-white/70">{item.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
            Pipeline Status
          </h2>
          <div className="flex items-center gap-2">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.name} className="flex items-center gap-2">
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-center min-w-[100px]">
                  <span className="text-lg font-bold font-mono text-gold">{stage.count}</span>
                  <p className="text-[10px] text-white/40 mt-1">{stage.name}</p>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <span className="text-white/20 text-lg">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
          System Health
        </h2>
        <div className="flex items-center gap-8">
          {HEALTH.map((h) => (
            <div key={h.name} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${statusColors[h.status]}`} />
              <span className="text-sm text-white/60">{h.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
