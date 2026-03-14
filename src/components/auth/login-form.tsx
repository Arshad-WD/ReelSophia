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
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          use_fedcm_for_prompt: true, // Opt-in to FedCM to stay modern
        });
        
        // Clears any previous button rendering to prevent "removeChild" errors
        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: googleButtonRef.current.offsetWidth,
            text: "continue_with",
            shape: "pill",
          });
        }
        
        setScriptLoaded(true);
      }
    };

    return () => {
      // Optional: Cleanup logic if script needs removal, 
      // though usually GSI stays loaded once inserted
    };
  }, []);


  return (
    <div className="w-full space-y-8 py-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] ml-1">
              Vault Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.03] border border-white/5 focus:border-primary/50 rounded-2xl p-4 text-foreground outline-none transition-all duration-500 text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em] ml-1">
                Security Key
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/[0.03] border border-white/5 focus:border-primary/50 rounded-2xl p-4 text-foreground outline-none transition-all duration-500 text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-signature w-full disabled:opacity-50"
        >
          {loading ? "Decrypting..." : "Access Vault"}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
          <span className="bg-background px-4 text-muted-foreground/30 font-bold">Protocol Shift</span>
        </div>
      </div>

      <div className="relative w-full flex justify-center min-h-[50px]">
        <div 
          ref={googleButtonRef} 
          className="w-full flex justify-center"
        />
        {!scriptLoaded && (
          <div className="absolute inset-0 w-full bg-white/[0.05] animate-pulse h-[50px] rounded-2xl flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Initializing Auth Protocol...</span>
          </div>
        )}
      </div>

      <div className="text-center pt-4">
        <p className="text-[11px] text-muted-foreground/40 uppercase tracking-widest leading-loose">
          New to the system?{" "}
          <Link href="/sign-up" className="text-primary hover:text-white transition-colors duration-500 font-bold">
            Register for Access
          </Link>
        </p>
      </div>
    </div>
  );
}
