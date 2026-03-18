"use client";

import { Loader2, CheckCircle2, AlertCircle, Download, Mic, Sparkles, FileAudio, ArrowRight, Binary, Cpu, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStatusProps {
  status: string;
  progress?: number;
  error?: string | null;
  className?: string;
}

const STATUS_MAP: Record<string, { label: string; subtext: string; icon: React.ElementType; color: string; intensity: string }> = {
  PENDING: { 
    label: "INITIATING_PROTOCOL", 
    subtext: "Securing neural channel to content source...",
    icon: Network, color: "text-white/40", intensity: "opacity-30" 
  },
  DOWNLOADING: { 
    label: "DATA_CAPTURE", 
    subtext: "Ingesting raw visual intelligence stream...",
    icon: Download, color: "text-primary/70", intensity: "opacity-50" 
  },
  EXTRACTING: { 
    label: "SIGNAL_ISOLATION", 
    subtext: "Decoupling high-fidelity acoustic patterns...",
    icon: FileAudio, color: "text-primary/80", intensity: "opacity-60" 
  },
  TRANSCRIBING: { 
    label: "NEURAL_DECODING", 
    subtext: "Transforming speech into semantic structures...",
    icon: Cpu, color: "text-primary/90", intensity: "opacity-80" 
  },
  CLEANING: { 
    label: "ENTROPY_REDUCTION", 
    subtext: "Removing linguistic artifacts and noise...",
    icon: Sparkles, color: "text-primary", intensity: "opacity-100" 
  },
  SUMMARIZING: { 
    label: "SYNTHETIC_COGNITION", 
    subtext: "Condensing intelligence into core insights...",
    icon: Binary, color: "text-primary", intensity: "opacity-100" 
  },
  CATEGORIZING: { 
    label: "Neural Mapping", 
    subtext: "Clustering insights into relevant knowledge sectors...",
    icon: Network, color: "text-primary", intensity: "opacity-100" 
  },
  COMPLETED: { 
    label: "EVOLUTION_COMPLETE", 
    subtext: "Intelligence has been fully synthesized.",
    icon: CheckCircle2, color: "text-green-400", intensity: "opacity-100" 
  },
  FAILED: { 
    label: "PROTOCOL_BREACH", 
    subtext: "Process interrupted by unexpected variables.",
    icon: AlertCircle, color: "text-destructive", intensity: "opacity-100" 
  },
};

export function ProcessingStatus({ status, progress, error, className }: ProcessingStatusProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.PENDING;
  const Icon = config.icon;
  const isAnimated = !["COMPLETED", "FAILED"].includes(status);

  return (
    <div className={cn("relative py-24 flex flex-col items-center justify-center overflow-hidden", className)}>
      {/* ── Neural field visualization ── */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[150px] animate-breath-slow rounded-full" />
      </div>

      <div className="relative w-full max-w-xl group">
        {/* Technical Perimeter */}
        <div className="absolute -inset-10 border border-white/[0.03] rounded-[3rem] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-[1px] bg-primary animate-parallax-hero" />
          <div className="absolute bottom-0 right-0 w-40 h-[1px] bg-primary animate-parallax-hero" style={{ animationDirection: "reverse" }} />
        </div>

        {/* Central Intelligence Core */}
        <div className="flex flex-col items-center justify-center py-20 relative px-6">
          {/* Pulsating Multi-layer Rings */}
          {isAnimated && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-primary/20 animate-pulse-ring" />
              <div className="w-72 h-72 rounded-full border border-primary/10 animate-pulse-ring [animation-delay:0.5s]" />
              <div className="w-96 h-96 rounded-full border border-primary/5 animate-pulse-ring [animation-delay:1s]" />
            </div>
          )}

          <div className={cn(
            "w-28 h-28 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-[100px] border border-white/10 flex items-center justify-center relative z-10 transition-all duration-1000 overflow-hidden",
            isAnimated ? "shadow-[0_0_80px_rgba(255,255,255,0.05)] rotate-3" : "shadow-none"
          )}>
            <div className="absolute inset-0 h-full w-full shimmer-border opacity-20" />
            <Icon className={cn(
              "w-10 h-10 transition-all duration-1000",
              config.color,
              isAnimated && "animate-pulse"
            )} />
          </div>

          <div className="mt-16 text-center space-y-6 max-w-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.8em] uppercase text-white/20 inline-block pl-2">System Phase</span>
              <h2 className={cn(
                "text-4xl sm:text-5xl font-heading tracking-tighter transition-all duration-1000 drop-shadow-2xl",
                config.color
              )}>
                {config.label.split('_').join(' ')}
              </h2>
            </div>
            
            <p className="text-lg text-white/30 font-serif italic leading-relaxed">
              {config.subtext}
            </p>
          </div>
        </div>

        {/* Progress Matrix */}
        {progress !== undefined && progress > 0 && !["COMPLETED", "FAILED"].includes(status) && (
          <div className="mt-12 px-10 space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em]">Optimization Threshold</span>
                <p className="text-xl font-heading text-white italic">{Math.round(progress)}<span className="text-sm font-normal text-white/20 ml-1">%</span></p>
              </div>
              <div className="w-16 h-[1px] bg-white/10 mb-2" />
            </div>
            <div className="relative h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/[0.05]">
              <div
                className="h-full ig-gradient transition-all duration-1000 ease-out shadow-[0_0_30px_rgba(225,48,108,0.5)]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                 <div className="absolute inset-0 w-full animate-shimmer-border opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Breach Alert (Error) */}
        {error && (
          <div className="mt-16 p-8 velvet-card border-destructive/20 bg-destructive/[0.02] relative overflow-hidden group/error">
             <div className="absolute inset-0 shimmer-border opacity-10" />
             <div className="flex items-start gap-6 text-destructive">
               <AlertCircle className="w-6 h-6 mt-1 shrink-0" />
               <div className="space-y-2">
                 <span className="text-[10px] font-bold uppercase tracking-[0.5em]">Protocol Interruption</span>
                 <p className="text-lg font-serif italic opacity-70 leading-relaxed text-white/80">{error}</p>
                 <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] py-3 px-6 rounded-full border border-destructive/30 hover:bg-destructive hover:text-white transition-all duration-500"
                 >
                   Retry Synchronization
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Technical Meta Layout */}
        <div className="mt-20 pt-8 border-t border-white/[0.03] flex justify-between items-center px-2 opacity-30">
           <span className="text-[8px] font-mono tracking-[0.5em] uppercase">Core // Sophia.OS</span>
           <span className="text-[8px] font-mono tracking-[0.5em] uppercase">Lat: 0.002s</span>
        </div>
      </div>
    </div>
  );
}
