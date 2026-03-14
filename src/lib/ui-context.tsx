"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface OptimisticReel {
  id: string;
  url: string;
  platform: string;
  status: "PENDING" | "DOWNLOADING" | "EXTRACTING" | "TRANSCRIBING" | "CLEANING" | "SUMMARIZING" | "COMPLETED" | "FAILED";
  progress: number;
  title?: string;
  createdAt: string;
}

interface UIContextType {
  optimisticReels: OptimisticReel[];
  addOptimisticReel: (reel: OptimisticReel) => void;
  updateOptimisticReel: (id: string, updates: Partial<OptimisticReel>) => void;
  removeOptimisticReel: (id: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [optimisticReels, setOptimisticReels] = useState<OptimisticReel[]>([]);

  const addOptimisticReel = useCallback((reel: OptimisticReel) => {
    setOptimisticReels((prev) => [reel, ...prev]);
  }, []);

  const updateOptimisticReel = useCallback((id: string, updates: Partial<OptimisticReel>) => {
    setOptimisticReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const removeOptimisticReel = useCallback((id: string) => {
    setOptimisticReels((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <UIContext.Provider value={{ optimisticReels, addOptimisticReel, updateOptimisticReel, removeOptimisticReel }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
