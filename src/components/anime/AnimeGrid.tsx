import AnimeCard, { AnimeCardSkeleton } from "./AnimeCard";
import type { AniListAnime } from "@/types";
import { cn } from "@/lib/utils";

interface AnimeGridProps {
  anime: AniListAnime[];
  title?: string;
  className?: string;
  cols?: 3 | 4 | 5 | 6;
}

const colMap = {
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
};

export default function AnimeGrid({ anime, title, className, cols = 5 }: AnimeGridProps) {
  return (
    <section className={className}>
      {title && (
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      )}
      <div className={cn("grid gap-4", colMap[cols])}>
        {anime.map((a, i) => (
          <AnimeCard key={a.id} anime={a} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}

export function AnimeGridSkeleton({ count = 10, cols = 5 }: { count?: number; cols?: 3 | 4 | 5 | 6 }) {
  return (
    <div className={cn("grid gap-4", colMap[cols])}>
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
