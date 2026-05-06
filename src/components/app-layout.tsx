"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-[#050508]">
        
        {/* ── Global Cinematic Layers ── */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Base Atmospheric Glows */}
          <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-primary/10 blur-[180px] rounded-full opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full opacity-20" />
          
          {/* Subtle Grain/Noise Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none grayscale contrast-150" 
               style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        </div>

        {/* ── Navigation ── */}
        {!isAuthPage && <Navbar />}

        {/* ── Main Content Container ── */}
        <main className={cn(
          "flex-1 relative z-10 w-full",
          !isAuthPage && "pt-24 lg:pt-32"
        )}>
          <div className="responsive-container min-h-screen">
            {children}
          </div>
        </main>

        {/* ── Footer Branding (Optional/Subtle) ── */}
        {!isAuthPage && (
          <footer className="relative z-10 py-20 px-6 border-t border-white/[0.03] mt-20">
            <div className="responsive-container flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3 opacity-20 hover:opacity-50 transition-opacity duration-500">
                <div className="w-6 h-6 rounded-lg brand-gradient" />
                <span className="text-xs font-bold uppercase tracking-[0.4em] text-white">ReelSophia</span>
              </div>
              <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">
                Distributed Intelligence Network © 2026
              </p>
            </div>
          </footer>
        )}
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          className: "glass border-white/10 font-sans text-sm text-white py-4 px-6 rounded-2xl shadow-2xl",
        }}
      />
    </AuthProvider>
  );
}
