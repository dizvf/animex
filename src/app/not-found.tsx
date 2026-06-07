import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black gradient-text mb-4">404</div>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-white/40 mb-8 max-w-sm">
        The anime you're looking for might have been removed or doesn't exist.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-400 transition-all"
        >
          Go Home
        </Link>
        <Link
          href="/browse"
          className="px-5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-white/70 font-semibold text-sm hover:text-white transition-all"
        >
          Browse Anime
        </Link>
      </div>
    </div>
  );
}
