import { Suspense } from "react";
import HeroBanner from "@/components/anime/HeroBanner";
import AnimeGrid, { AnimeGridSkeleton } from "@/components/anime/AnimeGrid";
import { getTrendingAnime, getPopularAnime, getSeasonalAnime } from "@/lib/anilist";
import { getCurrentSeason } from "@/lib/utils";
import type { AniListAnime } from "@/types";

export const revalidate = 1800; // Revalidate every 30 min

async function TrendingSection() {
  const data = await getTrendingAnime(1, 20);
  const anime = (data.Page.media as AniListAnime[]).filter((a) => a.bannerImage || a.coverImage.extraLarge);
  return (
    <>
      <HeroBanner anime={anime[0]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <AnimeGrid anime={anime.slice(1, 11)} title="🔥 Trending Now" cols={5} />
      </div>
    </>
  );
}

async function PopularSection() {
  const data = await getPopularAnime(1, 10);
  return (
    <AnimeGrid
      anime={data.Page.media as AniListAnime[]}
      title="⭐ All-Time Popular"
      cols={5}
    />
  );
}

async function SeasonalSection() {
  const { season, year } = getCurrentSeason();
  const data = await getSeasonalAnime(season, year);
  return (
    <AnimeGrid
      anime={(data.Page.media as AniListAnime[]).slice(0, 10)}
      title={`🌸 ${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`}
      cols={5}
    />
  );
}

export default function HomePage() {
  return (
    <div className="pb-20">
      <Suspense
        fallback={
          <div className="h-[70vh] min-h-[500px] skeleton" />
        }
      >
        <TrendingSection />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-12">
        <Suspense fallback={<><div className="h-7 w-48 skeleton rounded mb-4" /><AnimeGridSkeleton count={10} /></>}>
          <SeasonalSection />
        </Suspense>

        <Suspense fallback={<><div className="h-7 w-48 skeleton rounded mb-4" /><AnimeGridSkeleton count={10} /></>}>
          <PopularSection />
        </Suspense>
      </div>
    </div>
  );
}
