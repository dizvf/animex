"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlistStore } from "@/lib/store";
import { getAnimeTitle, cn } from "@/lib/utils";
import type { AniListAnime } from "@/types";
import toast from "react-hot-toast";

export default function WatchlistButton({ anime }: { anime: AniListAnime }) {
  const isIn = useWatchlistStore((s) => s.isInWatchlist(anime.id));
  const add = useWatchlistStore((s) => s.addToWatchlist);
  const remove = useWatchlistStore((s) => s.removeFromWatchlist);

  const toggle = () => {
    if (isIn) {
      remove(anime.id);
      toast.success("Removed from watchlist");
    } else {
      add({
        id: anime.id,
        title: getAnimeTitle(anime.title),
        image: anime.coverImage.large,
        progress: 0,
        total: anime.episodes ?? null,
        status: "plan-to-watch",
      });
      toast.success("Added to watchlist");
    }
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border",
        isIn
          ? "bg-brand/20 text-brand border-brand/40 hover:bg-brand/30"
          : "bg-surface-overlay text-white/70 border-surface-border hover:text-white hover:bg-surface-card"
      )}
    >
      {isIn ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      {isIn ? "Saved" : "Add to List"}
    </button>
  );
}
