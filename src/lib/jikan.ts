const JIKAN_BASE = "https://api.jikan.moe/v4";

async function jikanFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${JIKAN_BASE}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Jikan error: ${res.status} ${path}`);
  return res.json();
}

// Episodes list
export async function getEpisodes(malId: number, page = 1) {
  return jikanFetch<{
    data: Array<{
      mal_id: number;
      title: string;
      title_japanese: string | null;
      aired: string | null;
      filler: boolean;
      recap: boolean;
      forum_url: string;
    }>;
    pagination: { last_visible_page: number; has_next_page: boolean };
  }>(`/anime/${malId}/episodes?page=${page}`);
}

// Full episodes list (all pages)
export async function getAllEpisodes(malId: number) {
  const all: unknown[] = [];
  let page = 1;
  while (true) {
    const { data, pagination } = await getEpisodes(malId, page);
    all.push(...data);
    if (!pagination.has_next_page) break;
    page++;
    // Rate limit: Jikan allows ~3 req/sec
    await new Promise((r) => setTimeout(r, 400));
  }
  return all;
}

// Anime statistics
export async function getAnimeStats(malId: number) {
  return jikanFetch<{
    data: {
      watching: number;
      completed: number;
      on_hold: number;
      dropped: number;
      plan_to_watch: number;
      total: number;
      scores: Record<string, { votes: number; percentage: number }>;
    };
  }>(`/anime/${malId}/statistics`);
}

// Staff
export async function getAnimeStaff(malId: number) {
  return jikanFetch<{
    data: Array<{
      person: { mal_id: number; name: string; images: { jpg: { image_url: string } } };
      positions: string[];
    }>;
  }>(`/anime/${malId}/staff`);
}
