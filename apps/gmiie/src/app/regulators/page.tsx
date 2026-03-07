import type { Metadata } from "next";
import Link from "next/link";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getRegulators } from "@/lib/data";
import type { RegulatorListItem } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "Regulators & Central Banks",
  description:
    "Track the regulatory bodies and central banks shaping tokenized securities, CBDC policy, and digital asset frameworks worldwide.",
  path: "/regulators",
  domain: "gmiie.xxxiii.io",
});

const TYPE_ICONS: Record<string, string> = {
  REGULATOR: "⚖️",
  CENTRAL_BANK: "🏛️",
};

export default async function RegulatorsPage() {
  let regulators: RegulatorListItem[] = [];

  try {
    const raw = await getRegulators();
    regulators = raw;
  } catch {
    // DB not connected
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Regulators & Central Banks
        </h1>
        <p className="text-body text-text-muted">
          The regulatory bodies and central banks shaping tokenized securities,
          CBDC policy, and digital asset frameworks worldwide.
        </p>
      </div>

      {regulators.length > 0 ? (
        <div className="space-y-3">
          {regulators.map((entity) => {
            const icon = TYPE_ICONS[entity.entityType] ?? "⚖️";

            return (
              <Link
                key={entity.slug}
                href={`/entities/${entity.slug}`}
                className="block p-4 rounded-lg border border-border-subtle bg-surface/30 hover:border-gold/20 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-body font-semibold text-text-primary group-hover:text-gold transition-colors">
                        {entity.name}
                      </h3>
                      <span className="text-label font-mono px-2 py-0.5 rounded-lg bg-surface border border-border-subtle text-text-muted uppercase">
                        {entity.entityType.replace(/_/g, " ")}
                      </span>
                    </div>
                    {entity.description && (
                      <p className="text-body-sm text-text-secondary line-clamp-2 mb-1">
                        {entity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-label font-mono text-text-muted">
                      {entity.headquarters && (
                        <span>{entity.headquarters}</span>
                      )}
                      {entity.articleCount > 0 && (
                        <span>{entity.articleCount} articles</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-text-muted">
          <p className="text-body">No regulators tracked yet.</p>
          <p className="text-body-sm mt-2">
            Regulatory entities will appear as intelligence is published.
          </p>
        </div>
      )}
    </div>
  );
}
