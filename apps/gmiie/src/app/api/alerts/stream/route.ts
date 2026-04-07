// ─────────────────────────────────────────────────────────────
// GET /api/alerts/stream
// Server-Sent Events stream — pushes high-importance articles
// as they arrive (or periodically polls Prisma for recent ones)
// ─────────────────────────────────────────────────────────────
import { prisma } from "@xxxiii/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Helper: write an SSE event
      const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Initial burst — last 10 high-importance published articles
      try {
        const recent = await prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            importanceScore: { gte: 6 },
          },
          select: {
            slug: true,
            title: true,
            headline: true,
            articleType: true,
            importanceScore: true,
            publishedAt: true,
            source: { select: { name: true } },
          },
          orderBy: { publishedAt: "desc" },
          take: 10,
        });

        send("init", {
          alerts: recent.map((a: { slug: string; title: string; headline: string | null; articleType: string; importanceScore: number | null; publishedAt: Date | null; source: { name: string } | null }) => ({
            slug: a.slug,
            title: a.title,
            headline: a.headline ?? a.title,
            type: a.articleType,
            score: a.importanceScore ?? 0,
            publishedAt: a.publishedAt?.toISOString() ?? null,
            source: a.source?.name ?? "GMIIE",
            severity: (a.importanceScore ?? 0) >= 8.5 ? "high" : (a.importanceScore ?? 0) >= 7 ? "medium" : "low",
          })),
        });
      } catch {
        send("init", { alerts: [] });
      }

      // Heartbeat every 30 s — also checks for new PUBLISHED articles
      let lastCheck = new Date();

      const interval = setInterval(async () => {
        try {
          const fresh = await prisma.article.findMany({
            where: {
              status: "PUBLISHED",
              publishedAt: { gt: lastCheck },
            },
            select: {
              slug: true,
              title: true,
              headline: true,
              articleType: true,
              importanceScore: true,
              publishedAt: true,
              source: { select: { name: true } },
            },
            orderBy: { publishedAt: "desc" },
            take: 5,
          });

          lastCheck = new Date();

          if (fresh.length > 0) {
            for (const a of fresh) {
              send("alert", {
                slug: a.slug,
                title: a.title,
                headline: a.headline ?? a.title,
                type: a.articleType,
                score: a.importanceScore ?? 0,
                publishedAt: a.publishedAt?.toISOString() ?? null,
                source: a.source?.name ?? "GMIIE",
                severity: (a.importanceScore ?? 0) >= 8.5 ? "high" : (a.importanceScore ?? 0) >= 7 ? "medium" : "low",
              });
            }
          } else {
            send("heartbeat", { ts: new Date().toISOString() });
          }
        } catch {
          send("heartbeat", { ts: new Date().toISOString() });
        }
      }, 30_000);

      // Clean up when client disconnects
      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
