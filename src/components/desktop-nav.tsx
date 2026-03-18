"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Home, Library, PlusCircle, Search, LogOut, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Nexus", icon: Home },
  { href: "/library", label: "Archives", icon: Library },
  { href: "/add", label: "/capture", icon: PlusCircle },
  { href: "/search", label: "Intel", icon: Search },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed top-8 inset-x-0 z-[100] hidden lg:flex justify-center transition-all duration-700 pointer-events-none",
      isScrolled ? "top-6" : "top-10"
    )}>
      <nav className={cn(
        "flex items-center gap-10 px-10 py-5 rounded-[2.5rem] bg-white/[0.01] backdrop-blur-[40px] border border-white/[0.08] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] pointer-events-auto transition-all duration-700",
        "relative overflow-hidden group",
        isScrolled ? "px-8 py-4" : "px-10 py-5"
      )}>
        {/* Dynamic Inner Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* Brand Core */}
        <Link href="/" className="flex items-center gap-4 group/brand mr-4">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-2xl transition-all duration-700 group-hover/brand:bg-primary group-hover/brand:scale-110 group-hover/brand:rotate-[30deg]">
             <Hexagon className="w-5 h-5 text-black group-hover/brand:text-white transition-colors" />
          </div>
          <div className="flex flex-col">
             <span className="text-sm font-heading font-bold tracking-tight text-white leading-none">SOPHIA</span>
             <span className="text-[7px] font-bold tracking-[0.4em] uppercase text-primary/60">INTELLIGENCE</span>
          </div>
        </Link>

        {/* Navigation Nodes */}
        <div className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 group/node",
                  isActive 
                    ? "text-primary bg-white/[0.04] border border-white/[0.05]" 
                    : "text-white/20 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-700",
                  isActive ? "scale-110" : "group-hover/node:scale-125"
                )} />
                
                {isActive && (
                   <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]" />
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/5 text-[8px] font-bold uppercase tracking-[0.3em] text-white opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                   {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Action Nodes Separator */}
        <div className="h-8 w-px bg-white/[0.08]" />

        {/* System & User Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/settings"
              className="w-11 h-11 rounded-2xl border border-white/[0.08] p-[1px] hover:border-primary/60 hover:scale-110 transition-all duration-700 overflow-hidden relative shadow-3xl bg-white/[0.01]"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity" />
              {user?.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt="Profile" 
                  width={44} 
                  height={44} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary italic">
                  {user?.name?.[0] || "?"}
                </div>
              )}
            </Link>
            
            <button 
              onClick={() => logout()}
              className="w-11 h-11 rounded-2xl border border-white/[0.03] flex items-center justify-center text-white/10 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 active:scale-95 transition-all duration-500"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
