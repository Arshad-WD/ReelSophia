"use client";

import { Sparkles, ArrowRight, Youtube, Instagram, Brain, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingSection() {
  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-full max-w-[900px] h-[600px] brand-gradient opacity-[0.1] blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-full max-w-[500px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* ── Top Bar ── */}
      <header className="relative z-20 flex items-center justify-between px-6 lg:px-12 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">ReelSophia</span>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/sign-in"
            className="text-sm font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="btn-primary px-6 py-2.5 text-xs uppercase tracking-widest font-bold"
          >
            Start
          </Link>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-20 lg:py-32">
        <div className="reveal-up">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl mb-10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Technical Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-heading tracking-tight text-white leading-[1.05] mb-8 text-balance">
            Transcribe any video into{" "}
            <span className="text-brand-gradient">deep technical intelligence</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base lg:text-xl text-white/40 leading-relaxed mb-12 text-balance">
            ReelSophia analyzes YouTube and Instagram content to synthesize exhaustive technical breakdowns, implementation guides, and conceptual maps.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
            <Link href="/sign-up" className="btn-primary w-full sm:w-auto px-10 py-5 text-sm uppercase tracking-widest font-bold shadow-2xl shadow-primary/20">
              <Sparkles className="w-5 h-5" />
              Analyze First Video
            </Link>
            <Link
              href="/sign-in"
              className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-5 text-xs uppercase tracking-widest font-bold text-white/30 hover:text-white transition-all"
            >
              Access Vault
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Integrations */}
          <div className="flex items-center justify-center gap-6 text-white/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="flex items-center gap-2.5">
              <Youtube className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">YouTube</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <div className="flex items-center gap-2.5">
              <Instagram className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Instagram</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Capabilities ── */}
      <section className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 reveal-up stagger-3">
          {[
            {
              icon: Brain,
              title: "Conceptual Mapping",
              desc: "Deconstructs complex audio-visual data into structured technical blocks, identifying every tool and technique mentioned.",
            },
            {
              icon: Zap,
              title: "Execution Framework",
              desc: "Converts insights into step-by-step guides, complete with technical specifications and implementation best practices.",
            },
            {
              icon: Layers,
              title: "Intelligent Archive",
              desc: "A centralized, searchable knowledge base that grows with every video processed. Your personal technical encyclopedia.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 lg:p-10 hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                <feature.icon className="w-6 h-6 text-white/40 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-sm text-white/30 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom Section ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-12 px-6">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-30">
            <Brain className="w-5 h-5 text-white" />
            <span className="text-xs font-bold uppercase tracking-widest">ReelSophia Intelligence</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/10 text-center">
            © {new Date().getFullYear()} Distributed Intelligence Network. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/20">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Protocol</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
