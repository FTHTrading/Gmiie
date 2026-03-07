import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getTrackedStateBySlug } from "@/lib/data";
import { StateStatusBadge } from "@/components/tracker/BillStatusBadge";
import { BillTrackerTable } from "@/components/tracker/BillTrackerTable";
import { BillDetailCard } from "@/components/tracker/BillDetailCard";
import { StateTimeline } from "@/components/tracker/StateTimeline";
import { StateDetailViewSwitcher } from "./StateDetailViewSwitcher";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const state = await getTrackedStateBySlug(slug).catch(() => null);
  if (!state) return genMeta({ title: "State Not Found", description: "", path: `/tracker/${slug}`, domain: "gmiie.xxxiii.io" });
  return genMeta({
    title: `${state.name} Stablecoin Tracker`,
    description: state.summary || `Track stablecoin legislation and policy activity in ${state.name}.`,
    path: `/tracker/${slug}`,
    domain: "gmiie.xxxiii.io",
  });
}

export default async function StateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = await getTrackedStateBySlug(slug);
  if (!state) notFound();

  const lastAction = state.lastActionDate
    ? new Date(state.lastActionDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <article className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-caption font-mono text-text-muted mb-4 sm:mb-6">
        <Link href="/tracker" className="hover:text-gold transition-colors">
          State Tracker
        </Link>
        <span>/</span>
        <span className="text-text-secondary">{state.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h1 className="text-headline sm:text-display font-serif font-bold text-text-primary mb-1">
              {state.name}
            </h1>
            <span className="text-body font-mono text-text-muted">{state.abbreviation}</span>
          </div>
          <StateStatusBadge status={state.status} size="md" />
        </div>

        {/* Meta line */}
        <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-muted">
          <span>{state.bills.length} bill{state.bills.length !== 1 ? "s" : ""} tracked</span>
          {lastAction && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Last action: {lastAction}</span>
            </>
          )}
          {state.nextExpectedStep && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>
                <span className="text-gold">Next → </span>
                {state.nextExpectedStep}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary + Why it matters */}
      {(state.summary || state.whyItMatters) && (
        <div className="mb-6 sm:mb-8 p-5 rounded-xl bg-surface border border-border-subtle">
          {state.summary && (
            <div className="mb-4">
              <h2 className="text-caption font-mono font-semibold text-gold uppercase tracking-wider mb-2">
                Overview
              </h2>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                {state.summary}
              </p>
            </div>
          )}
          {state.whyItMatters && (
            <div>
              <h2 className="text-caption font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">
                Why It Matters
              </h2>
              <p className="text-body-sm text-text-secondary leading-relaxed">
                {state.whyItMatters}
              </p>
            </div>
          )}
        </div>
      )}

      {/* View switcher: Bills / Timeline */}
      <StateDetailViewSwitcher state={state} />

      {/* Monitoring disclosure */}
      <div className="mt-8 pt-4 border-t border-border-subtle">
        <p className="text-caption font-mono text-text-muted/60">
          Source: Official state legislature records · Verification-assisted · Not legal advice
        </p>
      </div>
    </article>
  );
}
