"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  ArrowLeft, ExternalLink, Trash2, Target, Wrench,
  BookOpen, Sparkles, Zap, Clock, MoreVertical
} from "lucide-react";
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
    if (!confirm("Delete this reel and its notes?")) return;
    try {
      const res = await fetch(`/api/reels/${reel.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Reel deleted");
        router.push("/library");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const isProcessing = reel.status !== "COMPLETED" && reel.status !== "FAILED";

  return (
    <div className="pt-8 lg:pt-12 pb-32 px-5 lg:px-10 max-w-[1100px] mx-auto min-h-screen animate-in fade-in duration-500">
      {/* Navigation */}
      <nav className="flex items-center justify-between mb-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl velvet-card flex items-center justify-center hover:border-primary/30 transition-all group outline-none"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        <div className="flex items-center gap-2">
          <a
            href={reel.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl velvet-card flex items-center justify-center hover:border-primary/30 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="w-10 h-10 rounded-xl velvet-card flex items-center justify-center hover:border-destructive/30 transition-all outline-none">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            } />
            <DropdownMenuContent align="end" className="velvet-card border-border/50 p-1.5 min-w-[160px]">
              <DropdownMenuItem
                onClick={deleteReel}
                className="text-destructive text-xs cursor-pointer hover:bg-destructive/10 py-2.5 px-3 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Reel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Processing State */}
      {isProcessing && (
        <section className="velvet-card p-8 border-primary/20 bg-primary/5 mb-10 animate-in slide-in-from-top-4">
          <ProcessingStatus
            status={reel.job?.status || reel.status}
            progress={reel.job?.progress}
            error={reel.job?.error}
            className="max-w-md"
          />
        </section>
      )}

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">
            {reel.platform}
          </span>
          {reel.folder && (
            <span className="text-xs text-muted-foreground bg-white/[0.03] px-3 py-1 rounded-lg flex items-center gap-1.5">
              {reel.folder.icon || "📁"} {reel.folder.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1.5" suppressHydrationWarning>
            <Clock className="w-3.5 h-3.5" />
            {new Date(reel.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
          {reel.title || "Untitled Reel"}
        </h1>

        {reel.shortExplanation && (
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            {reel.shortExplanation}
          </p>
        )}
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Idea */}
          {reel.mainIdea && (
            <section className="velvet-card p-8 bg-primary/5 border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Core Insight</h2>
              </div>
              <p className="text-xl font-semibold text-foreground leading-snug pl-5 border-l-2 border-primary/40">
                {reel.mainIdea}
              </p>
            </section>
          )}

          {/* Key Points */}
          {reel.keyPoints.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Target className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Points</h2>
              </div>
              <div className="space-y-3">
                {reel.keyPoints.map((point, i) => (
                  <div key={i} className="velvet-card p-5 group hover:border-primary/20 transition-all">
                    <div className="flex gap-4">
                      <span className="text-sm font-bold text-primary/40 group-hover:text-primary transition-colors mt-0.5">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {point}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actionable Tips */}
          {reel.actionableTips.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Action Steps</h2>
              </div>
              {reel.actionableTips.map((tip, i) => (
                <div key={i} className="velvet-card p-4 bg-primary/5 border-primary/10 group hover:bg-primary/10 transition-all">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {tip}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Tools & Concepts */}
          {reel.toolsConcepts.length > 0 && (
            <section className="velvet-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mentioned</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {reel.toolsConcepts.map((tool) => (
                  <span key={tool} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-border/30 text-xs font-medium text-muted-foreground">
                    {tool}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {reel.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reel.tags.map((tag) => (
                <span key={tag} className="text-xs text-muted-foreground/60 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transcript */}
      {reel.transcript && (
        <section className="mt-16 border-t border-border/30 pt-8">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full velvet-card p-6 text-left flex items-center justify-between group transition-all hover:border-primary/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Full Transcript
                </h3>
                <span className="text-xs text-muted-foreground">Click to {showTranscript ? "hide" : "expand"}</span>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showTranscript ? "bg-primary text-primary-foreground rotate-180" : "bg-white/[0.03] text-muted-foreground"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {showTranscript && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="velvet-card p-8 font-mono text-sm text-muted-foreground leading-loose whitespace-pre-wrap">
                {reel.transcript}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
