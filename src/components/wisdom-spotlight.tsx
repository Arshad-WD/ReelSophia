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
            // Pick a random one from the latest 5
            const selected = data.reels[Math.floor(Math.random() * data.reels.length)];
            setHighlight({
              id: selected.id,
              title: selected.title,
              mainIdea: selected.mainIdea,
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
    <div className="w-full relative group animate-page-entry mb-20 lg:mb-32">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
      
      <div className="relative signature-card border-white/5 bg-card/20 backdrop-blur-3xl p-10 lg:p-16 overflow-hidden">
        {/* Decorative corner icon */}
        <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-20 transition-all duration-1000 rotate-12 group-hover:rotate-0">
          <Quote className="w-32 h-32 text-primary" />
        </div>

        <div className="max-w-4xl relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-primary/60">Insight of the Moment</span>
          </div>

          <h2 className="text-3xl lg:text-6xl font-heading mb-10 leading-[1.05] tracking-tight group-hover:text-primary transition-colors duration-700">
            {highlight.title}
          </h2>

          <p className="text-lg lg:text-2xl text-muted-foreground/40 italic leading-relaxed mb-12 lg:mb-16 font-sans border-l-2 border-primary/20 pl-8 ml-2">
            "{highlight.mainIdea}"
          </p>

          <Link href={`/note/${highlight.id}`} className="group/btn flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em] text-primary hover:text-white transition-all duration-500">
            Dive into full synthesis 
            <div className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:border-primary transition-all duration-500">
              <ArrowRight className="w-5 h-5 group-hover/btn:text-background transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
