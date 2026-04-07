import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { AlertsFeed } from "./AlertsFeed";

export const metadata: Metadata = genMeta({
  title: "Live Alerts",
  description:
    "Real-time regulatory and market intelligence alerts — high-importance signals from central banks, regulators, and institutional sources streamed as they are detected.",
  path: "/alerts",
  domain: "gmiie.xxxiii.io",
});

export default function AlertsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Live Intelligence Alerts
        </h1>
        <p className="text-body text-text-muted max-w-2xl">
          High-importance signals streamed in real time from the GMIIE pipeline. Alerts are ranked
          by importance score and severity — high alerts require immediate attention from institutional
          practitioners.
        </p>
      </div>

      {/* Severity guide */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-xl border border-border-subtle bg-surface/20">
        <div className="flex items-center gap-2 text-body-sm text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span><span className="font-semibold text-red-400">High</span> — Score ≥ 8.5, immediate institutional impact</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span><span className="font-semibold text-gold">Medium</span> — Score 7.0–8.4, watch-list significance</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-text-muted" />
          <span><span className="font-semibold text-text-muted">Low</span> — Score 6.0–6.9, contextual awareness</span>
        </div>
      </div>

      <AlertsFeed />
    </div>
  );
}
