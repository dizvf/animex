import { getEpisodes } from "@/lib/jikan";
import { getAniListEpisodes } from "@/lib/anilist";
import { getAnimeTitle } from "@/lib/utils";
import EpisodeList, { type EpisodeData } from "@/components/anime/EpisodeList";
import type { AniListAnime } from "@/types";

interface EpisodeSectionProps {
  anime: AniListAnime;
}

async function fetchAllJikanEpisodes(malId: number) {
  const all: Array<{ mal_id: number; title: string | null; filler: boolean; recap: boolean; aired: string | null }> = [];
  let page = 1;
  while (true) {
    try {
      const { data, pagination } = await getEpisodes(malId, page);
      all.push(...data);
      if (!pagination.has_next_page) break;
      page++;
      await new Promise((r) => setTimeout(r, 350));
    } catch { break; }
  }
  return all;
}

export default async function EpisodeSection({ anime }: EpisodeSectionProps) {
  const totalEpisodes = anime.episodes ?? null;

  const [jikanEps, aniListEpData] = await Promise.all([
    anime.idMal ? fetchAllJikanEpisodes(anime.idMal) : Promise.resolve([]),
    getAniListEpisodes(anime.id).catch(() => null),
  ]);

  const aniListThumbs: Record<number, string> = {};
  if (aniListEpData?.Media?.streamingEpisodes) {
    aniListEpData.Media.streamingEpisodes.forEach((se, i) => {
      if (se.thumbnail) aniListThumbs[i + 1] = se.thumbnail;
    });
  }

  const jikanMap = new Map(jikanEps.map((e) => [e.mal_id, e]));
  const count = totalEpisodes ?? jikanEps.length;

  const episodes: EpisodeData[] = Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    const jikan = jikanMap.get(num);
    return {
      number: num,
      title: jikan?.title ?? null,
      thumbnail: aniListThumbs[num] ?? null,
      filler: jikan?.filler ?? false,
      recap: jikan?.recap ?? false,
      aired: jikan?.aired ?? null,
    };
  });

  return (
    <EpisodeList
      animeId={anime.id}
      malId={anime.idMal}
      episodes={episodes}
      currentEpisode={0}
      totalEpisodes={totalEpisodes}
      layout="list"
    />
  );
}