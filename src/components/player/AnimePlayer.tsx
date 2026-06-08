"use client";

import { useState, useEffect } from "react";
import { useWatchlistStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AnimePlayerProps {
  animeId: number;
  malId: number | null;
  episode: number;
  onNext?: () => void;
  className?: string;
}

type Lang = "sub" | "dub";

const PROVIDERS = [
  {
    name: "Ryu",
    url: (animeId: number, _malId: number | null, ep: number, lang: Lang) =>
      `https://animeplay.cfd/stream/ani/${animeId}/${ep}/${lang}`,
  },
  {
    name: "Volt",
    url: (_animeId: number, malId: number | null, ep: number, lang: Lang) =>
      malId ? `https://animeplay.cfd/stream/mal/${malId}/${ep}/${lang}` : null,
  },
  {
    name: "Warp",
    url: (animeId: number, _malId: number | null, ep: number, _lang: Lang) =>
      `https://player.vidplus.to/embed/anime/${animeId}/${ep}`,
  },
  {
    name: "Ayame",
    url: (animeId: number, _malId: number | null, ep: number, _lang: Lang) =>
      `https://2embed.cc/embed/anime/${animeId}/${ep}`,
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
  const [lang, setLang] = useState<Lang>("sub");
  const [loading, setLoading] = useState(true);
  const setProgress = useWatchlistStore((s) => s.setProgress);

  useEffect(() => {
    setLoading(true);
  }, [providerIdx, episode, lang]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress({ animeId, episode, progress: 30, duration: 1440 });
    }, 30_000);
    return () => clearTimeout(timer);
  }, [animeId, episode, setProgress]);

  const p = PROVIDERS[providerIdx];
  const src = p.url(animeId, malId, episode, lang);

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
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

        {/* Sub/Dub toggle */}
        <div className="flex rounded-lg overflow-hidden border border-surface-border ml-1">
          {(["sub", "dub"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-all uppercase",
                lang === l
                  ? "bg-brand text-white"
                  : "bg-surface-card text-white/50 hover:text-white"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {onNext && (
          <button
            onClick={onNext}
            className="ml-auto px-3 py-1 rounded-lg text-xs font-medium bg-surface-overlay border border-surface-border text-white/60 hover:text-white transition-all"
          >
            Next EP →
          </button>
        )}
      </div>

      {/* Player */}
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
            key={`${providerIdx}-${episode}-${lang}`}
            src={src}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/30 text-sm">No source for this server</p>
              <p className="text-white/20 text-xs mt-1">Try a different server above</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-white/20 mt-2 text-center">
        If a server doesn't load, try another one. Toggle Sub / Dub above.
      </p>
    </div>
  );
}