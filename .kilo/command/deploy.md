---
description: Deploy the application to production
agent: code
model: anthropic/claude-sonnet
---
Deploy chakula-foods application.

Steps:
1. Run build: `cd chakula-foods && npm run build`
2. Run database migrations: `cd chakula-foods && npx prisma migrate deploy`
3. Verify deployment: Check health endpoints and logs
4. Update deployment status in tracking system

Use $ARGUMENTS for any deployment flags (e.g., --dry-run, --force).
Reference files with @file for deployment configs.
Shell output with !`cmd` for verification steps.
