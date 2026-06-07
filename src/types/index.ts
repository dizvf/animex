// ── AniList Types ──────────────────────────────────────────────
export interface AniListTitle {
  romaji: string;
  english: string | null;
  native: string;
  userPreferred: string;
}

export interface AniListCoverImage {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
}

export interface AniListAnime {
  id: number;
  idMal: number | null;
  title: AniListTitle;
  coverImage: AniListCoverImage;
  bannerImage: string | null;
  description: string | null;
  season: string | null;
  seasonYear: number | null;
  format: string;
  status: string;
  episodes: number | null;
  duration: number | null;
  genres: string[];
  averageScore: number | null;
  popularity: number;
  trending: number;
  studios: { nodes: Array<{ id: number; name: string; isAnimationStudio: boolean }> };
  streamingEpisodes: Array<{ title: string; thumbnail: string; url: string }>;
  trailer: { id: string; site: string } | null;
  nextAiringEpisode: { airingAt: number; timeUntilAiring: number; episode: number } | null;
  startDate: { year: number; month: number; day: number };
  endDate: { year: number | null; month: number | null; day: number | null };
  recommendations: {
    nodes: Array<{
      mediaRecommendation: AniListAnime;
      rating: number;
    }>;
  };
  characters: {
    edges: Array<{
      node: { id: number; name: { full: string }; image: { large: string } };
      role: string;
    }>;
  };
  relations: {
    edges: Array<{
      node: AniListAnime;
      relationType: string;
    }>;
  };
}

export interface AniListPage<T> {
  pageInfo: { total: number; currentPage: number; lastPage: number; hasNextPage: boolean };
  media: T[];
}

// ── Jikan Types ────────────────────────────────────────────────
export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
  forum_url: string;
}

export interface JikanAnimeStats {
  watching: number;
  completed: number;
  on_hold: number;
  dropped: number;
  plan_to_watch: number;
  total: number;
  scores: Record<string, { votes: number; percentage: number }>;
}

// ── AniSkip Types ──────────────────────────────────────────────
export interface AniSkipInterval {
  startTime: number;
  endTime: number;
}

export interface AniSkipResult {
  found: boolean;
  results: {
    op?: { interval: AniSkipInterval; skipType: "op" };
    "mixed-op"?: { interval: AniSkipInterval; skipType: "mixed-op" };
    ed?: { interval: AniSkipInterval; skipType: "ed" };
    "mixed-ed"?: { interval: AniSkipInterval; skipType: "mixed-ed" };
    recap?: { interval: AniSkipInterval; skipType: "recap" };
  };
  statusCode: number;
}

// ── Anify Types ────────────────────────────────────────────────
export interface AnifySource {
  url: string;
  quality: string;
  isM3U8: boolean;
}

export interface AnifySubtitle {
  url: string;
  lang: string;
}

export interface AnifyEpisodeData {
  sources: AnifySource[];
  subtitles: AnifySubtitle[];
  intro?: AniSkipInterval;
  outro?: AniSkipInterval;
}

export interface AnifyEpisode {
  id: string;
  number: number;
  title: string | null;
  isFiller: boolean;
  img: string | null;
  hasDub: boolean;
  description: string | null;
  rating: number | null;
  updatedAt: number;
}

// ── App types ──────────────────────────────────────────────────
export interface WatchlistEntry {
  id: number;
  title: string;
  image: string;
  progress: number;
  total: number | null;
  status: "watching" | "completed" | "on-hold" | "dropped" | "plan-to-watch";
  addedAt: string;
}

export interface EpisodeProgress {
  animeId: number;
  episode: number;
  progress: number; // seconds
  duration: number;
  updatedAt: string;
}
