"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, Instagram, Youtube, Scroll, Fingerprint, Layers } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingSection() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
      
      containerRef.current.style.setProperty("--mouse-x", `${x}%`);
      containerRef.current.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden neural-field"
      style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as any}
    >
      {/* ── Ultra-Premium Background Architecture ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.1] mix-blend-screen scale-[1.1] transition-transform duration-[2000ms] ease-out"
          style={{ 
            backgroundImage: "url('/images/neural-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translate(${(mousePosition.x - 50) * -0.05}px, ${(mousePosition.y - 50) * -0.05}px) scale(1.1)`
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] ig-gradient opacity-[0.05] blur-[160px] rounded-full animate-breath-slow" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[600px] bg-primary/20 blur-[140px] rounded-full opacity-20 animate-pulse" />
      </div>

      {/* ── Immersive Hero Section ── */}
      <section className="relative z-10 w-full max-w-[1700px] px-8 lg:px-24 flex flex-col items-center text-center">
        <div className="flex flex-col items-center gap-12 lg:gap-24">
          
          <div className="reveal-up stagger-1">
            <div className="group relative px-8 py-3 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl transition-all duration-700 hover:border-primary/40 active:scale-95 shadow-3xl overflow-hidden">
              <div className="absolute inset-0 shimmer-border opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-white/40 group-hover:text-primary transition-colors">Neural Sync v4.1 Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-10 lg:space-y-16 reveal-up stagger-2">
            <h1 className="text-[3.5rem] sm:text-[6rem] lg:text-[12rem] xl:text-[15rem] font-heading leading-[0.8] tracking-tighter text-white drop-shadow-3xl">
              Knowledge <br />
              <span 
                className="text-ig-gradient font-normal italic inline-block p-4"
                style={{ 
                  transform: `translate(${(mousePosition.x - 50) * 0.1}px, ${(mousePosition.y - 50) * 0.05}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                Synthesized.
              </span>
            </h1>
            
            <p className="max-w-4xl mx-auto text-xl lg:text-3xl text-white/30 font-sans leading-relaxed italic text-balance mb-12">
              Transmuting the ephemeral chaos of social media into a structured <span className="text-white/60">monument of personal intelligence.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-10 lg:gap-16 reveal-up stagger-3 pt-8">
            <Link 
              href="/sign-up" 
              className="group relative px-10 py-6 sm:px-20 sm:py-10 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white text-background text-[10px] sm:text-sm font-bold uppercase tracking-[0.4em] transition-all duration-700 hover:bg-primary active:scale-95 shadow-[0_40px_80px_-20px_rgba(255,255,255,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 shimmer-border opacity-30 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-5 relative z-10">
                 <Sparkles className="w-5 h-5 group-hover:rotate-[30deg] transition-all duration-1000" />
                 Initiate Architect
              </div>
            </Link>

            <Link 
              href="/sign-in" 
              className="group flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.5em] text-white/30 hover:text-white transition-all duration-700"
            >
              System Access
              <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center transition-all duration-700 group-hover:bg-white/5 group-hover:border-white/20 group-hover:scale-110 active:scale-90">
                <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-white transition-colors" />
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-48 lg:mt-72 grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-16 w-full reveal-up stagger-4 max-w-[1500px]">
           {[
             { icon: Instagram, label: "Capture", desc: "Instantly archive any spark of wisdom from Instagram Reels." },
             { icon: Fingerprint, label: "Synthesize", desc: "AI-driven extraction of core insights and architectural concepts." },
             { icon: Layers, label: "Archive", desc: "Build your permanent library of cross-platform knowledge." }
           ].map((feature, idx) => (
             <div key={idx} className="group velvet-card p-14 space-y-10 text-left border-white/[0.03] transition-all duration-1000 hover:border-primary/20 hover:-translate-y-4">
               <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:border-primary shadow-2xl overflow-hidden relative">
                  <div className="absolute inset-0 shimmer-border opacity-0 group-hover:opacity-100 transition-opacity" />
                  <feature.icon className="w-6 h-6 text-white/20 group-hover:text-background transition-colors relative z-10" />
               </div>
               <div className="space-y-6">
                 <h3 className="text-2xl font-heading text-white/80 group-hover:text-white transition-colors uppercase tracking-[0.2em]">{feature.label}</h3>
                 <p className="text-lg text-white/20 italic font-sans leading-relaxed group-hover:text-white/40 transition-colors">{feature.desc}</p>
               </div>
               <div className="h-[1px] w-0 bg-primary group-hover:w-full transition-all duration-1000" />
             </div>
           ))}
        </div>
      </section>

      <footer className="relative z-10 mt-40 lg:mt-64 pb-20 reveal-up stagger-5 opacity-40">
        <div className="flex flex-col items-center gap-10">
           <div className="flex items-center gap-14 text-[11px] font-bold tracking-[0.6em] uppercase text-white/20 transition-all hover:gap-20 hover:text-white/50 cursor-pointer">
              <span>Security</span>
              <span>Privacy</span>
              <span>Open Source</span>
           </div>
           <p className="font-mono text-[10px] text-white/10 uppercase tracking-[0.8em]">© MMXXVI REELSOPHIA_INSTITUTE</p>
        </div>
      </footer>
    </div>
  );
}
