import { NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  if (q.length > 200) return NextResponse.json({ error: "query too long" }, { status: 400 });
  const results = await searchTracks(q);
  return NextResponse.json(results);
}
