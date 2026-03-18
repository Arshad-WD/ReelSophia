/**
 * OpenRouter AI Service
 * Handles chunk summarization and final structured knowledge extraction.
 * Designed to minimize token usage through chunked processing.
 */

import type { ChunkSummary, StructuredKnowledge } from "@/types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(
    messages: { role: string; content: string }[],
    maxTokens: number = 1000,
    customApiKey?: string
): Promise<string> {
    const apiKey = customApiKey || process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured and no custom key provided");
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
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
 * Summarize a single chunk of transcript into bullet points.
 * This is the first AI pass - extracts key ideas from each chunk.
 */
export async function summarizeChunk(
    chunk: string,
    chunkIndex: number,
    totalChunks: number,
    customApiKey?: string
): Promise<ChunkSummary> {
    const systemPrompt = `You are a high-fidelity intelligence extraction engine. Your mission is to decode this transcript chunk into its most granular and detailed components. 

CRITICAL: This is NOT a summary. Extract every fact, specific instruction, nuanced explanation, and contextual detail. 

This is part ${chunkIndex + 1} of ${totalChunks}.

Respond with valid JSON only:
{
  "keyIdeas": ["Encyclopedic breakdown of insight 1, preserving full technical and contextual depth", "Detailed explanation of fact 2 as presented in the source"],
  "tips": ["Extremely granular, step-by-step actionable advice including specific commands or parameters if mentioned"],
  "toolsMentioned": ["Specific tool, library, or system name with its exact role and context"],
  "concepts": ["Deep technical or theoretical definition of a concept mentioned, including the master-logic taught"]
}

Be exhaustive. Do not omit unique information. Each node should be a substantial, data-dense entry.`;

    const result = await callOpenRouter(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: chunk },
        ],
        800,
        customApiKey
    );

    try {
        return JSON.parse(result) as ChunkSummary;
    } catch {
        return { keyIdeas: [], tips: [], toolsMentioned: [], concepts: [] };
    }
}

/**
 * Final structured knowledge extraction from chunk summaries.
 * This is the second AI pass - combines all chunk summaries into one note.
 */
export async function extractStructuredKnowledge(
    chunkSummaries: ChunkSummary[],
    originalTranscriptPreview: string,
    customApiKey?: string
): Promise<StructuredKnowledge> {
    // Merge all chunk summaries into a compact input
    const mergedInput = chunkSummaries
        .map((cs, i) => {
            const parts: string[] = [];
            if (cs.keyIdeas.length) parts.push(`Ideas: ${cs.keyIdeas.join("; ")}`);
            if (cs.tips.length) parts.push(`Tips: ${cs.tips.join("; ")}`);
            if (cs.toolsMentioned.length) parts.push(`Tools: ${cs.toolsMentioned.join(", ")}`);
            if (cs.concepts.length) parts.push(`Concepts: ${cs.concepts.join(", ")}`);
            return `[Part ${i + 1}] ${parts.join(" | ")}`;
        })
        .join("\n");

    const systemPrompt = `You are a master knowledge architect and research encyclopedist. Your objective is to synthesize raw extracted data into a flagship-grade, comprehensive knowledge archive. 

CRITICAL: DO NOT SUMMARIZE. If a concept is explained, reconstruct the entire logic, context, and nuance. Your output must feel like a definitive reference manual for the topic.

Respond with valid JSON only:
{
  "title": "A precise, sophisticated, and professional title",
  "mainIdea": "A detailed multi-sentence thesis explaining the core objective, context, and complete underlying logic of the topic.",
  "keyPoints": [
    "Comprehensive exploration of insight 1: explain the 'why', the 'how', and the 'so what' with full nuance.",
    "Deep breakdown of fact 2: include all relevant details, sub-contexts, and supporting evidence mentioned.",
    "..."
  ],
  "actionableTips": [
    "High-fidelity, step-by-step practical advice. Be extremely specific about implementation and potential pitfalls.",
    "..."
  ],
  "toolsConcepts": [
    "Core Concept/Tool 1: An encyclopedic definition, its specific use case, and how it relates to the broader system discussed.",
    "..."
  ],
  "shortExplanation": "A thorough, high-density executive brief that covers the full scope of the topic with professional clarity. This should be substantial, not just a couple of sentences.",
  "tags": ["precise_technical_tag", "domain_expertise", "category"]
}

Guidelines:
1. Extraction Fidelity: If the source material provides a detailed walkthrough, your response must contain that entire walkthrough.
2. No Omissions: Capture every significant fact, name, tool, and methodology mentioned.
3. Logical Depth: Explain the connection between different points if the source establishes them.
4. Professional Tone: Use sophisticated, analytical, and authoritative language.
5. Content Only: Disregard any metadata or distracting transcript noise (timestamps, filler words, etc.).`;

    const userMessage = `Here are the extracted data nodes from a detailed intelligence source:\n\n${mergedInput}\n\nPrimary Context Header:\n${originalTranscriptPreview.slice(0, 300)}`;

    const result = await callOpenRouter(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        1500,
        customApiKey
    );

    try {
        const parsed = JSON.parse(result);
        return {
            title: parsed.title || "Untitled Note",
            mainIdea: parsed.mainIdea || "",
            keyPoints: parsed.keyPoints || [],
            actionableTips: parsed.actionableTips || [],
            toolsConcepts: parsed.toolsConcepts || [],
            shortExplanation: parsed.shortExplanation || "",
            tags: parsed.tags || [],
        };
    } catch {
        throw new Error("Failed to parse AI response as structured knowledge");
    }
}

/**
 * Single-pass extraction for short transcripts (under 300 words).
 * Uses only one AI call instead of chunk + merge.
 */
export async function extractKnowledgeSinglePass(
    cleanedTranscript: string,
    customApiKey?: string
): Promise<StructuredKnowledge> {
    const systemPrompt = `You are a master research encyclopedist. Your goal is to transform this transcript into a flagship-grade, comprehensive knowledge archive.

CRITICAL: DO NOT SUMMARIZE. Reconstruct the entire informational landscape, context, and methodology presented.

Respond with valid JSON only:
{
  "title": "A precise, sophisticated, and professional title",
  "mainIdea": "A detailed multi-sentence thesis explaining the core objective, context, and complete underlying logic of the topic.",
  "keyPoints": ["Comprehensive exploration of insight 1: explain the 'why', the 'how', and the 'so what' with full nuance."],
  "actionableTips": ["High-fidelity, step-by-step practical advice. Be extremely specific about implementation."],
  "toolsConcepts": ["Core Concept/Tool: An encyclopedic definition and its specific role in the presented system."],
  "shortExplanation": "A thorough, high-density executive brief that covers the full scope of the topic with professional clarity.",
  "tags": ["technical_tag", "domain", "category"]
}

Guidelines: Capture every significant fact, name, and methodology. If the speaker teaches a concept, explain the entire concept exactly as taught.`;

    const result = await callOpenRouter(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: cleanedTranscript },
        ],
        1200,
        customApiKey
    );

    try {
        const parsed = JSON.parse(result);
        return {
            title: parsed.title || "Untitled Note",
            mainIdea: parsed.mainIdea || "",
            keyPoints: parsed.keyPoints || [],
            actionableTips: parsed.actionableTips || [],
            toolsConcepts: parsed.toolsConcepts || [],
            shortExplanation: parsed.shortExplanation || "",
            tags: parsed.tags || [],
        };
    } catch {
        throw new Error("Failed to parse AI response");
    }
}

/**
 * AI Categorization — Suggests a folder name and icon for a reel.
 */
export async function suggestCategory(
    transcript: string,
    summary: string,
    customApiKey?: string
): Promise<{ name: string; icon: string }> {
    const systemPrompt = `You are a content organizer. Categorize this video into a single high-level folder.
Respond with valid JSON only:
{
  "name": "Single word category name (e.g. Tech, Food, Finance, Health, AI, Coding, Business, Entertainment)",
  "icon": "A single matching emoji (e.g. 💻, 🍔, 💰, 🏥, 🤖, 🔨, 📈, 🎨)"
}`;

    const userMessage = `Title/Summary: ${summary}\n\nTranscript Preview: ${transcript.slice(0, 500)}`;

    const result = await callOpenRouter(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        150,
        customApiKey
    );

    try {
        const parsed = JSON.parse(result);
        return {
            name: parsed.name || "General",
            icon: parsed.icon || "📁",
        };
    } catch {
        return { name: "General", icon: "📁" };
    }
}
/**
 * Fallback extraction for when transcription fails but video metadata is available.
 */
export async function extractKnowledgeFromMetadata(
    metadata: { title: string; description: string; uploader: string },
    customApiKey?: string
): Promise<StructuredKnowledge> {
    const systemPrompt = `You are a knowledge extraction assistant. You only have the video title and description, not the full transcript. 
Extract as much structured knowledge as possible based ON THE METADATA PROVIDED.
If the description is generic, do your best to infer the main idea.

Respond with valid JSON only:
{
  "title": "the video title or a refined version",
  "mainIdea": "one sentence describing the core concept based on metadata",
  "keyPoints": ["best guess at key insight 1"],
  "actionableTips": ["general advice related to the topic"],
  "toolsConcepts": ["tools or concepts mentioned in title/desc"],
  "shortExplanation": "2-3 sentence explanation based on what is known",
  "tags": ["tag1", "tag2"]
}

Guidelines:
- Acknowledge that this is an AI-generated summary from metadata.
- Be honest about the depth of information available.`;

    const userMessage = `Title: ${metadata.title}\nDescription: ${metadata.description}\nUploader: ${metadata.uploader}`;

    const result = await callOpenRouter(
        [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
        ],
        800,
        customApiKey
    );

    try {
        const parsed = JSON.parse(result);
        return {
            title: parsed.title || metadata.title || "Untitled Note",
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
