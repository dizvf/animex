import { Suspense } from "react";
import { searchAnime, getGenres } from "@/lib/anilist";
import AnimeGrid, { AnimeGridSkeleton } from "@/components/anime/AnimeGrid";
import BrowseFilters from "./BrowseFilters";
import type { AniListAnime } from "@/types";

interface BrowsePageProps {
  searchParams: {
    search?: string;
    genre?: string;
    year?: string;
    season?: string;
    format?: string;
    status?: string;
    sort?: string;
    page?: string;
  };
}

export const metadata = {
  title: "Browse Anime",
  description: "Search and filter through thousands of anime series and movies.",
};

async function BrowseResults({ searchParams }: BrowsePageProps) {
  const { search, genre, year, season, format, status, sort, page } = searchParams;
  const currentPage = Number(page) || 1;

  const data = await searchAnime(search ?? "", currentPage, {
    genres: genre ? [genre] : undefined,
    year: year ? Number(year) : undefined,
    season,
    format,
    status,
    sort: sort ?? "POPULARITY_DESC",
  });

  const anime = data.Page.media as AniListAnime[];
  const pageInfo = data.Page.pageInfo as {
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };

  if (anime.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-white/40 text-lg">No anime found</p>
        <p className="text-white/30 text-sm mt-1">Try different search terms or filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/50 text-sm">
          Showing <span className="text-white font-medium">{anime.length}</span> of{" "}
          <span className="text-white font-medium">{pageInfo.total.toLocaleString()}</span> results
        </p>
      </div>

      <AnimeGrid anime={anime} cols={6} />

      {/* Pagination */}
      {pageInfo.lastPage > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) })}`}
              className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-white/70 hover:text-white hover:border-brand/40 transition-all text-sm"
            >
              ← Prev
            </a>
          )}
          <span className="px-4 py-2 text-sm text-white/50">
            Page {currentPage} of {pageInfo.lastPage}
          </span>
          {pageInfo.hasNextPage && (
            <a
              href={`?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) })}`}
              className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-white/70 hover:text-white hover:border-brand/40 transition-all text-sm"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </>
  );
}

async function FiltersSection({ searchParams }: BrowsePageProps) {
  const genres = await getGenres();
  return <BrowseFilters genres={genres} searchParams={searchParams} />;
}

export default function BrowsePage({ searchParams }: BrowsePageProps) {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-black text-white mb-6">Browse Anime</h1>

        <Suspense fallback={<div className="h-16 skeleton rounded-xl mb-6" />}>
          <FiltersSection searchParams={searchParams} />
        </Suspense>

        <Suspense fallback={<AnimeGridSkeleton count={24} cols={6} />}>
          <BrowseResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
