"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import Link from "next/link";

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
      console.error("Google Callback Error:", error);
      toast.error("Auth System Offline - Check console for details");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Check if script is already present
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      if (window.google) {
        initializeGoogle();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    function initializeGoogle() {
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

    return () => {
      // Optional: Cleanup logic if script needs removal, 
      // though usually GSI stays loaded once inserted
    };
  }, []);


  return (
    <div className="w-full space-y-10 py-2">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em] ml-2">
              Neural Identifier
            </label>
            <div className="relative group/input">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.02] border border-white/5 focus:border-primary/40 focus:bg-white/[0.04] rounded-2xl p-5 text-white outline-none transition-all duration-700 text-sm placeholder:text-white/10"
                placeholder="architect@reelsophia.io"
              />
              <div className="absolute inset-0 rounded-2xl shimmer-border opacity-0 group-focus-within/input:opacity-30 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center ml-2">
              <label className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">
                Security Key
              </label>
            </div>
            <div className="relative group/input">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/[0.02] border border-white/5 focus:border-primary/40 focus:bg-white/[0.04] rounded-2xl p-5 text-white outline-none transition-all duration-700 text-sm placeholder:text-white/10"
                placeholder="••••••••••••"
              />
              <div className="absolute inset-0 rounded-2xl shimmer-border opacity-0 group-focus-within/input:opacity-30 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full py-6 rounded-2xl bg-white text-background text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 hover:bg-primary active:scale-95 shadow-2xl overflow-hidden disabled:opacity-50"
        >
          <div className="absolute inset-0 shimmer-border opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center justify-center gap-3">
            {loading ? "Decrypting..." : "Initiate Sync"}
          </span>
        </button>
      </form>

      <div className="relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.6em]">
          <span className="bg-transparent px-6 text-white/10 font-bold italic">Secondary Protocol</span>
        </div>
      </div>

      <div className="relative w-full flex justify-center min-h-[56px]">
        <div 
          ref={googleButtonRef} 
          className="w-full flex justify-center"
        />
        {!scriptLoaded && (
          <div className="absolute inset-0 w-full bg-white/[0.02] animate-pulse h-[56px] rounded-2xl flex items-center justify-center border border-white/5 pointer-events-none">
            <span className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-bold">Synchronizing...</span>
          </div>
        )}
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] leading-loose">
          Awaiting Credentials?{" "}
          <Link href="/sign-up" className="text-primary hover:text-white transition-all duration-500 font-bold border-b border-primary/20 hover:border-white">
            Register Segment
          </Link>
        </p>
      </div>
    </div>
  );
}
