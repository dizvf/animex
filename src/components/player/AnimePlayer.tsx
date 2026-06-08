"use client";

import { useState, useEffect, useRef } from "react";
import { useWatchlistStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AnimePlayerProps {
  animeId: number;
  malId: number | null;
  episode: number;
  onNext?: () => void;
  className?: string;
}

// All providers — tried in order, user can switch manually
const PROVIDERS = [
  {
    name: "Hianime",
    url: (malId: number, ep: number) =>
      `https://player.zoro.to/anime/${malId}/${ep}`,
    useMal: false,
    useAnilist: true,
  },
  {
    name: "VidSrc",
    url: (malId: number, ep: number) =>
      `https://vidsrc.me/embed/anime?malId=${malId}&episode=${ep}`,
    useMal: true,
    useAnilist: false,
  },
  {
    name: "2Anime",
    url: (malId: number, ep: number) =>
      `https://2anime.xyz/embed/${malId}/${ep}`,
    useMal: true,
    useAnilist: false,
  },
  {
    name: "AnimeOwl",
    url: (id: number, ep: number) =>
      `https://animeowl.live/anime-player.php?mal_id=${id}&episode=${ep}`,
    useMal: true,
    useAnilist: false,
  },
  {
    name: "GogoAnime",
    url: (id: number, ep: number) =>
      `https://gogoanime3.cc/embed/${id}-episode-${ep}`,
    useMal: false,
    useAnilist: true,
  },
];

export default function AnimePlayer({
  animeId,
  malId,
  episode,
  onNext,
  className,
}: AnimePlayerProps) {
  const [providerIdx, setProviderIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const setProgress = useWatchlistStore((s) => s.setProgress);

  useEffect(() => {
    setLoading(true);
  }, [providerIdx, episode]);

  // Mark episode as started after 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress({ animeId, episode, progress: 30, duration: 1440 });
    }, 30_000);
    return () => clearTimeout(timer);
  }, [animeId, episode, setProgress]);

  const p = PROVIDERS[providerIdx];
  const id = p.useMal ? malId : animeId;
  const src = id != null ? p.url(id, episode) : null;

  return (
    <div className={cn("w-full", className)}>
      {/* Server switcher */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-white/40 shrink-0">Server:</span>
        {PROVIDERS.map((prov, i) => (
          <button
            key={prov.name}
            onClick={() => setProviderIdx(i)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all",
              providerIdx === i
                ? "bg-brand text-white"
                : "bg-surface-card border border-surface-border text-white/50 hover:text-white"
            )}
          >
            {prov.name}
          </button>
        ))}
        {onNext && (
          <button
            onClick={onNext}
            className="ml-auto px-3 py-1 rounded-lg text-xs font-medium bg-surface-overlay border border-surface-border text-white/60 hover:text-white transition-all"
          >
            Next EP →
          </button>
        )}
      </div>

      {/* Iframe player */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-surface-border">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Loading {p.name}…</p>
            </div>
          </div>
        )}

        {src ? (
          <iframe
            key={`${providerIdx}-${episode}`}
            src={src}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/30 text-sm">No source ID available — try a different server</p>
          </div>
        )}
      </div>

      <p className="text-xs text-white/20 mt-2 text-center">
        If one server doesn't load, click another server button above.
      </p>
    </div>
  );
}