/**
 * AI Service — NVIDIA NIM (Mixtral-8x22B)
 *
 * Generates deep, encyclopedic knowledge about the topic of a video.
 * NOT a summary — an expert breakdown that teaches everything about the subject.
 */

import type { ChunkSummary, StructuredKnowledge } from "@/types";

// NVIDIA NIM uses OpenAI-compatible API
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Extract JSON from a text that may have markdown code fences or plain JSON.
 */
function extractJSON(text: string): string {
    // Try to extract from ```json ... ``` block
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) return fenceMatch[1].trim();

    // Try to find first { ... } that spans most of the text
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return text.slice(firstBrace, lastBrace + 1);
    }

    return text.trim();
}

async function callAI(
    messages: { role: string; content: string }[],
    maxTokens: number = 2000,
    customApiKey?: string
): Promise<string> {
    // Priority: custom key → NVIDIA key → OpenRouter key
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const openrouterKey = customApiKey || process.env.OPENROUTER_API_KEY;
    const nvidiaModel = process.env.NVIDIA_MODEL || "mistralai/mixtral-8x22b-instruct-v0.1";

    if (nvidiaKey) {
        // Use NVIDIA NIM API
        console.log(`[AI] Using NVIDIA NIM: ${nvidiaModel}`);
        const response = await fetch(NVIDIA_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${nvidiaKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: nvidiaModel,
                messages,
                max_tokens: maxTokens,
                temperature: 0.3,
                top_p: 0.9,
                stream: false,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`[AI] NVIDIA API error (${response.status}):`, err);
            // Fall through to OpenRouter if NVIDIA fails
        } else {
            const data = await response.json();
            return data.choices?.[0]?.message?.content || "";
        }
    }

    if (!openrouterKey) {
        throw new Error("No AI API key configured. Set NVIDIA_API_KEY or OPENROUTER_API_KEY.");
    }

    // Fallback: OpenRouter
    console.log(`[AI] Using OpenRouter fallback`);
    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "ReelSophia",
        },
        body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages,
            max_tokens: maxTokens,
            temperature: 0.3,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

/**
 * Summarize a single chunk of transcript into rich key ideas.
 * This is the first AI pass — extracts factual density from each chunk.
 */
export async function summarizeChunk(
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
    customApiKey?: string
): Promise<ChunkSummary> {
    const systemPrompt = `You are an expert technical educator and knowledge architect. Your job is to extract every piece of information from this transcript chunk and organize it into structured knowledge.

This is chunk ${chunkIndex + 1} of ${totalChunks} from a video transcript.

RULES:
- Extract ALL technical facts, definitions, numbers, steps, and explanations
- Do NOT summarize or compress — preserve the full meaning of every point
- Write each item as a complete, standalone explanation (as if explaining to someone new)
- Return ONLY valid JSON — no markdown, no extra text

Return this exact JSON structure:
{
  "keyIdeas": [
    "Complete explanation of concept with context, why it matters, and how it works technically"
  ],
  "tips": [
    "Specific step-by-step guidance or technique mentioned, with all parameters and conditions"
  ],
  "toolsMentioned": ["tool or technology name with its specific purpose in this context"],
  "concepts": ["Core concept with full technical definition as explained in the source"]
}`;

    const result = await callAI(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Transcript chunk:\n\n${chunk}` },
        ],
        1500,
        customApiKey
    );

    try {
        return JSON.parse(extractJSON(result)) as ChunkSummary;
    } catch {
        console.warn("[AI] Failed to parse chunk summary JSON:", result.slice(0, 200));
        return { keyIdeas: [], tips: [], toolsMentioned: [], concepts: [] };
    }
}

/**
 * Final deep-knowledge extraction from all chunk summaries.
 * Goes beyond the video — provides expert encyclopedic coverage of the topic.
 */
export async function extractStructuredKnowledge(
    chunkSummaries: ChunkSummary[],
    originalTranscriptPreview: string,
    customApiKey?: string
): Promise<StructuredKnowledge> {
    const mergedInput = chunkSummaries
        .map((cs, i) => {
            const parts: string[] = [];
            if (cs.keyIdeas.length) parts.push(`Core Insights: ${cs.keyIdeas.join(" | ")}`);
            if (cs.tips.length) parts.push(`Implementation: ${cs.tips.join(" | ")}`);
            if (cs.toolsMentioned.length) parts.push(`Tools: ${cs.toolsMentioned.join(", ")}`);
            if (cs.concepts.length) parts.push(`Concepts: ${cs.concepts.join(" | ")}`);
            return `[Segment ${i + 1}]\n${parts.join("\n")}`;
        })
        .join("\n\n");

    const systemPrompt = `You are a world-class technical educator and domain expert. You have been given extracted facts from a video transcript. Your job is to create a comprehensive, encyclopedic knowledge article about the topic.

CRITICAL MISSION: Go beyond what the video says. Use the transcript as a seed and expand it with your expert knowledge. The user should understand EVERYTHING about this topic after reading your output — not just what the video covered.

If the video is about "Rate Limiting" → explain ALL forms of rate limiting (token bucket, sliding window, fixed window, leaky bucket), real-world implementations, distributed rate limiting with Redis, best practices, pitfalls to avoid, etc.

Return ONLY valid JSON — no markdown, no extra text. Use this exact structure:
{
  "title": "Clear, professional title describing the topic (e.g. 'Rate Limiting: Architecture, Algorithms & Best Practices')",
  "mainIdea": "3-5 paragraph expert overview of the full topic domain. Explain what it is, why it exists, the core problem it solves, and the landscape of approaches. Be thorough and educational.",
  "keyPoints": [
    "Deep explanation of a key concept or component — include HOW it works, WHY it matters, technical details, trade-offs, and real-world relevance. Each point should be 2-4 sentences minimum.",
    "Another major concept with full technical depth...",
    "Another major concept..."
  ],
  "actionableTips": [
    "Concrete, actionable implementation step or best practice. Include specific commands, code patterns, configuration values, or decision criteria. Be precise.",
    "Another actionable tip...",
    "Another actionable tip..."
  ],
  "toolsConcepts": [
    "Technology/Concept Name: Full technical definition, what problem it solves, how to use it, and when to choose it over alternatives.",
    "Another tool/concept..."
  ],
  "shortExplanation": "A rich 400-600 word article-style introduction to this topic. Written for a developer who wants to truly understand it. Cover: what it is, why it matters, the core mechanisms, real-world applications, and key trade-offs. Professional tone, dense with insight.",
  "tags": ["specific_technical_tag", "domain", "subtopic", "technology"]
}

Guidelines:
1. MINIMUM 6 keyPoints — each substantive and technically complete
2. MINIMUM 5 actionableTips — specific and implementable
3. MINIMUM 5 toolsConcepts — with real explanations not just names
4. The shortExplanation should be a quality technical article intro
5. tags should be precise technical terms, not generic words`;

    const userMessage = `Extracted knowledge from video:\n\n${mergedInput}\n\nTranscript preview (first 800 chars):\n${originalTranscriptPreview.slice(0, 800)}`;

    const result = await callAI(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        3000,
        customApiKey
    );

    try {
        const parsed = JSON.parse(extractJSON(result));
        return {
            title: parsed.title || "Knowledge Entry",
            mainIdea: parsed.mainIdea || "",
            keyPoints: parsed.keyPoints || [],
            actionableTips: parsed.actionableTips || [],
            toolsConcepts: parsed.toolsConcepts || [],
            shortExplanation: parsed.shortExplanation || "",
            tags: parsed.tags || [],
        };
    } catch {
        console.error("[AI] Failed to parse structured knowledge:", result.slice(0, 400));
        throw new Error("Failed to parse AI response as structured knowledge");
    }
}

/**
 * Single-pass deep knowledge extraction for short transcripts.
 */
export async function extractKnowledgeSinglePass(
    cleanedTranscript: string,
    customApiKey?: string
): Promise<StructuredKnowledge> {
    const systemPrompt = `You are a world-class technical educator and domain expert. Analyze this transcript and create a comprehensive, encyclopedic knowledge article on the topic discussed.

CRITICAL: Go far beyond the video content. Use the transcript as a starting point and expand with complete expert-level knowledge. If it's about "API design" → cover REST, GraphQL, gRPC, versioning, authentication, rate limiting, caching, error handling, etc.

Return ONLY valid JSON — no markdown, no preamble. Use this exact structure:
{
  "title": "Clear, professional topic title",
  "mainIdea": "3-5 paragraphs of expert overview covering the full topic domain with technical depth",
  "keyPoints": [
    "Key concept with full technical explanation, context, and trade-offs — 2-4 sentences each"
  ],
  "actionableTips": [
    "Specific, implementable step with precise technical details"
  ],
  "toolsConcepts": [
    "Tool/Concept: Complete technical definition, use case, and when to use it"
  ],
  "shortExplanation": "400-600 word article-style technical introduction to the full topic",
  "tags": ["technical_tag", "domain", "subtopic"]
}

Requirements: 6+ keyPoints, 5+ actionableTips, 5+ toolsConcepts, substantive shortExplanation.`;

    const result = await callAI(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Transcript:\n\n${cleanedTranscript}` },
        ],
        2500,
        customApiKey
    );

    try {
        const parsed = JSON.parse(extractJSON(result));
        return {
            title: parsed.title || "Knowledge Entry",
            mainIdea: parsed.mainIdea || "",
            keyPoints: parsed.keyPoints || [],
            actionableTips: parsed.actionableTips || [],
            toolsConcepts: parsed.toolsConcepts || [],
            shortExplanation: parsed.shortExplanation || "",
            tags: parsed.tags || [],
        };
    } catch {
        console.error("[AI] Failed to parse single-pass knowledge:", result.slice(0, 400));
        throw new Error("Failed to parse AI response");
    }
}

/**
 * Auto-categorization.
 */
export async function suggestCategory(
    transcript: string,
    title: string,
    customApiKey?: string
): Promise<{ name: string; icon: string }> {
    const systemPrompt = `Categorize the following content into a single topic category.
Return ONLY valid JSON:
{"name": "SingleWordCategory", "icon": "🔧"}

Examples: Programming 💻, Security 🔒, Design 🎨, Business 💼, Science 🔬, Finance 💰, Marketing 📈, DevOps ⚙️, AI 🤖, Databases 🗄️`;

    const result = await callAI(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Title: ${title}\nContent preview: ${transcript.slice(0, 400)}` },
        ],
        100,
        customApiKey
    );

    try {
        const parsed = JSON.parse(extractJSON(result));
        return { name: parsed.name || "General", icon: parsed.icon || "📁" };
    } catch {
        return { name: "General", icon: "📁" };
    }
}

/**
 * Deep knowledge from metadata when transcript is unavailable.
 */
export async function extractKnowledgeFromMetadata(
    metadata: { title: string; description: string; uploader: string },
    customApiKey?: string
): Promise<StructuredKnowledge> {
    const systemPrompt = `You are a world-class domain expert. A video's transcript is unavailable, but you have its title and description. 

Your job: Create a comprehensive, authoritative knowledge article on the topic indicated by the title/description. Use your expert knowledge to cover the subject thoroughly — as if writing a technical reference article.

Return ONLY valid JSON:
{
  "title": "Professional, descriptive title for the topic",
  "mainIdea": "3-5 paragraph expert overview of the full topic domain with technical depth and context",
  "keyPoints": [
    "Major concept with full technical explanation, history, mechanics, and relevance — 2-4 sentences each"
  ],
  "actionableTips": [
    "Practical, specific implementation guidance with technical precision"
  ],
  "toolsConcepts": [
    "Tool/Concept: Authoritative technical definition with use cases and decision guidance"
  ],
  "shortExplanation": "400-600 word article-style technical overview of the complete topic",
  "tags": ["technical_tag", "domain", "subtopic"]
}

Requirements: 6+ keyPoints, 5+ actionableTips, 5+ toolsConcepts. Be an expert, not a summarizer.`;

    const userMessage = `Video topic seed:\nTitle: ${metadata.title}\nDescription: ${metadata.description}\nCreator: ${metadata.uploader}`;

    const result = await callAI(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        2500,
        customApiKey
    );

    try {
        const parsed = JSON.parse(extractJSON(result));
        return {
            title: parsed.title || metadata.title || "Knowledge Entry",
            mainIdea: parsed.mainIdea || "",
            keyPoints: parsed.keyPoints || [],
            actionableTips: parsed.actionableTips || [],
            toolsConcepts: parsed.toolsConcepts || [],
            shortExplanation: parsed.shortExplanation || "",
            tags: parsed.tags || [],
        };
    } catch {
        throw new Error("Failed to parse AI response from metadata");
    }
}
