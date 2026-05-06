"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  ArrowLeft, ExternalLink, Trash2, BookOpen, Lightbulb,
  Wrench, CheckCircle2, Tag, MoreVertical, ChevronDown,
  Brain, Zap, Target, FileText, Shield, Globe, Cpu,
  Activity, Layers, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Reel {
  id: string;
  title: string | null;
  summary: string | null;
  mainIdea: string | null;
  keyPoints: string[];
  actionableTips: string[];
  toolsConcepts: string[];
  shortExplanation: string | null;
  transcript: string | null;
  tags: string[];
  status: string;
  platform: string;
  sourceUrl: string;
  createdAt: string | Date;
  folder: { id: string; name: string; icon: string | null } | null;
  job: { status: string; progress: number; error: string | null } | null;
}

interface NoteDetailClientProps {
  initialReel: Reel;
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "bg-red-500/10 text-red-400 border-red-500/20",
  instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  tiktok: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function NoteDetailClient({ initialReel }: NoteDetailClientProps) {
  const router = useRouter();
  const [reel] = useState<Reel>(initialReel);
  const [showTranscript, setShowTranscript] = useState(false);
  const [expandedPoint, setExpandedPoint] = useState<number | null>(null);

  const deleteReel = async () => {
    if (!confirm("Permanently remove this intelligence entry?")) return;
    try {
      const res = await fetch(`/api/reels/${reel.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Intelligence purged from archives");
        router.push("/library");
      }
    } catch {
      toast.error("Protocol failed: unable to delete");
    }
  };

  const isProcessing = reel.status !== "COMPLETED" && reel.status !== "FAILED";
  const platformColor = PLATFORM_COLORS[reel.platform] || "bg-white/10 text-white/60 border-white/20";

  return (
    <div className="min-h-screen bg-[#050508] text-foreground pb-32">
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/10 blur-[200px] rounded-full opacity-40" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full pt-6 lg:pt-10">

        {/* ── Top Navigation Protocol ── */}
        <nav className="flex items-center justify-between mb-12 lg:mb-16 reveal-up">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 py-2.5 px-6 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl hover:bg-white/[0.05] hover:border-white/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 group-hover:text-white">Archives</span>
          </button>

          <div className="flex items-center gap-4">
            <a
              href={reel.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 py-2.5 px-6 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all group"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 group-hover:text-primary">Source Protocol</span>
              <ExternalLink className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary" />
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-center hover:bg-white/[0.05] transition-all outline-none">
                <MoreVertical className="w-4 h-4 text-white/20" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="velvet-card border-white/10 p-2 min-w-[200px] bg-[#0A0A0F]/90 backdrop-blur-3xl">
                <DropdownMenuItem
                  onClick={deleteReel}
                  className="text-destructive text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-destructive/10 py-3 px-4 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Purge Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* ── Intelligence Header ── */}
        <header className="mb-16 lg:mb-24 reveal-up stagger-1">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-[0.2em]", platformColor)}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {reel.platform}
            </div>
            {reel.folder && (
              <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="opacity-60">{reel.folder.icon || "📁"}</span>
                {reel.folder.name}
              </div>
            )}
            <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]" suppressHydrationWarning>
              {new Date(reel.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {/* Master Title */}
          <div className="relative">
            <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/5 to-transparent hidden lg:block" />
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-heading tracking-tight text-white leading-[1.05] mb-10 text-balance">
              {reel.title || "Unclassified Intelligence"}
            </h1>
          </div>

          {/* Abstract */}
          {reel.shortExplanation && (
            <div className="max-w-4xl relative">
              <p className="text-lg lg:text-2xl text-white/40 leading-relaxed font-sans text-balance border-l-2 border-primary/20 pl-8 lg:pl-12">
                {reel.shortExplanation}
              </p>
            </div>
          )}
        </header>

        {/* ── Processing Protocol ── */}
        {isProcessing && (
          <section className="mb-16 lg:mb-24 reveal-up">
            <div className="rounded-[2rem] border border-primary/20 bg-primary/[0.02] p-8 lg:p-12 shadow-2xl shadow-primary/5">
              <ProcessingStatus
                status={reel.job?.status || reel.status}
                progress={reel.job?.progress}
                error={reel.job?.error}
                className="max-w-2xl mx-auto"
              />
            </div>
          </section>
        )}

        {/* ── Intelligence Matrix ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* ── Center: Core Intelligence (8 cols) ── */}
          <div className="lg:col-span-8 space-y-12 lg:space-y-20">

            {/* Comprehensive Overview */}
            {reel.mainIdea && (
              <section className="reveal-up stagger-2">
                <div className="flex items-center gap-4 mb-8 lg:mb-10">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-primary uppercase tracking-[0.4em]">Operational Summary</h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">Foundational Intelligence</p>
                  </div>
                </div>
                <div className="group relative rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] p-8 lg:p-14 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Globe className="w-32 h-32 text-white" />
                  </div>
                  <p className="relative z-10 text-white/70 leading-[1.8] text-base lg:text-xl whitespace-pre-line font-light">
                    {reel.mainIdea}
                  </p>
                </div>
              </section>
            )}

            {/* Discovery Nodes (Key Insights) */}
            {reel.keyPoints.length > 0 && (
              <section className="reveal-up stagger-3">
                <div className="flex items-center gap-4 mb-8 lg:mb-10">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">Discovery Nodes</h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">{reel.keyPoints.length} Integrated Points</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {reel.keyPoints.map((point, i) => {
                    const isExpanded = expandedPoint === i;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "group relative rounded-[2rem] transition-all duration-500 overflow-hidden cursor-pointer",
                          isExpanded 
                            ? "bg-white/[0.04] border border-primary/30 shadow-2xl shadow-primary/5" 
                            : "bg-white/[0.015] border border-white/[0.05] hover:bg-white/[0.03] hover:border-white/10"
                        )}
                        onClick={() => setExpandedPoint(isExpanded ? null : i)}
                      >
                        {/* Progress/Scan Line */}
                        <div className={cn(
                          "absolute top-0 left-0 bottom-0 w-[3px] transition-all duration-500",
                          isExpanded ? "bg-primary" : "bg-white/5 group-hover:bg-white/20"
                        )} />

                        <div className="p-7 lg:p-10 flex items-start gap-8">
                          {/* Node ID */}
                          <div className="flex flex-col items-center shrink-0 pt-1">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors",
                              isExpanded ? "text-primary" : "text-white/20"
                            )}>
                              NODE
                            </span>
                            <span className={cn(
                              "text-2xl font-heading leading-none transition-colors",
                              isExpanded ? "text-white" : "text-white/10 group-hover:text-white/30"
                            )}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <div className="flex-1 space-y-6">
                            <p className={cn(
                              "text-white/80 transition-all duration-500 text-base lg:text-xl leading-relaxed font-medium",
                              !isExpanded && "line-clamp-2"
                            )}>
                              {point}
                            </p>

                            {/* Expanded Data Visualization */}
                            {isExpanded && (
                              <div className="pt-8 border-t border-white/5 animate-in fade-in zoom-in-95 duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">Analysis Protocol</h4>
                                    <div className="flex items-center gap-3">
                                      <Activity className="w-4 h-4 text-primary animate-pulse" />
                                      <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[85%] rounded-full" />
                                      </div>
                                      <span className="text-[10px] font-mono text-white/30">85% REL</span>
                                    </div>
                                    <p className="text-xs text-white/30 leading-relaxed italic">
                                      This discovery node represents a high-relevance technical concept extracted and cross-referenced with architectural patterns.
                                    </p>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Internal Reference</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="px-2 py-1 rounded bg-white/5 text-[9px] font-bold text-white/20 uppercase">Core_System</span>
                                      <span className="px-2 py-1 rounded bg-white/5 text-[9px] font-bold text-white/20 uppercase">Efficiency_Optimization</span>
                                      <span className="px-2 py-1 rounded bg-white/5 text-[9px] font-bold text-white/20 uppercase">Ref_Arch</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className={cn(
                            "w-10 h-10 rounded-full border border-white/5 flex items-center justify-center shrink-0 transition-all duration-500",
                            isExpanded ? "bg-primary/20 border-primary/40 rotate-180" : "bg-white/5 group-hover:border-white/20"
                          )}>
                            <ChevronDown className={cn("w-4 h-4", isExpanded ? "text-primary" : "text-white/20")} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Source Transcript Terminal */}
            {reel.transcript && (
              <section className="reveal-up">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">Raw Data Stream</h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">Decrypted Source Transcript</p>
                  </div>
                </div>

                <div className="rounded-[2.5rem] bg-[#0A0A0F] border border-white/[0.08] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05] bg-white/[0.02]">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/20" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                    </div>
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">REELSOPHIA_TERMINAL v2.0</span>
                    <button 
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
                    >
                      {showTranscript ? "COLLAPSE" : "EXPAND STREAM"}
                    </button>
                  </div>
                  
                  <div className={cn(
                    "p-8 lg:p-12 font-mono text-sm leading-[1.8] transition-all duration-700 overflow-hidden",
                    showTranscript ? "max-h-[1200px]" : "max-h-[160px] opacity-40 blur-[1px]"
                  )}>
                    <p className="text-white/40 whitespace-pre-wrap selection:bg-primary selection:text-white">
                      {reel.transcript}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Right: Operational Grid (4 cols) ── */}
          <div className="lg:col-span-4 space-y-12 lg:space-y-16 reveal-up stagger-4">

            {/* Strategic Procedures (Actionable Tips) */}
            {reel.actionableTips.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-primary uppercase tracking-[0.4em]">Strategic Guide</h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">Operational Procedures</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {reel.actionableTips.map((tip, i) => (
                    <div
                      key={i}
                      className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 lg:p-8 transition-all hover:bg-white/[0.04] hover:border-primary/20 group"
                    >
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#050508] border border-white/10 flex items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                      </div>
                      <div className="flex gap-6">
                        <span className="text-[10px] font-bold text-primary/40 pt-1">0{i + 1}</span>
                        <p className="text-sm lg:text-base text-white/60 group-hover:text-white leading-relaxed">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Glossary (Tools & Concepts) */}
            {reel.toolsConcepts.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-white/40" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-[0.4em]">Technical Ledger</h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-1">Identified Entities</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {reel.toolsConcepts.map((item, i) => {
                    const colonIdx = item.indexOf(":");
                    const name = colonIdx > 0 ? item.slice(0, colonIdx).trim() : item;
                    const desc = colonIdx > 0 ? item.slice(colonIdx + 1).trim() : "";
                    return (
                      <div key={i} className="group rounded-[1.5rem] bg-white/[0.015] border border-white/[0.05] p-6 lg:p-8 hover:bg-white/[0.03] transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <Layers className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                          <p className="text-sm font-bold text-white uppercase tracking-wider">{name}</p>
                        </div>
                        {desc && <p className="text-xs lg:text-sm text-white/30 leading-relaxed group-hover:text-white/50 transition-colors">{desc}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Protocol Tags */}
            {reel.tags.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6">Classification Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {reel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.02] text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Metadata Vault */}
            <section className="rounded-[2rem] border border-white/[0.06] bg-white/[0.01] p-8 space-y-6">
              <h3 className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] mb-2">Vault Metadata</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Protocol ID</span>
                  <span className="text-[10px] text-white/30 font-mono tracking-tighter">{reel.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Origin</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">{reel.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Integrity</span>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-emerald-500/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">Verified</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
