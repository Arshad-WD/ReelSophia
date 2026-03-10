"use client";

import { useState, useCallback } from "react";
import { NoteCard } from "@/components/note-card";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  mainIdea: string | null;
  tags: string[];
  status: string;
  platform: string;
  sourceUrl: string;
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

  // Debounced search
  const handleInputChange = (value: string) => {
    setQuery(value);
    const timer = setTimeout(() => handleSearch(value), 400);
    return () => clearTimeout(timer);
  };

  return (
    <div className="px-5 pt-8 max-w-md mx-auto pb-24 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-sans font-extrabold tracking-tighter text-white italic underline decoration-primary/40 underline-offset-8 uppercase mb-3">
          RETRIEVAL
        </h1>
        <p className="text-[10px] text-muted-foreground font-sans font-bold uppercase tracking-[0.3em]">
          QUERYING THE COLLECTIVE ARCHIVE
        </p>
      </div>
      {/* Search Input */}
      <div className="mb-12">
        <div className="relative group">
          <input
            type="search"
            placeholder="TYPE TO SEARCH..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full h-16 bg-[#0A0A0A] !rounded-full border border-white/5 focus:border-primary/40 transition-all px-14 text-lg font-sans font-bold text-white placeholder:text-muted-foreground/20"
            autoFocus
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setSearched(false);
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="journal-card p-12 text-center border-dashed border-2 bg-transparent">
          <p className="text-5xl mb-6 text-muted-foreground opacity-20">NULL</p>
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            No matches found for &quot;{query}&quot;
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-[10px] font-sans font-extrabold text-primary mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
             <span className="w-8 h-[1px] bg-primary/20" /> {results.length} ENTRIES UNEARTHED
          </h2>
          <div className="space-y-3">
            {results.map((reel) => (
              <NoteCard
                key={reel.id}
                id={reel.id}
                title={reel.title}
                summary={reel.summary}
                mainIdea={reel.mainIdea}
                tags={reel.tags}
                status={reel.status}
                platform={reel.platform}
                sourceUrl={reel.sourceUrl}
                createdAt={reel.createdAt}
                folder={reel.folder}
              />
            ))}
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-24 opacity-60">
          <p className="text-6xl mb-8 font-sans font-extrabold italic text-white/5 uppercase tracking-tighter">ARCHIVE</p>
          <p className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-white/40">
            AWAITING INPUT...
          </p>
          <p className="text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground/30 mt-4 max-w-[200px] mx-auto leading-relaxed">
            SEARCH TITLES, TAGS, AND CORE KNOWLEDGE ENTRIES
          </p>
        </div>
      )}
    </div>
  );
}
