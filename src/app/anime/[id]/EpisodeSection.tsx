"use client";

import EpisodeList from "@/components/anime/EpisodeList";
import type { JikanEpisode } from "@/types";

interface EpisodeSectionProps {
  animeId: number;
  malId: number | null;
  episodes: JikanEpisode[];
  totalEpisodes: number | null;
}

export default function EpisodeSection({ animeId, malId, episodes, totalEpisodes }: EpisodeSectionProps) {
  return (
    <EpisodeList
      animeId={animeId}
      malId={malId}
      episodes={episodes}
      currentEpisode={0}
      totalEpisodes={totalEpisodes}
    />
  );
}
