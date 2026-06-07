import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month >= 1 && month <= 3) return { season: "WINTER", year };
  if (month >= 4 && month <= 6) return { season: "SPRING", year };
  if (month >= 7 && month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export function formatScore(score: number | null): string {
  if (!score) return "N/A";
  return (score / 10).toFixed(1);
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    FINISHED: "Finished",
    RELEASING: "Airing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  return map[status] ?? status;
}

export function formatFormat(format: string): string {
  const map: Record<string, string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
    MANGA: "Manga",
    NOVEL: "Novel",
    ONE_SHOT: "One Shot",
  };
  return map[format] ?? format;
}

export function secondsToTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function getAnimeTitle(title: {
  romaji: string;
  english: string | null;
  native: string;
  userPreferred?: string;
}): string {
  return title.english ?? title.romaji ?? title.native;
}
