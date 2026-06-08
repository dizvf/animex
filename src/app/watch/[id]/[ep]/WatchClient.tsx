"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import AnimePlayer from "@/components/player/AnimePlayer";

interface WatchClientProps {
  animeId: number;
  malId: number | null;
  episode: number;
  title: string;
  prevEp: number | null;
  nextEp: number | null;
}

export default function WatchClient({
  animeId,
  malId,
  episode,
  title,
  prevEp,
  nextEp,
}: WatchClientProps) {
  const router = useRouter();

  const handleNext = nextEp
    ? () => router.push(`/watch/${animeId}/${nextEp}`)
    : undefined;

  return (
    <div className="flex-1 min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
        <Link href={`/anime/${animeId}`} className="hover:text-white transition-colors line-clamp-1">
          {title}
        </Link>
        <ChevronRight size={14} />
        <span className="text-white/70">Episode {episode}</span>
      </div>

      {/* Player */}
      <AnimePlayer
        animeId={animeId}
        malId={malId}
        episode={episode}
        onNext={handleNext}
      />

      {/* Episode nav */}
      <div className="flex items-center justify-between mt-4">
        {prevEp ? (
          <Link
            href={`/watch/${animeId}/${prevEp}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-white/70 hover:text-white hover:border-brand/40 transition-all text-sm"
          >
            <ChevronLeft size={16} />
            EP {prevEp}
          </Link>
        ) : <div />}

        <Link
          href={`/anime/${animeId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-white/60 hover:text-white transition-all text-sm"
        >
          <List size={15} />
          All Episodes
        </Link>

        {nextEp ? (
          <Link
            href={`/watch/${animeId}/${nextEp}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white hover:bg-brand-400 transition-all text-sm font-medium"
          >
            EP {nextEp}
            <ChevronRight size={16} />
          </Link>
        ) : <div />}
      </div>

      {/* Title card */}
      <div className="mt-6 p-4 rounded-xl bg-surface-card border border-surface-border">
        <Link href={`/anime/${animeId}`} className="hover:text-brand transition-colors">
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </Link>
        <p className="text-white/50 text-sm mt-0.5">Episode {episode}</p>
      </div>
    </div>
  );
}