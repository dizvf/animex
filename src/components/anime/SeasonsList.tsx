import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { getAnimeTitle, formatFormat } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AniListAnime } from "@/types";

const RELATION_ORDER: Record<string, number> = {
  PREQUEL: 0,
  PARENT: 1,
  SEQUEL: 2,
  SIDE_STORY: 3,
  ALTERNATIVE: 4,
  SPIN_OFF: 5,
  OTHER: 6,
};

const RELATION_LABELS: Record<string, string> = {
  PREQUEL: "Prequel",
  SEQUEL: "Sequel",
  PARENT: "Parent Story",
  SIDE_STORY: "Side Story",
  ALTERNATIVE: "Alternative",
  SPIN_OFF: "Spin-off",
  SUMMARY: "Summary",
  OTHER: "Other",
};

interface SeasonsListProps {
  relations: AniListAnime["relations"];
  currentId: number;
}

export default function SeasonsList({ relations, currentId }: SeasonsListProps) {
  if (!relations?.edges?.length) return null;

  // Filter to only anime relations (not manga/etc), sorted
  const animeRelations = relations.edges
    .filter((e) => e.node.format !== "MANGA" && e.node.format !== "NOVEL" && e.node.format !== "ONE_SHOT")
    .sort((a, b) => (RELATION_ORDER[a.relationType] ?? 9) - (RELATION_ORDER[b.relationType] ?? 9));

  if (animeRelations.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4">Related</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {animeRelations.map(({ node, relationType }) => {
          const t = getAnimeTitle(node.title);
          const isCurrent = node.id === currentId;

          return (
            <Link
              key={node.id}
              href={`/anime/${node.id}`}
              className={cn(
                "group relative rounded-xl overflow-hidden border transition-all",
                isCurrent
                  ? "border-brand ring-1 ring-brand/50"
                  : "border-surface-border hover:border-brand/40"
              )}
            >
              {/* Cover */}
              <div className="aspect-poster relative bg-surface-overlay">
                <Image
                  src={node.coverImage.large}
                  alt={t}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Relation badge */}
                <div className="absolute top-2 left-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    relationType === "SEQUEL" ? "bg-brand text-white" :
                    relationType === "PREQUEL" ? "bg-purple-500 text-white" :
                    "bg-black/60 text-white/80"
                  )}>
                    {RELATION_LABELS[relationType] ?? relationType}
                  </span>
                </div>

                {/* Current indicator */}
                {isCurrent && (
                  <div className="absolute top-2 right-2 bg-brand rounded-full px-2 py-0.5">
                    <span className="text-[10px] font-bold text-white">NOW</span>
                  </div>
                )}

                {/* Play button on hover */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                    <Play size={12} fill="white" className="text-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-2 bg-surface-card">
                <p className="text-xs font-medium text-white/90 line-clamp-2 leading-tight">{t}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/40">{formatFormat(node.format)}</span>
                  {node.seasonYear && (
                    <span className="text-[10px] text-white/30">{node.seasonYear}</span>
                  )}
                  {node.status === "RELEASING" && (
                    <span className="text-[10px] text-green-400 font-medium">Airing</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}