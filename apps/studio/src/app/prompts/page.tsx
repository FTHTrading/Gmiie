'use client';

const categoryColor: Record<string, string> = {
  Content: 'bg-blue-500/10 text-blue-400',
  Analysis: 'bg-purple-500/10 text-purple-400',
  Classification: 'bg-amber-500/10 text-amber-400',
  SEO: 'bg-emerald-500/10 text-emerald-400',
  Scoring: 'bg-cyan-500/10 text-cyan-400',
  Aggregation: 'bg-gold/10 text-gold',
};

const PROMPTS = [
  { name: 'Article Summarizer', description: 'Generates concise 2-3 sentence summaries of long-form financial articles, preserving key data points and entity references.', model: 'GPT-4', category: 'Content', updated: '2026-03-05', tokens: 1240 },
  { name: 'Market Brief Writer', description: 'Composes daily market brief articles from aggregated source data, structured with key takeaways, market moves, and forward outlook.', model: 'Claude', category: 'Content', updated: '2026-03-04', tokens: 2180 },
  { name: 'Deep Dive Generator', description: 'Produces long-form analytical articles with section headers, data tables, historical context, and regulatory implications.', model: 'Claude', category: 'Analysis', updated: '2026-03-03', tokens: 3450 },
  { name: 'Entity Profile Builder', description: 'Creates comprehensive entity profiles from scraped data, including background, recent activity, market position, and related entities.', model: 'GPT-4', category: 'Analysis', updated: '2026-03-02', tokens: 1680 },
  { name: 'Classification Engine', description: 'Categorizes incoming articles into topic clusters, assigns entity tags, determines content type, and assesses relevance tier.', model: 'GPT-4', category: 'Classification', updated: '2026-03-06', tokens: 890 },
  { name: 'Signal Scorer', description: 'Evaluates article significance on a 1-10 scale based on market impact, institutional relevance, regulatory implications, and novelty.', model: 'GPT-4', category: 'Scoring', updated: '2026-03-06', tokens: 720 },
  { name: 'SEO Title Generator', description: 'Generates search-optimized titles balancing keyword density with editorial quality and click-through appeal.', model: 'GPT-4', category: 'SEO', updated: '2026-03-01', tokens: 560 },
  { name: 'Meta Description Writer', description: 'Crafts 155-character meta descriptions optimized for search snippets with primary keyword integration.', model: 'GPT-4', category: 'SEO', updated: '2026-02-28', tokens: 480 },
  { name: 'FAQ Generator', description: 'Generates structured FAQ sections based on article content, targeting common reader questions and long-tail search queries.', model: 'Claude', category: 'SEO', updated: '2026-03-04', tokens: 1120 },
  { name: 'Newsletter Compiler', description: 'Aggregates top articles into a formatted newsletter with editorial introductions, section groupings, and call-to-action elements.', model: 'Claude', category: 'Aggregation', updated: '2026-03-05', tokens: 2640 },
];

export default function PromptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prompt Library</h1>
        <p className="text-white/40 text-sm mt-1">Manage AI prompt templates for the content generation pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROMPTS.map((prompt) => (
          <div
            key={prompt.name}
            className="bg-surface border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-white/90">{prompt.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs shrink-0 ml-2 ${categoryColor[prompt.category] ?? 'bg-white/5 text-white/50'}`}>
                {prompt.category}
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-4">{prompt.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-white/30">
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{prompt.model}</span>
                <span>Updated: <span className="font-mono">{prompt.updated}</span></span>
                <span><span className="font-mono">{prompt.tokens.toLocaleString()}</span> tokens</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors">
                  Edit
                </button>
                <button className="text-xs text-gold/60 hover:text-gold px-2 py-1 rounded hover:bg-gold/5 transition-colors">
                  Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
