# Chakula Foods - Deployment Guide

## Overview
Food ordering application built with Next.js, Prisma ORM, and PostgreSQL. Deployed on Vercel.

## Project Structure
```
chakula-foods/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and services
│   │   ├── prisma.ts     # Prisma client
│   │   └── ...
│   └── store/            # State management
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── vercel.json           # Vercel deployment config
```

## VS Code Development

### Kilo CLI Integration
This project uses Kilo CLI for deployment workflow automation.

**Quick Commands:**
- `/deploy` - Deploy the application
- `/migrate` - Run database migrations
- `/switch-agent deploy` - Use deployment specialist

**Kilo Files Created:**
- `.kilo/command/deploy.md` - Deployment workflow
- `.kilo/command/migrate.md` - Migration workflow  
- `.kilo/agent/deploy.md` - Deployment specialist agent
- `.kilo/kilo.json` - Kilo configuration

### VS Code Tasks
Use `Ctrl+Shift+P` > "Run Task" to execute:
- **Build chakula-foods** - Build the Next.js application
- **Run Migrations** - Apply database migrations
- **Create Migration** - Create new Prisma migration
- **Deploy to Vercel** - Deploy to production
- **Seed Database** - Run database seed script

### Launch Configurations
Debug configuration available for Kilo CLI in `.vscode/launch.json`.

## Local Development

```bash
# Install dependencies
cd chakula-foods && npm install

# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Run tests
npm run lint
```

## Database (PostgreSQL + Prisma)

### Schema Overview
Key models:
- **User** - Customer accounts with roles
- **Product** - Food items with categories
- **Order** - Customer orders with status tracking
- **Subscription** - Recurring meal plans
- **Payment** - Transaction records
- **Review** - Product reviews

### Migration Workflow

1. **Create Migration:**
   ```bash
   cd chakula-foods
   npx prisma migrate dev --name <migration_name>
   ```

2. **Review Changes:**
   - Check `prisma/migrations/` directory
   - Review SQL generated
   - Update schema documentation if needed

3. **Apply to Production:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify:**
   ```bash
   npx prisma studio
   ```

## Deployment

### Pre-deployment Checklist
- [ ] Run `npm run build` - Verify build succeeds
- [ ] Run `npx prisma generate` - Generate Prisma client
- [ ] Run `npx prisma validate` - Validate schema
- [ ] Create migration if schema changed
- [ ] Review environment variables
- [ ] Check Vercel dashboard for active deployments

### Production Deployment

**Automatic (via Git):**
```bash
git add .
git commit -m "Deploy: <description>"
git push origin main
```

**Manual (Vercel CLI):**
```bash
cd chakula-foods
vercel --prod
```

**Using Kilo CLI:**
```bash
/deploy
```

### Post-deployment Verification
1. Check `/api/health` endpoint
2. Verify database connectivity
3. Test user registration/login
4. Test order placement flow
5. Check error logs in Vercel dashboard

## Environment Variables

Required for production:
```
DATABASE_URL=postgresql://user:password@host:port/database
NEXT_PUBLIC_APP_URL=https://your-domain.com
JWT_SECRET=your-secret-key
```

## Monitoring

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Prisma Studio:** `npx prisma studio`
- **Logs:** Vercel function logs
- **Database:** Direct PostgreSQL connection

## Rollback Procedure

1. **Identify stable version:**
   ```bash
   git log --oneline
   ```

2. **Revert deployment:**
   ```bash
   vercel rollback <deployment-id>
   ```

3. **Revert database (if needed):**
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

4. **Verify rollback:**
   - Check application health
   - Test critical functionality
   - Review error logs

## Troubleshooting

### Build Failures
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check Prisma schema
npx prisma validate

# Clean and rebuild
rm -rf .next && npm run build
```

### Database Connection Issues
```bash
# Verify connection URL
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Check migrations
npx prisma migrate status
```

### Migration Conflicts
```bash
# Reset database (dev only)
npx prisma migrate reset

# Resolve conflicts
npx prisma migrate resolve --applied <migration_name>
```

## Team Guidelines

- Always create migrations for schema changes
- Review migration SQL before applying to production
- Test deployments in staging first
- Monitor error logs after deployment
- Document breaking changes
- Use semantic versioning for releases

## Support

For issues or questions:
- Check deployment logs in Vercel
- Review Prisma migration history
- Contact DevOps team
