import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

function createPrismaClient(): PrismaClient {
  const dbUrl = getDatabaseUrl();

  if (!dbUrl) {
    return new PrismaClient({
      log: ["error"],
    });
  }

  // Use pg adapter for Supabase pooler (pgbouncer) compatibility
  const pool = globalForPrisma.pool ?? new Pool({ connectionString: dbUrl });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
