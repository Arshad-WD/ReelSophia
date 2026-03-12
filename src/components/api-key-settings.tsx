"use client";

import { useState } from "react";
import { Key, Loader2, Trash } from "lucide-react";

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

            setMessage({ text: keyToSave ? "API key saved" : "API key removed", type: "success" });
            if (!keyToSave) setApiKey("");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            setMessage({ text: msg, type: "error" });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="velvet-card p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-foreground">OpenRouter API Key</h2>
                    <p className="text-xs text-muted-foreground">Use your own key for unlimited processing</p>
                </div>
            </div>

            <div className="space-y-4">
                <input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full h-12 bg-white/[0.03] border border-border/30 rounded-xl px-4 font-mono text-sm text-foreground focus:border-primary/40 outline-none transition-all"
                />
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSave(apiKey)}
                        disabled={isSaving || !apiKey.trim()}
                        className="btn-primary flex-1 py-3 text-sm"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Key"}
                    </button>
                    {apiKey && (
                        <button
                            onClick={() => handleSave("")}
                            disabled={isSaving}
                            className="p-3 rounded-xl border border-border/30 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            title="Remove Key"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {message && (
                <p className={`text-xs text-center mt-4 font-medium ${message.type === "success" ? "text-green-400" : "text-destructive"}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
