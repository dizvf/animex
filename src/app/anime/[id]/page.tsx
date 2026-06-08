import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Star, Tv2, Calendar, Clock, BookOpen, Heart } from "lucide-react";
import { getAnimeById } from "@/lib/anilist";
import { getEpisodes } from "@/lib/jikan";
import AnimeGrid from "@/components/anime/AnimeGrid";
import { cn, formatScore, formatStatus, formatFormat, stripHtml, getAnimeTitle } from "@/lib/utils";
import type { AniListAnime, JikanEpisode } from "@/types";
import WatchlistButton from "./WatchlistButton";
import EpisodeSection from "./EpisodeSection";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const data = await getAnimeById(Number(params.id));
    const anime = data.Media as AniListAnime;
    const title = getAnimeTitle(anime.title);
    return {
      title,
      description: anime.description ? stripHtml(anime.description).slice(0, 160) : undefined,
      openGraph: { images: [{ url: anime.coverImage.extraLarge }] },
    };
  } catch {
    return { title: "Anime" };
  }
}

export const revalidate = 3600;

export default async function AnimePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  let data;
  try {
    data = await getAnimeById(id);
  } catch {
    notFound();
  }

  const anime = data.Media as AniListAnime;
  const title = getAnimeTitle(anime.title);
  const score = formatScore(anime.averageScore);
  const desc = anime.description ? stripHtml(anime.description) : null;
  const studio = anime.studios.nodes.find((s) => s.isAnimationStudio);

  // Jikan episodes (non-blocking)
  let episodes: JikanEpisode[] = [];
  if (anime.idMal) {
    try {
      const ep = await getEpisodes(anime.idMal);
      episodes = ep.data;
    } catch {}
  }

  // Recommendations
  const recs = anime.recommendations?.nodes
    ?.map((n) => n.mediaRecommendation)
    ?.filter(Boolean)
    ?.slice(0, 10) as AniListAnime[] | undefined;

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt={title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: anime.coverImage.color ?? "#1a1a1e" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10 pb-20">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="w-36 sm:w-48 rounded-2xl overflow-hidden shadow-2xl border border-surface-border">
              <Image
                src={anime.coverImage.extraLarge}
                alt={title}
                width={192}
                height={256}
                className="object-cover w-full"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 sm:pt-28">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/browse?genre=${encodeURIComponent(g)}`}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-brand/15 text-brand border border-brand/25 hover:bg-brand/25 transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 leading-tight">{title}</h1>
            {anime.title.native && (
              <p className="text-white/40 text-sm mb-4">{anime.title.native}</p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-5">
              {anime.averageScore && (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star size={15} fill="currentColor" /> {score}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-white/60">
                <Tv2 size={14} /> {formatFormat(anime.format)}
              </span>
              <span className={cn(
                "flex items-center gap-1.5 font-medium",
                anime.status === "RELEASING" ? "text-green-400" : "text-white/60"
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  anime.status === "RELEASING" ? "bg-green-400 animate-pulse" : "bg-white/40"
                )} />
                {formatStatus(anime.status)}
              </span>
              {anime.episodes && (
                <span className="flex items-center gap-1.5 text-white/60">
                  <BookOpen size={14} /> {anime.episodes} episodes
                </span>
              )}
              {anime.duration && (
                <span className="flex items-center gap-1.5 text-white/60">
                  <Clock size={14} /> {anime.duration} min
                </span>
              )}
              {anime.seasonYear && (
                <span className="flex items-center gap-1.5 text-white/60">
                  <Calendar size={14} /> {anime.seasonYear}
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-5">
              <Link
                href={`/watch/${anime.id}/1`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-400 text-white font-semibold text-sm transition-all shadow-lg shadow-brand/30"
              >
                <Play size={16} fill="white" />
                Watch Now
              </Link>
              <WatchlistButton anime={anime} />
            </div>

            {studio && (
              <p className="text-xs text-white/40">Studio: <span className="text-white/60">{studio.name}</span></p>
            )}
          </div>
        </div>

        {/* Description */}
        {desc && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-2">Synopsis</h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-3xl">{desc}</p>
          </div>
        )}

        {/* Characters */}
        {anime.characters?.edges?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-4">Characters</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {anime.characters.edges.slice(0, 12).map(({ node, role }) => (
                <div key={node.id} className="shrink-0 w-20 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-overlay border border-surface-border mx-auto mb-1.5">
                    <Image src={node.image.large} alt={node.name.full} width={80} height={80} className="object-cover w-full h-full" />
                  </div>
                  <p className="text-xs text-white/80 line-clamp-2 leading-tight">{node.name.full}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Episodes */}
        <div className="mt-10">
          <EpisodeSection
            animeId={anime.id}
            malId={anime.idMal}
            episodes={episodes}
            totalEpisodes={anime.episodes}
          />
        </div>

        {/* Recommendations */}
        {recs && recs.length > 0 && (
          <div className="mt-12">
            <AnimeGrid anime={recs} title="You Might Also Like" cols={5} />
          </div>
        )}
      </div>
    </div>
  );
}