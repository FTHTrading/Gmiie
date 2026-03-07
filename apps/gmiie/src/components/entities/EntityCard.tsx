import Link from "next/link";
import type { EntityListItem } from "@/lib/models";

/** @deprecated Use EntityListItem from @/lib/models directly */
export type EntityCardData = EntityListItem;

interface EntityCardProps {
  entity: EntityListItem;
  compact?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  BANK: "🏦",
  CENTRAL_BANK: "🏛️",
  REGULATOR: "⚖️",
  EXCHANGE: "📊",
  CUSTODIAN: "🔐",
  ASSET_MANAGER: "💼",
  TOKENIZATION_FIRM: "🔗",
  INFRASTRUCTURE_PROVIDER: "⚙️",
  CHAIN: "⛓️",
  PROTOCOL: "📜",
  CLEARING_HOUSE: "🏢",
  PAYMENT_PROVIDER: "💳",
};

const TYPE_LABELS: Record<string, string> = {
  BANK: "Bank",
  CENTRAL_BANK: "Central Bank",
  REGULATOR: "Regulator",
  EXCHANGE: "Exchange",
  CUSTODIAN: "Custodian",
  ASSET_MANAGER: "Asset Manager",
  TOKENIZATION_FIRM: "Tokenization",
  INFRASTRUCTURE_PROVIDER: "Infrastructure",
  CHAIN: "Blockchain",
  PROTOCOL: "Protocol",
  CLEARING_HOUSE: "Clearing House",
  PAYMENT_PROVIDER: "Payments",
  GOVERNMENT_AGENCY: "Government",
  FUND: "Fund",
  BROKER_DEALER: "Broker-Dealer",
  TRANSFER_AGENT: "Transfer Agent",
  MARKET_UTILITY: "Market Utility",
  COUNTRY: "Country",
};

export function EntityCard({ entity, compact = false }: EntityCardProps) {
  const icon = TYPE_ICONS[entity.entityType] || "◎";
  const typeLabel = TYPE_LABELS[entity.entityType] || entity.entityType;

  return (
    <Link
      href={`/entities/${entity.slug}`}
      className="block p-5 rounded-xl bg-surface border border-border-subtle hover:border-gold/20 hover:bg-surface-elevated transition-all duration-200 group"
    >
      <div className="flex items-start gap-3.5">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          {/* Name + type */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors truncate">
              {entity.name}
            </h3>
            <span className="text-label font-mono text-text-muted bg-surface-elevated px-2 py-0.5 rounded whitespace-nowrap">
              {typeLabel}
            </span>
          </div>

          {/* Description */}
          {!compact && entity.description && (
            <p className="text-body-sm text-text-secondary leading-relaxed mb-2.5 line-clamp-2">
              {entity.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-caption font-mono text-text-muted">
            {entity.headquarters && <span>{entity.headquarters}</span>}
            {entity.articleCount > 0 && (
              <span>{entity.articleCount} articles</span>
            )}
            {entity.timelineCount > 0 && (
              <span>{entity.timelineCount} events</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
