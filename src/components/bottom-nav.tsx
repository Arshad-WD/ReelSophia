"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Home, Library, PlusCircle, Search, Settings, LayoutGrid, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Archives", icon: Library },
  { href: "/add", label: "Capture", icon: PlusCircle },
  { href: "/search", label: "Intel", icon: Search },
];

export function BottomNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-8 inset-x-0 z-[100] px-6 pointer-events-none">
      <div className="flex flex-col items-center gap-6">
        
        {/* ── Navigation Stack (The "Fan-out" menu) ── */}
        <div className={cn(
          "flex flex-col gap-3 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] items-center pointer-events-auto",
          isExpanded ? "mb-4 opacity-100 translate-y-0 scale-100" : "mb-0 opacity-0 translate-y-8 scale-50 h-0 overflow-hidden"
        )}>
           {NAV_ITEMS.map((item, idx) => {
             const isActive = pathname === item.href;
             const Icon = item.icon;
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 onClick={() => setIsExpanded(false)}
                 className={cn(
                   "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative",
                   "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-xl",
                   isActive ? "text-white border-primary/40 bg-white/[0.1] shadow-[0_0_20px_rgba(225,48,108,0.2)]" : "text-white/20 hover:text-white/50"
                 )}
                 style={{ transitionDelay: `${(NAV_ITEMS.length - idx) * 30}ms` }}
               >
                 <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110")} />
                 {isActive && (
                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ig-gradient rounded-full shadow-[0_0_8px_var(--color-primary)]" />
                 )}
               </Link>
             );
           })}
        </div>

        {/* ── The Dynamic Control Island ── */}
        <div className="flex items-center gap-3 p-2 bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] rounded-full shadow-2xl pointer-events-auto relative overflow-hidden group/island">
          {/* Main Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 shadow-lg",
              isExpanded ? "bg-white text-black rotate-90" : "ig-gradient text-white"
            )}
          >
            {isExpanded ? <X className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
          </button>

          {/* Quick Peek: Active Icon */}
          {!isExpanded && (
            <div className="flex items-center px-3 gap-4 animate-in fade-in slide-in-from-right-4 duration-400">
               <div className="h-4 w-[1px] bg-white/[0.08]" />
               <Link href="/settings" className="w-9 h-9 rounded-full border border-white/[0.08] p-[1.5px] hover:border-primary/40 transition-all duration-300 overflow-hidden relative">
                 {user?.imageUrl ? (
                   <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-primary bg-white/[0.02]">
                     {user?.name?.[0] || "?"}
                   </div>
                 )}
               </Link>
            </div>
          )}
        </div>

        {/* Swipe Feedback */}
        {isExpanded && (
          <div className="fixed inset-0 -z-10 bg-background/60 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setIsExpanded(false)} />
        )}
      </div>
    </div>
  );
}
