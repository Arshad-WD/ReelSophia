"use client";

import { useState, useCallback, useEffect } from "react";
import { NoteCard } from "@/components/note-card";
import { Search as SearchIcon, X, Database } from "lucide-react";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  platform: string;
  createdAt: string;
  folder: { id: string; name: string; icon: string | null } | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <div className="pt-8 lg:pt-12 pb-32 px-5 lg:px-10 min-h-screen animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-1">
          Search
        </h1>
        <p className="text-sm text-muted-foreground">Find insights across all your reels</p>
      </header>

      {/* Search Input */}
      <div className="mb-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/15 to-transparent rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors z-10" />
            <input
              type="search"
              placeholder="Search by title, content, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 velvet-card bg-card/60 border-border/30 focus:border-primary/40 transition-all pl-14 pr-14 text-base font-medium text-foreground placeholder:text-muted-foreground/30 outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-1 bg-primary rounded-full animate-shimmer mb-4" style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)" }} />
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="velvet-card p-16 text-center">
          <SearchIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No results</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            No reels matched &quot;{query}&quot;. Try a different search term.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-sm font-semibold text-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </h2>
            <div className="h-px flex-1 bg-border/30" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {results.map((reel) => (
              <NoteCard
                key={reel.id}
                id={reel.id}
                title={reel.title}
                summary={reel.summary}
                status={reel.status}
                platform={reel.platform}
                createdAt={new Date(reel.createdAt)}
                folderName={reel.folder?.name}
              />
            ))}
          </div>
        </section>
      )}

      {!searched && !loading && (
        <div className="py-16 text-center">
          <Database className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Search across titles, summaries, transcripts, and tags to find any insight you&apos;ve extracted.
          </p>
        </div>
      )}
    </div>
  );
}
