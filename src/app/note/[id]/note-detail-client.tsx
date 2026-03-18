"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  ArrowLeft, ExternalLink, Trash2, Target, Wrench,
  BookOpen, Sparkles, Zap, Clock, MoreVertical, ChevronDown
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

export default function NoteDetailClient({ initialReel }: NoteDetailClientProps) {
  const router = useRouter();
  const [reel] = useState<Reel>(initialReel);
  const [showTranscript, setShowTranscript] = useState(false);

  const deleteReel = async () => {
    if (!confirm("Discard this intelligence entry?")) return;
    try {
      const res = await fetch(`/api/reels/${reel.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Entry Discarded");
        router.push("/library");
      }
    } catch {
      toast.error("Failed to discard");
    }
  };

  const isProcessing = reel.status !== "COMPLETED" && reel.status !== "FAILED";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden neural-field">
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
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full animate-breath-slow" />
      </div>

      <div className="relative z-10 pt-10 pb-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Floating Navigation Command */}
        <nav className="flex items-center justify-between mb-20 reveal-up">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-4 py-2 px-6 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500"
          >
            <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover:text-white transition-colors">Return to Library</span>
          </button>

          <div className="flex items-center gap-4">
            <a
              href={reel.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 py-2 px-6 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl hover:bg-primary/20 transition-all duration-500"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">View Source</span>
              <ExternalLink className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="w-10 h-10 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-xl flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/30 transition-all outline-none">
                  <MoreVertical className="w-4 h-4 text-white/20" />
                </button>
              } />
              <DropdownMenuContent align="end" className="velvet-card border-white/10 p-2 min-w-[180px] bg-background/90 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
                <DropdownMenuItem
                  onClick={deleteReel}
                  className="text-destructive text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-destructive/10 py-3 px-4 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard Entry
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Cinematic Header */}
        <header className="mb-24 reveal-up stagger-1">
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[8px] font-bold uppercase tracking-[0.5em]">
              {reel.platform} Entity
            </div>
            {reel.folder && (
              <div className="px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-white/40 text-[8px] font-bold uppercase tracking-[0.5em] flex items-center gap-2">
                <span className="text-[10px]">{reel.folder.icon || "📁"}</span>
                {reel.folder.name}
              </div>
            )}
            <div className="flex items-center gap-2 text-white/20 text-[8px] font-bold uppercase tracking-[0.5em] ml-2">
              <Clock className="w-3.5 h-3.5 opacity-50" />
              <span suppressHydrationWarning>
                {new Date(reel.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-heading tracking-tighter text-white mb-8 leading-[0.95] drop-shadow-3xl max-w-5xl">
            {reel.title || "Untitled Intelligence"}
          </h1>

          {reel.shortExplanation && (
            <p className="text-xl lg:text-2xl text-white/30 font-serif italic max-w-3xl leading-relaxed border-l-2 border-primary/20 pl-8 ml-2">
              {reel.shortExplanation}
            </p>
          )}
        </header>

        {/* Processing State Overlay */}
        {isProcessing && (
          <section className="mb-24 reveal-up">
            <div className="velvet-card p-12 border-primary/20 bg-primary/[0.02]">
              <ProcessingStatus
                status={reel.job?.status || reel.status}
                progress={reel.job?.progress}
                error={reel.job?.error}
                className="max-w-2xl mx-auto"
              />
            </div>
          </section>
        )}

        {/* Editorial Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Main Dossier Column */}
          <div className="lg:col-span-8 space-y-20 reveal-up stagger-2">
            
            {/* Core Synthesis (Main Idea) */}
            {reel.mainIdea && (
              <section className="relative">
                <div className="absolute -left-12 top-0 h-full w-[1px] bg-gradient-to-b from-primary/40 to-transparent hidden lg:block" />
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.6em]">Core Synthesis</h2>
                  </div>
                  <div className="velvet-card p-10 lg:p-14 bg-white/[0.01] border-white/[0.03] shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 shimmer-border opacity-10 pointer-events-none" />
                     <p className="text-2xl lg:text-3xl font-heading text-white leading-tight drop-shadow-lg">
                       {reel.mainIdea}
                     </p>
                  </div>
                </div>
              </section>
            )}

            {/* Strategic Intel (Key Points) */}
            {reel.keyPoints.length > 0 && (
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <Target className="w-5 h-5 text-white/20" />
                  <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.6em]">Strategic Intel</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {reel.keyPoints.map((point, i) => (
                    <div key={i} className="group flex gap-8 p-10 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-primary/20 hover:bg-white/[0.02] transition-all duration-700 relative overflow-hidden">
                      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-primary animate-parallax-hero opacity-0 group-hover:opacity-20 transition-opacity" />
                      <span className="text-3xl font-heading text-primary/10 group-hover:text-primary transition-all duration-700 shrink-0 italic">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <p className="text-lg text-white/40 group-hover:text-white transition-all duration-700 leading-relaxed font-serif italic">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Tactical Sidebar */}
          <div className="lg:col-span-4 space-y-16 reveal-up stagger-3">
            
            {/* Tactical Directives (Actionable Tips) */}
            {reel.actionableTips.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.6em]">Tactical Directives</h2>
                </div>
                <div className="space-y-4">
                  {reel.actionableTips.map((tip, i) => (
                    <div key={i} className="velvet-card p-6 bg-primary/[0.02] border-primary/10 group hover:bg-primary/5 transition-all duration-700 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-[1px] bg-primary opacity-30" />
                      <p className="text-sm font-bold text-white leading-relaxed group-hover:pl-2 transition-all duration-700">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Semantic Matrix (Tools & Concepts) */}
            {reel.toolsConcepts.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <Wrench className="w-5 h-5 text-white/20" />
                  <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.6em]">Semantic Matrix</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {reel.toolsConcepts.map((tool) => (
                    <span key={tool} className="px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:border-primary/40 hover:text-primary transition-all duration-500 cursor-default">
                      {tool}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Metadata Ledger */}
            <section className="space-y-8 pt-8 border-t border-white/5">
               <div className="space-y-4">
                  <div className="flex justify-between items-center opacity-20">
                    <span className="text-[8px] font-mono uppercase tracking-[0.5em]">Entity ID</span>
                    <span className="text-[8px] font-mono tracking-widest uppercase">{reel.id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-4">
                    {reel.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-bold text-primary/30 uppercase tracking-[0.2em] hover:text-primary transition-colors cursor-pointer">
                        #{tag}
                      </span>
                    ))}
                  </div>
               </div>
            </section>
          </div>
        </div>

        {/* Intelligence Stream (Transcript) */}
        {reel.transcript && (
          <section className="mt-40 pt-20 border-t border-white/5 reveal-up">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full velvet-card p-10 text-left flex items-center justify-between group transition-all duration-700 hover:border-primary/20 bg-white/[0.01]"
            >
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                  <BookOpen className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-heading text-white group-hover:text-primary transition-colors mb-1">
                    Intelligence Stream
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Raw transcript data</p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 border border-white/5",
                showTranscript ? "bg-primary border-primary text-background rotate-180" : "bg-white/[0.02] text-white/20"
              )}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>

            {showTranscript && (
              <div className="mt-8 animate-in fade-in slide-in-from-top-10 duration-1000">
                <div className="velvet-card p-14 lg:p-20 font-serif text-lg text-white/30 leading-loose italic whitespace-pre-wrap bg-white/[0.005]">
                  {reel.transcript}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="fixed bottom-10 left-10 opacity-10 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-[1.5em] text-white">Sophia OS // Ledger Entry v4.2</p>
      </footer>
    </div>
  );
}
