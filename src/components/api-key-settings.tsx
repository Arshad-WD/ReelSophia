"use client";

import { useState } from "react";
import { Copy, Key, Loader2, Save, Trash } from "lucide-react";

export function ApiKeySettings({ initialKey = "" }: { initialKey?: string }) {
    const [apiKey, setApiKey] = useState(initialKey);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSave = async (keyToSave: string) => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/user/key", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: keyToSave }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update API key");
            }

            setMessage({ text: keyToSave ? "API Key saved successfully" : "API Key removed", type: "success" });
            if (!keyToSave) setApiKey("");
        } catch (error: any) {
            setMessage({ text: error.message, type: "error" });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="journal-card p-8 mb-8 bg-[#050505] border-white/5">
            <h2 className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-muted-foreground/40 mb-8 flex items-center gap-3">
               <span className="w-8 h-[1px] bg-white/10" /> AUTONOMOUS KEY
            </h2>
            
            <p className="text-xs font-sans font-bold uppercase tracking-[0.1em] text-muted-foreground/60 leading-relaxed mb-8 border-l-2 border-primary pl-6">
                Configure a personal OpenRouter API key to bypass communal rate limits. 
                Processing will be logged directly to your autonomous account.
            </p>

            <div className="flex flex-col gap-4 mt-2">
                <div className="space-y-6">
                    <label className="text-[10px] font-sans font-extrabold uppercase tracking-[0.3em] text-muted-foreground/30">ENCRYPTED AUTH TOKEN</label>
                    <div className="flex flex-col gap-4">
                        <input
                            type="password"
                            placeholder="sk-or-v1-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="editorial-input w-full h-14 !rounded-full bg-white/5 !border-white/5 px-6 font-sans font-bold text-white focus:!border-primary/40 transition-all"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleSave(apiKey)}
                                disabled={isSaving || !apiKey.trim()}
                                className="btn-journal-primary flex-1 py-4 text-xs tracking-widest"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "COMMIT KEY"}
                            </button>
                            {apiKey && (
                                <button
                                    onClick={() => handleSave("")}
                                    disabled={isSaving}
                                    className="p-4 rounded-xl border border-white/5 bg-white/5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center"
                                    title="Revoke Key"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {message && (
                    <p className={`text-[10px] font-sans font-extrabold uppercase tracking-[0.2em] text-center mt-4 ${message.type === "success" ? "text-green-400" : "text-primary"}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
}
