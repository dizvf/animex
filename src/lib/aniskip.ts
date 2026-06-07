import type { AniSkipResult } from "@/types";

const ANISKIP_BASE = "https://api.aniskip.com/v2";

/**
 * Get skip times for an episode.
 * @param malId  - MyAnimeList ID
 * @param episode - Episode number (1-indexed)
 * @param episodeLength - Total episode length in seconds (for validation)
 */
export async function getSkipTimes(
  malId: number,
  episode: number,
  episodeLength?: number
): Promise<AniSkipResult> {
  const types = ["op", "mixed-op", "ed", "mixed-ed", "recap"].join("&types[]=");
  const lengthParam = episodeLength ? `&episodeLength=${episodeLength}` : "";

  try {
    const res = await fetch(
      `${ANISKIP_BASE}/skip-times/${malId}/${episode}?types[]=${types}${lengthParam}`,
      { next: { revalidate: 86400 } } // Cache 24h — skip times don't change
    );

    if (res.status === 404) {
      return { found: false, results: {}, statusCode: 404 };
    }

    if (!res.ok) {
      throw new Error(`AniSkip error: ${res.status}`);
    }

    return res.json();
  } catch {
    return { found: false, results: {}, statusCode: 500 };
  }
}

/**
 * Format skip time for display in the player.
 * Returns null if no skip time is available for the given type.
 */
export function getSkipInterval(result: AniSkipResult, type: "op" | "ed") {
  if (!result.found) return null;
  return result.results[type]?.interval ?? result.results[`mixed-${type}` as keyof typeof result.results]?.interval ?? null;
}
