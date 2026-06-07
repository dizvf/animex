import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistEntry, EpisodeProgress } from "@/types";

interface WatchlistStore {
  entries: WatchlistEntry[];
  progress: Record<string, EpisodeProgress>; // key: `${animeId}-${episode}`
  addToWatchlist: (entry: Omit<WatchlistEntry, "addedAt">) => void;
  removeFromWatchlist: (id: number) => void;
  updateStatus: (id: number, status: WatchlistEntry["status"]) => void;
  setProgress: (p: Omit<EpisodeProgress, "updatedAt">) => void;
  getProgress: (animeId: number, episode: number) => EpisodeProgress | null;
  isInWatchlist: (id: number) => boolean;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      entries: [],
      progress: {},

      addToWatchlist(entry) {
        const exists = get().entries.find((e) => e.id === entry.id);
        if (exists) return;
        set((s) => ({
          entries: [{ ...entry, addedAt: new Date().toISOString() }, ...s.entries],
        }));
      },

      removeFromWatchlist(id) {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      },

      updateStatus(id, status) {
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, status } : e)),
        }));
      },

      setProgress({ animeId, episode, progress, duration }) {
        const key = `${animeId}-${episode}`;
        set((s) => ({
          progress: {
            ...s.progress,
            [key]: { animeId, episode, progress, duration, updatedAt: new Date().toISOString() },
          },
        }));
        // Auto-update watchlist progress
        const entry = get().entries.find((e) => e.id === animeId);
        if (entry && episode > entry.progress) {
          set((s) => ({
            entries: s.entries.map((e) =>
              e.id === animeId ? { ...e, progress: episode } : e
            ),
          }));
        }
      },

      getProgress(animeId, episode) {
        return get().progress[`${animeId}-${episode}`] ?? null;
      },

      isInWatchlist(id) {
        return get().entries.some((e) => e.id === id);
      },
    }),
    { name: "animex-watchlist" }
  )
);
