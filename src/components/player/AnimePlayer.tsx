"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
  useMediaState,
  Track,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlistStore } from "@/lib/store";
import type { AnifyEpisodeData, AniSkipResult } from "@/types";
import { getSkipInterval } from "@/lib/aniskip";

interface AnimePlayerProps {
  animeId: number;
  episode: number;
  episodeData: AnifyEpisodeData;
  skipTimes: AniSkipResult;
  onNext?: () => void;
  className?: string;
}

export default function AnimePlayer({
  animeId,
  episode,
  episodeData,
  skipTimes,
  onNext,
  className,
}: AnimePlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const setProgress = useWatchlistStore((s) => s.setProgress);
  const savedProgress = useWatchlistStore((s) => s.getProgress(animeId, episode));

  const [showSkipOp, setShowSkipOp] = useState(false);
  const [showSkipEd, setShowSkipEd] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const opInterval = getSkipInterval(skipTimes, "op");
  const edInterval = getSkipInterval(skipTimes, "ed");

  // Pick best source (prefer HLS)
  const sources = episodeData.sources ?? [];
  const hls = sources.find((s) => s.isM3U8) ?? sources[0];
  const src = hls?.url;

  // Subtitles
  const subtitles = episodeData.subtitles ?? [];
  const engSub = subtitles.find((s) => s.lang.toLowerCase().includes("english") || s.lang === "en");

  // Restore saved position
  useEffect(() => {
    if (savedProgress && playerRef.current && savedProgress.progress > 30) {
      const p = playerRef.current;
      const handler = () => {
        if (savedProgress.progress > 0) {
          p.currentTime = savedProgress.progress;
        }
      };
      p.addEventListener("can-play", handler, { once: true });
      return () => p.removeEventListener("can-play", handler);
    }
  }, [savedProgress]);

  // Track skip button visibility
  useEffect(() => {
    const id = setInterval(() => {
      const t = playerRef.current?.currentTime ?? 0;
      setCurrentTime(t);
      setShowSkipOp(!!opInterval && t >= opInterval.startTime && t < opInterval.endTime);
      setShowSkipEd(!!edInterval && t >= edInterval.startTime && t < edInterval.endTime);
    }, 500);
    return () => clearInterval(id);
  }, [opInterval, edInterval]);

  // Save progress every 5 seconds
  useEffect(() => {
    const save = () => {
      const p = playerRef.current;
      if (!p || !p.duration || p.currentTime < 5) return;
      setProgress({
        animeId,
        episode,
        progress: p.currentTime,
        duration: p.duration,
      });
    };
    const id = setInterval(save, 5000);
    return () => { clearInterval(id); save(); };
  }, [animeId, episode, setProgress]);

  const skipTo = useCallback((time: number) => {
    if (playerRef.current) playerRef.current.currentTime = time;
  }, []);

  if (!src) {
    return (
      <div className={cn("aspect-video bg-surface-overlay rounded-xl flex items-center justify-center", className)}>
        <p className="text-white/40 text-sm">No stream source available</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <MediaPlayer
        ref={playerRef}
        src={src}
        title={`Episode ${episode}`}
        className="w-full aspect-video"
        playsInline
        crossOrigin="anonymous"
        onEnd={onNext}
      >
        <MediaProvider />

        {/* Subtitles */}
        {engSub && (
          <Track
            src={engSub.url}
            kind="subtitles"
            label="English"
            lang="en"
            default
          />
        )}
        {subtitles
          .filter((s) => s !== engSub)
          .map((sub) => (
            <Track key={sub.url} src={sub.url} kind="subtitles" label={sub.lang} lang={sub.lang} />
          ))}

        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          thumbnails={undefined}
        />
      </MediaPlayer>

      {/* AniSkip — Skip Intro */}
      {showSkipOp && opInterval && (
        <button
          className="skip-btn"
          onClick={() => skipTo(opInterval.endTime)}
        >
          <SkipForward size={14} className="inline mr-1.5" />
          Skip Intro
        </button>
      )}

      {/* AniSkip — Skip Outro */}
      {showSkipEd && edInterval && (
        <button
          className="skip-btn"
          onClick={onNext ?? (() => skipTo(edInterval.endTime))}
        >
          <SkipForward size={14} className="inline mr-1.5" />
          {onNext ? "Next Episode" : "Skip Outro"}
        </button>
      )}
    </div>
  );
}
