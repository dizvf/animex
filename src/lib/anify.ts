import type { AnifyEpisode, AnifyEpisodeData } from "@/types";

// Anify is self-hosted on Railway — set RAILWAY_API_URL in .env
const ANIFY_BASE =
  process.env.ANIFY_API_URL ||
  process.env.NEXT_PUBLIC_ANIFY_API_URL ||
  "https://api.anify.tv";

async function anifyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ANIFY_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(process.env.ANIFY_API_KEY
        ? { Authorization: `Bearer ${process.env.ANIFY_API_KEY}` }
        : {}),
    },
    next: { revalidate: 900 },
    ...init,
  });

  if (!res.ok) throw new Error(`Anify error: ${res.status} ${path}`);
  return res.json();
}

/**
 * Get all episodes for an anime.
 * Anify uses AniList IDs.
 */
export async function getAnifyEpisodes(id: number): Promise<AnifyEpisode[]> {
  const data = await anifyFetch<Array<{ providerId: string; episodes: AnifyEpisode[] }>>(
    `/episodes/${id}?fields=[episodes]`
  );
  // Prefer gogoanime provider, fall back to first
  const provider =
    data.find((p) => p.providerId === "gogoanime") ??
    data.find((p) => p.providerId === "zoro") ??
    data[0];
  return provider?.episodes ?? [];
}

/**
 * Get streaming sources for a specific episode.
 * @param id       - AniList ID
 * @param episode  - Episode number
 * @param providerId - Provider preference ('gogoanime' | 'zoro' | 'crunchyroll')
 */
export async function getEpisodeSources(
  id: number,
  episode: number,
  providerId = "gogoanime"
): Promise<AnifyEpisodeData> {
  return anifyFetch<AnifyEpisodeData>(
    `/sources?id=${id}&providerId=${providerId}&watchId=${id}-episode-${episode}&episode=${episode}&subType=sub&server=default`
  );
}

/**
 * Get info for a single anime from Anify (for mapping).
 */
export async function getAnifyInfo(id: number) {
  return anifyFetch<{
    id: string;
    title: { english: string; romaji: string };
    mappings: Array<{ providerId: string; id: string }>;
  }>(`/info/${id}`);
}
