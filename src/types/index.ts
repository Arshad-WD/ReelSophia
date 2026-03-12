export interface StructuredKnowledge {
    title: string;
    mainIdea: string;
    keyPoints: string[];
    actionableTips: string[];
    toolsConcepts: string[];
    shortExplanation: string;
    tags: string[];
}

export interface ChunkSummary {
    keyIdeas: string[];
    tips: string[];
    toolsMentioned: string[];
    concepts: string[];
}

export interface AISettings {
    keys: {
        openrouter?: string;
        openai?: string;
        anthropic?: string;
        gemini?: string;
    };
    preferredProvider: string;
}

export interface User {
    id: string;
    email: string;
    name: string | null;
    imageUrl: string | null;
    aiSettings: AISettings | null;
}

export interface ProcessingJobData {
    reelId: string;
    userId: string;
    sourceUrl: string;
    platform: string;
    aiSettings?: AISettings;
}

export interface ReelWithJob {
    id: string;
    sourceUrl: string;
    platform: string;
    title: string | null;
    summary: string | null;
    mainIdea: string | null;
    keyPoints: string[];
    actionableTips: string[];
    toolsConcepts: string[];
    shortExplanation: string | null;
    tags: string[];
    status: string;
    createdAt: Date;
    folder: {
        id: string;
        name: string;
        icon: string | null;
    } | null;
    job: {
        status: string;
        progress: number;
        error: string | null;
    } | null;
}
