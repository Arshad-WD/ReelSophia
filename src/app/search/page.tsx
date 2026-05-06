"use client";

import { useState, useCallback, useEffect } from "react";
import { NoteCard } from "@/components/note-card";
import { Search as SearchIcon, X, Database, Sparkles, Command, Activity, Zap, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  status: string;
  platform: string;
  createdAt: string;
  folder: { id: string; name: string; icon: string | null } | null;
  job: { status: string; progress: number; error: string | null } | null;
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
    <div className="min-h-screen pb-40">
      
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Header Protocol */}
      <header className="max-w-4xl mx-auto mb-16 lg:mb-24 text-center reveal-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl mb-10">
          <Command className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/80">Query Protocol active</span>
        </div>
        <h1 className="text-5xl lg:text-8xl font-heading tracking-tight text-white mb-8 leading-[1] text-balance">
          Query <span className="text-brand-gradient">Archives</span>
        </h1>
        <p className="text-base lg:text-xl text-white/30 max-w-2xl mx-auto leading-relaxed text-balance">
          Access your distributed knowledge network. Query by concept, tool, or technical entity for instant retrieval.
        </p>
      </header>

      {/* ── Query Console ── */}
      <div className="max-w-4xl mx-auto mb-20 lg:mb-32 reveal-up stagger-1">
        <div className="relative group">
          {/* Immersive Focus Glow */}
          <div className="absolute inset-x-0 -top-10 -bottom-10 bg-primary/10 blur-[100px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/[0.08] p-2 transition-all duration-500 group-focus-within:border-primary/40 group-focus-within:bg-white/[0.04]">
            <div className="relative flex items-center">
              <div className="absolute left-6 w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-focus-within:border-primary/20 transition-all">
                <SearchIcon className="w-6 h-6 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="search"
                placeholder="Target entity, technique, or architecture…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-20 bg-transparent rounded-[1.5rem] pl-22 pr-16 text-xl lg:text-2xl text-white outline-none transition-all placeholder:text-white/5 font-mono"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); setSearched(false); }}
                  className="absolute right-6 p-3 rounded-xl bg-white/5 hover:bg-destructive/10 text-white/20 hover:text-destructive transition-all group/close"
                >
                  <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform" />
                </button>
              )}
            </div>
            {/* Structural Scanline */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
          </div>
          
          {/* Quick Stats Overlay */}
          <div className="mt-6 flex items-center justify-center gap-8 opacity-20 group-focus-within:opacity-60 transition-opacity">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Low Latency</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white">Full-Text Indexing</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Result Ledger ── */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 reveal-up">
            <div className="relative mb-12">
               <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
               <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
            </div>
            <h3 className="text-xs font-bold tracking-[0.5em] uppercase text-primary animate-pulse">Scanning Archive Sectors…</h3>
          </div>
        ) : searched && results.length === 0 ? (
          <div className="relative py-32 rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] overflow-hidden reveal-up">
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-40 animate-scanline" />
            <div className="relative z-10 text-center space-y-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white/10" />
              </div>
              <div>
                <h3 className="text-3xl font-heading text-white mb-2">Zero Matches Identified</h3>
                <p className="text-sm text-white/20 uppercase tracking-widest font-mono">Status: No results for query sequence</p>
              </div>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="reveal-up">
            <div className="flex items-center gap-6 mb-12">
              <div className="px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">
                  {results.length} Entities Located
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                  jobProgress={reel.job?.progress}
                  jobError={reel.job?.error}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-32 text-center reveal-up opacity-40">
            <Sparkles className="w-16 h-16 text-white/5 mx-auto mb-10 animate-pulse" />
            <p className="text-2xl text-white/20 italic text-balance font-heading font-light max-w-xl mx-auto">
              Awaiting query sequence. Initiate a search to retrieve synthesized intelligence from your private library.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
