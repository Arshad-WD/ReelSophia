"use client";

import { useAuth } from "@/lib/auth-context";
import { ApiKeySettings } from "@/components/api-key-settings";
import Image from "next/image";
import { User, LogOut, ChevronRight, Shield, Database, Settings as SettingsIcon, Activity, Cpu, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen pb-40">
      
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Header Protocol */}
      <header className="max-w-4xl mx-auto mb-20 text-center reveal-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-xl mb-10">
          <SettingsIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">Terminal Preferences</span>
        </div>
        <h1 className="text-5xl lg:text-8xl font-heading tracking-tight text-white mb-8">
          System <span className="text-brand-gradient">Control</span>
        </h1>
        <p className="text-base lg:text-xl text-white/30 max-w-xl mx-auto leading-relaxed text-balance">
          Configure your technical identity, intelligence gateways, and distributed infrastructure parameters.
        </p>
      </header>

      <div className="max-w-5xl mx-auto space-y-16 lg:space-y-24">
        
        {/* Digital Identity Module */}
        <section className="reveal-up stagger-1">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">Identity Module</h2>
          </div>
          
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] p-8 lg:p-14 transition-all hover:bg-white/[0.03] hover:border-white/10">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-gradient-to-b from-transparent via-white to-transparent h-20 w-full animate-scanline" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-3xl bg-[#0A0A0F] border-2 border-white/5 overflow-hidden flex items-center justify-center p-1 shadow-2xl">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-white/[0.02] flex items-center justify-center relative">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <User className="w-12 h-12 text-white/5" />
                    )}
                    {/* Visual Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-40" />
                  </div>
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#050508] border border-white/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h3 className="text-3xl lg:text-4xl font-heading text-white mb-2">{user?.name || "Unclassified User"}</h3>
                  <p className="text-sm text-primary font-mono tracking-tighter opacity-60">{user?.email}</p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">Priority Node Access</div>
                  <div className="px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-widest">Verified DNA</div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-wrap justify-center md:justify-start gap-8">
                  <div>
                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mb-1">Knowledge Capacity</p>
                    <p className="text-sm font-mono text-white/40">Unlimited</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mb-1">Last Sync</p>
                    <p className="text-sm font-mono text-white/40">T-00:14:22</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="group px-8 py-4 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Purge Session
              </button>
            </div>
          </div>
        </section>

        {/* Intelligence Gateways (API) */}
        <section className="reveal-up stagger-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white/40" />
            </div>
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">Intelligence Gateways</h2>
          </div>
          <div className="rounded-[2.5rem] bg-white/[0.015] border border-white/[0.06] p-2 lg:p-4 overflow-hidden">
             <ApiKeySettings initialSettings={user?.aiSettings} />
          </div>
        </section>

        {/* Infrastructure Status */}
        <section className="reveal-up stagger-3">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white/40" />
            </div>
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.4em]">Infrastructure Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-8 hover:bg-white/[0.04] hover:border-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors">Security Protocol</h4>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 font-mono">TLS 1.3 End-to-End</p>
                  </div>
                </div>
                <div className="h-2 w-12 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-white/10 uppercase tracking-widest">
                  <span>Encryption Level</span>
                  <span className="text-emerald-500/50">Optimal</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full">
                  <div className="h-full bg-primary/40 w-[95%] rounded-full" />
                </div>
              </div>
            </div>

            <div className="group rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-8 hover:bg-white/[0.04] hover:border-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-primary transition-colors">Distributed Storage</h4>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1 font-mono">Global Mesh Active</p>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-emerald-500/40 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mb-1">Latency</p>
                  <p className="text-sm font-mono text-emerald-500/70">14ms</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mb-1">Redundancy</p>
                  <p className="text-sm font-mono text-emerald-500/70">3X</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
