import { notFound } from "next/navigation";
import { getAnimeById } from "@/lib/anilist";
import { getEpisodes } from "@/lib/jikan";
import EpisodeList from "@/components/anime/EpisodeList";
import WatchClient from "./WatchClient";
import { getAnimeTitle } from "@/lib/utils";
import type { AniListAnime, JikanEpisode } from "@/types";

interface WatchPageProps {
  params: { id: string; ep: string };
}

export async function generateMetadata({ params }: WatchPageProps) {
  const id = Number(params.id);
  const ep = Number(params.ep);
  try {
    const data = await getAnimeById(id);
    const anime = data.Media as AniListAnime;
    return { title: `${getAnimeTitle(anime.title)} Episode ${ep}` };
  } catch {
    return { title: `Watch Episode ${ep}` };
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const id = Number(params.id);
  const ep = Number(params.ep);

  if (isNaN(id) || isNaN(ep) || ep < 1) notFound();

  let anime: AniListAnime;
  try {
    const data = await getAnimeById(id);
    anime = data.Media as AniListAnime;
  } catch {
    notFound();
  }

  const title = getAnimeTitle(anime!.title);
  const totalEpisodes = anime!.episodes ?? null;

  // Jikan episode list for sidebar
  let jikanEps: JikanEpisode[] = [];
  if (anime!.idMal) {
    try {
      const { data } = await getEpisodes(anime!.idMal, Math.ceil(ep / 100));
      jikanEps = data;
    } catch {}
  }

  const prevEp = ep > 1 ? ep - 1 : null;
  const nextEp = totalEpisodes
    ? ep < totalEpisodes ? ep + 1 : null
    : ep + 1;

  return (
    <div className="pt-16 min-h-screen bg-surface">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          <WatchClient
            animeId={id}
            malId={anime!.idMal}
            episode={ep}
            title={title}
            prevEp={prevEp}
            nextEp={nextEp}
          />

          <div className="xl:w-72 2xl:w-80 shrink-0">
            <div className="bg-surface-card border border-surface-border rounded-xl p-4 xl:sticky xl:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <EpisodeList
                animeId={id}
                malId={anime!.idMal}
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