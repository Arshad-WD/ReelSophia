"use client";

import { useState, useCallback, useEffect } from "react";
import { NoteCard } from "@/components/note-card";
import { Search as SearchIcon, X, Database, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
        setResults(data.result || data.results || []);
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
    <div className="min-h-screen bg-background text-white relative overflow-hidden neural-field">
      {/* ── Ultra-Premium Background Architecture ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen scale-[1.1]"
          style={{ 
            backgroundImage: "url('/images/neural-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-primary/5 blur-[200px] rounded-full animate-breath-slow" />
      </div>

      <div className="relative z-10 pt-32 lg:pt-48 pb-40 px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Editorial Header */}
        <header className="mb-20 reveal-up">
           <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-8 group hover:border-primary/40 transition-all duration-700">
              <SearchIcon className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-white/40 group-hover:text-white transition-colors">Neural Discovery</span>
            </div>
            <h1 className="text-6xl lg:text-9xl font-heading tracking-tighter text-white drop-shadow-3xl leading-[0.9] mb-8">
              Intelligence <br />
              <span className="text-ig-gradient italic font-normal">Synthesis.</span>
            </h1>
        </header>

        {/* High-End Search Interface */}
        <div className="mb-32 reveal-up stagger-1">
          <div className="relative group max-w-4xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
            <div className="relative">
              <SearchIcon className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 text-white/10 group-focus-within:text-primary transition-all duration-700 z-10" />
              <input
                type="search"
                placeholder="Query the Archive..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-24 lg:h-32 velvet-card bg-white/[0.02] border-white/5 focus:border-primary/40 transition-all pl-24 pr-24 text-2xl lg:text-4xl font-serif italic text-white placeholder:text-white/5 outline-none rounded-[2.5rem] shadow-3xl"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/[0.05] hover:bg-destructive/20 flex items-center justify-center text-white/30 hover:text-white transition-all z-10 group/clear"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Architecture */}
        <div className="space-y-20">
          {loading && (
            <div className="flex flex-col items-center justify-center py-40 reveal-up">
              <div className="w-24 h-[2px] bg-white/[0.05] relative overflow-hidden rounded-full mb-8">
                <div className="absolute inset-0 bg-primary animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)" }} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-primary animate-pulse">Scanning Neural Paths</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="velvet-card p-32 text-center relative overflow-hidden group reveal-up">
              <div className="absolute inset-0 shimmer-border opacity-10 pointer-events-none" />
              <SearchIcon className="w-20 h-20 text-white/5 mx-auto mb-10 animate-float" />
              <h3 className="text-3xl font-heading mb-4 text-white tracking-tight">Zero Matches Found</h3>
              <p className="text-lg text-white/20 font-serif italic max-w-md mx-auto">
                The term &quot;{query}&quot; has no archival footprint in your current sector.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <section className="reveal-up">
              <div className="flex items-center gap-8 mb-16">
                 <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">
                   {results.length} Identity Match{results.length !== 1 ? "es" : ""}
                 </h2>
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
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
            <div className="py-32 text-center reveal-up">
              <Database className="w-24 h-24 text-white/[0.03] mx-auto mb-12 animate-float filter blur-[1px]" />
              <div className="space-y-6 max-w-2xl mx-auto">
                 <p className="text-2xl font-serif italic text-white/20 leading-relaxed">
                   Enter archival coordinates or keywords to synthesize insights from your deep discovery network.
                 </p>
                 <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em] text-white/5">
                    <span>Transcripts</span>
                    <div className="w-1 h-1 rounded-full bg-white/5" />
                    <span>Summaries</span>
                    <div className="w-1 h-1 rounded-full bg-white/5" />
                    <span>Metatags</span>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-[1.5em] text-white">Sophia OS // Search Terminal v4.0</p>
      </footer>
    </div>
  );
}
