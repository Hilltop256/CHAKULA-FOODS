-- Fix missing Supabase migrations schema and table
-- This is needed when using Prisma with Supabase, as Supabase Dashboard
-- expects this table to exist even though Prisma manages migrations separately.

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  statements TEXT[]
);
