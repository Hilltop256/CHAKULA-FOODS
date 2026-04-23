import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix: Clean DATABASE_URL - remove query params and decode
// Vercel may URL-encode the URL causing Prisma to misinterpret
function getCleanDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  try {
    // First remove query params (they come after ?)
    const questionMarkIndex = url.indexOf("?");
    let cleaned = questionMarkIndex > 0 ? url.substring(0, questionMarkIndex) : url;
    // Then URL decode to fix %20 -> space etc
    return decodeURIComponent(cleaned);
  } catch {
    return url;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
    datasources: {
      db: {
        url: getCleanDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
