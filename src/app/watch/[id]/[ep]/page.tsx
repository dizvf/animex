import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { getAnimeById } from "@/lib/anilist";
import { getEpisodes } from "@/lib/jikan";
import { getAnifyEpisodes, getEpisodeSources } from "@/lib/anify";
import { getSkipTimes } from "@/lib/aniskip";
import AnimePlayer from "@/components/player/AnimePlayer";
import EpisodeList from "@/components/anime/EpisodeList";
import { getAnimeTitle } from "@/lib/utils";
import type { AniListAnime, JikanEpisode, AniSkipResult } from "@/types";

interface WatchPageProps {
  params: { id: string; ep: string };
}

export async function generateMetadata({ params }: WatchPageProps) {
  const id = Number(params.id);
  const ep = Number(params.ep);
  try {
    const data = await getAnimeById(id);
    const anime = data.Media as AniListAnime;
    const title = getAnimeTitle(anime.title);
    return { title: `${title} Episode ${ep}` };
  } catch {
    return { title: `Watch Episode ${ep}` };
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const id = Number(params.id);
  const ep = Number(params.ep);

  if (isNaN(id) || isNaN(ep) || ep < 1) notFound();

  // Parallel data fetching
  const [animeResult, episodeSourcesResult, skipTimesResult] = await Promise.allSettled([
    getAnimeById(id),
    getEpisodeSources(id, ep),
    (async () => {
      const data = await getAnimeById(id);
      const anime = data.Media as AniListAnime;
      if (!anime.idMal) return { found: false, results: {}, statusCode: 404 } as AniSkipResult;
      return getSkipTimes(anime.idMal, ep);
    })(),
  ]);

  if (animeResult.status === "rejected") notFound();

  const anime = (animeResult.value as { Media: AniListAnime }).Media;
  const title = getAnimeTitle(anime.title);
  const totalEpisodes = anime.episodes;

  const episodeData = episodeSourcesResult.status === "fulfilled"
    ? episodeSourcesResult.value
    : { sources: [], subtitles: [] };

  const skipTimes: AniSkipResult = skipTimesResult.status === "fulfilled"
    ? skipTimesResult.value
    : { found: false, results: {}, statusCode: 500 };

  // Jikan episodes for sidebar
  let jikanEps: JikanEpisode[] = [];
  if (anime.idMal) {
    try {
      const { data } = await getEpisodes(anime.idMal, Math.ceil(ep / 100));
      jikanEps = data;
    } catch {}
  }

  const prevEp = ep > 1 ? ep - 1 : null;
  const nextEp = totalEpisodes ? (ep < totalEpisodes ? ep + 1 : null) : ep + 1;

  return (
    <div className="pt-16 min-h-screen bg-surface">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
              <Link href={`/anime/${id}`} className="hover:text-white transition-colors line-clamp-1">
                {title}
              </Link>
              <ChevronRight size={14} />
              <span className="text-white/70">Episode {ep}</span>
            </div>

            {/* Player */}
            <AnimePlayer
              animeId={id}
              episode={ep}
              episodeData={episodeData}
              skipTimes={skipTimes}
              onNext={nextEp ? () => { window.location.href = `/watch/${id}/${nextEp}`; } : undefined}
            />

            {/* Episode nav */}
            <div className="flex items-center justify-between mt-4">
              {prevEp ? (
                <Link
                  href={`/watch/${id}/${prevEp}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-white/70 hover:text-white hover:border-brand/40 transition-all text-sm"
                >
                  <ChevronLeft size={16} />
                  EP {prevEp}
                </Link>
              ) : <div />}

              <Link
                href={`/anime/${id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-white/60 hover:text-white transition-all text-sm"
              >
                <List size={15} />
                All Episodes
              </Link>

              {nextEp ? (
                <Link
                  href={`/watch/${id}/${nextEp}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white hover:bg-brand-400 transition-all text-sm font-medium"
                >
                  EP {nextEp}
                  <ChevronRight size={16} />
                </Link>
              ) : <div />}
            </div>

            {/* Anime title card */}
            <div className="mt-6 p-4 rounded-xl bg-surface-card border border-surface-border">
              <Link href={`/anime/${id}`} className="hover:text-brand transition-colors">
                <h1 className="text-lg font-bold text-white">{title}</h1>
              </Link>
              <p className="text-white/50 text-sm mt-0.5">Episode {ep}</p>
            </div>
          </div>

          {/* Sidebar: Episode list */}
          <div className="xl:w-72 2xl:w-80 shrink-0">
            <div className="bg-surface-card border border-surface-border rounded-xl p-4 xl:sticky xl:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <EpisodeList
                animeId={id}
                malId={anime.idMal}
                episodes={jikanEps}
                currentEpisode={ep}
                totalEpisodes={totalEpisodes}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
