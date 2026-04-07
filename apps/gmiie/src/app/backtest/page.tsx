import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { BacktestEngine } from "./BacktestEngine";

export const metadata: Metadata = genMeta({
  title: "Signal Backtest Engine",
  description:
    "Test how GMIIE signal dimensions correlated with article importance scores across historical data. Measure hit rate, lift, and top triggered articles for any dimension and threshold.",
  path: "/backtest",
  domain: "gmiie.xxxiii.io",
});

export default function BacktestPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Signal Backtest Engine
        </h1>
        <p className="text-body text-text-muted">
          Test how any GMIIE signal dimension correlates with article importance
          across historical data. Select a dimension, set a threshold, and measure
          whether a high signal score actually predicted high-impact articles.
        </p>
      </div>

      {/* What this shows */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Hit Rate",
            description:
              "Percentage of articles in the lookback window where the chosen dimension crossed your threshold.",
          },
          {
            label: "Importance Lift",
            description:
              "Difference in average importance score between triggered articles and the baseline (below-threshold) group.",
          },
          {
            label: "Top Hits",
            description:
              "The highest-importance articles from the triggered group — the signal's best calls in the period.",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg border border-border-subtle bg-surface/20"
          >
            <p className="text-body-sm font-semibold text-gold mb-1">
              {item.label}
            </p>
            <p className="text-caption text-text-muted leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <BacktestEngine />

      {/* Methodology note */}
      <div className="mt-8 border-t border-border-subtle pt-5">
        <h2 className="text-body font-semibold text-text-primary mb-2 flex items-center gap-2">
          <span className="w-5 h-px bg-gold" />
          Interpretation Notes
        </h2>
        <ul className="space-y-1.5 text-body-sm text-text-secondary leading-relaxed">
          <li>
            Signal scores (0–100) are generated per-article when content is
            processed. A score of 60+ generally indicates meaningful relevance for
            that dimension.
          </li>
          <li>
            Importance scores (0–10) reflect the article&apos;s actual significance
            as assessed by the pipeline. Scores ≥ 7 are high-impact; ≥ 9 are
            critical.
          </li>
          <li>
            A high lift (triggered avg &gt; baseline avg) suggests the dimension
            is a useful leading indicator. Low or negative lift suggests the signal
            needs calibration.
          </li>
          <li>
            Use the lookback window to test signal stability across different time
            periods — a dimension that performs well in one period may be noisier in
            others.
          </li>
        </ul>
      </div>
    </div>
  );
}
