"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen relative">
        {/* Desktop & Mobile Navigation Islands */}
        {!isAuthPage && (
          <>
            <DesktopNav />
            <BottomNav />
          </>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 relative z-10",
          !isAuthPage && "pt-12 lg:pt-24"
        )}>
          <div className="max-w-[1400px] mx-auto min-h-screen">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          className: "velvet-card border-border/50 font-sans text-sm",
        }}
      />
    </AuthProvider>
  );
}
