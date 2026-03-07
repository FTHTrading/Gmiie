'use client';

const METRICS = [
  { label: 'Total Pageviews', value: '124K', trend: '+18.2%', up: true },
  { label: 'Unique Visitors', value: '45K', trend: '+12.7%', up: true },
  { label: 'Avg Time on Page', value: '3:42', trend: '+0:14', up: true },
  { label: 'Top Topic', value: 'Tokenization', trend: null, up: true },
  { label: 'Top Entity', value: 'BlackRock', trend: null, up: true },
  { label: 'Bounce Rate', value: '34%', trend: '-2.1%', up: false },
];

const TOP_ARTICLES = [
  { title: 'BlackRock Tokenized Treasury Fund Surpasses $1B AUM', views: '12,847' },
  { title: 'SEC Updates Digital Asset Securities Classification Framework', views: '9,234' },
  { title: 'JPMorgan Onyx Hits $2B Daily Tokenized Repo Volume', views: '8,156' },
  { title: 'EU MiCA Implementation: What Markets Need to Know', views: '7,421' },
  { title: 'Ethereum Pectra Upgrade Institutional Staking Impact', views: '6,893' },
];

const TRAFFIC_SOURCES = [
  { source: 'Direct', pct: 38, color: 'bg-gold' },
  { source: 'Search', pct: 32, color: 'bg-blue-500' },
  { source: 'Social', pct: 18, color: 'bg-purple-500' },
  { source: 'Referral', pct: 12, color: 'bg-emerald-500' },
];

const PRODUCTION_STATS = [
  { label: 'Articles / Day', value: '14.2' },
  { label: 'Avg Time to Publish', value: '2h 18m' },
  { label: 'AI vs Manual Ratio', value: '82% / 18%' },
  { label: 'Auto-Published', value: '67%' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Content performance and traffic intelligence</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {METRICS.map((m) => (
          <div key={m.label} className="bg-surface border border-white/5 rounded-xl p-6">
            <span className="text-xs text-white/30 uppercase tracking-wider">{m.label}</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold font-mono">{m.value}</span>
              {m.trend && (
                <span className={`text-xs font-mono flex items-center gap-1 ${m.up ? 'text-emerald-400' : 'text-emerald-400'}`}>
                  {m.label === 'Bounce Rate' ? '↓' : '↑'} {m.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
            Top Articles This Week
          </h2>
          <div className="divide-y divide-white/5">
            {TOP_ARTICLES.map((a, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-white/20 w-5 shrink-0">{i + 1}.</span>
                  <span className="text-sm text-white/70 truncate">{a.title}</span>
                </div>
                <span className="text-sm font-mono text-gold shrink-0">{a.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic by Source */}
        <div className="bg-surface border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
            Traffic by Source
          </h2>
          <div className="space-y-4">
            {TRAFFIC_SOURCES.map((t) => (
              <div key={t.source}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-white/60">{t.source}</span>
                  <span className="font-mono text-white/40">{t.pct}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${t.color} rounded-full`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Production */}
      <div className="bg-surface border border-white/5 rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
          Content Production
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PRODUCTION_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <span className="text-2xl font-bold font-mono text-white/80">{s.value}</span>
              <p className="text-xs text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
