import type { Metadata } from "next";
import Link from "next/link";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { prisma } from "@xxxiii/db";

export const revalidate = 60;

export const metadata: Metadata = genMeta({
  title: "Mail Command Center — GMIIE",
  description:
    "AI email alert dispatch system — manage subscribers, monitor delivery health, " +
    "trigger test dispatches, and review alert history.",
  path: "/mail",
  domain: "gmiie.xxxiii.io",
});

// ── Data fetchers ─────────────────────────────────────────────

async function getSubscriberStats() {
  try {
    const [total, active, daily, twiceDaily, weekly] = await Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true, cadence: "DAILY" } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true, cadence: "TWICE_DAILY" } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true, cadence: "WEEKLY" } }),
    ]);
    return { total, active, daily, twiceDaily, weekly };
  } catch {
    return { total: 0, active: 0, daily: 0, twiceDaily: 0, weekly: 0 };
  }
}

async function getRecentHighScoreArticles() {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED", importanceScore: { gte: 7.0 } },
      select: {
        id: true,
        slug: true,
        title: true,
        importanceScore: true,
        publishedAt: true,
        source: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getRecentAuditLogs() {
  try {
    return await prisma.auditLog.findMany({
      where: {
        action: { in: ["ALERT_DISPATCHED", "DIGEST_DISPATCHED", "MAILER_TEST"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────

export default async function MailCommandCenterPage() {
  const [subs, alerts, logs] = await Promise.all([
    getSubscriberStats(),
    getRecentHighScoreArticles(),
    getRecentAuditLogs(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-0.5 bg-gold" />
          <h1 className="text-headline font-serif font-bold text-text-primary">
            Mail Command Center
          </h1>
        </div>
        <p className="text-body text-text-secondary max-w-2xl leading-relaxed mb-4">
          AI-managed email alert dispatch — the Rust mailer service monitors article
          importance scores and automatically sends targeted alerts to subscribers.
          Owner receives a copy of every dispatch.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/subscribe"
            className="text-label font-mono text-gold border border-gold/30 rounded-md px-3 py-1.5 hover:bg-gold/5 transition-colors"
          >
            → Subscriber Signup
          </Link>
          <Link
            href="/alerts"
            className="text-label font-mono text-text-muted border border-border-subtle rounded-md px-3 py-1.5 hover:border-gold/20 transition-colors"
          >
            → Live Alerts Feed
          </Link>
          <Link
            href="/statecoin"
            className="text-label font-mono text-text-muted border border-border-subtle rounded-md px-3 py-1.5 hover:border-gold/20 transition-colors"
          >
            → Stablecoin Intelligence
          </Link>
        </div>
      </div>

      {/* ── System health strip ── */}
      <MailerHealthStrip />

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <StatCard label="Total Subscribers" value={subs.total} />
        <StatCard label="Active" value={subs.active} accent="green" />
        <StatCard label="Daily Cadence" value={subs.daily} />
        <StatCard label="Twice Daily" value={subs.twiceDaily} />
        <StatCard label="Weekly" value={subs.weekly} />
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: dispatch queue + recent alerts (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Dispatch queue */}
          <div>
            <SectionLabel>Alert-Eligible Articles</SectionLabel>
            <p className="text-caption text-text-muted mb-3">
              Articles scoring ≥ 7.0 that would trigger email dispatch. The Rust mailer
              auto-sends when these arrive in the pipeline.
            </p>
            {alerts.length === 0 ? (
              <EmptyState message="No high-score articles detected yet. The pipeline will surface them as they arrive." />
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => {
                  const score = a.importanceScore ?? 0;
                  const severity = score >= 8.5 ? "HIGH" : "WATCH";
                  const sevColor = score >= 8.5 ? "text-red-400" : "text-gold";
                  return (
                    <Link
                      key={a.id}
                      href={`/intelligence/${a.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface/30 hover:border-gold/20 transition-colors group"
                    >
                      <span className={`text-label font-mono w-14 shrink-0 ${sevColor}`}>
                        {severity}
                      </span>
                      <span className="text-label font-mono text-text-muted w-10 shrink-0">
                        {score.toFixed(1)}
                      </span>
                      <span className="text-body-sm text-text-primary group-hover:text-gold transition-colors flex-1 min-w-0 truncate">
                        {a.title}
                      </span>
                      <span className="text-caption text-text-muted shrink-0 hidden sm:block">
                        {a.source?.name ?? ""}
                      </span>
                      <span className="text-caption text-text-muted shrink-0">
                        {a.publishedAt ? formatTimeAgo(a.publishedAt) : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit trail */}
          <div>
            <SectionLabel>Dispatch History</SectionLabel>
            {logs.length === 0 ? (
              <EmptyState message="No dispatch events recorded yet. Events will appear here after the mailer sends its first alert." />
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface/20"
                  >
                    <ActionBadge action={log.action} />
                    <span className="text-body-sm text-text-secondary flex-1 min-w-0 truncate">
                      {log.details ?? log.action}
                    </span>
                    <span className="text-caption text-text-muted shrink-0">
                      {formatTimeAgo(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: system info (1/3) */}
        <div className="space-y-6">

          {/* Architecture card */}
          <div className="p-4 rounded-xl border border-border-subtle bg-surface">
            <h3 className="text-body-sm font-semibold text-text-primary mb-3">
              System Architecture
            </h3>
            <div className="space-y-2.5 text-body-sm">
              <ArchRow label="Mailer Service" value="Rust / Axum" detail="Port 9100" />
              <ArchRow label="SMTP Transport" value="Lettre + STARTTLS" />
              <ArchRow label="Templates" value="MiniJinja" detail="Dark theme, gold accent" />
              <ArchRow label="Score Threshold" value="≥ 7.0" detail="Configurable via env" />
              <ArchRow label="Owner Copy" value="Always BCC'd" detail="Every dispatch" />
              <ArchRow label="Subscriber API" value="/api/subscribers" />
              <ArchRow label="Dispatch Proxy" value="/api/mailer" />
            </div>
          </div>

          {/* Severity guide */}
          <div className="p-4 rounded-xl border border-border-subtle bg-surface">
            <h3 className="text-body-sm font-semibold text-text-primary mb-3">
              Severity Tiers
            </h3>
            <div className="space-y-3">
              <SeverityRow
                level="HIGH ALERT"
                color="bg-red-500"
                textColor="text-red-400"
                threshold="Score ≥ 8.5"
                action="Immediate dispatch to all subscribers"
              />
              <SeverityRow
                level="WATCH LIST"
                color="bg-gold"
                textColor="text-gold"
                threshold="Score 7.0 – 8.4"
                action="Digest-eligible, included in daily/weekly roundups"
              />
              <SeverityRow
                level="SIGNAL"
                color="bg-text-muted"
                textColor="text-text-muted"
                threshold="Score < 7.0"
                action="Logged but not dispatched — no email sent"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="p-4 rounded-xl border border-gold/20 bg-gold/5">
            <h3 className="text-body-sm font-semibold text-gold mb-3">
              Endpoints
            </h3>
            <div className="space-y-2 text-body-sm font-mono">
              <EndpointRow method="POST" path="/v1/dispatch" desc="Send alert" />
              <EndpointRow method="POST" path="/v1/digest" desc="Send digest" />
              <EndpointRow method="POST" path="/v1/test" desc="SMTP test" />
              <EndpointRow method="GET" path="/v1/status" desc="Service info" />
              <EndpointRow method="GET" path="/health" desc="Liveness" />
            </div>
            <p className="text-caption text-text-muted mt-3">
              Base URL: <span className="text-gold">localhost:9100</span>
            </p>
          </div>

          {/* Cadence schedule */}
          <div className="p-4 rounded-xl border border-border-subtle bg-surface">
            <h3 className="text-body-sm font-semibold text-text-primary mb-3">
              Digest Schedule
            </h3>
            <div className="space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Daily digest</span>
                <span className="font-mono text-text-muted">06:00 ET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Twice daily</span>
                <span className="font-mono text-text-muted">06:00, 18:00 ET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Weekly roundup</span>
                <span className="font-mono text-text-muted">Mon 06:00 ET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Stablecoin scan</span>
                <span className="font-mono text-text-muted">Every 30 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function MailerHealthStrip() {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border-subtle bg-surface/30 mb-6">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-body-sm font-medium text-text-primary">Rust Mailer</span>
        <span className="text-caption text-text-muted font-mono">:9100</span>
      </div>
      <span className="text-caption text-text-muted">|</span>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-body-sm font-medium text-text-primary">Ingestion Pipeline</span>
      </div>
      <span className="text-caption text-text-muted">|</span>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-body-sm font-medium text-text-primary">Stablecoin Monitor</span>
        <span className="text-caption text-text-muted font-mono">30m cycle</span>
      </div>
      <span className="text-caption text-text-muted ml-auto hidden sm:block">
        Owner copy: always enabled
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="text-label font-mono text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
      <span className="w-4 h-px bg-gold/40" />
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green";
}) {
  const valueColor = accent === "green" ? "text-green-400" : "text-text-primary";
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-4">
      <div className={`text-2xl font-bold font-mono ${valueColor}`}>{value}</div>
      <div className="text-body-sm font-medium text-text-primary mt-0.5">{label}</div>
    </div>
  );
}

function ArchRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-text-muted">{label}</span>
      <span className="font-mono text-text-primary text-right">
        {value}
        {detail && (
          <span className="text-text-muted text-caption ml-1">({detail})</span>
        )}
      </span>
    </div>
  );
}

function SeverityRow({
  level,
  color,
  textColor,
  threshold,
  action,
}: {
  level: string;
  color: string;
  textColor: string;
  threshold: string;
  action: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`w-2 h-2 rounded-full ${color}`} />
        <span className={`text-label font-mono ${textColor}`}>{level}</span>
        <span className="text-caption text-text-muted ml-auto">{threshold}</span>
      </div>
      <p className="text-caption text-text-muted ml-4">{action}</p>
    </div>
  );
}

function EndpointRow({
  method,
  path,
  desc,
}: {
  method: string;
  path: string;
  desc: string;
}) {
  const methodColor =
    method === "POST" ? "text-green-400" : "text-blue-400";
  return (
    <div className="flex items-center gap-2">
      <span className={`${methodColor} w-10 shrink-0 text-caption`}>{method}</span>
      <span className="text-gold flex-1">{path}</span>
      <span className="text-text-muted text-caption">{desc}</span>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const style =
    action === "ALERT_DISPATCHED"
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : action === "DIGEST_DISPATCHED"
        ? "text-gold bg-gold/10 border-gold/20"
        : "text-blue-400 bg-blue-500/10 border-blue-500/20";
  const label =
    action === "ALERT_DISPATCHED"
      ? "ALERT"
      : action === "DIGEST_DISPATCHED"
        ? "DIGEST"
        : "TEST";
  return (
    <span className={`text-label font-mono px-2 py-0.5 rounded border shrink-0 ${style}`}>
      {label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-6 rounded-xl border border-border-subtle bg-surface/20 text-center">
      <p className="text-body-sm text-text-muted">{message}</p>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
