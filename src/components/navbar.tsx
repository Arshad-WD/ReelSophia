"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Home, Library, PlusCircle, Search, LogOut, Menu, X, Settings, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/add", label: "Add Video", icon: PlusCircle },
  { href: "/search", label: "Search", icon: Search },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-300 px-6 py-4",
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">ReelSophia</span>
            <span className="text-[10px] text-primary font-semibold tracking-[0.2em] uppercase">Intelligence</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-md">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Section */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full border border-white/[0.08] overflow-hidden hover:border-primary/50 transition-all duration-200 bg-white/[0.03] flex items-center justify-center group"
          >
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <Settings className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
            )}
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/30 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[-1] bg-background animate-in fade-in duration-300">
          <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 text-2xl font-bold transition-all duration-200",
                    isActive ? "text-primary scale-110" : "text-white/40 hover:text-white"
                  )}
                >
                  <Icon className="w-8 h-8" />
                  {item.label}
                </Link>
              );
            })}
            <div className="w-full h-px bg-white/5 my-4" />
            <Link
              href="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white/40 text-xl font-bold flex items-center gap-4"
            >
              <Settings className="w-7 h-7" />
              Settings
            </Link>
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="text-destructive/60 text-xl font-bold flex items-center gap-4 mt-4"
            >
              <LogOut className="w-7 h-7" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
