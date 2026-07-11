# Quick Start: SharedReads Platform Development

**Date**: 2025-12-25
**Branch**: 001-sharedreads-platform
**Purpose**: Developer onboarding guide for setting up and running SharedReads platform locally

## Overview

This guide walks through setting up the complete SharedReads platform (frontend + backend) on your local machine, from zero to running application with database, authentication, and payment integration.

**Time to Complete**: ~30 minutes (excluding dependency downloads)

**Prerequisites**:
- Node.js 20.x LTS installed
- Git installed
- PostgreSQL 15+ installed locally OR Neon account (recommended)
- Cloudinary account (free tier)
- Razorpay test account
- Resend account (free tier)
- Twilio account (trial credits)

---

## Step 1: Repository Setup

### Clone Repository

```bash
git clone <repository-url>
cd shared-reads
git checkout 001-sharedreads-platform
```

### Verify Directory Structure

```bash
ls -la
# Expected output:
# - backend/
# - frontend/
# - specs/
# - .specify/
# - README.md
```

---

## Step 2: Backend Setup

### 2.1 Navigate to Backend

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

**Expected dependencies** (from package.json):
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.8.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "razorpay": "^2.9.2",
    "cloudinary": "^1.41.3",
    "resend": "^3.0.0",
    "twilio": "^4.20.0",
    "express-rate-limit": "^7.1.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "prisma": "^5.8.0",
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0"
  }
}
```

### 2.3 Environment Configuration

Create `.env` file in `backend/` directory:

```bash
cp .env.example .env
```

**Edit `.env` with your credentials**:

```env
# Node Environment
NODE_ENV=development
PORT=3000

# Database (Neon PostgreSQL recommended)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/sharedreads?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/sharedreads?sslmode=require"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_ACCESS_SECRET="your-access-token-secret-here"
JWT_REFRESH_SECRET="your-refresh-token-secret-here"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Razorpay (Test Mode)
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="your-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Resend (Email)
RESEND_API_KEY="re_xxxxx"
RESEND_FROM_EMAIL="SharedReads <noreply@sharedreads.app>"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="ACxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# CORS Origins (comma-separated)
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.4 Database Setup

**Initialize Prisma**:

```bash
npx prisma generate
```

**Run Database Migrations**:

```bash
npx prisma migrate dev --name init
```

Expected output:
```
✔ Generated Prisma Client (5.x.x)
✔ The migration has been created successfully
✔ Applied 1 migration
```

**Seed Admin User** (optional but recommended):

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 12);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@sharedreads.app' },
    update: {},
    create: {
      email: 'admin@sharedreads.app',
      passwordHash: adminPasswordHash,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Seed complete: Admin user created');
  console.log('   Email: admin@sharedreads.app');
  console.log('   Password: AdminPassword123');
  console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:

```bash
npx prisma db seed
```

### 2.5 Start Development Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3000
✅ Database connected
```

**Verify Backend Running**:

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","database":"connected"}
```

---

## Step 3: Frontend Setup

### 3.1 Open New Terminal and Navigate to Frontend

```bash
cd frontend  # From repository root
```

### 3.2 Install Dependencies

```bash
npm install
```

**Expected dependencies** (from package.json):
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "@tanstack/react-query": "^5.17.0",
    "react-hook-form": "^7.49.3",
    "zod": "^3.22.4",
    "axios": "^1.6.5",
    "tailwindcss": "^3.4.1"
  },
  "devDependencies": {
    "vite": "^5.0.11",
    "typescript": "^5.3.3",
    "@vitejs/plugin-react": "^4.2.1",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33"
  }
}
```

### 3.3 Environment Configuration

Create `.env` file in `frontend/` directory:

```bash
cp .env.example .env
```

**Edit `.env`**:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Razorpay (Test Mode - Public Key Only)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Cloudinary (Public Cloud Name Only)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Feature Flags (for Phase gating)
VITE_ENABLE_MESSAGING=false
VITE_ENABLE_MULTI_LANGUAGE=false
```

### 3.4 Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.11  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Verify Frontend Running**:

Open browser: `http://localhost:5173`
Expected: SharedReads landing page with "Sign Up" and "Login" buttons

---

## Step 4: Verify Full Stack Integration

### 4.1 Test User Registration Flow

1. **Open Frontend**: `http://localhost:5173`
2. **Click "Sign Up"**
3. **Fill Registration Form**:
   - Email: `test@example.com`
   - Phone: `+919876543210`
   - Password: `TestPassword123`
4. **Submit Form**

**Expected Backend Logs**:
```
✉️  OTP sent to test@example.com: 123456
📱 SMS sent to +919876543210: 654321
```

**Expected Frontend**: OTP verification screen

5. **Enter OTP Codes** (from backend logs)
6. **Submit OTP**

**Expected**: Redirected to dashboard with "Welcome!" message

### 4.2 Test Book Listing Creation

1. **Navigate to "List a Book"**
2. **Fill Book Form**:
   - Title: "Clean Code"
   - Author: "Robert C. Martin"
   - Condition: GOOD
   - Rental Type: PAID
   - Rental Price: 50
   - Deposit: 200
   - Duration: 14 days
   - Upload 2 sample images
   - Set location (allow browser geolocation or manual)
3. **Submit**

**Expected Backend Logs**:
```
📸 Image uploaded to Cloudinary: book-listings/xxx.jpg
✅ Book listing created: Clean Code
```

**Expected Frontend**: "Book listed successfully!" toast notification

### 4.3 Test Book Search

1. **Navigate to Search** (`/search`)
2. **Enter Search Query**: "Clean Code"
3. **Allow Location Access** (or enter manually)

**Expected**: Search results showing "Clean Code" listing with distance

### 4.4 Test Payment Flow (Razorpay Test Mode)

1. **Click on "Clean Code" book**
2. **Click "Request to Borrow"**
3. **Open Lender Account** (new incognito window, login as book owner)
4. **Approve Request**
5. **Switch to Borrower Account**
6. **Click "Pay Deposit"**

**Expected**: Razorpay test checkout modal opens

7. **Use Razorpay Test Card**:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
8. **Complete Payment**

**Expected Backend Logs**:
```
💰 Payment received: ₹250 (Deposit: ₹200, Rental: ₹50)
✅ Transaction status: DEPOSIT_PAID
```

**Expected Frontend**: "Payment successful!" notification, transaction status updated

---

## Step 5: Database Inspection (Optional)

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens browser at `http://localhost:5555` with GUI to inspect database tables:
- Users
- BookListings
- Transactions
- PaymentTransactions
- Reviews
- Disputes

---

## Step 6: Testing & Linting

### Backend Tests

```bash
cd backend
npm test
```

Expected output:
```
PASS  tests/unit/auth.test.ts
PASS  tests/integration/books.test.ts
PASS  tests/integration/transactions.test.ts

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

---

## Common Issues & Troubleshooting

### Issue: Database Connection Failed

**Error**: `P1001: Can't reach database server`

**Solution**:
- Verify `DATABASE_URL` in `.env` is correct
- Check Neon database is running (check dashboard)
- Ensure SSL mode: `?sslmode=require` is appended to connection string

### Issue: OTP Not Sending

**Error**: `Failed to send email/SMS`

**Solution**:
- Verify Resend API key is valid (test at resend.com/dashboard)
- Verify Twilio credentials are correct
- Check Twilio trial account has credits
- Verify phone number is E.164 format (`+91xxxxxxxxxx`)

### Issue: Razorpay Checkout Not Loading

**Error**: `Razorpay script failed to load`

**Solution**:
- Verify `VITE_RAZORPAY_KEY_ID` starts with `rzp_test_`
- Check browser console for CORS errors
- Ensure test mode is enabled in Razorpay dashboard

### Issue: Image Upload Failing

**Error**: `Cloudinary upload failed`

**Solution**:
- Verify Cloudinary credentials in `.env`
- Check Cloudinary upload preset allows unsigned uploads OR use signed upload
- Verify image size <10MB (free tier limit)

### Issue: Frontend Can't Reach Backend

**Error**: `Network Error` or CORS error

**Solution**:
- Verify backend is running on `http://localhost:3000`
- Check `CORS_ORIGINS` in backend `.env` includes `http://localhost:5173`
- Verify `VITE_API_BASE_URL` in frontend `.env` is correct

---

## Pre-Launch Checklist

Before deploying to production, verify:

### Environment Variables
- [ ] All secrets rotated from defaults
- [ ] Razorpay switched to live mode keys
- [ ] Cloudinary upload preset configured
- [ ] JWT secrets are cryptographically random (32+ chars)
- [ ] CORS origins limited to production domain

### Security
- [ ] HTTPS enforced (no HTTP traffic)
- [ ] Rate limiting enabled on all endpoints
- [ ] Admin password changed from seed default
- [ ] Database backup configured
- [ ] Secrets stored in secure vault (not in .env files in production)

### Performance
- [ ] Frontend bundle <500KB gzipped
- [ ] Lighthouse score >90
- [ ] Database indexes created (see data-model.md)
- [ ] Image optimization enabled (Cloudinary auto-format)
- [ ] CDN configured for static assets

### Functionality
- [ ] User registration and OTP verification works
- [ ] Book listing creation with 2+ images works
- [ ] Search returns results within 1 second
- [ ] Payment flow completes successfully
- [ ] Transaction lifecycle (request → pay → handover → return → complete) works end-to-end
- [ ] Reviews can be submitted after completed transaction
- [ ] Disputes can be raised and resolved by admin
- [ ] Admin dashboard displays correct metrics

### Constitution Compliance
- [ ] Mobile responsive (320px breakpoint tested)
- [ ] No in-app messaging features (WhatsApp/phone external coordination)
- [ ] Free tier limits respected (monitor Cloudinary, Neon usage)
- [ ] Photo uploads include EXIF data stripping (privacy)
- [ ] 90-day photo cleanup cron job configured

---

## Development Workflow

### Daily Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Prisma Studio (database GUI)
cd backend
npx prisma studio
```

### Making Database Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Regenerate Prisma client
npx prisma generate
```

### Adding New Dependencies

```bash
# Backend
cd backend
npm install <package-name>
npm install -D <dev-package-name>  # Dev dependencies

# Frontend
cd frontend
npm install <package-name>
```

### Git Workflow

```bash
# Commit changes
git add .
git commit -m "feat: add book listing creation"

# Push to feature branch
git push origin 001-sharedreads-platform

# Keep branch updated
git fetch origin
git rebase origin/master  # Or merge if preferred
```

---

## Next Steps

After completing quickstart setup:

1. **Run Full Test Suite**: `npm test` in both frontend and backend
2. **Review API Contracts**: See `specs/001-sharedreads-platform/contracts/api-contract.yaml`
3. **Review Data Model**: See `specs/001-sharedreads-platform/data-model.md`
4. **Implement User Stories**: Follow priority order (P1 → P2 → P3) from `spec.md`
5. **Generate Tasks**: Run `/speckit.tasks` to create detailed implementation tasks

---

## Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **React Query Docs**: https://tanstack.com/query/latest
- **Razorpay Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **Zod Validation**: https://zod.dev

---

## Support

For issues or questions:
- Check `specs/001-sharedreads-platform/` documentation
- Review constitution: `.specify/memory/constitution.md`
- Open GitHub issue with `[SharedReads]` prefix

---

**Happy Coding! 🚀**
