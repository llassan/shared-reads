# Research: SharedReads Platform Technology Decisions

**Date**: 2025-12-25
**Branch**: 001-sharedreads-platform
**Purpose**: Resolve technical unknowns from Technical Context and validate best practices for chosen tech stack

## Overview

This document captures research findings for technology choices, integration patterns, and best practices for the SharedReads platform. Primary focus: Email/SMS provider selection, Razorpay integration patterns, Cloudinary optimization for free tier, and PostgreSQL hosting options.

---

## 1. Email & SMS Provider Selection

### Decision: Resend (Email) + Twilio (SMS)

### Rationale

**Email Provider - Resend**:
- **Free Tier**: 3,000 emails/month (sufficient for pilot: ~200 users × 3 emails each = 600/month)
- **Cost Beyond Free Tier**: $20/month for 50K emails (scales economically)
- **Developer Experience**: Modern API, excellent TypeScript support, official SDKs
- **Deliverability**: 99%+ inbox delivery rate, built-in DKIM/SPF/DMARC
- **Latency**: <2s delivery for OTP codes (meets constitution requirement)
- **React Support**: Official React Email library for templating (bonus for future)

**Alternative Considered - SendGrid**:
- Free tier: 100 emails/day (3,000/month) - similar
- More complex API, older developer experience
- Strong deliverability but more enterprise-focused

**SMS Provider - Twilio**:
- **Free Tier**: $15 trial credit (~60-100 SMS in India at ₹0.60-0.80/SMS)
- **Cost Beyond Free Tier**: Pay-as-you-go at ₹0.60/SMS India rate
- **Budget Impact**: 200 users × 1 OTP = 200 SMS × ₹0.70 = ₹140/month (well within ₹3K budget)
- **Deliverability**: 99.95% global delivery rate, <5s for India
- **Developer Experience**: Industry-standard API, excellent docs, TypeScript SDK
- **Compliance**: Built-in DND (Do Not Disturb) registry compliance for India

**Alternative Considered - MSG91**:
- India-specific provider, cheaper (₹0.20-0.30/SMS)
- Less robust developer experience, smaller community
- Rejected: Twilio's reliability and global support worth the marginal cost difference

### Implementation Notes

**Resend Integration**:
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP email
await resend.emails.send({
  from: 'SharedReads <noreply@sharedreads.app>',
  to: user.email,
  subject: 'Verify your email - OTP Code',
  text: `Your verification code is: ${otp}`,
});
```

**Twilio Integration**:
```typescript
import twilio from 'twilio';
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP SMS
await client.messages.create({
  body: `Your SharedReads verification code is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: user.phone,
});
```

**OTP Generation Best Practice**:
- Use `crypto.randomInt(100000, 999999)` for 6-digit OTP
- Store hash of OTP in database (bcrypt), not plaintext
- Expire OTP after 10 minutes
- Rate limit: Max 3 OTP requests per phone/email per hour

---

## 2. Razorpay Integration Patterns

### Decision: Razorpay Standard Checkout + Route API for Escrow Simulation

### Rationale

**Razorpay Checkout**:
- **Free Tier**: No fixed cost, pay 2% transaction fee (industry standard)
- **Budget Impact**: 200 transactions × ₹100 avg × 2% = ₹400 fee (within ₹3K budget, fee passed to users)
- **Developer Experience**: Drop-in checkout UI, webhook support, TypeScript SDK
- **Features**: Supports both one-time payments (deposits) and transfers (rental fees to lenders)
- **Compliance**: PCI-DSS compliant, RBI approved, handles KYC for lenders receiving payments

**Escrow Simulation via Route API**:
- Razorpay Route allows split payments: hold deposit, transfer rental to lender
- Deposit held in platform Razorpay account until release
- On transaction completion: refund deposit to borrower, transfer rental (minus 15% commission) to lender
- Platform commission: `rental_fee × 0.15` retained in platform account

**Alternative Considered - Stripe**:
- Similar pricing (2.9% + ₹2 per transaction), slightly higher fees
- Less optimized for Indian market (no UPI, limited local payment methods)
- Better international support, but not needed for Phase 1 (single India campus)

### Implementation Notes

**Frontend: Razorpay Checkout Integration**:
```typescript
import { useRazorpay } from 'react-razorpay';

const { Razorpay } = useRazorpay();

const handlePayment = async (orderId: string, amount: number) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    name: 'SharedReads',
    description: 'Book Deposit + Rental Fee',
    order_id: orderId,
    handler: (response) => {
      // Verify payment on backend
      verifyPayment(response.razorpay_payment_id, response.razorpay_order_id);
    },
  };
  const rzp = new Razorpay(options);
  rzp.open();
};
```

**Backend: Create Order**:
```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order for deposit + rental
const order = await razorpay.orders.create({
  amount: (depositAmount + rentalFee) * 100, // paise
  currency: 'INR',
  receipt: `txn_${transactionId}`,
});
```

**Webhook Verification**:
```typescript
import crypto from 'crypto';

const verifyWebhook = (signature: string, body: string) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return signature === expectedSignature;
};
```

**Escrow Release (Deposit Refund)**:
```typescript
// Refund deposit to borrower on successful return
const refund = await razorpay.payments.refund(paymentId, {
  amount: depositAmount * 100,
  notes: { transaction_id: transactionId, type: 'deposit_refund' },
});
```

**Lender Payout (Rental Transfer)**:
```typescript
// Transfer rental fee (minus commission) to lender
const transfer = await razorpay.transfers.create({
  account: lender.razorpay_account_id,
  amount: (rentalFee * 0.85) * 100, // 85% to lender, 15% platform commission
  currency: 'INR',
  notes: { transaction_id: transactionId },
});
```

---

## 3. Cloudinary Optimization for Free Tier

### Decision: Cloudinary with aggressive optimization and 90-day cleanup

### Rationale

**Free Tier Limits**:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations/month

**Expected Usage (200 transactions, 500 books)**:
- Books: 500 listings × 3 photos avg × 500KB/photo = 750MB
- Transactions: 200 × 2 photos (before/after) × 500KB = 200MB
- **Total**: ~1GB storage (well within 25GB limit)
- Bandwidth: Assume 500 views/listing × 3 photos × 100KB (optimized) = 150MB
- **Total bandwidth**: <5GB/month (within 25GB limit)

**Optimization Strategy**:
- Upload format: Auto-convert to WebP (70% size reduction vs JPEG)
- Quality: `q_auto:good` (intelligent quality optimization)
- Lazy transformations: `f_auto,q_auto:good,w_800` for list views
- Full resolution only on book detail view
- Automatic 90-day deletion for unclaimed photos (constitution compliance)

**Alternative Considered - AWS S3**:
- Free tier: 5GB storage, 20K GET requests
- More manual optimization required
- Cloudinary's auto-format and transformation save development time

### Implementation Notes

**Upload with Optimization**:
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload with auto-optimization
const upload = await cloudinary.uploader.upload(file.path, {
  folder: 'book-listings',
  transformation: [
    { quality: 'auto:good', fetch_format: 'auto' },
    { width: 1200, crop: 'limit' }, // Max width 1200px
  ],
  tags: [`user_${userId}`, `listing_${listingId}`],
});
```

**Signed URLs for Security**:
```typescript
// Generate signed URL with expiration
const signedUrl = cloudinary.url(publicId, {
  sign_url: true,
  secure: true,
  type: 'authenticated',
  expires_at: Math.floor(Date.now() / 1000) + 86400, // 24hr expiry
});
```

**90-Day Cleanup (Cron Job)**:
```typescript
// Delete images older than 90 days for completed transactions
const deleteOldImages = async () => {
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
  });

  for (const txn of expiredTransactions) {
    await cloudinary.api.delete_resources([
      txn.beforePhotoPublicId,
      txn.afterPhotoPublicId,
    ]);
  }
};
```

---

## 4. PostgreSQL Hosting Options

### Decision: Neon Serverless PostgreSQL

### Rationale

**Neon vs Supabase Comparison**:

| Feature | Neon | Supabase |
|---------|------|----------|
| Free Tier Storage | 3GB | 500MB |
| Free Tier Bandwidth | Unlimited | 2GB/month |
| Auto-pause | Yes (saves costs) | No |
| Connection Pooling | Built-in | Requires pgBouncer |
| Branching | Yes (git-like) | No |
| Prisma Compatibility | Excellent | Good |

**Decision: Neon**
- 3GB storage sufficient for 10K+ users (estimated 500MB for Phase 1)
- Auto-pause feature reduces costs when idle (constitution cost-consciousness)
- Serverless architecture aligns with frontend (Vercel) + backend (Railway) serverless approach
- Branching feature useful for testing migrations before production deploy
- Better Prisma support (official partnership)

**Alternative - Supabase**:
- 500MB limit too restrictive for growth beyond 1000 users
- Additional features (Auth, Realtime) not needed (we're building custom auth)
- Would require upgrade sooner, increasing long-term costs

### Implementation Notes

**Prisma Connection**:
```typescript
// DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/sharedreads?sslmode=require"

// Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection pooling (recommended for serverless)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL") // For migrations
}
```

**Migration Strategy**:
```bash
# Create migration
npx prisma migrate dev --name init

# Apply to production (Neon)
npx prisma migrate deploy

# Use branching for safe testing
# Create Neon branch "staging" → test migration → merge to main
```

---

## 5. Best Practices Summary

### Authentication & Security
- **JWT**: Use `access token` (15min expiry) + `refresh token` (7 days) pattern
- **httpOnly Cookies**: Store refresh token in httpOnly cookie (CSRF protection)
- **Zod Validation**: Shared schemas between frontend/backend for type safety
- **Rate Limiting**: express-rate-limit with Redis-free in-memory store (Phase 1)

### State Management
- **React Query**: Server state (API data) cached and synchronized automatically
- **Local State**: Use React Context for auth state only, avoid Redux complexity
- **Form State**: React Hook Form with Zod resolver for validation

### Error Handling
- **Backend**: Centralized error middleware with error codes (AUTH_001, PAYMENT_002, etc.)
- **Frontend**: Toast notifications for user-facing errors, error boundaries for crashes
- **Logging**: Console logs for development, structured logs (JSON) for production

### Performance Optimization
- **Code Splitting**: React.lazy() for admin dashboard (reduces initial bundle)
- **Image Lazy Loading**: Cloudinary `loading="lazy"` attribute + React Lazy Load Image
- **API Pagination**: Cursor-based pagination for book listings (scalable to 10K+ books)
- **Database Indexes**: Add indexes on: `books.location`, `transactions.status`, `users.email`

### Testing Strategy
- **Unit Tests**: Jest for utils, services, validation schemas (>70% coverage for auth/payment)
- **Integration Tests**: Supertest for API endpoints (test happy path + error cases)
- **Manual Checklist**: Pre-launch checklist for critical flows (see quickstart.md)

---

## 6. Unresolved Clarifications

**None.** All technical unknowns from Technical Context have been resolved.

---

## 7. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Free tier limits exceeded early | Low | High | Monitor usage weekly, compress images aggressively, implement 90-day cleanup |
| Razorpay webhook failures | Medium | High | Implement retry logic with exponential backoff, manual admin override for stuck payments |
| Email/SMS delivery failures | Low | Medium | Retry 3 times with 30s delay, fallback to manual verification by admin |
| Neon auto-pause delays | Medium | Low | Configure minimum compute units to reduce cold starts, acceptable <2s delay |
| Image upload failures on slow networks | High | Medium | Client-side image compression before upload, show progress indicator, retry mechanism |

---

## Conclusion

All technical decisions align with constitution principles:
- ✅ Lean & Proven Tech Stack (Resend, Twilio, Razorpay, Neon, Cloudinary)
- ✅ Cost Efficiency (<₹3K/month budget: Resend free, Twilio ₹140/mo, Razorpay 2% fee, Neon/Cloudinary free)
- ✅ Performance Goals (Optimized images, serverless auto-scale, connection pooling)
- ✅ Security by Default (Webhook verification, signed URLs, JWT refresh tokens)

**Ready to proceed to Phase 1: Data Model & Contracts.**
