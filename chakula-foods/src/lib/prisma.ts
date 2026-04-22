import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix: URL-decode DATABASE_URL before passing to Prisma
// Vercel may URL-encode special characters causing issues
function getCleanDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  try {
    // URL decode to fix %20 -> space and other encoded chars
    return decodeURIComponent(url);
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
