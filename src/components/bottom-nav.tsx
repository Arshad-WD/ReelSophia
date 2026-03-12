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
      <div className="flex flex-col items-center gap-4">
        
        {/* ── Navigation Stack (The "Fan-out" menu) ── */}
        <div className={cn(
          "flex flex-col gap-3 transition-all duration-700 items-center pointer-events-auto",
          isExpanded ? "mb-4 opacity-100 scale-100" : "mb-0 opacity-0 scale-50 h-0 overflow-hidden"
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
                   "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                   "bg-background/40 backdrop-blur-3xl border border-white/5 shadow-2xl",
                   isActive ? "text-primary border-primary/20" : "text-muted-foreground"
                 )}
                 style={{ transitionDelay: `${(NAV_ITEMS.length - idx) * 50}ms` }}
               >
                 <Icon className="w-6 h-6" />
                 {isActive && (
                   <div className="absolute -left-1 w-1 h-6 bg-primary rounded-full blur-[1px]" />
                 )}
               </Link>
             );
           })}
        </div>

        {/* ── The Dynamic Control Island ── */}
        <div className="flex items-center gap-3 p-2 bg-background/20 backdrop-blur-[60px] border border-white/5 rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Main Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 relative z-10",
              isExpanded ? "bg-foreground text-background rotate-90" : "bg-primary text-background"
            )}
          >
            {isExpanded ? <X className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6 shadow-[0_0_20px_rgba(0,0,0,0.4)]" />}
          </button>

          {/* Quick Peek: Active Icon */}
          {!isExpanded && (
            <div className="flex items-center px-4 gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
               <div className="h-4 w-px bg-white/10" />
               <Link href="/settings" className="w-10 h-10 rounded-full border border-white/10 overflow-hidden">
                 {user?.imageUrl ? (
                   <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
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
