"use client";

import { useState, useEffect, useRef } from "react";
import { useWatchlistStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SkipForward, Keyboard } from "lucide-react";

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
    name: "Nova",
    url: (animeId: number, _malId: number | null, ep: number, lang: Lang) =>
      `https://animeplay.cfd/stream/ani/${animeId}/${ep}/${lang}`,
  },
  {
    name: "Orion",
    url: (animeId: number, _malId: number | null, ep: number, lang: Lang) =>
      `https://vidnest.fun/anime/${animeId}/${ep}/${lang}`,
  },
  {
    name: "Pulsar",
    url: (_animeId: number, malId: number | null, ep: number, lang: Lang) =>
      malId ? `https://megaplay.buzz/stream/mal/${malId}/${ep}/${lang}` : null,
  },
  {
    name: "Vega",
    url: (animeId: number, _malId: number | null, ep: number, lang: Lang) =>
      `https://tryembed.us.cc/embed/anime/${animeId}/${ep}/${lang}`,
  },
];

const SETTINGS_KEY = "animex-player-settings";

function loadSettings(): { lang: Lang; providerIdx: number } {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    return s ? JSON.parse(s) : { lang: "dub", providerIdx: 0 };
  } catch {
    return { lang: "dub", providerIdx: 0 };
  }
}

function saveSettings(s: { lang: Lang; providerIdx: number }) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
}

// Average anime episode length in seconds (24 min)
const DEFAULT_DURATION = 24 * 60;

export default function AnimePlayer({
  animeId,
  malId,
  episode,
  onNext,
  className,
}: AnimePlayerProps) {
  const [providerIdx, setProviderIdx] = useState(0);
  const [lang, setLang] = useState<Lang>("dub");
  const [loading, setLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const setProgress = useWatchlistStore((s) => s.setProgress);
  const watchStartTime = useRef<number>(Date.now());
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    const s = loadSettings();
    setLang(s.lang);
    setProviderIdx(s.providerIdx);
  }, []);

  // Save settings when they change
  useEffect(() => {
    saveSettings({ lang, providerIdx });
  }, [lang, providerIdx]);

  useEffect(() => { setLoading(true); }, [providerIdx, episode, lang]);

  // Track watch time and save progress periodically
  useEffect(() => {
    watchStartTime.current = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - watchStartTime.current) / 1000;
      // Estimate progress as elapsed real time watching (capped at duration)
      const estimatedProgress = Math.min(elapsedSeconds, DEFAULT_DURATION);
      setProgress({
        animeId,
        episode,
        progress: estimatedProgress,
        duration: DEFAULT_DURATION,
      });
    }, 10_000);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [animeId, episode, setProgress]);

  // Mark episode as fully watched when leaving the page
  useEffect(() => {
    return () => {
      const elapsedSeconds = (Date.now() - watchStartTime.current) / 1000;
      if (elapsedSeconds > DEFAULT_DURATION * 0.7) {
        // Watched most of it — mark as complete
        setProgress({
          animeId,
          episode,
          progress: DEFAULT_DURATION,
          duration: DEFAULT_DURATION,
        });
      }
    };
  }, [animeId, episode, setProgress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          iframeRef.current?.contentWindow?.postMessage({ type: "seek", offset: 5 }, "*");
          break;
        case "ArrowLeft":
          e.preventDefault();
          iframeRef.current?.contentWindow?.postMessage({ type: "seek", offset: -5 }, "*");
          break;
        case " ":
          e.preventDefault();
          iframeRef.current?.contentWindow?.postMessage({ type: "togglePlay" }, "*");
          break;
        case "f":
        case "F":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            containerRef.current?.requestFullscreen();
          }
          break;
        case "m":
        case "M":
          e.preventDefault();
          iframeRef.current?.contentWindow?.postMessage({ type: "toggleMute" }, "*");
          break;
        case "ArrowUp":
          e.preventDefault();
          iframeRef.current?.contentWindow?.postMessage({ type: "volumeUp" }, "*");
          break;
        case "ArrowDown":
          e.preventDefault();
          iframeRef.current?.contentWindow?.postMessage({ type: "volumeDown" }, "*");
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const p = PROVIDERS[providerIdx];
  const src = p.url(animeId, malId, episode, lang);

  return (
    <div className={cn("w-full", className)}>
      {/* Controls bar */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className="text-xs text-white/40 shrink-0 mr-1">Server:</span>
        {PROVIDERS.map((prov, i) => (
          <button
            key={prov.name}
            onClick={() => setProviderIdx(i)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              providerIdx === i
                ? "bg-brand text-white"
                : "bg-surface-card border border-surface-border text-white/50 hover:text-white"
            )}
          >
            {prov.name}
          </button>
        ))}

        {/* Sub/Dub */}
        <div className="flex rounded-lg overflow-hidden border border-surface-border ml-1">
          {(["sub", "dub"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-all uppercase",
                lang === l ? "bg-brand text-white" : "bg-surface-card text-white/50 hover:text-white"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Shortcuts button */}
        <button
          onClick={() => setShowShortcuts((v) => !v)}
          className="ml-1 p-1.5 rounded-lg bg-surface-card border border-surface-border text-white/50 hover:text-white transition-colors"
          title="Keyboard shortcuts"
        >
          <Keyboard size={13} />
        </button>

        {/* Next episode */}
        {onNext && (
          <button
            onClick={onNext}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand text-white hover:bg-brand-400 transition-all"
          >
            <SkipForward size={13} />
            Next
          </button>
        )}
      </div>

      {/* Shortcuts panel */}
      {showShortcuts && (
        <div className="mb-2 p-3 rounded-xl bg-surface-card border border-surface-border">
          <p className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">Keyboard Shortcuts</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {[
              ["→", "Skip forward 5s"],
              ["←", "Skip back 5s"],
              ["Space", "Play / Pause"],
              ["↑ / ↓", "Volume up / down"],
              ["F", "Fullscreen"],
              ["M", "Mute"],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-overlay border border-surface-border text-white/70 font-mono text-[10px]">
                  {key}
                </kbd>
                <span className="text-white/50">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2">
            Note: shortcuts work only if the active server's player supports them.
          </p>
        </div>
      )}

      {/* Player iframe */}
      <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-surface-border">

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
            ref={iframeRef}
            key={`${providerIdx}-${episode}-${lang}`}
            src={src}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-pointer-lock"
            onLoad={() => {
              setLoading(false);
              watchStartTime.current = Date.now();
            }}
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
        Click the keyboard icon for shortcuts · Settings save automatically
      </p>
    </div>
  );
}