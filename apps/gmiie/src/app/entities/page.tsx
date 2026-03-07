import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getEntities } from "@/lib/data";
import { EntityCard } from "@/components/entities/EntityCard";
import type { EntityListItem } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "Entity Directory",
  description:
    "Explore the institutions, regulators, infrastructure providers, and technology companies shaping the future of global capital markets.",
  path: "/entities",
  domain: "gmiie.xxxiii.io",
});

const ENTITY_TYPES = [
  { label: "All", value: "all" },
  { label: "Banks", value: "BANK" },
  { label: "Market Infrastructure", value: "MARKET_INFRASTRUCTURE" },
  { label: "Regulators", value: "REGULATOR" },
  { label: "Asset Managers", value: "ASSET_MANAGER" },
  { label: "Technology Providers", value: "TECHNOLOGY_PROVIDER" },
  { label: "Exchanges", value: "EXCHANGE" },
  { label: "Central Banks", value: "CENTRAL_BANK" },
] as const;

export default async function EntitiesPage() {
  let entities: EntityListItem[] = [];

  try {
    const raw = await getEntities(100);
    entities = raw;
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Entity Directory
        </h1>
        <p className="text-body text-text-muted">
          Institutions, regulators, infrastructure providers, and technology
          companies defining the transformation of global capital markets.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2.5 mb-6 pb-4 border-b border-border-subtle">
        <span className="text-label font-mono text-text-muted tracking-wider mr-1 self-center">
          FILTER
        </span>
        {ENTITY_TYPES.map((type) => (
          <button
            key={type.value}
            className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
              type.value === "all"
                ? "bg-gold/10 border-gold/30 text-gold"
                : "bg-surface border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Entity grid */}
      {entities.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {entities.map((entity) => (
            <EntityCard key={entity.slug} entity={entity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <p className="text-body">No entities tracked yet.</p>
          <p className="text-body-sm mt-2">Entities will appear as intelligence is published.</p>
        </div>
      )}
    </div>
  );
}
