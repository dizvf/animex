"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrowseFiltersProps {
  genres: string[];
  searchParams: Record<string, string | undefined>;
}

const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "TV_SHORT"];
const STATUSES = ["RELEASING", "FINISHED", "NOT_YET_RELEASED"];
const SORTS = [
  { value: "POPULARITY_DESC", label: "Popular" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "SCORE_DESC", label: "Top Rated" },
  { value: "START_DATE_DESC", label: "Newest" },
  { value: "TITLE_ROMAJI", label: "A–Z" },
];
const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));

export default function BrowseFilters({ genres, searchParams }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const set = (key: string, value: string | undefined) => {
    const p = new URLSearchParams();
    // Carry over existing params
    Object.entries(searchParams).forEach(([k, v]) => { if (v && k !== "page") p.set(k, v); });
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete("page");
    router.push(`${pathname}?${p.toString()}`);
  };

  const clear = () => router.push(pathname);

  const hasFilters = Object.values(searchParams).some(Boolean);

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          defaultValue={searchParams.search ?? ""}
          placeholder="Search anime…"
          className="w-full bg-surface-overlay border border-surface-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter") set("search", (e.target as HTMLInputElement).value || undefined);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Genre */}
        <select
          value={searchParams.genre ?? ""}
          onChange={(e) => set("genre", e.target.value || undefined)}
          className="bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Genres</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Format */}
        <select
          value={searchParams.format ?? ""}
          onChange={(e) => set("format", e.target.value || undefined)}
          className="bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Formats</option>
          {FORMATS.map((f) => <option key={f} value={f}>{f.replace("_", " ")}</option>)}
        </select>

        {/* Status */}
        <select
          value={searchParams.status ?? ""}
          onChange={(e) => set("status", e.target.value || undefined)}
          className="bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>

        {/* Year */}
        <select
          value={searchParams.year ?? ""}
          onChange={(e) => set("year", e.target.value || undefined)}
          className="bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Years</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Sort */}
        <select
          value={searchParams.sort ?? "POPULARITY_DESC"}
          onChange={(e) => set("sort", e.target.value)}
          className="bg-surface-overlay border border-surface-border rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-brand cursor-pointer"
        >
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors text-sm"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
