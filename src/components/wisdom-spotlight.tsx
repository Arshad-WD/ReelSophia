"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Highlight {
  id: string;
  title: string;
  preview: string;
}

export function WisdomSpotlight() {
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHighlight() {
      try {
        const res = await fetch("/api/reels?limit=5&status=COMPLETED");
        if (res.ok) {
          const data = await res.json();
          if (data.reels?.length > 0) {
            const selected = data.reels[Math.floor(Math.random() * data.reels.length)];
            setHighlight({
              id: selected.id,
              title: selected.title || "Knowledge Entry",
              preview: selected.summary?.slice(0, 180) || "Extracted knowledge ready to explore.",
            });
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchHighlight();
  }, []);

  if (loading || !highlight) return null;

  return (
    <div className="reveal-up">
      <Link href={`/note/${highlight.id}`} className="group block">
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-300">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[200px] brand-gradient opacity-[0.06] blur-[80px] rounded-full pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-500" />

          <div className="relative p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Featured</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white/80 group-hover:text-white transition-colors mb-1 truncate">
                {highlight.title}
              </h3>
              <p className="text-sm text-white/35 leading-relaxed line-clamp-2 group-hover:text-white/50 transition-colors">
                {highlight.preview}
              </p>
            </div>

            <div className="flex items-center gap-2 text-primary/60 group-hover:text-primary transition-colors shrink-0">
              <span className="text-xs font-semibold">Read</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
