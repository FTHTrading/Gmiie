"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { EntityGraphData, GraphNode } from "@/lib/models";

// ─── Ring assignment by entity type ──────────────────────────────────────────
const RING_MAP: Record<string, number> = {
  CENTRAL_BANK: 1,
  REGULATOR: 2,
  CLEARING_HOUSE: 2,
  MARKET_UTILITY: 2,
  BANK: 3,
  CUSTODIAN: 3,
  BROKER_DEALER: 3,
  TRANSFER_AGENT: 3,
  EXCHANGE: 4,
  ASSET_MANAGER: 4,
  FUND: 4,
  PAYMENT_PROVIDER: 4,
  PROTOCOL: 5,
  CHAIN: 5,
  TOKENIZATION_FIRM: 5,
  INFRASTRUCTURE_PROVIDER: 5,
  GOVERNMENT_AGENCY: 5,
  COUNTRY: 5,
};

const RING_RADIUS: Record<number, number> = {
  1: 100,
  2: 205,
  3: 300,
  4: 375,
  5: 450,
};

// ─── Colors per entity type ───────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  CENTRAL_BANK: "#C9A84C",
  REGULATOR: "#E85D04",
  CLEARING_HOUSE: "#F48C06",
  MARKET_UTILITY: "#FAA307",
  BANK: "#3B82F6",
  CUSTODIAN: "#60A5FA",
  BROKER_DEALER: "#818CF8",
  TRANSFER_AGENT: "#A5B4FC",
  EXCHANGE: "#06B6D4",
  ASSET_MANAGER: "#A855F7",
  FUND: "#C084FC",
  PAYMENT_PROVIDER: "#EC4899",
  PROTOCOL: "#10B981",
  CHAIN: "#34D399",
  TOKENIZATION_FIRM: "#6EE7B7",
  INFRASTRUCTURE_PROVIDER: "#86EFAC",
  GOVERNMENT_AGENCY: "#94A3B8",
  COUNTRY: "#64748B",
};

// ─── Human-readable labels ────────────────────────────────────────────────────
const TYPE_LABEL: Record<string, string> = {
  CENTRAL_BANK: "Central Banks",
  REGULATOR: "Regulators",
  CLEARING_HOUSE: "Clearing Houses",
  MARKET_UTILITY: "Market Utilities",
  BANK: "Banks",
  CUSTODIAN: "Custodians",
  BROKER_DEALER: "Broker-Dealers",
  TRANSFER_AGENT: "Transfer Agents",
  EXCHANGE: "Exchanges",
  ASSET_MANAGER: "Asset Managers",
  FUND: "Funds",
  PAYMENT_PROVIDER: "Payment Providers",
  PROTOCOL: "Protocols",
  CHAIN: "Blockchains",
  TOKENIZATION_FIRM: "Tokenization Firms",
  INFRASTRUCTURE_PROVIDER: "Infrastructure",
  GOVERNMENT_AGENCY: "Government Agencies",
  COUNTRY: "Countries / Jurisdictions",
};

// ─── Ring labels ───────────────────────────────────────────────────────────────
const RING_LABEL: Record<number, string> = {
  1: "MONETARY AUTHORITY",
  2: "REGULATORY & MARKET INFRA",
  3: "TRADITIONAL FINANCE",
  4: "MARKETS & CAPITAL",
  5: "DIGITAL RAILS & PROTOCOLS",
};

const CX = 700;
const CY = 430;
const VIEWBOX_W = 1400;
const VIEWBOX_H = 860;

function computePositions(nodes: GraphNode[]): Map<string, [number, number]> {
  const byRing = new Map<number, GraphNode[]>();
  for (const node of nodes) {
    const ring = RING_MAP[node.entityType] ?? 5;
    if (!byRing.has(ring)) byRing.set(ring, []);
    byRing.get(ring)!.push(node);
  }

  const positions = new Map<string, [number, number]>();
  for (const [ring, ringNodes] of byRing) {
    const r = RING_RADIUS[ring] ?? 450;
    ringNodes.forEach((node, i) => {
      // Start at top (-π/2), offset each ring slightly so labels don't overlap across rings
      const offset = ring % 2 === 0 ? Math.PI / (ringNodes.length * 2) : 0;
      const angle = offset + (i / ringNodes.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(node.id, [
        CX + r * Math.cos(angle),
        CY + r * Math.sin(angle),
      ]);
    });
  }
  return positions;
}

function getDisplayName(node: GraphNode): string {
  const label = node.shortName ?? node.name;
  return label.length > 14 ? label.slice(0, 13) + "…" : label;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function FinancialSystemMap({ data }: { data: EntityGraphData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());

  const positions = useMemo(() => computePositions(data.nodes), [data.nodes]);
  const selectedNode = selectedId ? data.nodes.find((n) => n.id === selectedId) ?? null : null;

  const allTypes = useMemo(() => {
    const types = new Set(data.nodes.map((n) => n.entityType));
    return Array.from(types).sort();
  }, [data.nodes]);

  const visibleIds = useMemo(() => {
    if (activeTypes.size === 0) return new Set(data.nodes.map((n) => n.id));
    return new Set(data.nodes.filter((n) => activeTypes.has(n.entityType)).map((n) => n.id));
  }, [data.nodes, activeTypes]);

  function toggleType(type: string) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function handleNodeClick(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  if (data.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-text-muted text-4xl mb-4">◎</div>
        <p className="text-body-sm text-text-muted font-mono">
          No entity data yet. Run the database seed to populate the financial system map.
        </p>
        <code className="mt-3 text-xs text-gold/70 font-mono bg-surface-elevated px-3 py-1.5 rounded">
          pnpm db:seed
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTypes(new Set())}
          className={`px-2.5 py-1 rounded text-label font-mono text-xs transition-colors ${
            activeTypes.size === 0
              ? "bg-gold/20 text-gold border border-gold/40"
              : "text-text-muted border border-border-subtle hover:border-border-muted"
          }`}
        >
          ALL
        </button>
        {allTypes.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`px-2.5 py-1 rounded text-label font-mono text-xs transition-colors`}
            style={{
              backgroundColor: activeTypes.has(type)
                ? (TYPE_COLOR[type] ?? "#888") + "25"
                : undefined,
              color: activeTypes.has(type) ? (TYPE_COLOR[type] ?? "#888") : undefined,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: activeTypes.has(type)
                ? (TYPE_COLOR[type] ?? "#888") + "60"
                : "#2a2a2a",
            }}
          >
            {TYPE_LABEL[type] ?? type}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-label font-mono text-text-muted">
        <span>
          <span className="text-text-primary">
            {activeTypes.size === 0 ? data.nodes.length : [...visibleIds].length}
          </span>{" "}
          entities
        </span>
        {data.edges.length > 0 && (
          <span>
            <span className="text-text-primary">{data.edges.length}</span> topic connections
          </span>
        )}
        {selectedNode && (
          <span className="ml-auto text-gold/70">
            ◎ {selectedNode.name} selected
          </span>
        )}
      </div>

      {/* Map + Info panel */}
      <div className="flex gap-4">
        {/* SVG Map */}
        <div className={`flex-1 min-w-0 border border-border-subtle rounded-lg overflow-hidden bg-background`}>
          <svg
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            className="w-full"
            style={{ background: "transparent" }}
          >
            {/* Ring guidelines */}
            {[1, 2, 3, 4, 5].map((ring) => (
              <circle
                key={ring}
                cx={CX}
                cy={CY}
                r={RING_RADIUS[ring]}
                fill="none"
                stroke={ring === 1 ? "#C9A84C22" : "#ffffff06"}
                strokeWidth={1}
                strokeDasharray={ring === 1 ? "4 4" : "2 6"}
              />
            ))}

            {/* Ring labels (at 3 o'clock position) */}
            {[2, 3, 4, 5].map((ring) => (
              <text
                key={`ring-label-${ring}`}
                x={CX + RING_RADIUS[ring] + 6}
                y={CY + 4}
                fontSize={7}
                fill="#ffffff18"
                fontFamily="monospace"
                letterSpacing={1}
              >
                {RING_LABEL[ring]}
              </text>
            ))}

            {/* Center hub */}
            <circle cx={CX} cy={CY} r={38} fill="#C9A84C0a" stroke="#C9A84C30" strokeWidth={1} />
            <circle cx={CX} cy={CY} r={22} fill="#C9A84C15" stroke="#C9A84C50" strokeWidth={1} />
            <text x={CX} y={CY - 4} textAnchor="middle" fontSize={8} fill="#C9A84Ccc" fontFamily="monospace" fontWeight="bold" letterSpacing={1.5}>GMIIE</text>
            <text x={CX} y={CY + 7} textAnchor="middle" fontSize={6} fill="#C9A84C66" fontFamily="monospace" letterSpacing={1}>GLOBAL</text>

            {/* Edges — only draw when lightly (expensive to render all) */}
            {data.edges.length < 500 &&
              data.edges
                .filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target))
                .map((edge, i) => {
                  const a = positions.get(edge.source);
                  const b = positions.get(edge.target);
                  if (!a || !b) return null;
                  const isHighlighted =
                    hoveredId === edge.source || hoveredId === edge.target ||
                    selectedId === edge.source || selectedId === edge.target;
                  if (!isHighlighted && data.edges.length > 150) return null;
                  return (
                    <line
                      key={i}
                      x1={a[0]} y1={a[1]}
                      x2={b[0]} y2={b[1]}
                      stroke={isHighlighted ? "#C9A84C" : "#ffffff12"}
                      strokeWidth={isHighlighted ? Math.min(edge.sharedTopics, 3) : 0.5}
                      opacity={isHighlighted ? 0.7 : 0.3}
                    />
                  );
                })}

            {/* Nodes */}
            {data.nodes
              .filter((n) => visibleIds.has(n.id))
              .map((node) => {
                const pos = positions.get(node.id);
                if (!pos) return null;
                const [x, y] = pos;
                const color = TYPE_COLOR[node.entityType] ?? "#888";
                const isSelected = selectedId === node.id;
                const isHovered = hoveredId === node.id;
                const isConnected =
                  selectedId !== null &&
                  data.edges.some(
                    (e) =>
                      (e.source === selectedId && e.target === node.id) ||
                      (e.target === selectedId && e.source === node.id)
                  );
                const dimmed =
                  selectedId !== null && !isSelected && !isConnected;
                const r = isSelected ? 9 : isHovered ? 7.5 : 6;
                const ring = RING_MAP[node.entityType] ?? 5;
                const labelSize = ring <= 2 ? 8 : ring === 3 ? 7 : 6;

                return (
                  <g
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: "pointer" }}
                    opacity={dimmed ? 0.2 : 1}
                  >
                    {/* Glow halo for selected */}
                    {isSelected && (
                      <circle
                        cx={x} cy={y} r={16}
                        fill={color + "20"}
                        stroke={color + "50"}
                        strokeWidth={1}
                      />
                    )}
                    {/* Main node */}
                    <circle
                      cx={x} cy={y} r={r}
                      fill={color + (isSelected ? "ff" : isHovered ? "cc" : "99")}
                      stroke={color}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                    />
                    {/* Article count ring */}
                    {node.articleCount > 0 && (
                      <circle
                        cx={x} cy={y}
                        r={r + 3 + Math.min(node.articleCount / 5, 4)}
                        fill="none"
                        stroke={color + "30"}
                        strokeWidth={1}
                      />
                    )}
                    {/* Label */}
                    <text
                      x={x}
                      y={y - r - 3}
                      textAnchor="middle"
                      fontSize={labelSize}
                      fill={isSelected ? color : isHovered ? "#ffffffcc" : "#ffffff88"}
                      fontFamily="monospace"
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {getDisplayName(node)}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Info panel — shows when a node is selected */}
        {selectedNode && (
          <div className="w-64 shrink-0 border border-border-subtle rounded-lg p-4 bg-surface space-y-3 self-start sticky top-20">
            {/* Type badge */}
            <div className="flex items-center justify-between">
              <span
                className="text-label font-mono text-xs px-2 py-0.5 rounded-full border"
                style={{
                  color: TYPE_COLOR[selectedNode.entityType] ?? "#888",
                  borderColor: (TYPE_COLOR[selectedNode.entityType] ?? "#888") + "50",
                  backgroundColor: (TYPE_COLOR[selectedNode.entityType] ?? "#888") + "15",
                }}
              >
                {TYPE_LABEL[selectedNode.entityType] ?? selectedNode.entityType}
              </span>
              <button
                onClick={() => setSelectedId(null)}
                className="text-text-muted hover:text-text-primary text-sm"
              >
                ✕
              </button>
            </div>

            {/* Name */}
            <div>
              <h3 className="text-body font-semibold text-text-primary leading-snug">
                {selectedNode.name}
              </h3>
              {selectedNode.shortName && selectedNode.name !== selectedNode.shortName && (
                <p className="text-label text-text-muted font-mono">{selectedNode.shortName}</p>
              )}
            </div>

            {/* Meta */}
            <dl className="space-y-1 text-label font-mono">
              {selectedNode.country && (
                <div className="flex gap-2">
                  <dt className="text-text-muted w-16">Country</dt>
                  <dd className="text-text-secondary">{selectedNode.country}</dd>
                </div>
              )}
              {selectedNode.region && (
                <div className="flex gap-2">
                  <dt className="text-text-muted w-16">Region</dt>
                  <dd className="text-text-secondary">{selectedNode.region}</dd>
                </div>
              )}
              {selectedNode.articleCount > 0 && (
                <div className="flex gap-2">
                  <dt className="text-text-muted w-16">Articles</dt>
                  <dd className="text-gold">{selectedNode.articleCount}</dd>
                </div>
              )}
              {selectedNode.topicIds.length > 0 && (
                <div className="flex gap-2">
                  <dt className="text-text-muted w-16">Topics</dt>
                  <dd className="text-text-secondary">{selectedNode.topicIds.length}</dd>
                </div>
              )}
            </dl>

            {/* Connected entities */}
            {(() => {
              const connected = data.edges
                .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                .sort((a, b) => b.sharedTopics - a.sharedTopics)
                .slice(0, 5)
                .map((e) => {
                  const otherId = e.source === selectedNode.id ? e.target : e.source;
                  return { node: data.nodes.find((n) => n.id === otherId), sharedTopics: e.sharedTopics };
                })
                .filter((x): x is { node: GraphNode; sharedTopics: number } => x.node !== undefined);

              if (connected.length === 0) return null;
              return (
                <div>
                  <p className="text-label font-mono text-text-muted uppercase tracking-widest mb-2">Connected</p>
                  <ul className="space-y-1">
                    {connected.map(({ node, sharedTopics }) => (
                      <li key={node.id} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: TYPE_COLOR[node.entityType] ?? "#888" }}
                        />
                        <button
                          onClick={() => setSelectedId(node.id)}
                          className="text-body-sm text-text-secondary hover:text-text-primary truncate text-left"
                        >
                          {node.shortName ?? node.name}
                        </button>
                        <span className="ml-auto text-label text-text-muted shrink-0">
                          {sharedTopics}t
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* View full entity link */}
            <Link
              href={`/entities/${selectedNode.slug}`}
              className="block text-center text-body-sm text-gold/80 hover:text-gold border border-gold/20 hover:border-gold/40 rounded py-1.5 transition-colors font-mono"
            >
              View Entity →
            </Link>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-border-subtle pt-4">
        <p className="text-label font-mono text-text-muted uppercase tracking-widest mb-3">Legend</p>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map((ring) => (
            <div key={ring} className="flex items-center gap-2">
              <svg width="12" height="12">
                <circle cx={6} cy={6} r={ring === 1 ? 6 : ring === 2 ? 5 : ring === 3 ? 4 : ring === 4 ? 3 : 2.5} fill={ring === 1 ? "#C9A84C" : ring === 2 ? "#E85D04" : ring === 3 ? "#3B82F6" : ring === 4 ? "#06B6D4" : "#10B981"} />
              </svg>
              <span className="text-label font-mono text-text-muted text-xs">{RING_LABEL[ring]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
