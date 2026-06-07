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

  const count = totalEpisodes ?? episodes.length;
  const pages = Math.ceil(count / 50);
  const [page, setPage] = useState(Math.max(0, Math.floor((currentEpisode - 1) / 50)));

  // Generate episode list from Jikan or fallback to numbered list
  const rawList = episodes.length > 0
    ? episodes
    : Array.from({ length: count }, (_, i) => ({
        mal_id: i + 1,
        title: `Episode ${i + 1}`,
        title_japanese: null,
        aired: null,
        filler: false,
        recap: false,
        forum_url: "",
      }));

  const filtered = rawList.filter((ep) => {
    if (filter === "filler") return !ep.filler;
    if (filter === "recap") return !ep.recap;
    return true;
  });

  const pageSlice = filtered.slice(page * 50, (page + 1) * 50);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h2 className="text-lg font-bold text-white flex-1">Episodes</h2>

        <div className="flex rounded-lg overflow-hidden border border-surface-border text-xs">
          {(["all", "filler", "recap"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 capitalize transition-colors",
                filter === f
                  ? "bg-brand text-white"
                  : "bg-surface-card text-white/50 hover:text-white hover:bg-surface-overlay"
              )}
            >
              {f === "filler" ? "No Fillers" : f === "recap" ? "No Recaps" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Page selector */}
      {pages > 1 && (
        <div className="flex gap-1 mb-3 flex-wrap">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                page === i
                  ? "bg-brand text-white"
                  : "bg-surface-overlay text-white/50 hover:text-white"
              )}
            >
              {i * 50 + 1}–{Math.min((i + 1) * 50, count)}
            </button>
          ))}
        </div>
      )}

      {/* Episode grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                "relative group rounded-lg border transition-all duration-200 overflow-hidden",
                isCurrent
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-surface-border bg-surface-card hover:border-brand/50 hover:bg-surface-overlay text-white/70 hover:text-white"
              )}
            >
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold">EP {epNum}</span>
                  {isWatched ? (
                    <CheckCircle2 size={12} className="text-green-400" />
                  ) : hasProgress ? (
                    <Circle size={12} className="text-brand/60" />
                  ) : null}
                </div>
                {ep.title && ep.title !== `Episode ${epNum}` && (
                  <p className="text-xs line-clamp-1 opacity-60">{ep.title}</p>
                )}
                {ep.filler && (
                  <span className="text-[10px] text-amber-400 font-medium">Filler</span>
                )}
              </div>

              {/* Progress bar */}
              {hasProgress && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-border">
                  <div
                    className="h-full bg-brand transition-all"
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
