"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Highlight {
  id: string;
  title: string;
  mainIdea: string;
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
          if (data.reels && data.reels.length > 0) {
            const selected = data.reels[Math.floor(Math.random() * data.reels.length)];
            setHighlight({
              id: selected.id,
              title: selected.title,
              mainIdea: selected.summary?.slice(0, 150) + "..." || "Archived wisdom awaiting your activation.",
            });
          }
        }
      } catch (err) {
        console.error("Pulse fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlight();
  }, []);

  if (loading || !highlight) return null;

  return (
    <div className="w-full relative group reveal-up mb-40 lg:mb-64">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-[4rem] blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
      
      <div className="relative velvet-card border-white/10 bg-card/40 backdrop-blur-3xl p-12 lg:p-24 overflow-hidden rounded-[4rem]">
        {/* Dynamic Abstract Visual */}
        <div className="absolute top-0 right-0 w-[50%] h-full opacity-10 group-hover:opacity-20 transition-all duration-1000 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] ig-gradient blur-[100px] rounded-full animate-breath-slow" />
        </div>

        <div className="max-w-5xl relative z-10">
          <div className="flex items-center gap-6 mb-12 stagger-1">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.5em] uppercase text-primary/60">Neural Spotlight</span>
          </div>

          <h2 className="text-4xl lg:text-7xl font-heading mb-12 leading-[0.95] tracking-tighter text-white/90 group-hover:text-white transition-all duration-1000 text-balance stagger-2">
            {highlight.title}
          </h2>

          <p className="text-xl lg:text-3xl text-white/20 italic leading-relaxed mb-16 lg:mb-24 font-sans border-l border-primary/30 pl-10 ml-2 stagger-3">
            "{highlight.mainIdea}"
          </p>

          <Link href={`/note/${highlight.id}`} className="group/btn inline-flex items-center gap-8 stagger-4 text-xs font-bold uppercase tracking-[0.4em] text-primary/80 hover:text-white transition-all duration-700">
            Activate Full Synthesis 
            <div className="w-16 h-16 rounded-full border border-primary/10 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:border-primary group-hover/btn:scale-110 group-hover/btn:rotate-[-45deg] transition-all duration-700 shadow-3xl">
              <ArrowRight className="w-8 h-8 group-hover/btn:text-background transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
