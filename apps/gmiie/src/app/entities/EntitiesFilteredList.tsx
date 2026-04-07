"use client";

import { useState } from "react";
import { EntityCard } from "@/components/entities/EntityCard";
import type { EntityListItem } from "@/lib/models";

const ENTITY_TYPES = [
  { label: "All", value: "all" },
  { label: "Banks", value: "BANK" },
  { label: "Central Banks", value: "CENTRAL_BANK" },
  { label: "Regulators", value: "REGULATOR" },
  { label: "Asset Managers", value: "ASSET_MANAGER" },
  { label: "Market Infrastructure", value: "MARKET_INFRASTRUCTURE" },
  { label: "Technology Providers", value: "TECHNOLOGY_PROVIDER" },
  { label: "Exchanges", value: "EXCHANGE" },
  { label: "Custodians", value: "CUSTODIAN" },
] as const;

type FilterValue = (typeof ENTITY_TYPES)[number]["value"];

export function EntitiesFilteredList({ entities }: { entities: EntityListItem[] }) {
  const [active, setActive] = useState<FilterValue>("all");

  const filtered =
    active === "all" ? entities : entities.filter((e) => e.entityType === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-border-subtle">
        <span className="text-label font-mono text-text-muted tracking-wider mr-1 self-center">
          FILTER
        </span>
        {ENTITY_TYPES.map((type) => {
          const isActive = active === type.value;
          const count =
            type.value === "all"
              ? entities.length
              : entities.filter((e) => e.entityType === type.value).length;
          if (type.value !== "all" && count === 0) return null;
          return (
            <button
              key={type.value}
              onClick={() => setActive(type.value)}
              className={`px-3 py-1.5 rounded-full text-caption font-medium border transition-colors ${
                isActive
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-surface border-border-subtle text-text-secondary hover:border-gold/30 hover:text-gold"
              }`}
            >
              {type.label}
              <span className={`ml-1.5 ${isActive ? "text-gold/70" : "text-text-muted/50"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Entity grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((entity) => (
            <EntityCard key={entity.slug} entity={entity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          <p className="text-body">No {ENTITY_TYPES.find((t) => t.value === active)?.label.toLowerCase()} entities yet.</p>
          <button onClick={() => setActive("all")} className="mt-3 text-body-sm text-gold hover:underline">
            View all entities
          </button>
        </div>
      )}
    </div>
  );
}
