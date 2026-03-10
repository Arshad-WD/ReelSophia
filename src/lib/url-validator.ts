const ALLOWED_DOMAINS = [
    "instagram.com",
    "www.instagram.com",
    "tiktok.com",
    "www.tiktok.com",
    "vm.tiktok.com",
    "youtube.com",
    "www.youtube.com",
    "youtu.be",
    "m.youtube.com",
] as const;

export type Platform = "instagram" | "tiktok" | "youtube";

interface ValidationResult {
    valid: boolean;
    platform?: Platform;
    error?: string;
    normalizedUrl?: string;
}

export function validateReelUrl(url: string): ValidationResult {
    if (!url || typeof url !== "string") {
        return { valid: false, error: "URL is required" };
    }

    const trimmed = url.trim();

    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return { valid: false, error: "Invalid URL format" };
    }

    // Must be HTTPS
    if (parsed.protocol !== "https:") {
        return { valid: false, error: "Only HTTPS URLs are allowed" };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check against whitelist
    const isAllowed = ALLOWED_DOMAINS.some((domain) => hostname === domain);
    if (!isAllowed) {
        return {
            valid: false,
            error:
                "Only Instagram, TikTok, and YouTube URLs are supported",
        };
    }

    // Determine platform
    let platform: Platform;
    if (hostname.includes("instagram")) {
        platform = "instagram";
        // Must be a reel URL
        if (!parsed.pathname.includes("/reel") && !parsed.pathname.includes("/p/")) {
            return { valid: false, error: "Please provide an Instagram Reel URL" };
        }
    } else if (hostname.includes("tiktok")) {
        platform = "tiktok";
    } else {
        platform = "youtube";
        // Must be a Shorts URL (or youtu.be)
        if (
            hostname !== "youtu.be" &&
            !parsed.pathname.includes("/shorts/")
        ) {
            return {
                valid: false,
                error: "Please provide a YouTube Shorts URL",
            };
        }
    }

    return {
        valid: true,
        platform,
        normalizedUrl: trimmed,
    };
}
