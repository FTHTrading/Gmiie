import Link from "next/link";
import { getTimelineEvents } from "@/lib/data";
import type { TimelineEvent } from "@/lib/models";

export const revalidate = 300;

export const metadata = {
  title: "Timeline — Infrastructure Evolution",
  description:
    "Chronological timeline of key events in tokenized securities, digital assets, and financial infrastructure.",
};

// Group events by month-year
function groupByMonth(
  events: TimelineEvent[]
): { key: string; label: string; events: TimelineEvent[] }[] {
  const groups = new Map<string, typeof events>();

  for (const event of events) {
    const d = new Date(event.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }

  return Array.from(groups.entries()).map(([key, events]) => ({
    key,
    label: events.length > 0
      ? new Date(events[0].date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : key,
    events,
  }));
}

// Entity type badge colors
const TYPE_COLORS: Record<string, string> = {
  REGULATOR: "bg-red/20 text-red",
  CENTRAL_BANK: "bg-blue/20 text-blue",
  BANK: "bg-cyan/20 text-cyan",
  EXCHANGE: "bg-gold/20 text-gold",
  CUSTODIAN: "bg-purple/20 text-purple",
  ASSET_MANAGER: "bg-green/20 text-green",
  TOKENIZATION_FIRM: "bg-gold/20 text-gold",
  INFRASTRUCTURE_PROVIDER: "bg-cyan/20 text-cyan",
  CLEARING_HOUSE: "bg-blue/20 text-blue",
  GOVERNMENT_AGENCY: "bg-red/20 text-red",
};

export default async function TimelinePage() {
  let events: TimelineEvent[] = [];

  try {
    events = await getTimelineEvents(100);
  } catch {
    // DB not connected
  }

  const grouped = groupByMonth(events);

  // Placeholder events when DB is empty
  const placeholderGroups = grouped.length > 0
    ? grouped
    : [
        {
          key: "2026-03",
          label: "March 2026",
          events: [
            {
              id: "ph-1",
              title: "MUFG launches tokenized real estate security on Ethereum",
              description: "Japan's largest bank debuts institutional-grade tokenized real estate product targeting domestic pension funds.",
              date: new Date("2026-03-05"),
              sourceUrl: null,
              entity: { name: "MUFG", slug: "mufg", shortName: "MUFG", entityType: "BANK" },
            },
            {
              id: "ph-2",
              title: "ECB digital euro prototype enters Phase 3 testing",
              description: "European Central Bank expands digital euro pilot to 5 additional member states with retail CBDC functionality.",
              date: new Date("2026-03-02"),
              sourceUrl: null,
              entity: { name: "European Central Bank", slug: "ecb", shortName: "ECB", entityType: "CENTRAL_BANK" },
            },
          ],
        },
        {
          key: "2026-02",
          label: "February 2026",
          events: [
            {
              id: "ph-3",
              title: "Northern Trust tokenizes $2B money market fund on Polygon",
              description: "Major custodian bank brings institutional money market fund on-chain, enabling 24/7 settlement.",
              date: new Date("2026-02-20"),
              sourceUrl: null,
              entity: { name: "Northern Trust", slug: "northern-trust", shortName: null, entityType: "CUSTODIAN" },
            },
            {
              id: "ph-4",
              title: "DTCC completes digital settlement pilot processing $1T notional",
              description: "Project Ion demonstrates same-day settlement for US Treasury securities using distributed ledger technology.",
              date: new Date("2026-02-12"),
              sourceUrl: null,
              entity: { name: "DTCC", slug: "dtcc", shortName: "DTCC", entityType: "CLEARING_HOUSE" },
            },
          ],
        },
        {
          key: "2026-01",
          label: "January 2026",
          events: [
            {
              id: "ph-5",
              title: "SEC clarifies tokenized securities custody framework",
              description: "New guidance allows qualified custodians to hold tokenized securities without additional licensing requirements.",
              date: new Date("2026-01-28"),
              sourceUrl: null,
              entity: { name: "SEC", slug: "sec", shortName: "SEC", entityType: "REGULATOR" },
            },
            {
              id: "ph-6",
              title: "BlackRock BUIDL fund surpasses $5B AUM",
              description: "Tokenized Treasury fund becomes the largest on-chain money market vehicle globally.",
              date: new Date("2026-01-15"),
              sourceUrl: null,
              entity: { name: "BlackRock", slug: "blackrock", shortName: null, entityType: "ASSET_MANAGER" },
            },
            {
              id: "ph-7",
              title: "Singapore MAS finalizes Project Guardian Phase 2",
              description: "Cross-border tokenized bond issuance framework goes live across ASEAN markets.",
              date: new Date("2026-01-08"),
              sourceUrl: null,
              entity: { name: "MAS", slug: "mas", shortName: "MAS", entityType: "REGULATOR" },
            },
          ],
        },
      ];

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-heading font-bold text-text-primary mb-2">
          Infrastructure Timeline
        </h1>
        <p className="text-body text-text-muted">
          Tracking the evolution of tokenized markets, institutional adoption, and regulatory milestones.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border-subtle" />

        {placeholderGroups.map((group) => (
          <div key={group.key} className="mb-8">
            {/* Month header */}
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-[15px] h-[15px] rounded-full bg-gold border-2 border-background z-10 flex-shrink-0" />
              <h2 className="text-body font-mono font-semibold text-gold uppercase tracking-wider">
                {group.label}
              </h2>
            </div>

            {/* Events */}
            <div className="ml-[30px] space-y-3">
              {group.events.map((event) => {
                const d = new Date(event.date);
                const day = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const entity = event.entity;
                const typeColor = entity
                  ? TYPE_COLORS[entity.entityType] || "bg-text-muted/20 text-text-muted"
                  : "bg-text-muted/20 text-text-muted";

                return (
                  <div
                    key={event.id}
                    className="bg-surface rounded-xl border border-border-subtle p-5 hover:border-gold/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-body font-medium text-text-primary leading-snug">
                        {event.title}
                      </h3>
                      <span className="text-label font-mono text-text-muted whitespace-nowrap flex-shrink-0">
                        {day}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-body-sm text-text-muted leading-relaxed mb-3">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2.5">
                      {entity && (
                      <>
                      <Link href={`/entities/${entity.slug}`}>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-label font-mono font-medium ${typeColor} hover:opacity-80 transition-opacity`}
                        >
                          {entity.shortName || entity.name}
                        </span>
                      </Link>

                      <span className="text-label font-mono text-text-muted">
                        {entity.entityType.replace(/_/g, " ")}
                      </span>
                      </>
                      )}

                      {event.sourceUrl && (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-label font-mono text-gold hover:text-gold/80 transition-colors"
                        >
                          Source →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {events.length === 0 && grouped.length === 0 && (
          <div className="ml-[30px] py-16 text-center">
            <p className="text-body text-text-muted">
              No timeline events yet. Events will appear as the intelligence pipeline processes data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
