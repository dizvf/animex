"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play, Clock } from "lucide-react";
import { cn, formatScore, getAnimeTitle, formatFormat } from "@/lib/utils";
import type { AniListAnime } from "@/types";

interface AnimeCardProps {
  anime: AniListAnime;
  className?: string;
  priority?: boolean;
}

export default function AnimeCard({ anime, className, priority }: AnimeCardProps) {
  const title = getAnimeTitle(anime.title);
  const score = formatScore(anime.averageScore);
  const color = anime.coverImage.color ?? "#E85D04";

  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn("anime-card block group relative", className)}
    >
      {/* Poster */}
      <div className="aspect-poster relative rounded-xl overflow-hidden bg-surface-overlay">
        <Image
          src={anime.coverImage.large}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <div className="anime-card__overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: `${color}CC` }}
          >
            <Play size={22} fill="white" className="text-white ml-1" />
          </div>
        </div>

        {/* Score badge */}
        {anime.averageScore && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star size={10} fill="#F59E0B" className="text-amber-400" />
            <span className="text-xs font-semibold text-white">{score}</span>
          </div>
        )}

        {/* Format badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
          <span className="text-xs text-white/80 font-medium">{formatFormat(anime.format)}</span>
        </div>

        {/* Airing indicator */}
        {anime.status === "RELEASING" && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            <span className="text-xs text-green-400 font-medium">Airing</span>
          </div>
        )}

        {/* Episodes */}
        {anime.episodes && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white/70">
            <Clock size={10} />
            <span className="text-xs">{anime.episodes} ep</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-tight group-hover:text-white transition-colors">
          {title}
        </h3>
        {anime.seasonYear && (
          <p className="text-xs text-white/40 mt-0.5">{anime.seasonYear}</p>
        )}
      </div>
    </Link>
  );
}

// ── Skeleton ────────────────────────────────────────────────────
export function AnimeCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-poster rounded-xl skeleton" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3.5 rounded skeleton w-4/5" />
        <div className="h-3 rounded skeleton w-2/5" />
      </div>
    </div>
  );
}
