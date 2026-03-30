const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";
const PLAYLISTS_ENDPOINT = "https://api.spotify.com/v1/playlists";

const client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
const client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN ?? "";

async function getAccessToken() {
  const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });
  return res.json();
}

export { getAccessToken };

export interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  uri: string;
}

export async function searchTracks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const { access_token } = await getAccessToken();
  const res = await fetch(
    `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=5`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  if (res.status !== 200) return [];
  const data = await res.json();
  return (data.tracks?.items ?? []).map((t: Record<string, unknown>) => ({
    id: t.id,
    title: (t as { name: string }).name,
    artist: ((t as { artists: { name: string }[] }).artists ?? []).map((a) => a.name).join(", "),
    album: ((t as { album: { name: string } }).album ?? {}).name ?? "",
    albumArt: ((t as { album: { images: { url: string }[] } }).album?.images)?.[1]?.url ??
              ((t as { album: { images: { url: string }[] } }).album?.images)?.[0]?.url ?? "",
    uri: (t as { uri: string }).uri,
  }));
}

export async function addToPlaylist(trackUri: string): Promise<boolean> {
  const playlistId = process.env.SPOTIFY_RECOMMEND_PLAYLIST_ID;
  if (!playlistId) return false;
  const { access_token } = await getAccessToken();
  const res = await fetch(`${PLAYLISTS_ENDPOINT}/${playlistId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
  if (res.status !== 201) {
    const body = await res.text();
    console.error(`Spotify addToPlaylist: ${res.status} — ${body}`);
  }
  return res.status === 201;
}

export interface SpotifyTrack {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
}

export async function getNowPlaying(): Promise<SpotifyTrack | null> {
  if (!client_id || !client_secret || !refresh_token) return null;

  try {
    const { access_token } = await getAccessToken();

    // Try currently playing first
    const nowRes = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.item) {
        return {
          isPlaying: data.is_playing,
          title: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          album: data.item.album.name,
          albumArt: data.item.album.images?.[2]?.url ?? data.item.album.images?.[0]?.url ?? "",
          url: data.item.external_urls.spotify,
        };
      }
    }

    // Fall back to recently played
    const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (recentRes.status === 200) {
      const data = await recentRes.json();
      const track = data.items?.[0]?.track;
      if (track) {
        return {
          isPlaying: false,
          title: track.name,
          artist: track.artists.map((a: { name: string }) => a.name).join(", "),
          album: track.album.name,
          albumArt: track.album.images?.[2]?.url ?? track.album.images?.[0]?.url ?? "",
          url: track.external_urls.spotify,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
