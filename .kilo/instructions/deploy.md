# Deployment Instructions for chakula-foods

## Overview
This project is a Next.js food ordering application (chakula-foods) deployed on Vercel with a PostgreSQL database via Prisma ORM.

## Technology Stack
- **Framework**: Next.js (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Vercel
- **Package Manager**: Bun/NPM

## Key Files
- `chakula-foods/vercel.json` - Vercel deployment config
- `chakula-foods/next.config.ts` - Next.js configuration
- `chakula-foods/prisma/schema.prisma` - Database schema
- `chakula-foods/src/lib/prisma.ts` - Prisma client setup

## Deployment Workflow

### 1. Pre-deployment Checks
```bash
cd chakula-foods
npm run build  # Verify build succeeds
npx prisma generate  # Generate Prisma client
npx prisma validate  # Validate schema
```

### 2. Database Migrations
```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Deploy migrations to production
npx prisma migrate deploy

# Review migration history
npx prisma migrate status
```

### 3. Deployment
```bash
# Vercel deployment (automatic via git push)
# Or manual:
vercel --prod
```

### 4. Post-deployment Verification
- Check `/api/health` endpoint
- Verify database connectivity
- Test critical user flows (login, cart, checkout)
- Monitor error logs

## Rollback Procedure
1. Identify last stable commit
2. Revert deployment: `vercel rollback <deployment-id>`
3. Revert database: `npx prisma migrate resolve --rolled-back <migration_name>`
4. Verify rollback success

## Environment Variables
Required for production deployment:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Application URL
- `JWT_SECRET` - Auth token secret
- Payment gateway keys (Stripe, etc.)
- SMS service credentials (if used)

## Monitoring
- Vercel dashboard: https://vercel.com/dashboard
- Prisma Studio: `npx prisma studio`
- Application logs: Vercel function logs

## Troubleshooting

### Build Failures
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports resolve correctly
- Check Prisma schema for syntax errors

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL server is running
- Ensure network/firewall allows connections
- Run `npx prisma db pull` to sync schema

### Migration Conflicts
- Resolve conflicts in prisma/migrations/
- Use `npx prisma migrate resolve` to mark as applied
- Never modify applied migrations directly
