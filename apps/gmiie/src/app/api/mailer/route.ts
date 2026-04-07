import { NextRequest, NextResponse } from "next/server";

const MAILER_URL = process.env.MAILER_URL ?? "http://localhost:9100";
const MAILER_API_KEY = process.env.MAILER_API_KEY ?? "";

/**
 * POST /api/mailer
 *
 * Proxy to the Rust gmiie-mailer service.
 * Called by the AI processing pipeline after scoring articles.
 * Also callable manually from admin tooling.
 *
 * Body: DispatchRequest (article_id, title, summary, url, score, severity, ...)
 *
 * Auth: x-api-key header must match INTERNAL_API_KEY env var (if set).
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.INTERNAL_API_KEY;
  if (apiKey) {
    const provided = request.headers.get("x-api-key");
    if (provided !== apiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields before forwarding
  const payload = body as Record<string, unknown>;
  if (!payload.article_id || !payload.title || !payload.summary || !payload.url) {
    return NextResponse.json(
      { error: "article_id, title, summary, and url are required" },
      { status: 400 }
    );
  }

  // Default severity based on score if not provided
  if (!payload.severity && typeof payload.score === "number") {
    payload.severity =
      payload.score >= 8.5 ? "high" : payload.score >= 7.0 ? "medium" : "low";
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (MAILER_API_KEY) {
      headers["x-api-key"] = MAILER_API_KEY;
    }

    const mailerResp = await fetch(`${MAILER_URL}/v1/dispatch`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    const result = await mailerResp.json();

    if (!mailerResp.ok) {
      return NextResponse.json(
        { error: "Mailer dispatch failed", detail: result },
        { status: mailerResp.status }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mailer unreachable";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

/**
 * GET /api/mailer
 * Returns mailer service health status.
 */
export async function GET() {
  try {
    const resp = await fetch(`${MAILER_URL}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await resp.json();
    return NextResponse.json({ mailer: data, url: MAILER_URL });
  } catch {
    return NextResponse.json(
      { mailer: null, url: MAILER_URL, error: "Mailer offline" },
      { status: 503 }
    );
  }
}
