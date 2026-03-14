import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is present in production to avoid silent failures
if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  console.error("CRITICAL: DATABASE_URL is not defined in production environment.");
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Singleton instance of the Prisma client.
 */
export const prisma = db;
