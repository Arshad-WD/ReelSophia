"use client";

import { useEffect, useRef, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Hexagon } from "lucide-react";

export default function SignInPage() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
      containerRef.current.style.setProperty("--mouse-x", `${x}%`);
      containerRef.current.style.setProperty("--mouse-y", `${y}%`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden neural-field"
      style={{ "--mouse-x": "50%", "--mouse-y": "50%" } as any}
    >
      {/* ── Ultra-Premium Background Architecture ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.05] mix-blend-screen scale-[1.1] transition-transform duration-[2000ms] ease-out"
          style={{ 
            backgroundImage: "url('/images/neural-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translate(${(mousePosition.x - 50) * -0.05}px, ${(mousePosition.y - 50) * -0.05}px) scale(1.1)`
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] ig-gradient opacity-[0.05] blur-[160px] rounded-full animate-breath-slow" />
      </div>

      <div className="w-full max-w-lg relative z-10 px-6 reveal-up stagger-1">
        <header className="text-center mb-16 space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] bg-white flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] hover:scale-110 hover:rotate-12 transition-all duration-700">
               <Hexagon className="w-10 h-10 text-black" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-[0.8em] uppercase text-primary/60 inline-block pl-2">Security Protocol Active</span>
              <h1 className="text-5xl sm:text-7xl font-heading tracking-tighter text-white drop-shadow-3xl">
                Identity <br />
                <span className="text-ig-gradient italic font-normal">Verification.</span>
              </h1>
            </div>
          </div>
        </header>

        <div className="velvet-card p-10 sm:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-white/[0.05] relative overflow-hidden group">
          <div className="absolute inset-0 shimmer-border opacity-20 pointer-events-none" />
          <div className="text-white/20 text-center mb-10 font-bold uppercase tracking-[0.5em] text-[9px]">Identify yourself to access the architecture</div>
          <LoginForm />
        </div>

        <footer className="mt-16 text-center opacity-20">
           <p className="font-mono text-[8px] uppercase tracking-[1em] text-white">Sophia OS // Security Ledger</p>
        </footer>
      </div>
    </div>
  );
}
