"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/lib/store";
import type { JikanEpisode } from "@/types";

export interface EpisodeData {
  number: number;
  title: string | null;
  thumbnail: string | null;
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
  layout?: "grid" | "list";
}

const CHUNK = 50;

export default function EpisodeList({
  animeId,
  episodes,
  totalEpisodes,
  currentEpisode,
  layout = "grid",
}: EpisodeListProps) {
  const getProgress = useWatchlistStore((s) => s.getProgress);
  const [filter, setFilter] = useState<"all" | "no-filler" | "no-recap">("all");
  const [view, setView] = useState<"grid" | "list">(layout);

  const count = totalEpisodes ?? Math.max(episodes.length, currentEpisode);

  // Build full episode list, filling gaps with stubs
  const epMap = new Map<number, EpisodeData>();
  episodes.forEach((ep) => epMap.set(ep.number, ep));

  const allEps: EpisodeData[] = Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return epMap.get(num) ?? {
      number: num,
      title: null,
      thumbnail: null,
      filler: false,
      recap: false,
      aired: null,
    };
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

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-surface-border text-xs">
          <button
            onClick={() => setView("grid")}
            className={cn("px-2.5 py-1.5 transition-colors", view === "grid" ? "bg-brand text-white" : "bg-surface-card text-white/40 hover:text-white")}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={cn("px-2.5 py-1.5 transition-colors", view === "list" ? "bg-brand text-white" : "bg-surface-card text-white/40 hover:text-white")}
          >
            List
          </button>
        </div>

        {/* Filter */}
        <div className="flex rounded-lg overflow-hidden border border-surface-border text-xs">
          {(["all", "no-filler", "no-recap"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(0); }}
              className={cn(
                "px-2.5 py-1.5 transition-colors capitalize",
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

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 gap-1.5">
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
                  "relative group rounded-lg border transition-all duration-150 overflow-hidden",
                  isCurrent
                    ? "border-brand bg-brand/15"
                    : "border-surface-border bg-surface-card hover:border-brand/50 hover:bg-surface-overlay"
                )}
              >
                {/* Thumbnail if available */}
                {ep.thumbnail ? (
                  <div className="relative aspect-video w-full">
                    <Image src={ep.thumbnail} alt={`Episode ${ep.number}`} fill className="object-cover" sizes="120px" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <Play size={14} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                  </div>
                ) : null}

                <div className="px-2 py-1.5">
                  <span className={cn("text-xs font-semibold block", isCurrent ? "text-brand" : "text-white/70")}>
                    EP {ep.number}
                  </span>
                  {isWatched && <CheckCircle2 size={10} className="text-green-400 mt-0.5" />}
                  {ep.filler && <span className="text-[9px] text-amber-500">Filler</span>}
                </div>

                {hasProgress && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-border">
                    <div className="h-full bg-brand" style={{ width: `${(prog!.progress / prog!.duration) * 100}%` }} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
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
                  "flex items-center gap-3 p-2 rounded-lg border transition-all",
                  isCurrent
                    ? "border-brand bg-brand/10"
                    : "border-transparent hover:border-surface-border hover:bg-surface-card"
                )}
              >
                {/* Thumbnail */}
                {ep.thumbnail ? (
                  <div className="relative w-20 h-12 rounded shrink-0 overflow-hidden bg-surface-overlay">
                    <Image src={ep.thumbnail} alt="" fill className="object-cover" sizes="80px" />
                  </div>
                ) : (
                  <div className="w-20 h-12 rounded shrink-0 bg-surface-overlay flex items-center justify-center">
                    <span className="text-xs text-white/20">{ep.number}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold shrink-0", isCurrent ? "text-brand" : "text-white/50")}>
                      EP {ep.number}
                    </span>
                    {ep.filler && <span className="text-[9px] text-amber-500 font-medium">FILLER</span>}
                    {isWatched && <CheckCircle2 size={10} className="text-green-400" />}
                  </div>
                  {ep.title && (
                    <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{ep.title}</p>
                  )}
                  {ep.aired && (
                    <p className="text-[10px] text-white/30 mt-0.5">{ep.aired}</p>
                  )}
                </div>

                {/* Progress bar */}
                {hasProgress && (
                  <div className="w-1 h-8 bg-surface-border rounded-full overflow-hidden shrink-0">
                    <div
                      className="w-full bg-brand rounded-full"
                      style={{ height: `${(prog!.progress / prog!.duration) * 100}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}