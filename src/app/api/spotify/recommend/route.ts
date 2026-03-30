import { NextResponse } from "next/server";
import { addToPlaylist, getAccessToken } from "@/lib/spotify";

// In-memory rate limiter: max 3 songs per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = 15;
const WINDOW_MS = 60 * 60 * 1000;

function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_PER_HOUR - 1 };
  }

  if (entry.count >= MAX_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_PER_HOUR - entry.count };
}

// Check if track is already in the playlist
async function isDuplicate(trackUri: string): Promise<boolean> {
  const playlistId = process.env.SPOTIFY_RECOMMEND_PLAYLIST_ID;
  if (!playlistId) return false;

  try {
    const { access_token } = await getAccessToken();
    // Fetch current playlist tracks (first 100)
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/items?fields=items(track(uri))&limit=100`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    if (res.status !== 200) return false;
    const data = await res.json();
    return (data.items ?? []).some(
      (item: { track: { uri: string } }) => item.track?.uri === trackUri
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const ip = getIP(req);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": "3600" },
      }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { uri } = body;
  if (!uri || typeof uri !== "string" || !uri.startsWith("spotify:track:")) {
    return NextResponse.json({ error: "Invalid track URI" }, { status: 400 });
  }

  // Check for duplicates
  const dupe = await isDuplicate(uri);
  if (dupe) {
    return NextResponse.json(
      { error: "Already in playlist", remaining },
      { status: 409 }
    );
  }

  const ok = await addToPlaylist(uri);
  if (!ok) {
    return NextResponse.json({ error: "Failed to add" }, { status: 500 });
  }

  return NextResponse.json({ success: true, remaining });
}
