"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Trash2, CheckCircle2, Clock, BookOpen, PauseCircle, XCircle } from "lucide-react";
import { useWatchlistStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { WatchlistEntry } from "@/types";

const STATUSES: { value: WatchlistEntry["status"]; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "watching",       label: "Watching",      icon: <Play size={13} />,        color: "text-brand" },
  { value: "completed",      label: "Completed",     icon: <CheckCircle2 size={13} />, color: "text-green-400" },
  { value: "on-hold",        label: "On Hold",       icon: <PauseCircle size={13} />,  color: "text-amber-400" },
  { value: "dropped",        label: "Dropped",       icon: <XCircle size={13} />,      color: "text-red-400" },
  { value: "plan-to-watch",  label: "Plan to Watch", icon: <BookOpen size={13} />,     color: "text-white/50" },
];

export default function ProfilePage() {
  const entries   = useWatchlistStore((s) => s.entries);
  const remove    = useWatchlistStore((s) => s.removeFromWatchlist);
  const updateStatus = useWatchlistStore((s) => s.updateStatus);
  const [filter, setFilter] = useState<WatchlistEntry["status"] | "all">("all");

  const filtered = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  const counts: Record<string, number> = { all: entries.length };
  STATUSES.forEach((s) => { counts[s.value] = entries.filter((e) => e.status === s.value).length; });

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">My Anime List</h1>
          <p className="text-white/40 text-sm mt-1">{entries.length} anime tracked</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filter === "all"
                ? "bg-brand text-white"
                : "bg-surface-card border border-surface-border text-white/50 hover:text-white"
            )}
          >
            All
            <span className="text-xs opacity-70">({counts.all})</span>
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                filter === s.value
                  ? "bg-surface-overlay border border-brand/40 text-white"
                  : "bg-surface-card border border-surface-border text-white/50 hover:text-white"
              )}
            >
              <span className={filter === s.value ? s.color : ""}>{s.icon}</span>
              {s.label}
              <span className="text-xs opacity-60">({counts[s.value] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24 border border-dashed border-surface-border rounded-2xl">
            <BookOpen size={40} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/40 text-lg font-medium">No anime here yet</p>
            <p className="text-white/30 text-sm mt-1 mb-5">Start browsing and add some to your list</p>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-400 transition-all"
            >
              Browse Anime
            </Link>
          </div>
        )}

        {/* List */}
        <div className="space-y-3">
          {filtered.map((entry) => {
            const pct = entry.total ? Math.round((entry.progress / entry.total) * 100) : 0;
            const status = STATUSES.find((s) => s.value === entry.status);

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 bg-surface-card border border-surface-border rounded-xl p-3 hover:border-surface-overlay transition-colors group"
              >
                {/* Cover */}
                <Link href={`/anime/${entry.id}`} className="shrink-0">
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-surface-overlay relative">
                    <Image
                      src={entry.image}
                      alt={entry.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/anime/${entry.id}`} className="hover:text-brand transition-colors">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{entry.title}</h3>
                  </Link>

                  {/* Progress bar */}
                  {entry.total && (
                    <div className="mt-1.5 mb-1">
                      <div className="h-1 bg-surface-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span>{entry.progress}{entry.total ? ` / ${entry.total}` : ""} ep</span>
                    <span className={cn("flex items-center gap-1", status?.color)}>
                      {status?.icon} {status?.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Status selector */}
                  <select
                    value={entry.status}
                    onChange={(e) => updateStatus(entry.id, e.target.value as WatchlistEntry["status"])}
                    className="bg-surface-overlay border border-surface-border rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-brand cursor-pointer hidden sm:block"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>

                  {/* Resume watch */}
                  <Link
                    href={`/watch/${entry.id}/${Math.max(1, entry.progress)}`}
                    className="p-2 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors"
                    title="Continue watching"
                  >
                    <Play size={15} fill="currentColor" />
                  </Link>

                  {/* Remove */}
                  <button
                    onClick={() => remove(entry.id)}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from list"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
