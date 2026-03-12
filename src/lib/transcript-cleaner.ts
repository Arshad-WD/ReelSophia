/**
 * Transcript Cleaner — Pre-AI processing stage.
 * Removes filler words, repeated sentences, excessive whitespace,
 * and irrelevant conversational phrases to reduce AI token usage.
 */

const FILLER_WORDS = [
    "um", "uh", "uhh", "umm", "ummm",
    "like,", "you know,", "I mean,",
    "basically,", "literally,", "honestly,",
    "right,", "so,", "well,", "okay so,",
    "actually,", "you know what I mean",
    "kind of", "sort of",
];

const FILLER_REGEX = new RegExp(
    `\\b(${FILLER_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
);

const IRRELEVANT_PHRASES = [
    /don'?t forget to (like|subscribe|follow|share|comment).*/gi,
    /hit the (like|subscribe|bell|notification) button.*/gi,
    /link in (the )?(bio|description).*/gi,
    /follow me on .*/gi,
    /subscribe to my .*/gi,
    /check out my .*/gi,
    /smash that .*/gi,
    /leave a comment .*/gi,
    /what do you (think|guys think).*/gi,
    /see you in the next (video|one|reel).*/gi,
    /thanks for watching.*/gi,
    /let me know in the comments.*/gi,
];

/**
 * Clean a raw transcript to reduce token count before AI processing.
 * Typically reduces transcript size by 30-50%.
 */
export function cleanTranscript(raw: string): string {
    if (!raw || typeof raw !== "string") return "";

    let cleaned = raw;

    // 1. Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // 2. Remove filler words
    cleaned = cleaned.replace(FILLER_REGEX, "");

    // 3. Remove irrelevant promotional phrases
    for (const pattern of IRRELEVANT_PHRASES) {
        cleaned = cleaned.replace(pattern, "");
    }

    // 4. Remove repeated phrases (Safety for STT artifacts)
    cleaned = removeRepeatedPhrases(cleaned);

    // 5. Remove repeated sentences
    cleaned = removeRepeatedSentences(cleaned);

    // 6. Clean up resulting whitespace
    cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
    cleaned = cleaned.replace(/\s+([.,!?])/g, "$1");

    return cleaned;
}

/**
 * Remove sequential repeated phrases (e.g. "word phrase word phrase")
 */
function removeRepeatedPhrases(text: string): string {
    // Look for phrases of at least 10 chars that repeat immediately
    // This catches the "rolling subtitle" stuttering.
    // Example: "Hello world Hello world" -> "Hello world"
    let result = text;
    
    // We do this a few times to catch 3x or 4x repetitions
    for (let i = 0; i < 2; i++) {
        result = result.replace(/(.{15,})\1+/gi, "$1");
    }
    
    return result;
}

/**
 * Remove duplicate or near-duplicate sentences.
 */
function removeRepeatedSentences(text: string): string {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const seen = new Set<string>();
    const unique: string[] = [];

    for (const sentence of sentences) {
        const normalized = sentence.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
        if (normalized.length < 5) continue; // Skip very short fragments
        if (!seen.has(normalized)) {
            seen.add(normalized);
            unique.push(sentence);
        }
    }

    return unique.join(" ");
}

/**
 * Split a cleaned transcript into chunks for chunk-based summarization.
 * Each chunk stays under the token limit to minimize AI costs.
 */
export function chunkTranscript(
    text: string,
    maxChunkWords: number = 300
): string[] {
    if (!text) return [];

    const words = text.split(/\s+/);

    // If transcript is short enough, return as single chunk
    if (words.length <= maxChunkWords) {
        return [text];
    }

    const chunks: string[] = [];

    // Try to split on sentence boundaries
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk: string[] = [];
    let currentWordCount = 0;

    for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).length;

        if (currentWordCount + sentenceWords > maxChunkWords && currentChunk.length > 0) {
            chunks.push(currentChunk.join(" "));
            currentChunk = [];
            currentWordCount = 0;
        }

        currentChunk.push(sentence);
        currentWordCount += sentenceWords;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
    }

    return chunks;
}

/**
 * Get transcript statistics for logging/debugging.
 */
export function getTranscriptStats(raw: string, cleaned: string) {
    const rawWords = raw.split(/\s+/).length;
    const cleanedWords = cleaned.split(/\s+/).length;
    const reduction = Math.round((1 - cleanedWords / rawWords) * 100);

    return {
        rawWords,
        cleanedWords,
        reductionPercent: reduction,
        rawChars: raw.length,
        cleanedChars: cleaned.length,
    };
}
