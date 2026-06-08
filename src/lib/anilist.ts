const ANILIST_API = "https://graphql.anilist.co";

const ANIME_FRAGMENT = `
  id idMal
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  description(asHtml: false)
  season seasonYear format status
  episodes duration
  genres
  averageScore popularity trending
  studios { nodes { id name isAnimationStudio } }
  trailer { id site }
  nextAiringEpisode { airingAt timeUntilAiring episode }
  startDate { year month day }
  endDate { year month day }
`;

async function query<T>(gql: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: gql, variables }),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

// ── Trending / Home ────────────────────────────────────────────
export async function getTrendingAnime(page = 1, perPage = 20) {
  return query<{ Page: { pageInfo: unknown; media: unknown[] } }>(`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${ANIME_FRAGMENT}
        }
      }
    }
  `, { page, perPage });
}

export async function getPopularAnime(page = 1, perPage = 20) {
  return query<{ Page: { pageInfo: unknown; media: unknown[] } }>(`
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          ${ANIME_FRAGMENT}
        }
      }
    }
  `, { page, perPage });
}

export async function getSeasonalAnime(season: string, seasonYear: number, page = 1) {
  return query<{ Page: { pageInfo: unknown; media: unknown[] } }>(`
    query ($season: MediaSeason, $year: Int, $page: Int) {
      Page(page: $page, perPage: 20) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
          ${ANIME_FRAGMENT}
        }
      }
    }
  `, { season, year: seasonYear, page });
}

// ── Anime detail ───────────────────────────────────────────────
export async function getAnimeById(id: number) {
  return query<{ Media: unknown }>(`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${ANIME_FRAGMENT}
        recommendations(sort: RATING_DESC, perPage: 8) {
          nodes {
            rating
            mediaRecommendation { ${ANIME_FRAGMENT} }
          }
        }
        characters(sort: ROLE, perPage: 12) {
          edges {
            role
            node { id name { full } image { large } }
          }
        }
        relations {
          edges {
            relationType
            node { ${ANIME_FRAGMENT} }
          }
        }
      }
    }
  `, { id });
}

// ── Search ─────────────────────────────────────────────────────
export async function searchAnime(
  search: string,
  page = 1,
  filters?: {
    genres?: string[];
    year?: number;
    season?: string;
    format?: string;
    status?: string;
    sort?: string;
  }
) {
  return query<{ Page: { pageInfo: unknown; media: unknown[] } }>(`
    query ($search: String, $page: Int, $genres: [String], $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
      Page(page: $page, perPage: 24) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, search: $search, genre_in: $genres, seasonYear: $year, season: $season, format: $format, status: $status, sort: $sort, isAdult: false) {
          ${ANIME_FRAGMENT}
        }
      }
    }
  `, {
    search: search || undefined,
    page,
    genres: filters?.genres?.length ? filters.genres : undefined,
    year: filters?.year,
    season: filters?.season,
    format: filters?.format,
    status: filters?.status,
    sort: filters?.sort ? [filters.sort] : ["POPULARITY_DESC"],
  });
}

// ── Genre list ─────────────────────────────────────────────────
export async function getGenres(): Promise<string[]> {
  const data = await query<{ GenreCollection: string[] }>(`
    query { GenreCollection }
  `);
  return data.GenreCollection;
}

// ── Episode list from AniList streamingEpisodes ────────────────
export async function getAniListEpisodes(id: number) {
  return query<{ Media: { episodes: number | null; streamingEpisodes: Array<{ title: string; thumbnail: string; url: string }> } }>(`
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        episodes
        streamingEpisodes {
          title
          thumbnail
          url
        }
      }
    }
  `, { id });
}