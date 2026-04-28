import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Decode the DATABASE_URL (Vercel may URL-encode special characters)
// but keep query params intact — Supabase pooler needs ?pgbouncer=true
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  try {
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
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
