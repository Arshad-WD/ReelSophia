import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize user-generated content to prevent XSS attacks.
 */
export function sanitize(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [], // Strip all HTML tags
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitize but allow basic formatting tags for note display.
 */
export function sanitizeRich(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "h3", "h4"],
        ALLOWED_ATTR: [],
    });
}
