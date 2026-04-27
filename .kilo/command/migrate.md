---
description: Run database migrations
agent: code
model: anthropic/claude-sonnet
---
Run database migrations for chakula-foods.

Steps:
1. Create new migration: `cd chakula-foods && npx prisma migrate dev --name <name>`
2. Review migration files in prisma/migrations/
3. Apply migrations: `cd chakula-foods && npx prisma migrate deploy`
4. Verify schema changes match expectations
5. Update seed data if needed: `cd chakula-foods && npx prisma db seed`

Use $ARGUMENTS for migration name or flags.
Reference schema with @file prisma/schema.prisma.
Shell output with !`cmd` for verification.
