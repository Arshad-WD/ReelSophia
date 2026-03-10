"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Library, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/add", icon: PlusCircle, label: "Add" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show nav on auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom border-t border-white/5 bg-background shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.8)]">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around py-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const isAdd = item.href === "/add";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-1 px-3 transition-colors relative group",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {isAdd ? (
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 -mt-4 rounded-full transition-all duration-300 shadow-lg",
                      isActive
                        ? "scale-110 shadow-[0_0_20px_rgba(220,39,67,0.4)]"
                        : "opacity-90 hover:scale-105"
                    )}
                    style={{ background: "var(--ig-gradient)" }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="relative">
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-all duration-300",
                        isActive ? "text-white scale-110" : "text-muted-foreground"
                      )}
                    />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                )}
                <span
                  className={cn(
                    "text-[10px] font-sans font-medium tracking-tight transition-all duration-300",
                    isActive ? "text-white mt-1" : "text-muted-foreground",
                    isAdd && "sr-only" // Hide label for the prominent add button
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
