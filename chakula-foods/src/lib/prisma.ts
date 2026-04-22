import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix: Clean DATABASE_URL - remove query params and decode
// Vercel may URL-encode the URL causing Prisma to misinterpret
function getCleanDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  try {
    // First URL decode to fix %20 -> space etc
    let decoded = decodeURIComponent(url);
    // Then remove query params that Prisma doesn't handle
    const questionMarkIndex = decoded.indexOf("?");
    if (questionMarkIndex > 0) {
      decoded = decoded.substring(0, questionMarkIndex);
    }
    return decoded;
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
