"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, Library, PlusCircle, Search, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/add", label: "Capture", icon: PlusCircle },
  { href: "/search", label: "Search", icon: Search },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[280px] flex-col z-40 bg-card/60 backdrop-blur-[40px] border-r border-white/[0.04]">
      {/* Brand */}
      <div className="p-8 pb-10">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fd1d1d] via-[#e1306c] to-[#c13584] flex items-center justify-center shadow-[0_0_20px_rgba(225,48,108,0.2)] group-hover:shadow-[0_0_30px_rgba(225,48,108,0.4)] group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="w-6 h-6 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">ReelSophia</h1>
            <p className="text-[11px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">Knowledge Base</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 transition-transform duration-500" />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-white/[0.03] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              )}
              
              <Icon className={cn(
                "w-[22px] h-[22px] relative z-10 transition-colors duration-300",
                isActive ? "text-primary" : "group-hover:text-foreground"
              )} />
              <span className="text-sm tracking-wide relative z-10">{item.label}</span>
              
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 cursor-pointer group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 ring-2 ring-background relative z-10",
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Account</span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Manage settings</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
