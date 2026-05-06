"use client";

import { LoginForm } from "@/components/auth/login-form";
import { Brain, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SignInPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-rotating highlights on the left side
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const highlights = [
    {
      title: "Deep Topical Intelligence",
      desc: "Extract technical depth from any video in seconds.",
      icon: Brain,
    },
    {
      title: "Actionable Insights",
      desc: "Get steps, commands, and tools explained clearly.",
      icon: Zap,
    },
    {
      title: "Organized Archive",
      desc: "Your personal encyclopedia of video knowledge.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background overflow-hidden">
      
      {/* ── Left Side: Visual Experience ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Ambient background for left side */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-full h-full bg-accent/5 blur-[100px] rounded-full" />
        </div>

        {/* Brand */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">ReelSophia</span>
        </Link>

        {/* Highlights */}
        <div className="relative z-10 max-w-sm">
          <div className="space-y-12">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              const isActive = activeStep === i;
              return (
                <div 
                  key={i}
                  className={cn(
                    "flex gap-6 transition-all duration-700",
                    isActive ? "opacity-100 translate-x-0" : "opacity-20 -translate-x-4 grayscale"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-white")} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">{h.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicators */}
          <div className="flex gap-2 mt-12">
            {highlights.map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  activeStep === i ? "w-8 bg-primary" : "w-2 bg-white/10"
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/20 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Military Grade Encryption
          </div>
        </div>
      </div>

      {/* ── Right Side: Auth Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile Header (Hidden on LG) */}
        <div className="lg:hidden absolute top-12 left-1/2 -translate-x-1/2 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ReelSophia</span>
          </Link>
        </div>

        <div className="w-full max-w-md reveal-up">
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-4xl font-heading text-white mb-3">Sign In</h1>
            <p className="text-white/40">Access your knowledge archive and new extractions.</p>
          </div>

          <div className="panel p-8 sm:p-10 shadow-2xl border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-sm text-white/30">
            New to the platform?{" "}
            <Link href="/sign-up" className="text-primary font-bold hover:text-white transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
