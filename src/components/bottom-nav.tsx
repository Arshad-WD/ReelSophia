"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, PlusCircle, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/add", label: "Add", icon: PlusCircle, isCenter: true },
  { href: "/search", label: "Search", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-safe">
      <div className="mx-2 mb-2 lg:hidden">
        <nav className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-[2rem] px-2 py-3 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -mt-8"
                >
                  <div className={cn(
                    "w-[3.25rem] h-[3.25rem] rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(225,48,108,0.4)]",
                    isActive
                      ? "bg-gradient-to-tr from-[#fd1d1d] via-[#e1306c] to-[#c13584] scale-105"
                      : "bg-gradient-to-tr from-[#fd1d1d]/90 via-[#e1306c]/90 to-[#c13584]/90 hover:scale-105"
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-white"
                )}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
