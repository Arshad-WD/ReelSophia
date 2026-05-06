"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Welcome back!");
        login(data.user);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/oauth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Identity Verified");
        login(data.user);
      } else {
        toast.error(data.error || "Google Verification Failed");
      }
    } catch (error) {
      toast.error("Auth System Offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      if (window.google) initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    function initializeGoogle() {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        use_fedcm_for_prompt: true,
      });
      
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: googleButtonRef.current.offsetWidth || 300,
          text: "continue_with",
          shape: "pill",
        });
      }
      setScriptLoaded(true);
    }

    script.onload = initializeGoogle;
  }, []);

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.03] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/10"
                placeholder="name@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/[0.03] border border-white/10 focus:border-primary/40 focus:bg-white/[0.05] rounded-xl py-3.5 pl-12 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/10"
                placeholder="••••••••••••"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
          <span className="bg-transparent px-4 text-white/10">or continue with</span>
        </div>
      </div>

      <div className="relative w-full flex justify-center min-h-[44px]">
        <div ref={googleButtonRef} className="w-full flex justify-center" />
        {!scriptLoaded && (
          <div className="absolute inset-0 w-full bg-white/[0.02] animate-pulse h-[44px] rounded-full border border-white/5" />
        )}
      </div>
    </div>
  );
}
