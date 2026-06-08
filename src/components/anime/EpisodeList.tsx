"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/lib/store";

export interface EpisodeData {
  number: number;
  title: string | null;
  filler: boolean;
  recap: boolean;
  aired: string | null;
}

interface EpisodeListProps {
  animeId: number;
  malId: number | null;
  episodes: EpisodeData[];
  totalEpisodes: number | null;
  currentEpisode: number;
}

const CHUNK = 50;

export default function EpisodeList({
  animeId,
  episodes,
  totalEpisodes,
  currentEpisode,
}: EpisodeListProps) {
  const getProgress = useWatchlistStore((s) => s.getProgress);
  const [filter, setFilter] = useState<"all" | "no-filler" | "no-recap">("all");

  const count = totalEpisodes ?? Math.max(episodes.length, currentEpisode);

  const epMap = new Map<number, EpisodeData>();
  episodes.forEach((ep) => epMap.set(ep.number, ep));

  const allEps: EpisodeData[] = Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return epMap.get(num) ?? { number: num, title: null, filler: false, recap: false, aired: null };
  });

  const filtered = allEps.filter((ep) => {
    if (filter === "no-filler") return !ep.filler;
    if (filter === "no-recap") return !ep.recap;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / CHUNK);
  const initialPage = Math.max(0, Math.floor((currentEpisode - 1) / CHUNK));
  const [page, setPage] = useState(initialPage);
  const pageSlice = filtered.slice(page * CHUNK, (page + 1) * CHUNK);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h2 className="text-base font-bold text-white flex-1">
          Episodes
          <span className="text-white/30 font-normal text-sm ml-1.5">({count})</span>
        </h2>
        <div className="flex rounded-lg overflow-hidden border border-surface-border text-xs">
          {(["all", "no-filler", "no-recap"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={cn(
                "px-2.5 py-1.5 transition-colors",
                filter === f ? "bg-brand text-white" : "bg-surface-card text-white/40 hover:text-white"
              )}
            >
              {f === "all" ? "All" : f === "no-filler" ? "No Fill" : "No Recap"}
            </button>
          ))}
        </div>
      </div>

      {/* Page buttons */}
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
                  page === i ? "bg-brand text-white" : "bg-surface-overlay text-white/40 hover:text-white"
                )}
              >
                {start}–{end}
              </button>
            );
          })}
        </div>
      )}

      {/* Episode grid */}
      <div className="space-y-1">
        {pageSlice.map((ep) => {
          const isCurrent = ep.number === currentEpisode;
          const prog = getProgress(animeId, ep.number);
          const isWatched = prog ? prog.progress / prog.duration > 0.85 : false;
          const hasProgress = prog && !isWatched && prog.progress > 5;

          return (
            <Link
              key={ep.number}
              href={`/watch/${animeId}/${ep.number}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all group",
                isCurrent
                  ? "border-brand bg-brand/10"
                  : "border-transparent hover:border-surface-border hover:bg-surface-card"
              )}
            >
              {/* Ep number */}
              <span className={cn(
                "text-xs font-bold shrink-0 w-8",
                isCurrent ? "text-brand" : "text-white/40"
              )}>
                {ep.number}
              </span>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs truncate",
                  isCurrent ? "text-white font-medium" : "text-white/60 group-hover:text-white"
                )}>
                  {ep.title ?? `Episode ${ep.number}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {ep.filler && <span className="text-[9px] text-amber-500 font-medium">FILLER</span>}
                  {ep.recap && <span className="text-[9px] text-blue-400 font-medium">RECAP</span>}
                  {ep.aired && <span className="text-[9px] text-white/20">{ep.aired.slice(0, 10)}</span>}
                </div>
              </div>

              {/* Status */}
              {isWatched && <CheckCircle2 size={12} className="text-green-400 shrink-0" />}

              {/* Progress bar */}
              {hasProgress && (
                <div className="w-10 h-1 bg-surface-border rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-brand rounded-full"
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