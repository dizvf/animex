"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/lib/store";
import type { JikanEpisode } from "@/types";

interface EpisodeListProps {
  animeId: number;
  malId: number | null;
  episodes: JikanEpisode[];
  currentEpisode: number;
  totalEpisodes: number | null;
}

export default function EpisodeList({
  animeId,
  episodes,
  currentEpisode,
  totalEpisodes,
}: EpisodeListProps) {
  const getProgress = useWatchlistStore((s) => s.getProgress);
  const [filter, setFilter] = useState<"all" | "filler" | "recap">("all");

  const count = totalEpisodes ?? Math.max(episodes.length, currentEpisode);

  // Build numbered episode stubs if Jikan didn't return enough
  const epMap = new Map<number, JikanEpisode>();
  episodes.forEach((ep) => epMap.set(ep.mal_id, ep));

  const allEps: JikanEpisode[] = Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return epMap.get(num) ?? {
      mal_id: num,
      title: `Episode ${num}`,
      title_japanese: null,
      aired: null,
      filler: false,
      recap: false,
      forum_url: "",
    };
  });

  const filtered = allEps.filter((ep) => {
    if (filter === "filler") return !ep.filler;
    if (filter === "recap") return !ep.recap;
    return true;
  });

  // Page = 50 episodes per page
  const CHUNK = 50;
  const totalPages = Math.ceil(filtered.length / CHUNK);
  const initialPage = Math.max(0, Math.floor((currentEpisode - 1) / CHUNK));
  const [page, setPage] = useState(initialPage);

  const pageSlice = filtered.slice(page * CHUNK, (page + 1) * CHUNK);

  return (
    <div>
      {/* Header + filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h2 className="text-base font-bold text-white flex-1">
          Episodes <span className="text-white/30 font-normal text-sm">({count})</span>
        </h2>
        <div className="flex rounded-lg overflow-hidden border border-surface-border text-xs">
          {(["all", "filler", "recap"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={cn(
                "px-2.5 py-1.5 capitalize transition-colors",
                filter === f
                  ? "bg-brand text-white"
                  : "bg-surface-card text-white/40 hover:text-white"
              )}
            >
              {f === "filler" ? "No Fill." : f === "recap" ? "No Rec." : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Page range buttons */}
      {totalPages > 1 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => {
            const start = i * CHUNK + 1;
            const end = Math.min((i + 1) * CHUNK, filtered.length);
            return (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                  page === i
                    ? "bg-brand text-white"
                    : "bg-surface-overlay text-white/40 hover:text-white"
                )}
              >
                {start}–{end}
              </button>
            );
          })}
        </div>
      )}

      {/* Episode grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 gap-1.5">
        {pageSlice.map((ep) => {
          const epNum = ep.mal_id;
          const isCurrent = epNum === currentEpisode;
          const prog = getProgress(animeId, epNum);
          const isWatched = prog ? prog.progress / prog.duration > 0.85 : false;
          const hasProgress = prog && !isWatched && prog.progress > 5;

          return (
            <Link
              key={epNum}
              href={`/watch/${animeId}/${epNum}`}
              className={cn(
                "relative group rounded-lg border transition-all duration-150 overflow-hidden text-center py-2 px-1",
                isCurrent
                  ? "border-brand bg-brand/15 text-brand font-semibold"
                  : "border-surface-border bg-surface-card hover:border-brand/50 hover:bg-surface-overlay text-white/60 hover:text-white"
              )}
            >
              <span className="text-xs block">{epNum}</span>
              {isWatched && (
                <CheckCircle2 size={10} className="text-green-400 mx-auto mt-0.5" />
              )}
              {ep.filler && !isWatched && (
                <span className="text-[9px] text-amber-500 block leading-none">F</span>
              )}

              {/* Progress bar */}
              {hasProgress && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-border">
                  <div
                    className="h-full bg-brand"
                    style={{ width: `${(prog!.progress / prog!.duration) * 100}%` }}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}