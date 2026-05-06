"use client";

import { useState } from "react";
import { Key, Loader2, Trash, Check, ChevronDown, Sparkles, Brain, Cpu, MessageSquare, Activity, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AISettings } from "@/types";

const PROVIDERS = [
    { id: "openrouter", name: "OpenRouter", icon: Sparkles, placeholder: "sk-or-v1-...", description: "Global Intelligence Mesh — Access 100+ LLM protocols" },
    { id: "openai", name: "OpenAI", icon: Brain, placeholder: "sk-...", description: "GPT Architecture — Direct neural link to OpenAI systems" },
    { id: "anthropic", name: "Anthropic", icon: Cpu, placeholder: "sk-ant-...", description: "Claude Integrity — Safety-first constitutional intelligence" },
    { id: "gemini", name: "Google Gemini", icon: MessageSquare, placeholder: "Key from Google AI Studio", description: "Gemini Nexus — Multimodal extraction via Google Cloud" },
];

export function ApiKeySettings({ initialSettings }: { initialSettings?: AISettings | null }) {
    const [settings, setSettings] = useState<AISettings>(initialSettings || {
        keys: {},
        preferredProvider: "openrouter"
    });
    const [activeProvider, setActiveProvider] = useState(settings.preferredProvider);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSave = async (newSettings: AISettings) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/user/key", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aiSettings: newSettings }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Uplink synchronization failed");
            }

            setMessage({ text: "Protocol synchronized: AI Gateway active", type: "success" });
            setSettings(newSettings);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Encryption failure";
            setMessage({ text: msg, type: "error" });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const updateKey = (provider: string, key: string) => {
        const newSettings = {
            ...settings,
            keys: {
                ...settings.keys,
                [provider]: key
            }
        };
        setSettings(newSettings);
    };

    const setPreferred = (provider: string) => {
        const newSettings = {
            ...settings,
            preferredProvider: provider
        };
        setSettings(newSettings);
        handleSave(newSettings);
    };

    return (
        <div className="relative group rounded-[2.5rem] bg-[#0A0A0F] border border-white/[0.05] p-8 lg:p-12 overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
                 style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16">
                
                {/* ── Provider Module List ── */}
                <div className="w-full lg:w-72 space-y-4">
                    <div className="flex items-center justify-between px-3 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Gateways</p>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-primary/40" />
                            <div className="w-1 h-1 rounded-full bg-primary/20" />
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {PROVIDERS.map((provider) => {
                            const Icon = provider.icon;
                            const hasKey = !!(settings.keys as any)[provider.id];
                            const isPreferred = settings.preferredProvider === provider.id;
                            const isActive = activeProvider === provider.id;
                            
                            return (
                                <button
                                    key={provider.id}
                                    onClick={() => setActiveProvider(provider.id)}
                                    className={cn(
                                        "w-full group/btn relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 overflow-hidden",
                                        isActive 
                                            ? "bg-primary/10 border border-primary/30" 
                                            : "bg-white/[0.02] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04]"
                                    )}
                                >
                                    {/* Active Pulse */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary animate-pulse" />
                                    )}
                                    
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300",
                                            isActive ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" : "bg-white/5 border-white/5"
                                        )}>
                                            <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-white/20 group-hover/btn:text-white/60")} />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-widest transition-colors",
                                            isActive ? "text-white" : "text-white/30 group-hover/btn:text-white/60"
                                        )}>
                                            {provider.name}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {hasKey && <Activity className="w-3 h-3 text-emerald-500/40" />}
                                        {isPreferred && (
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                                                <Zap className="w-2.5 h-2.5 text-primary fill-primary" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Active Interface ── */}
                <div className="flex-1 min-w-0">
                    {PROVIDERS.find(p => p.id === activeProvider) && (
                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="mb-10 lg:mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-3xl lg:text-4xl font-heading text-white">
                                        {PROVIDERS.find(p => p.id === activeProvider)?.name} <span className="text-primary opacity-40">Uplink</span>
                                    </h3>
                                </div>
                                <p className="text-sm lg:text-base text-white/30 leading-relaxed italic border-l-2 border-primary/20 pl-6">
                                    {PROVIDERS.find(p => p.id === activeProvider)?.description}
                                </p>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 ml-2">Secure API Cipher</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                        <input
                                            type="password"
                                            placeholder={PROVIDERS.find(p => p.id === activeProvider)?.placeholder}
                                            value={(settings.keys as any)[activeProvider] || ""}
                                            onChange={(e) => updateKey(activeProvider, e.target.value)}
                                            className="relative w-full h-16 bg-[#050508] border border-white/10 rounded-[1.25rem] px-8 font-mono text-sm text-white focus:border-primary/50 outline-none transition-all shadow-inner"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                            {(settings.keys as any)[activeProvider] && (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
                                                    <span className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Encrypted</span>
                                                </div>
                                            )}
                                            <Key className="w-5 h-5 text-white/10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => handleSave(settings)}
                                        disabled={isSaving}
                                        className="btn-primary flex-1 !py-5 shadow-2xl shadow-primary/20 text-[10px] font-bold uppercase tracking-[0.3em] disabled:opacity-40"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Intelligence Interface"}
                                    </button>
                                    
                                    {!!(settings.keys as any)[activeProvider] && settings.preferredProvider !== activeProvider && (
                                        <button
                                            onClick={() => setPreferred(activeProvider)}
                                            className="px-8 rounded-2xl border border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center shrink-0"
                                        >
                                            Designate Primary
                                        </button>
                                    )}
                                    
                                    {!!(settings.keys as any)[activeProvider] && (
                                        <button
                                            onClick={() => {
                                                const newKeys = { ...settings.keys };
                                                delete (newKeys as any)[activeProvider];
                                                const newSettings = { ...settings, keys: newKeys };
                                                handleSave(newSettings);
                                            }}
                                            disabled={isSaving}
                                            className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-white/20 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all flex items-center justify-center shrink-0"
                                            title="Disconnect Node"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notification Protocol */}
            {message && (
                <div className={cn(
                    "mt-12 p-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] text-center animate-in zoom-in-95 duration-500 flex items-center justify-center gap-4",
                    message.type === "success" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", message.type === "success" ? "bg-emerald-500" : "bg-destructive")} />
                    {message.text}
                </div>
            )}
        </div>
    );
}
