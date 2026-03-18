"use client";

import { useAuth } from "@/lib/auth-context";
import { ApiKeySettings } from "@/components/api-key-settings";
import Image from "next/image";
import { Package, User, LogOut, ChevronRight, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();

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
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 blur-[220px] rounded-full animate-breath-slow" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/2 blur-[200px] rounded-full opacity-30" />
      </div>

      <div className="relative z-10 pt-32 lg:pt-48 pb-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Editorial Header */}
        <header className="mb-24 reveal-up">
           <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl mb-12 group hover:border-primary/40 transition-all duration-700">
              <Shield className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.6em] uppercase text-white/40 group-hover:text-white transition-colors">Identity Architecture</span>
            </div>
            <h1 className="text-6xl lg:text-9xl font-heading tracking-tighter text-white drop-shadow-3xl leading-[0.9] mb-8">
              Vault <br />
              <span className="text-ig-gradient italic font-normal">Configuration.</span>
            </h1>
            <p className="text-xl text-white/20 font-serif italic max-w-2xl leading-relaxed">
              Managing the secure gateways and neural connections of your digital intelligence.
            </p>
        </header>

        <div className="space-y-32">
          {/* Identity Section */}
          <section className="reveal-up stagger-1">
            <div className="flex items-center gap-6 mb-16">
               <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">Personal Identity</h2>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
            </div>
            
            <div className="velvet-card p-10 lg:p-16 relative overflow-hidden group">
              <div className="absolute inset-0 shimmer-border opacity-5 pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="w-32 lg:w-48 h-32 lg:h-48 rounded-full bg-white/[0.02] border-[6px] border-white/5 flex items-center justify-center overflow-hidden shadow-3xl relative z-10 group-hover:scale-105 transition-transform duration-700">
                      {user?.imageUrl ? (
                        <Image 
                          src={user.imageUrl} 
                          alt="Profile" 
                          width={192} 
                          height={192} 
                          className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                        />
                      ) : (
                        <User className="w-16 h-16 text-white/10" />
                      )}
                    </div>
                  </div>

                  <div className="text-center lg:text-left space-y-4 pt-4">
                    <h3 className="text-4xl lg:text-6xl font-heading text-white tracking-tighter drop-shadow-lg">{user?.name || "Neural Entity"}</h3>
                    <p className="text-[12px] lg:text-sm text-white/20 font-mono tracking-[0.4em] uppercase">{user?.email}</p>
                    
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-6">
                      <div className="px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(225,48,108,0.2)]">Level 4 Clearance</div>
                      <div className="px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Signature Series</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => logout()}
                  className="group relative py-6 px-12 rounded-[2rem] bg-white text-background text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 hover:bg-destructive hover:text-white hover:tracking-[0.6em] active:scale-95 shadow-2xl overflow-hidden self-center"
                >
                  <div className="absolute inset-0 shimmer-border opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-4">
                    <LogOut className="w-4 h-4" />
                    Terminate Session
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Intelligence Section */}
          <section className="reveal-up stagger-2">
            <div className="flex items-center gap-6 mb-16">
               <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">Intelligence Bridges</h2>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
            </div>
            <div className="relative group p-1 rounded-[3.5rem] bg-gradient-to-br from-white/5 to-transparent shadow-3xl">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
              <ApiKeySettings initialSettings={user?.aiSettings} />
            </div>
          </section>

          {/* Infrastructure Section */}
          <section className="reveal-up stagger-3 pb-40">
            <div className="flex items-center gap-6 mb-16">
               <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.8em]">Infrastructure Core</h2>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] to-transparent" />
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="velvet-card p-12 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 shimmer-border opacity-5 pointer-events-none" />
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <h4 className="text-2xl font-heading text-white tracking-tight mb-2">Neural Link Sync</h4>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-mono italic">Architecture: Encrypted Quantum Tunnel</p>
              </div>

              <div className="velvet-card p-12 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 shimmer-border opacity-5 pointer-events-none" />
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform duration-700 group-hover:text-primary">
                    <Database className="w-7 h-7" />
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/10 group-hover:text-primary transition-colors">
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <h4 className="text-2xl font-heading text-white tracking-tight mb-2">Synthetic Memory</h4>
                <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-mono italic">Provider: Cerebro-X Cloud Network</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-[1.5em] text-white">Sophia OS // Vault Master Redesign v9.0</p>
      </footer>
    </div>
  );
}
