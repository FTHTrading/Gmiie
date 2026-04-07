import type { Metadata } from "next";
import { generateMetadata as genMeta } from "@xxxiii/seo";
import { getEntities } from "@/lib/data";
import { EntitiesFilteredList } from "./EntitiesFilteredList";
import type { EntityListItem } from "@/lib/models";

export const revalidate = 300;

export const metadata: Metadata = genMeta({
  title: "Entity Directory",
  description:
    "Explore the institutions, regulators, infrastructure providers, and technology companies shaping the future of global capital markets.",
  path: "/entities",
  domain: "gmiie.xxxiii.io",
});

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

      <EntitiesFilteredList entities={entities} />
    </div>
  );
}
