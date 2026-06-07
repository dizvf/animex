"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/95 backdrop-blur-xl border-b border-surface-border shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-black/60 to-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black tracking-tight gradient-text">ANIMEX</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className={cn(
            "relative flex items-center transition-all duration-300",
            searchOpen ? "w-64" : "w-10"
          )}
        >
          {searchOpen && (
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anime…"
              className="w-full bg-surface-card border border-surface-border rounded-xl pl-4 pr-10 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand transition-colors"
            />
          )}
          <button
            type="button"
            onClick={() => setSearchOpen((p) => !p)}
            className={cn(
              "absolute right-2 p-1.5 rounded-lg text-white/60 hover:text-white transition-colors",
              !searchOpen && "relative right-0 hover:bg-white/10"
            )}
          >
            {searchOpen ? <X size={16} /> : <Search size={18} />}
          </button>
        </form>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen((p) => !p)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface/98 backdrop-blur-xl border-t border-surface-border">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  pathname === href
                    ? "text-white bg-brand/20 text-brand"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="pt-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime…"
                className="w-full bg-surface-overlay border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand"
              />
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
