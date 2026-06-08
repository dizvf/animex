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

const PROVIDERS = [
  {
    name: "Server 1",
    url: (malId: number, ep: number) =>
      `https://vidsrc.to/embed/anime/${malId}/${ep}`,
    useMal: true,
  },
  {
    name: "Server 2",
    url: (id: number, ep: number) =>
      `https://vidsrc.cc/v2/embed/anime/${id}/${ep}`,
    useMal: false,
  },
  {
    name: "Server 3",
    url: (malId: number, ep: number) =>
      `https://player.autoembed.cc/embed/anime/${malId}/${ep}`,
    useMal: true,
  },
];

export default function AnimePlayer({
  animeId,
  malId,
  episode,
  onNext,
  className,
}: AnimePlayerProps) {
  const [provider, setProvider] = useState(0);
  const [loading, setLoading] = useState(true);
  const setProgress = useWatchlistStore((s) => s.setProgress);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Save basic progress when provider is selected
  useEffect(() => {
    setLoading(true);
  }, [provider, episode]);

  // Mark episode as started after 30s
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress({
        animeId,
        episode,
        progress: 30,
        duration: 1440, // assume 24min
      });
    }, 30_000);
    return () => clearTimeout(timer);
  }, [animeId, episode, setProgress]);

  const current = PROVIDERS[provider];
  const id = current.useMal ? malId : animeId;

  const src = id ? current.url(id, episode) : null;

  return (
    <div className={cn("w-full", className)}>
      {/* Provider selector */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-white/40 mr-1">Source:</span>
        {PROVIDERS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setProvider(i)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all",
              provider === i
                ? "bg-brand text-white"
                : "bg-surface-card border border-surface-border text-white/50 hover:text-white"
            )}
          >
            {p.name}
          </button>
        ))}
        {onNext && (
          <button
            onClick={onNext}
            className="ml-auto px-3 py-1 rounded-lg text-xs font-medium bg-surface-card border border-surface-border text-white/50 hover:text-white transition-all"
          >
            Next EP →
          </button>
        )}
      </div>

      {/* Player */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Loading player…</p>
            </div>
          </div>
        )}

        {src ? (
          <iframe
            ref={iframeRef}
            src={src}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/40 mb-2">No MAL ID available for this anime</p>
              <p className="text-white/20 text-sm">Try browsing directly on a streaming site</p>
            </div>
          </div>
        )}
      </div>

      {/* Source note */}
      <p className="text-xs text-white/20 mt-2 text-center">
        If the player doesn't load, try a different server above.
      </p>
    </div>
  );
}