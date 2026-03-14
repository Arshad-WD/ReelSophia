/**
 * Server-safe HTML sanitizer.
 * Replaces isomorphic-dompurify which pulls in jsdom and causes
 * ESM compatibility errors on Vercel's serverless runtime.
 */

const RICH_ALLOWED_TAGS = new Set(["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "h3", "h4"]);

/**
 * Decode common HTML entities back to their characters.
 */
function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
}

/**
 * Sanitize user-generated content to prevent XSS attacks.
 * Strips ALL HTML tags and decodes entities.
 */
export function sanitize(dirty: string): string {
    // Remove all HTML tags
    const stripped = dirty.replace(/<[^>]*>/g, "");
    return decodeEntities(stripped).trim();
}

/**
 * Sanitize but allow basic formatting tags for note display.
 * Only permits a small whitelist of safe HTML tags with no attributes.
 */
export function sanitizeRich(dirty: string): string {
    // Remove any attributes from allowed tags, strip disallowed tags entirely
    return dirty.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tagName) => {
        const lower = tagName.toLowerCase();
        if (RICH_ALLOWED_TAGS.has(lower)) {
            // Return the tag without any attributes
            const isClosing = match.startsWith("</");
            const isSelfClosing = lower === "br";
            if (isClosing) return `</${lower}>`;
            if (isSelfClosing) return `<${lower} />`;
            return `<${lower}>`;
        }
        // Disallowed tag — strip it
        return "";
    });
}
