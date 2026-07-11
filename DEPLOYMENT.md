# SharedReads Deployment Guide

This guide covers deploying SharedReads to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Accounts

- **Neon** (PostgreSQL) - [neon.tech](https://neon.tech)
- **Railway/Render** (Backend hosting) - [railway.app](https://railway.app) or [render.com](https://render.com)
- **Vercel/Netlify** (Frontend hosting) - [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com)
- **Cloudinary** (Image storage) - [cloudinary.com](https://cloudinary.com)
- **Razorpay** (Payments) - [razorpay.com](https://razorpay.com)
- **Resend** (Email) - [resend.com](https://resend.com)
- **Twilio** (SMS) - [twilio.com](https://twilio.com)

### Production Checklist

- [ ] Generate new JWT secrets (different from dev)
- [ ] Setup production database
- [ ] Configure all external services
- [ ] Setup custom domain (optional)
- [ ] Configure SSL/TLS
- [ ] Setup error monitoring (Sentry recommended)
- [ ] Configure backup strategy

## Database Setup (Neon)

### 1. Create Neon Project

```bash
# Sign up at neon.tech
# Create new project: sharedreads-prod
# Select region closest to your users
# Copy connection string
```

### 2. Configure Database

```bash
# Connection string format:
postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/sharedreads?sslmode=require

# Save as:
DATABASE_URL=<your-connection-string>
DIRECT_DATABASE_URL=<your-connection-string>
```

### 3. Run Migrations

```bash
cd backend

# Set production DATABASE_URL
export DATABASE_URL="<your-neon-connection-string>"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Backend Deployment

### Option 1: Railway

#### 1. Setup Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init
```

#### 2. Configure Environment Variables

Add these in Railway dashboard or via CLI:

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=<neon-connection-string>
DIRECT_DATABASE_URL=<neon-connection-string>

# JWT Secrets (GENERATE NEW ONES!)
JWT_ACCESS_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# Razorpay (PRODUCTION KEYS)
RAZORPAY_KEY_ID=<production-key-id>
RAZORPAY_KEY_SECRET=<production-secret>
RAZORPAY_WEBHOOK_SECRET=<webhook-secret>

# Resend
RESEND_API_KEY=<your-api-key>
RESEND_FROM_EMAIL=SharedReads <noreply@yourdomain.com>

# Twilio
TWILIO_ACCOUNT_SID=<your-account-sid>
TWILIO_AUTH_TOKEN=<your-auth-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>

# CORS (update with your frontend URL)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 3. Deploy

```bash
railway up
```

#### 4. Run Post-Deployment Tasks

```bash
# Create admin user
railway run npx ts-node scripts/seed-admin.ts
```

### Option 2: Render

#### 1. Create Web Service

- Go to Render dashboard
- New > Web Service
- Connect your GitHub repository
- Select `backend` directory

#### 2. Configure Build Settings

```yaml
Build Command: npm install && npx prisma generate
Start Command: npm start
```

#### 3. Add Environment Variables

Add all variables from the Railway section above in Render dashboard.

#### 4. Deploy

Click "Create Web Service" - Render will auto-deploy.

## Frontend Deployment

### Option 1: Vercel

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
cd frontend

# Login
vercel login

# Deploy
vercel

# Follow prompts
# - Set root directory: ./frontend
# - Build command: npm run build
# - Output directory: dist
```

#### 3. Configure Environment Variables

In Vercel dashboard, add:

```env
VITE_API_URL=https://your-backend-url.railway.app/api/v1
VITE_RAZORPAY_KEY_ID=<production-razorpay-key-id>
```

#### 4. Redeploy

```bash
vercel --prod
```

### Option 2: Netlify

#### 1. Build Settings

```toml
# netlify.toml
[build]
  base = "frontend/"
  command = "npm run build"
  publish = "dist/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Environment Variables

Add in Netlify dashboard:

```env
VITE_API_URL=https://your-backend-url.railway.app/api/v1
VITE_RAZORPAY_KEY_ID=<production-razorpay-key-id>
```

#### 3. Deploy

```bash
# Connect repository in Netlify dashboard
# Or use CLI
npm install -g netlify-cli
netlify deploy --prod
```

## Post-Deployment

### 1. Create Admin User

```bash
# If using Railway
railway run -s backend npx ts-node scripts/seed-admin.ts

# If using Render (use shell access)
# Or run locally with production DATABASE_URL
npx ts-node scripts/seed-admin.ts
```

### 2. Test Critical Flows

- [ ] User registration with OTP
- [ ] Email and SMS delivery
- [ ] Book listing with image upload
- [ ] Search functionality
- [ ] Payment processing (use test card)
- [ ] Transaction workflow
- [ ] Admin dashboard access

### 3. Configure Custom Domain

#### Vercel/Netlify

- Add custom domain in dashboard
- Update DNS records
- SSL automatically configured

#### Railway/Render

- Add custom domain in dashboard
- Update DNS CNAME record
- SSL automatically configured

### 4. Update CORS Origins

Update backend `CORS_ORIGINS` to include production domains:

```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Monitoring & Maintenance

### Error Monitoring

#### Setup Sentry (Recommended)

**Backend:**

```bash
npm install @sentry/node

# In src/server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Frontend:**

```bash
npm install @sentry/react

# In src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Database Backups

#### Neon Automatic Backups

- Neon automatically backs up data
- Point-in-time restore available
- Configure retention period in dashboard

#### Manual Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup-20240101.sql
```

### Monitoring Checklist

- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error alerts (Sentry)
- [ ] Monitor API response times
- [ ] Track database performance
- [ ] Monitor Cloudinary storage usage
- [ ] Track Razorpay transaction volume
- [ ] Monitor email/SMS delivery rates

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Update Prisma
npx prisma migrate deploy
```

### Scaling Considerations

#### Database

- Neon autoscales automatically
- Monitor query performance
- Add indexes for slow queries
- Consider read replicas for high traffic

#### Backend

- Railway/Render autoscales
- Monitor memory usage
- Consider Redis for session storage
- Implement caching strategy

#### Frontend

- Vercel/Netlify handle scaling
- Optimize images (already using Cloudinary)
- Implement code splitting if needed

### Log Management

#### Railway

```bash
# View logs
railway logs

# Stream logs
railway logs --follow
```

#### Render

- View logs in dashboard
- Configure log retention
- Export to external service if needed

### Cost Optimization

#### Free Tier Limits

- **Neon**: 10 projects, 3GB storage
- **Railway**: $5/month credit, then $0.000231/GB-hour
- **Vercel**: 100GB bandwidth/month
- **Cloudinary**: 25GB storage, 25GB bandwidth/month
- **Resend**: 3,000 emails/month
- **Twilio**: Trial credits, then pay-as-you-go

#### Optimization Tips

1. **Cloudinary**: Optimize images on upload
2. **Database**: Clean up old OTP records regularly
3. **Logs**: Limit log retention
4. **API**: Implement request caching
5. **Email/SMS**: Batch notifications when possible

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Check Neon dashboard for connection limits
```

#### CORS Errors

```bash
# Ensure CORS_ORIGINS includes your domain
# Format: https://domain.com (no trailing slash)
```

#### Image Upload Failures

```bash
# Verify Cloudinary credentials
# Check upload limits
# Verify file size restrictions
```

#### Payment Issues

```bash
# Use Razorpay production keys (not test)
# Verify webhook URL is configured
# Check webhook signature validation
```

### Rollback Procedure

#### Backend Rollback

```bash
# Railway
railway rollback

# Render
# Use dashboard to rollback to previous deploy
```

#### Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD.sql

# Or use Neon point-in-time restore
```

## Support

For deployment issues:

- **Technical Issues**: Create GitHub issue
- **Service-Specific**: Contact respective support
- **Emergency**: Check status pages of services

## Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/production-best-practices)

---

**Note**: Always test in a staging environment before deploying to production.
