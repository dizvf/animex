"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Info, Star, Calendar, Tv2 } from "lucide-react";
import { cn, formatScore, getAnimeTitle, formatFormat, stripHtml, truncate } from "@/lib/utils";
import type { AniListAnime } from "@/types";

export default function HeroBanner({ anime }: { anime: AniListAnime }) {
  const title = getAnimeTitle(anime.title);
  const desc = anime.description ? truncate(stripHtml(anime.description), 200) : null;
  const score = formatScore(anime.averageScore);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {/* Banner image */}
      {(anime.bannerImage ?? anime.coverImage.extraLarge) && (
        <Image
          src={anime.bannerImage ?? anime.coverImage.extraLarge}
          alt={title}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      )}

      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-16 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="max-w-xl animate-fade-up">
          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {anime.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand/20 text-brand border border-brand/30"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3 text-shadow-sm leading-tight">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
            {anime.averageScore && (
              <span className="flex items-center gap-1.5 text-amber-400">
                <Star size={14} fill="currentColor" />
                <span className="font-semibold">{score}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Tv2 size={14} />
              {formatFormat(anime.format)}
            </span>
            {anime.seasonYear && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {anime.seasonYear}
              </span>
            )}
            {anime.episodes && (
              <span>{anime.episodes} episodes</span>
            )}
          </div>

          {/* Description */}
          {desc && (
            <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-3">{desc}</p>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={`/watch/${anime.id}/1`}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm",
                "bg-brand hover:bg-brand-400 transition-all duration-200 active:scale-95 shadow-lg shadow-brand/30"
              )}
            >
              <Play size={18} fill="white" />
              Watch Now
            </Link>
            <Link
              href={`/anime/${anime.id}`}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm",
                "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200 border border-white/10"
              )}
            >
              <Info size={18} />
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Poster (desktop) */}
      <div className="hidden lg:block absolute right-16 bottom-12 w-36 shadow-2xl rounded-xl overflow-hidden">
        <Image
          src={anime.coverImage.extraLarge}
          alt={title}
          width={144}
          height={192}
          className="object-cover"
        />
      </div>
    </div>
  );
}
