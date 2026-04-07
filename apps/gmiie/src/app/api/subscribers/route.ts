import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

const VALID_CADENCES = new Set(["daily", "twice_daily", "weekly"]);

/**
 * GET /api/subscribers
 *
 * Returns active subscribers for the gmiie site.
 * Used by the Rust gmiie-mailer service to fetch dispatch targets.
 *
 * Query params:
 *   cadence  — filter by cadence (daily | twice_daily | weekly)
 *   site     — filter by site slug (default: gmiie)
 *
 * Auth: x-api-key header must match INTERNAL_API_KEY env var (if set).
 */
export async function GET(request: NextRequest) {
  // Internal API key check (optional — set INTERNAL_API_KEY to enable)
  const apiKey = process.env.INTERNAL_API_KEY;
  if (apiKey) {
    const provided = request.headers.get("x-api-key");
    if (provided !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const cadenceParam = searchParams.get("cadence")?.toLowerCase() ?? null;
  const site = searchParams.get("site") ?? "gmiie";

  const cadenceFilter = cadenceParam && VALID_CADENCES.has(cadenceParam)
    ? cadenceParam.toUpperCase().replace("TWICE_DAILY", "TWICE_DAILY")
    : null;

  try {
    const where: Record<string, unknown> = {
      isActive: true,
      site,
    };

    if (cadenceFilter) {
      where.cadence = cadenceFilter === "DAILY"
        ? "DAILY"
        : cadenceFilter === "TWICE_DAILY"
          ? "TWICE_DAILY"
          : "WEEKLY";
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        cadence: true,
        language: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
      site,
      cadence: cadenceFilter ?? "all",
    });
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
