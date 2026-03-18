"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Home, Library, PlusCircle, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Archives", icon: Library },
  { href: "/add", label: "Capture", icon: PlusCircle },
  { href: "/search", label: "Intel", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-10 inset-x-0 z-[100] flex justify-center px-6 pointer-events-none">
      <nav className="flex items-center gap-1 p-2 bg-white/[0.01] backdrop-blur-[40px] border border-white/[0.08] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden group">
        <div className="absolute inset-0 shimmer-border opacity-20" />
        
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500",
                isActive 
                  ? "text-white bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-110" 
                  : "text-white/20 hover:text-white/40"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-all duration-500",
                isActive ? "scale-110" : "active:scale-125"
              )} />
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              )}
            </Link>
          );
        })}

        <div className="w-[1px] h-6 bg-white/[0.08] mx-2" />

        <Link 
          href="/settings"
          className="w-12 h-12 rounded-full border border-white/[0.08] p-[1.5px] hover:border-primary/40 transition-all duration-500 overflow-hidden relative shadow-lg"
        >
          {user?.imageUrl ? (
            <Image 
              src={user.imageUrl} 
              alt="Profile" 
              width={48} 
              height={48} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary italic bg-white/[0.01]">
              {user?.name?.[0] || "?"}
            </div>
          )}
        </Link>
      </nav>
    </div>
  );
}
