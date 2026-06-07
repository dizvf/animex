"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-white/40 mb-8 max-w-sm text-sm">
        {error.message ?? "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand-400 transition-all"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-surface-card border border-surface-border text-white/70 font-semibold text-sm hover:text-white transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
