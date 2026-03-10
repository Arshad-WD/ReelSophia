"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING: { icon: Clock, label: "Queued", color: "status-pending", animate: false },
  DOWNLOADING: { icon: Loader2, label: "Downloading", color: "status-processing", animate: true },
  EXTRACTING: { icon: Loader2, label: "Extracting Audio", color: "status-processing", animate: true },
  TRANSCRIBING: { icon: Loader2, label: "Transcribing", color: "status-processing", animate: true },
  CLEANING: { icon: Loader2, label: "Cleaning", color: "status-processing", animate: true },
  SUMMARIZING: { icon: Loader2, label: "AI Processing", color: "status-processing", animate: true },
  COMPLETED: { icon: CheckCircle2, label: "Completed", color: "status-completed", animate: false },
  FAILED: { icon: XCircle, label: "Failed", color: "status-failed", animate: false },
} as const;

interface ProcessingStatusProps {
  status: string;
  progress?: number;
  error?: string | null;
  className?: string;
}

export function ProcessingStatus({ status, progress, error, className }: ProcessingStatusProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "w-4 h-4",
            config.color,
            config.animate && "animate-spin"
          )}
        />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
        {progress !== undefined && progress > 0 && progress < 100 && (
          <Badge variant="outline" className="text-xs">
            {progress}%
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      {progress !== undefined && progress > 0 && status !== "COMPLETED" && status !== "FAILED" && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
