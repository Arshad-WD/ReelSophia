"use client";

import { useAuth } from "@/lib/auth-context";
import { ApiKeySettings } from "@/components/api-key-settings";
import { Package, User, LogOut, ChevronRight, Shield, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="pt-24 lg:pt-40 pb-32 lg:pb-48 px-4 lg:px-24 max-w-5xl mx-auto min-h-screen animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Editorial Header */}
      <header className="mb-12 lg:mb-24 relative px-2 lg:px-0">
        <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
          <div className="h-[1px] w-8 lg:w-12 bg-primary/30" />
          <span className="text-[9px] lg:text-[10px] font-bold tracking-[0.5em] uppercase text-primary/60">Vault Configuration</span>
        </div>
        <h1 className="text-4xl lg:text-9xl font-heading mb-4 lg:mb-10 tracking-tighter text-foreground">
          Settings
        </h1>
        <p className="text-sm lg:text-2xl text-muted-foreground/40 italic font-sans max-w-xl leading-relaxed">
          Refine your digital ecosystem and manage the secure gateways of your intelligence.
        </p>
      </header>

      <div className="space-y-12 lg:space-y-20 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
        {/* Profile Card Section */}
        <section className="px-2 lg:px-0">
          <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
            <h2 className="text-lg lg:text-3xl font-heading text-foreground tracking-tight">Personal Identity</h2>
            <div className="h-px flex-1 bg-white/[0.03]" />
          </div>
          
          <div className="velvet-card p-6 lg:p-10 border border-white/5 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8">
                <div className="w-24 lg:w-32 h-24 lg:h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-4 ring-white/5 shadow-2xl">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 lg:w-14 h-10 lg:h-14 text-primary/40" />
                  )}
                </div>
                <div className="text-center sm:text-left pt-2">
                  <h3 className="text-2xl lg:text-4xl font-heading text-foreground mb-2">{user?.name || "Member"}</h3>
                  <p className="text-[10px] lg:text-xs text-muted-foreground/40 font-mono tracking-widest uppercase mb-6">{user?.email}</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-[9px] font-bold text-primary uppercase tracking-tighter">Verified Access</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Legacy Archive</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => logout()}
                className="btn-signature group py-4 lg:py-5 px-8 lg:px-10 bg-white/[0.03] hover:bg-white/[0.1] border-white/5 hover:border-white/10 text-xs shadow-none mt-4 sm:mt-0"
              >
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                Logout Identity
              </button>
            </div>
          </div>
        </section>

        {/* API Section */}
        <section className="px-2 lg:px-0">
          <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
            <h2 className="text-lg lg:text-3xl font-heading text-foreground tracking-tight">Intelligence Bridges</h2>
            <div className="h-px flex-1 bg-white/[0.03]" />
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-primary/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <ApiKeySettings initialSettings={user?.aiSettings} />
          </div>
        </section>

        {/* Security & System Section */}
        <section className="px-2 lg:px-0 pb-12 sm:pb-20">
             <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
                <h2 className="text-lg lg:text-3xl font-heading text-foreground tracking-tight">System Core</h2>
                <div className="h-px flex-1 bg-white/[0.03]" />
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                <div className="velvet-card p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <Shield className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-sm font-bold tracking-tight mb-1 text-foreground">Cloud Sync</h4>
                    <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">Status: Secure Connected</p>
                </div>
                <div className="velvet-card p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <Database className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-sm font-bold tracking-tight mb-1 text-foreground">Intelligence Model</h4>
                    <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">Provider: OpenRouter Hybrid</p>
                </div>
            </div>
        </section>
      </div>

      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[1000px] h-[1000px] bg-primary/1 rounded-full blur-[200px] -z-20 pointer-events-none opacity-50" />
    </div>
  );
}
