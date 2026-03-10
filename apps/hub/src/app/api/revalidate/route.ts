import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-Demand Revalidation Endpoint for Hub
 * =========================================
 * Called by the pipeline workflow after ingesting new content.
 *
 * POST /api/revalidate
 * Authorization: Bearer <REVALIDATION_TOKEN>
 * Body: { "paths": ["/"] }
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || token !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const paths: string[] = body.paths || ["/"];

    const revalidated: string[] = [];

    for (const path of paths) {
      revalidatePath(path);
      revalidated.push(path);
    }

    return NextResponse.json({
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Revalidation failed", details: String(error) },
      { status: 500 },
    );
  }
}
