import { AnimeGridSkeleton } from "@/components/anime/AnimeGrid";

export default function Loading() {
  return (
    <div className="pb-20">
      {/* Hero skeleton */}
      <div className="h-[70vh] min-h-[500px] skeleton" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-7 w-48 skeleton rounded mb-4" />
            <AnimeGridSkeleton count={10} cols={5} />
          </div>
        ))}
      </div>
    </div>
  );
}
