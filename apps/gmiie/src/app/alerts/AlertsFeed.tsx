"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Alert {
  slug: string;
  title: string;
  headline: string;
  type: string;
  score: number;
  publishedAt: string | null;
  source: string;
  severity: "high" | "medium" | "low";
}

const SEVERITY_STYLES = {
  high: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "HIGH",
    border: "border-l-red-500/60",
  },
  medium: {
    dot: "bg-gold",
    badge: "bg-gold/10 text-gold border-gold/20",
    label: "MEDIUM",
    border: "border-l-[#D4AF37]/40",
  },
  low: {
    dot: "bg-text-muted",
    badge: "bg-surface-elevated text-text-muted border-border-subtle",
    label: "LOW",
    border: "border-l-border-subtle",
  },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatType(type: string) {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = () => {
    if (esRef.current) {
      esRef.current.close();
    }
    setStatus("connecting");

    const es = new EventSource("/api/alerts/stream");
    esRef.current = es;

    es.addEventListener("init", (e) => {
      const data = JSON.parse(e.data);
      setAlerts(data.alerts ?? []);
      setStatus("connected");
      setLastUpdated(new Date().toLocaleTimeString());
    });

    es.addEventListener("alert", (e) => {
      const alert: Alert = JSON.parse(e.data);
      setAlerts((prev) => {
        // dedupe by slug, put new one at top
        const filtered = prev.filter((a) => a.slug !== alert.slug);
        return [alert, ...filtered].slice(0, 50);
      });
      setLastUpdated(new Date().toLocaleTimeString());
    });

    es.addEventListener("heartbeat", () => {
      setStatus("connected");
      setLastUpdated(new Date().toLocaleTimeString());
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setStatus("disconnected");
      // Auto-reconnect after 5s
      reconnectTimer.current = setTimeout(connect, 5_000);
    };
  };

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusConfig = {
    connecting: { dot: "bg-gold animate-pulse", label: "Connecting…" },
    connected: { dot: "bg-green-500", label: "Live" },
    disconnected: { dot: "bg-red-500", label: "Disconnected" },
  }[status];

  const highCount = alerts.filter((a) => a.severity === "high").length;
  const medCount = alerts.filter((a) => a.severity === "medium").length;

  return (
    <div>
      {/* Status bar */}
      <div className="flex items-center justify-between mb-6 p-3 rounded-lg bg-surface/50 border border-border-subtle">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
          <span className="text-body-sm font-mono text-text-secondary">{statusConfig.label}</span>
          {lastUpdated && (
            <span className="text-label text-text-muted font-mono">· last update {lastUpdated}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-label font-mono text-text-muted">
          {highCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              {highCount} HIGH
            </span>
          )}
          {medCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
              {medCount} MEDIUM
            </span>
          )}
          <span>{alerts.length} total</span>
        </div>
      </div>

      {/* Alert list */}
      {alerts.length === 0 && status === "connected" ? (
        <div className="text-center py-16 text-text-muted text-body-sm">
          No high-importance alerts in the current pipeline. Check back shortly.
        </div>
      ) : alerts.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-surface/30 border border-border-subtle animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const styles = SEVERITY_STYLES[alert.severity];
            return (
              <Link
                key={alert.slug}
                href={`/intelligence/${alert.slug}`}
                className={`block p-4 rounded-xl border border-border-subtle border-l-4 ${styles.border} bg-surface/30 hover:bg-surface/60 transition-colors group`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-label font-mono border ${styles.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        {styles.label}
                      </span>
                      <span className="text-label font-mono text-text-muted">{formatType(alert.type)}</span>
                      <span className="text-label text-text-muted">·</span>
                      <span className="text-label font-mono text-text-muted">{alert.source}</span>
                    </div>
                    <p className="text-body-sm font-semibold text-text-primary group-hover:text-gold transition-colors leading-snug line-clamp-2">
                      {alert.headline}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-label font-mono font-bold text-gold">{alert.score.toFixed(1)}</span>
                    <span className="text-label text-text-muted font-mono whitespace-nowrap">
                      {timeAgo(alert.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
