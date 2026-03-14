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
    <div className={cn("relative py-20 flex flex-col items-center justify-center overflow-hidden", className)}>
      {/* The Background Neural Field */}
      <div className="absolute inset-0 -z-10 bg-[#07050a]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-breath-glow" />
      </div>

      {/* The Central Monolith UI */}
      <div className="relative w-full max-w-lg animate-neural-float">
        
        {/* Top Header - Technical Spec */}
        <div className="flex justify-between items-end mb-12 px-2 border-b border-white/[0.05] pb-4">
          <div className="flex flex-col gap-1">
             <span className="text-[8px] font-mono tracking-[0.4em] text-white/20 uppercase">Module // Synthesis</span>
             <h3 className="font-heading text-xl italic font-bold tracking-tight text-primary/90">
               Discovery in Progress
             </h3>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Stability: 99.4%</span>
          </div>
        </div>

        {/* The "Brain" - Central Dynamic Icon */}
        <div className="flex flex-col items-center justify-center py-16 relative">
          {/* Pulsing Core Rings */}
          {isAnimated && (
            <>
              <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-pulse-ring" />
              <div className="absolute w-44 h-44 rounded-full border border-primary/10 animate-pulse-ring [animation-delay:1s]" />
              <div className="absolute w-56 h-56 rounded-full border border-primary/5 animate-pulse-ring [animation-delay:2s]" />
            </>
          )}

          <div className={cn(
            "w-24 h-24 rounded-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 flex items-center justify-center relative z-10 transition-all duration-1000",
             isAnimated ? "group-hover:scale-110 shadow-[0_0_50px_rgba(225,48,108,0.2)]" : "shadow-none"
          )}>
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
            <Icon className={cn(
              "w-8 h-8 transition-all duration-700",
              config.color,
              isAnimated && "animate-pulse"
            )} />
          </div>

          <div className="mt-12 text-center space-y-4">
             <div className="flex flex-col items-center gap-1">
               <span className="text-[10px] font-mono tracking-[0.5em] text-white/20 uppercase font-bold">Current Protocol</span>
               <h2 className={cn(
                 "text-3xl font-heading font-black tracking-tighter transition-all duration-700 uppercase",
                 config.color,
                 isAnimated && "animate-glitch-low"
               )}>
                 {config.label}
               </h2>
             </div>
             <p className="max-w-[280px] text-white/40 text-xs font-sans italic leading-relaxed">
               {config.subtext}
             </p>
          </div>
        </div>

        {/* Technical Data Points - Floating around */}
        <div className="absolute top-1/4 -left-12 hidden lg:flex flex-col gap-6 text-white/10 font-mono text-[8px] tracking-widest uppercase origin-left -rotate-90">
          <span>Vector: 0xf42e...</span>
          <span>Sample: High-Fid</span>
        </div>
        <div className="absolute top-1/4 -right-12 hidden lg:flex flex-col gap-6 text-white/10 font-mono text-[8px] tracking-widest uppercase origin-right rotate-90 text-right">
          <span>Lat: 22ms</span>
          <span>Sync: True</span>
        </div>

        {/* The Progress Bar - Futuristic "Dashed" line */}
        {progress !== undefined && progress > 0 && !["COMPLETED", "FAILED"].includes(status) && (
          <div className="mt-16 space-y-3">
            <div className="flex justify-between text-[8px] font-mono text-white/20 tracking-[0.4em] uppercase">
              <span>Optimization</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="relative h-1 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.03]">
              <div
                className="h-full ig-gradient transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(225,48,108,0.4)]"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-12 p-6 bg-destructive/5 border border-destructive/10 rounded-3xl backdrop-blur-xl animate-in fade-in zoom-in duration-500">
             <div className="flex items-start gap-4 text-destructive">
               <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Protocol Failed</span>
                 <p className="text-xs leading-relaxed font-sans opacity-80">{error}</p>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
