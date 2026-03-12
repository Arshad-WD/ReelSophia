"use client";

import { useState } from "react";
import { Key, Loader2, Trash, Check, ChevronDown, Sparkles, Brain, Cpu, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { AISettings } from "@/types";

const PROVIDERS = [
    { id: "openrouter", name: "OpenRouter", icon: Sparkles, placeholder: "sk-or-v1-...", description: "Access any model via OpenRouter" },
    { id: "openai", name: "OpenAI", icon: Brain, placeholder: "sk-...", description: "Direct access to GPT models" },
    { id: "anthropic", name: "Anthropic", icon: Cpu, placeholder: "sk-ant-...", description: "Direct access to Claude models" },
    { id: "gemini", name: "Google Gemini", icon: MessageSquare, placeholder: "Key from Google AI Studio", description: "Direct access to Gemini models" },
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
                throw new Error(data.error || "Failed to update AI settings");
            }

            setMessage({ text: "AI settings saved successfully", type: "success" });
            setSettings(newSettings);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            setMessage({ text: msg, type: "error" });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
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
        <div className="velvet-card p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Provider List */}
                <div className="w-full lg:w-64 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-2 mb-4">Intelligence Providers</p>
                    {PROVIDERS.map((provider) => {
                        const Icon = provider.icon;
                        const hasKey = !!(settings.keys as any)[provider.id];
                        const isPreferred = settings.preferredProvider === provider.id;
                        
                        return (
                            <button
                                key={provider.id}
                                onClick={() => setActiveProvider(provider.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                    activeProvider === provider.id 
                                        ? "bg-primary/10 border border-primary/20 text-primary" 
                                        : "hover:bg-white/[0.03] border border-transparent text-muted-foreground/60"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={cn("w-4 h-4", activeProvider === provider.id ? "text-primary" : "group-hover:text-white")} />
                                    <span className="text-xs font-bold">{provider.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasKey && <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
                                    {isPreferred && <Check className="w-3 h-3" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Active Provider Config */}
                <div className="flex-1 space-y-6">
                    {PROVIDERS.find(p => p.id === activeProvider) && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-6">
                                <h3 className="text-xl font-heading text-foreground mb-1">
                                    {PROVIDERS.find(p => p.id === activeProvider)?.name} Configuration
                                </h3>
                                <p className="text-xs text-muted-foreground/60 leading-relaxed italic">
                                    {PROVIDERS.find(p => p.id === activeProvider)?.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder={PROVIDERS.find(p => p.id === activeProvider)?.placeholder}
                                        value={(settings.keys as any)[activeProvider] || ""}
                                        onChange={(e) => updateKey(activeProvider, e.target.value)}
                                        className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl px-6 font-mono text-sm text-foreground focus:border-primary/40 outline-none transition-all shadow-inner"
                                    />
                                    <Key className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20" />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => handleSave(settings)}
                                        disabled={isSaving}
                                        className="btn-signature flex-1 !py-4 w-full sm:w-auto text-xs"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Link"}
                                    </button>
                                    
                                    {!!(settings.keys as any)[activeProvider] && settings.preferredProvider !== activeProvider && (
                                        <button
                                            onClick={() => setPreferred(activeProvider)}
                                            className="px-6 rounded-2xl border border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-center justify-center shrink-0"
                                        >
                                            Set as Primary
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
                                            className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center shrink-0"
                                            title="Disconnect"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {message && (
                <div className={cn(
                    "mt-8 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center animate-in zoom-in-95 duration-300",
                    message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
