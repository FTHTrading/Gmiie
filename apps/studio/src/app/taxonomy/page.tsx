'use client';

import { useState } from 'react';

interface Topic {
  name: string;
  articles: number;
}

interface Cluster {
  name: string;
  topics: Topic[];
}

const CLUSTERS: Cluster[] = [
  {
    name: 'Tokenization & RWA',
    topics: [
      { name: 'Tokenized Treasuries', articles: 89 },
      { name: 'Real-World Assets', articles: 134 },
      { name: 'Security Token Offerings', articles: 67 },
      { name: 'Asset Fractionalization', articles: 45 },
    ],
  },
  {
    name: 'Digital Assets',
    topics: [
      { name: 'Bitcoin', articles: 312 },
      { name: 'Ethereum', articles: 278 },
      { name: 'Stablecoins', articles: 201 },
      { name: 'DeFi Protocols', articles: 156 },
    ],
  },
  {
    name: 'Infrastructure',
    topics: [
      { name: 'Layer 1 Networks', articles: 98 },
      { name: 'Custody Solutions', articles: 67 },
      { name: 'Settlement Systems', articles: 54 },
      { name: 'Oracles & Data Feeds', articles: 43 },
    ],
  },
  {
    name: 'Market Structure',
    topics: [
      { name: 'Exchange Platforms', articles: 112 },
      { name: 'Liquidity Provisioning', articles: 78 },
      { name: 'Market Making', articles: 56 },
      { name: 'Order Book Design', articles: 34 },
    ],
  },
  {
    name: 'Payments',
    topics: [
      { name: 'Cross-Border Payments', articles: 89 },
      { name: 'CBDC', articles: 134 },
      { name: 'Remittances', articles: 45 },
    ],
  },
  {
    name: 'Regulation',
    topics: [
      { name: 'MiCA Framework', articles: 97 },
      { name: 'SEC Enforcement', articles: 145 },
      { name: 'AML/KYC', articles: 78 },
      { name: 'Global Standards', articles: 56 },
    ],
  },
  {
    name: 'Global Markets',
    topics: [
      { name: 'Asia Pacific', articles: 123 },
      { name: 'Europe', articles: 98 },
      { name: 'Middle East & Africa', articles: 45 },
      { name: 'Latin America', articles: 34 },
    ],
  },
  {
    name: 'Institutional Adoption',
    topics: [
      { name: 'Bank Initiatives', articles: 167 },
      { name: 'Asset Manager Products', articles: 134 },
      { name: 'Insurance Applications', articles: 56 },
      { name: 'Pension Funds', articles: 23 },
    ],
  },
];

export default function TaxonomyPage() {
  const [selectedCluster, setSelectedCluster] = useState(0);
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set([0]));

  const toggleCluster = (index: number) => {
    setSelectedCluster(index);
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Taxonomy & Topics</h1>
          <p className="text-white/40 text-sm mt-1">Organize content classification hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white/5 border border-white/10 text-white/60 text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
            Add Topic
          </button>
          <button className="bg-gold text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gold-light transition-colors">
            Add Cluster
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Cluster List */}
        <div className="lg:col-span-2 bg-surface border border-white/5 rounded-xl p-4">
          <h2 className="text-xs uppercase tracking-wider text-white/30 font-medium px-2 mb-3">
            Topic Clusters
          </h2>
          <div className="space-y-1">
            {CLUSTERS.map((cluster, i) => {
              const isExpanded = expandedClusters.has(i);
              const isSelected = selectedCluster === i;
              return (
                <div key={cluster.name}>
                  <button
                    onClick={() => toggleCluster(i)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-gold/10 text-gold border border-gold/20'
                        : 'text-white/60 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">{isExpanded ? '▼' : '▸'}</span>
                      <span>{cluster.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white/30">
                      {cluster.topics.reduce((sum, t) => sum + t.articles, 0)}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {cluster.topics.map((topic) => (
                        <div
                          key={topic.name}
                          className="flex items-center justify-between px-3 py-1.5 text-xs text-white/40 hover:text-white/60 rounded transition-colors"
                        >
                          <span>{topic.name}</span>
                          <span className="font-mono text-white/20">{topic.articles}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Topics in Selected Cluster */}
        <div className="lg:col-span-3 bg-surface border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white/70">
              {CLUSTERS[selectedCluster].name}
            </h2>
            <span className="text-xs font-mono text-white/30">
              {CLUSTERS[selectedCluster].topics.length} topics
            </span>
          </div>
          <div className="space-y-3">
            {CLUSTERS[selectedCluster].topics.map((topic) => (
              <div
                key={topic.name}
                className="bg-white/[0.02] border border-white/5 rounded-lg p-4 flex items-center justify-between hover:border-white/10 transition-colors"
              >
                <div>
                  <h3 className="text-sm text-white/80">{topic.name}</h3>
                  <p className="text-xs text-white/25 mt-0.5">
                    Cluster: {CLUSTERS[selectedCluster].name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-white/60">{topic.articles}</span>
                    <p className="text-[10px] text-white/25">articles</p>
                  </div>
                  <button className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded hover:bg-white/5 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
