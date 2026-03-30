import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/spotify";

export const revalidate = 30;

function hasSlur(text: string): boolean {
  const lower = text.toLowerCase();
  return /nigg|n\*gg|ni\*\*|n\*\*\*/i.test(lower);
}

export async function GET() {
  const track = await getNowPlaying();

  if (!track) {
    return NextResponse.json({ isPlaying: false }, { status: 200 });
  }

  // Filter on server so the regex never ships to the client
  if (hasSlur(track.title) || hasSlur(track.artist)) {
    return NextResponse.json(
      { isPlaying: track.isPlaying, hidden: true },
      { status: 200 }
    );
  }

  return NextResponse.json(track, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
