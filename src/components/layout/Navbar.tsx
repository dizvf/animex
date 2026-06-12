"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Bookmark, Home, Compass, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/profile", label: "My List", icon: Bookmark },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
      searchRef.current?.blur();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="AnimeX"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === href
                  ? "text-white font-medium"
                  : "text-white/50 hover:text-white"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm ml-auto relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime"
            className="w-full bg-surface-card border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand transition-colors"
          />
        </form>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 -mr-2 text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileOpen((p) => !p)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-surface-border">
          <div className="px-4 py-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm transition-colors",
                  pathname === href ? "text-brand font-medium" : "text-white/60 hover:text-white"
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}