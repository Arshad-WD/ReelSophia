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

export interface ProcessingJobData {
    reelId: string;
    userId: string;
    sourceUrl: string;
    platform: string;
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
