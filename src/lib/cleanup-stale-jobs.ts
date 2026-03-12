import { db } from "./db";

/**
 * Identifies and marks stale processing jobs as FAILED.
 * Stale jobs are those in a non-terminal state for more than 30 minutes.
 */
export async function cleanupStaleJobs() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    console.log("[Cleanup] Checking for stale jobs older than", thirtyMinutesAgo.toISOString());

    try {
        // Find jobs that are not COMPLETED or FAILED and haven't been updated in 30 minutes
        const staleJobs = await db.processingJob.findMany({
            where: {
                status: {
                    notIn: ["COMPLETED", "FAILED"],
                },
                updatedAt: {
                    lt: thirtyMinutesAgo,
                },
            },
            include: {
                reel: true,
            },
        });

        if (staleJobs.length === 0) {
            console.log("[Cleanup] No stale jobs found.");
            return { count: 0 };
        }

        console.log(`[Cleanup] Found ${staleJobs.length} stale jobs. Marking as FAILED.`);

        const results = await Promise.all(
            staleJobs.map(async (job) => {
                try {
                    // Update the reel status
                    await db.reel.update({
                        where: { id: job.reelId },
                        data: { status: "FAILED" },
                    });

                    // Update the job status
                    return await db.processingJob.update({
                        where: { id: job.id },
                        data: {
                            status: "FAILED",
                            error: "Processing timed out (stale job cleanup)",
                        },
                    });
                } catch (e) {
                    console.error(`[Cleanup] Failed to update job ${job.id}:`, e);
                    return null;
                }
            })
        );

        const successCount = results.filter(r => r !== null).length;
        console.log(`[Cleanup] Successfully cleaned up ${successCount} jobs.`);
        
        return { count: successCount };
    } catch (error) {
        console.error("[Cleanup] Error during stale job cleanup:", error);
        throw error;
    }
}
