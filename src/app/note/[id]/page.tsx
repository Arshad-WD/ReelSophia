"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessingStatus } from "@/components/processing-status";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Lightbulb,
  Target,
  Wrench,
  FileText,
  BookOpen,
  MoreVertical,
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
  createdAt: string;
  folder: { id: string; name: string; icon: string | null } | null;
  job: { status: string; progress: number; error: string | null } | null;
}

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    async function fetchReel() {
      try {
        const res = await fetch(`/api/reels/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setReel(data.reel);
        } else {
          toast.error("Note not found");
          router.push("/library");
        }
      } catch {
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    }
    fetchReel();
  }, [params.id, router]);

  const deleteReel = async () => {
    if (!confirm("Delete this note permanently?")) return;
    try {
      const res = await fetch(`/api/reels/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note deleted");
        router.push("/library");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="px-5 pt-6 max-w-md mx-auto">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-24 rounded-2xl mb-4" />
        <Skeleton className="h-40 rounded-2xl mb-4" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!reel) return null;

  const isProcessing = reel.status !== "COMPLETED" && reel.status !== "FAILED";

  return (
    <div className="px-5 pt-8 max-w-md mx-auto pb-24 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-3">
          <a
            href={reel.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black hover:bg-white/5 transition-colors"
            title="View Source"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black hover:border-destructive/40 transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="journal-card border-white/10 bg-black p-2 min-w-[160px]">
              <DropdownMenuItem onClick={deleteReel} className="text-destructive font-sans font-bold text-xs uppercase cursor-pointer hover:bg-white/5 py-3">
                <Trash2 className="w-4 h-4 mr-2" />
                Confirm Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="journal-card p-6 border-primary/20 bg-primary/5 mb-8">
          <ProcessingStatus
            status={reel.job?.status || reel.status}
            progress={reel.job?.progress}
            error={reel.job?.error}
          />
        </div>
      )}

      {/* Title & Meta */}
      <div className="mb-12">
        <div className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-muted-foreground inline-block mb-4">
          ENTRY #{reel.id.slice(-4).toUpperCase()}
        </div>
        <h1 className="text-4xl font-sans font-extrabold tracking-tight mb-6 text-white leading-[1.1] italic uppercase underline decoration-primary/40 underline-offset-8">
           {reel.title || "Untitled Insight"}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-sans font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
          {reel.folder && (
            <span className="flex items-center gap-2 text-primary">
              {reel.folder.icon || "📁"} {reel.folder.name}
            </span>
          )}
          <span>{reel.platform} SOURCE</span>
          <span>{new Date(reel.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Idea */}
      {reel.mainIdea && (
        <div className="journal-card p-8 mb-8 bg-[#050505]">
          <h2 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 flex items-center gap-3">
             <span className="w-8 h-[1px] bg-white/10" /> CORE INSIGHT
          </h2>
          <p className="text-xl font-sans font-semibold leading-relaxed text-white/90 italic border-l-2 border-primary pl-6">{reel.mainIdea}</p>
        </div>
      )}

      {/* Key Points */}
      {reel.keyPoints.length > 0 && (
        <div className="journal-card p-8 mb-8">
           <h2 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-muted-foreground/40 mb-8 flex items-center gap-3">
             <span className="w-8 h-[1px] bg-white/10" /> STRUCTURED ANALYSIS
          </h2>
          <ul className="space-y-8">
            {reel.keyPoints.map((point, i) => (
              <li key={i} className="flex gap-6 group">
                <span className="text-2xl font-sans font-extrabold text-white/10 group-hover:text-primary/40 transition-colors mt-[-4px]">0{i + 1}</span>
                <span className="text-base leading-relaxed font-sans text-white/80">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actionable Tips */}
      {reel.actionableTips.length > 0 && (
        <div className="journal-card p-8 mb-8 bg-[#0A0A0A] border-white/5">
          <h2 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-3">
             <span className="w-8 h-[1px] bg-primary/20" /> OPERATIONAL DIRECTIVES
          </h2>
          <div className="space-y-4">
            {reel.actionableTips.map((tip, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <p className="text-base leading-relaxed font-sans text-white/90 italic">"{tip}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools & Concepts */}
      {reel.toolsConcepts.length > 0 && (
        <div className="journal-card p-8 mb-8">
          <h2 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-muted-foreground/40 mb-6 flex items-center gap-3">
             <span className="w-8 h-[1px] bg-white/10" /> LEXICON & TOOLING
          </h2>
          <div className="flex flex-wrap gap-3">
            {reel.toolsConcepts.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-sans font-bold text-white uppercase tracking-wider"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Short Explanation */}
      {reel.shortExplanation && (
        <div className="index-card p-6 mb-10 bg-library-bg/50 border-dashed">
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
            Explanatory Addendum
          </h2>
          <p className="text-xs leading-relaxed font-mono text-muted-foreground">
            {reel.shortExplanation}
          </p>
        </div>
      )}

      {/* Tags */}
      {reel.tags.length > 0 && (
        <div className="mb-12 py-10 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-4">
            {reel.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-sans font-extrabold uppercase tracking-[0.2em] text-primary italic"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transcript (collapsible) */}
      {reel.transcript && (
        <div className="index-card border-x-0 border-b-0">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full p-5 text-left flex items-center justify-between group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">
              Raw Source Transcript
            </span>
            <span className="text-[10px] font-mono text-primary font-bold">
              [{showTranscript ? "-" : "+"}]
            </span>
          </button>
          {showTranscript && (
            <div className="px-5 pb-8">
              <div className="p-4 bg-library-bg border border-border text-[11px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap selection:bg-primary/30">
                {reel.transcript}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
