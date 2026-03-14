"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Home, Library, PlusCircle, Search, Sparkles, Zap, LogOut, Settings, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Nexus", icon: Home },
  { href: "/library", label: "Archives", icon: Library },
  { href: "/add", label: "/capture", icon: PlusCircle },
  { href: "/search", label: "Intel", icon: Search },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-[100] transition-all duration-700 items-center justify-end group pointer-events-none",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* ── Vertical Command Strip ── */}
      <div className={cn(
        "relative flex flex-col items-center py-8 bg-white/[0.01] backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] shadow-2xl pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isExpanded ? "w-full px-6 items-start" : "w-16 px-0 items-center",
        "before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-primary/5 before:blur-3xl before:rounded-full before:-z-10"
      )}>
        
        {/* Brand Core */}
        <div className={cn(
          "mb-12 flex items-center transition-all duration-300",
          isExpanded ? "gap-4" : "gap-0"
        )}>
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shrink-0 group-hover:bg-primary transition-colors">
             <Hexagon className="w-5 h-5 text-black" />
           </div>
           {isExpanded && (
             <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
               <span className="text-sm font-heading font-bold tracking-tight text-white">SOPHIA OS</span>
               <span className="text-[7px] font-bold tracking-[0.4em] uppercase text-primary/60">INTELLIGENCE</span>
             </div>
           )}
        </div>

        {/* Navigation Spine */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center h-12 rounded-xl transition-all duration-300 group/item overflow-hidden",
                  isExpanded ? "w-full px-4 gap-4" : "w-12 px-0 justify-center",
                  isActive 
                    ? "bg-white/[0.08] text-primary border border-white/[0.05]" 
                    : "text-white/20 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn(
                  "shrink-0 transition-all duration-300 w-5 h-5",
                  isActive ? "scale-110" : "group-hover/item:scale-110"
                )} />
                
                {isExpanded && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-300">
                    {item.label}
                  </span>
                )}

                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-6 ig-gradient rounded-l-full shadow-[0_0_8px_rgba(225,48,108,0.4)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* System & User Section */}
        <div className={cn(
          "mt-12 flex flex-col gap-6 w-full",
          isExpanded ? "px-2" : "items-center"
        )}>
          {/* Status Glow */}
          <div className={cn(
            "flex items-center bg-white/[0.02] border border-white/[0.05] transition-all duration-300",
            isExpanded ? "rounded-xl px-4 py-2 gap-3" : "rounded-full w-8 h-8 justify-center"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent)]" />
            {isExpanded && (
              <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/20">Syncing...</span>
            )}
          </div>

          <div className={cn(
            "flex items-center transition-all duration-300",
            isExpanded ? "gap-4" : "flex-col gap-4"
          )}>
            <Link 
              href="/settings"
              className="w-10 h-10 rounded-full border border-white/[0.08] p-[1px] hover:border-primary/60 hover:scale-110 transition-all duration-300 overflow-hidden relative"
            >
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-primary bg-white/[0.01]">
                  {user?.name?.[0] || "?"}
                </div>
              )}
            </Link>
            
            <button 
              onClick={() => logout()}
              className={cn(
                "text-white/10 hover:text-destructive transition-all duration-300 p-2 hover:bg-destructive/10 rounded-full",
                isExpanded ? "rotate-0" : "rotate-90"
              )}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Background Glow Overlay (When Expanded) ── */}
      {isExpanded && (
        <div className="fixed inset-0 -z-50 bg-background/40 backdrop-blur-sm pointer-events-none transition-opacity duration-700" />
      )}
    </div>
  );
}
