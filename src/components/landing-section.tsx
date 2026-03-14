"use client";

import { Sparkles, ArrowRight, Brain, Zap, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingSection() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* ── 1. The Signature Hero ── */}
      <section className="relative pt-32 lg:pt-48 pb-32 px-6 lg:px-24 flex flex-col items-center text-center">
        <div className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[800px] ig-gradient opacity-[0.07] blur-[120px] rounded-full animate-breath-slow" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-12 animate-page-entry">
            <div className="h-[1px] w-8 bg-primary/40" />
            <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/60">Intelligence Series v1.0</span>
            <div className="h-[1px] w-8 bg-primary/40" />
          </div>

          <h1 className="text-[3.5rem] md:text-[6rem] lg:text-[9rem] font-heading leading-[0.85] tracking-tighter text-white mb-12 animate-page-entry [animation-delay:200ms]">
            Knowledge <br />
            <span className="italic font-normal ig-gradient bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.2)]">Architected.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/30 font-sans leading-relaxed italic mb-16 animate-page-entry [animation-delay:400ms]">
            Transforming the ephemeral stream of social media into a structured, permanent library of human achievement and synthesized wisdom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-page-entry [animation-delay:600ms]">
            <Link href="/sign-in" className="btn-signature group px-16 py-7">
              Initialize Access
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Link>
            <Link 
              href="/sign-up" 
              className="px-12 py-5 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-700"
            >
              Request Credentials
            </Link>
          </div>
        </div>

        {/* Floating Specimen Badge (Visual Only) */}
        <div className="mt-32 relative z-10 animate-page-entry [animation-delay:800ms]">
           <div className="signature-card p-1 items-center bg-white/[0.02] border-white/5 backdrop-blur-3xl px-8 py-4 flex gap-6">
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-zinc-800" />
                 ))}
                 <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[8px] font-bold text-background">+8k</div>
              </div>
              <div className="h-4 w-px bg-white/5" />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                Processed <span className="text-white">12,402</span> Specimens
              </p>
           </div>
        </div>
      </section>

      {/* ── 2. The Architectural Pillars ── */}
      <section className="relative py-48 px-6 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-12 mb-32">
            <h2 className="text-3xl lg:text-5xl font-heading text-white whitespace-nowrap">Core Protocols</h2>
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <FeatureCard 
              icon={<Brain className="w-8 h-8" />}
              title="Neural Synthesis"
              description="Our AI engine deconstructs video content into its fundamental atomic insights, preserving the essence while removing the noise."
              delay="0ms"
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Instant Acquisition"
              description="Capturing wisdom occurs in milliseconds. The moment an insight is shared, it is archived into your neural network."
              delay="200ms"
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Archival Integrity"
              description="Your knowledge base is private, secured by industrial-grade encryption, and organized for lifelong accessibility."
              delay="400ms"
            />
          </div>
        </div>
      </section>

      {/* ── 3. Call to Action ── */}
      <section className="relative py-64 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-150 animate-breath-glow" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-heading text-white mb-12 tracking-tighter">
            Stop Scrolling. <br />
            <span className="italic font-normal text-primary">Start Building.</span>
          </h2>
          <p className="text-lg text-white/20 italic mb-20 max-w-xl mx-auto leading-relaxed">
            The era of ephemeral content is over. Begin your journey of architected knowledge today.
          </p>
          <Link href="/sign-up" className="btn-signature inline-flex gap-8 group">
            Establish Your Legacy
            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-24 px-6 lg:px-24 border-t border-white/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex flex-col items-center md:items-start gap-4">
             <h3 className="text-xl font-heading text-white">Reel<span className="text-primary italic font-normal">Sophia</span></h3>
             <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/10">© 2026 Jenix WebLancer. All Rights Reserved.</p>
           </div>
           <div className="flex gap-12">
             <FooterLink label="Privacy" />
             <FooterLink label="Security" />
             <FooterLink label="Terms" />
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
  return (
    <div className={cn(
      "signature-card p-12 flex flex-col gap-8 group hover:bg-white/[0.04] transition-all duration-700 animate-page-entry",
      "rounded-[3.5rem] border-white/5 backdrop-blur-xl"
    )} style={{ animationDelay: delay }}>
      <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-background transition-all duration-700 shadow-2xl">
        {icon}
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-heading text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-white/30 leading-relaxed italic group-hover:text-white/60 transition-colors font-sans">
          {description}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-700">
        System Protocol Alpha <div className="h-px flex-1 bg-primary/20" />
      </div>
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 hover:text-white cursor-pointer transition-colors">
      {label}
    </span>
  );
}
