import { NextResponse } from "next/server";
import { getEntityGraph } from "@/lib/data";

export const revalidate = 600; // 10 min cache

export async function GET() {
  try {
    const data = await getEntityGraph();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/entities/graph]", error);
    return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
  }
}
