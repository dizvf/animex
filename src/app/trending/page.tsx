import { Suspense } from "react";
import { getTrendingAnime } from "@/lib/anilist";
import AnimeGrid, { AnimeGridSkeleton } from "@/components/anime/AnimeGrid";
import type { AniListAnime } from "@/types";

export const metadata = { title: "Trending Anime" };
export const revalidate = 900;

async function TrendingGrid({ page }: { page: number }) {
  const data = await getTrendingAnime(page, 24);
  return (
    <AnimeGrid anime={data.Page.media as AniListAnime[]} cols={6} />
  );
}

export default function TrendingPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🔥</span>
          <h1 className="text-3xl font-black text-white">Trending Now</h1>
        </div>
        <Suspense fallback={<AnimeGridSkeleton count={24} cols={6} />}>
          <TrendingGrid page={page} />
        </Suspense>
      </div>
    </div>
  );
}
