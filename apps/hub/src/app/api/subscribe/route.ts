import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@xxxiii/db";

const VALID_CADENCES = new Set(["daily", "twice_daily", "weekly"] as const);
const VALID_LANGUAGES = new Set(["en", "es", "fr", "de", "pt", "zh", "ja", "ar"]);

function mapCadence(value: string): "DAILY" | "TWICE_DAILY" | "WEEKLY" {
  if (value === "twice_daily") return "TWICE_DAILY";
  if (value === "weekly") return "WEEKLY";
  return "DAILY";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim() || null;
    const cadenceInput = String(body.cadence || "daily").toLowerCase();
    const languageInput = String(body.language || "en").toLowerCase();
    const location = String(body.location || "").trim() || null;
    const site = String(body.site || "hub").trim().toLowerCase();

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!VALID_CADENCES.has(cadenceInput as any)) {
      return NextResponse.json({ error: "Invalid cadence" }, { status: 400 });
    }

    const language = VALID_LANGUAGES.has(languageInput) ? languageInput : "en";

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: {
        email_site: {
          email,
          site,
        },
      },
      create: {
        email,
        name,
        site,
        cadence: mapCadence(cadenceInput),
        language,
        location,
        isActive: true,
      },
      update: {
        name,
        cadence: mapCadence(cadenceInput),
        language,
        location,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        cadence: true,
        language: true,
        location: true,
        site: true,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true, subscriber });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to register subscription", details: String(error) },
      { status: 500 },
    );
  }
}
