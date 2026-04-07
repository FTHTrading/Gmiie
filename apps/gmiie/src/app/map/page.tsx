import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getEntityGraph } from "@/lib/data";
import { FinancialSystemMap } from "@/components/map/FinancialSystemMap";
import type { EntityGraphData } from "@/lib/models";

export const revalidate = 600;

export const metadata: Metadata = genMeta({
  title: "Financial System Map",
  description:
    "Interactive network map of the global financial system — central banks, regulators, banks, exchanges, digital protocols, and the topic connections between them.",
  path: "/map",
  domain: "gmiie.xxxiii.io",
});

export default async function MapPage() {
  let graphData: EntityGraphData = { nodes: [], edges: [] };

  try {
    graphData = await getEntityGraph();
  } catch {
    // DB not connected — map renders empty state
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-gold/60 text-xl">◈</span>
          <h1 className="text-heading font-bold text-text-primary">
            Financial System Map
          </h1>
        </div>
        <p className="text-body text-text-muted max-w-2xl">
          Network topology of global monetary infrastructure — central banks,
          regulators, trading venues, settlement systems, and digital protocols.
          Connections surface from shared intelligence topics tracked by GMIIE.
        </p>

        {graphData.nodes.length > 0 && (
          <div className="flex items-center gap-6 mt-4 text-label font-mono text-text-muted">
            <span>
              <span className="text-gold">{graphData.nodes.length}</span> institutions mapped
            </span>
            <span>
              <span className="text-gold">
                {new Set(graphData.nodes.map((n) => n.entityType)).size}
              </span>{" "}
              entity types
            </span>
            {graphData.edges.length > 0 && (
              <span>
                <span className="text-gold">{graphData.edges.length}</span> topic connections
              </span>
            )}
            <span>
              <span className="text-gold">
                {new Set(graphData.nodes.map((n) => n.region).filter(Boolean)).size}
              </span>{" "}
              regions
            </span>
          </div>
        )}
      </div>

      {/* How to read the map */}
      <div className="mb-5 p-3 bg-surface-elevated/50 border border-border-subtle rounded-lg">
        <p className="text-label font-mono text-text-muted">
          <span className="text-gold/80">HOW TO READ</span>
          {" — "}
          Click any node to inspect. Inner rings = more systemic. Outer rings = digital infrastructure.
          Lines = entities sharing tracked topics. Filter by entity type using the pills above the map.
        </p>
      </div>

      {/* Map */}
      <FinancialSystemMap data={graphData} />
    </div>
  );
}
