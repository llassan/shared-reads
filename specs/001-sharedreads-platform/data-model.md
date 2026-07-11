# Data Model: SharedReads Platform

**Date**: 2025-12-25
**Branch**: 001-sharedreads-platform
**Purpose**: Define database schema, entities, relationships, and constraints for SharedReads platform

## Overview

This document specifies the complete data model for the SharedReads platform using Prisma schema syntax. The model supports peer-to-peer book sharing with trust mechanisms (escrow, reviews, disputes) and admin oversight.

**Database**: PostgreSQL 15+ (Neon serverless)
**ORM**: Prisma 5.x
**Type Safety**: Full TypeScript types generated from Prisma schema

---

## Entity Relationship Diagram (Conceptual)

```
┌─────────┐              ┌──────────────┐              ┌─────────┐
│  User   │──────────────│ BookListing  │              │  Admin  │
│         │  owns        │              │              │         │
│         │1          1..*│              │              │         │
└────┬────┘              └──────┬───────┘              └────┬────┘
     │                          │                           │
     │ lends/borrows            │ subject of                │ resolves
     │                          │                           │
     ├──────────┬───────────────┴───────────┐               │
     │          │                           │               │
┌────▼────┐ ┌──▼───────────┐      ┌────────▼─────┐   ┌────▼────┐
│ Borrow  │ │ Transaction  │──────│   Review     │   │ Dispute │
│ Request │ │              │1   2 │              │   │         │
└─────────┘ └──────┬───────┘      └──────────────┘   └─────────┘
                   │
                   │ tracks
                   │
            ┌──────▼─────────┐
            │    Payment     │
            │  Transaction   │
            └────────────────┘
```

---

## Prisma Schema

### Core User Entity

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  phone             String   @unique
  passwordHash      String
  name              String?
  profilePhoto      String?  // Cloudinary URL
  location          Json?    // { lat: number, lng: number, address: string }

  // Verification status
  emailVerified     Boolean  @default(false)
  phoneVerified     Boolean  @default(false)
  emailOtpHash      String?
  phoneOtpHash      String?
  otpExpiresAt      DateTime?

  // Reputation & status
  reputationScore   Float    @default(0.0) // 0-5 calculated from reviews
  accountStatus     AccountStatus @default(ACTIVE)
  suspendedReason   String?

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?

  // Relations
  listedBooks       BookListing[]    @relation("LenderBooks")
  borrowRequests    BorrowRequest[]  @relation("BorrowerRequests")
  lenderRequests    BorrowRequest[]  @relation("LenderRequests")

  transactionsAsBorrower  Transaction[] @relation("BorrowerTransactions")
  transactionsAsLender    Transaction[] @relation("LenderTransactions")

  reviewsGiven      Review[]         @relation("ReviewerReviews")
  reviewsReceived   Review[]         @relation("RevieweeReviews")

  disputesRaised    Dispute[]        @relation("DisputeInitiator")

  userAgreements    UserAgreement[]

  @@index([email])
  @@index([phone])
  @@index([accountStatus])
  @@map("users")
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### Book Listing Entity

```prisma
model BookListing {
  id              String   @id @default(cuid())

  // Book info
  title           String
  author          String
  description     String?

  // Condition & rental terms
  condition       BookCondition
  rentalType      RentalType
  rentalPrice     Decimal?  @db.Decimal(10, 2) // NULL for FREE rentals
  depositAmount   Decimal?  @db.Decimal(10, 2) // Required for PAID, optional for FREE
  rentalDuration  Int       // Days

  // Images (Cloudinary URLs)
  images          String[]  // Min 2, max 5

  // Location
  location        Json      // { lat: number, lng: number, address: string }

  // Availability
  available       Boolean   @default(true)

  // Lender reference
  lenderId        String
  lender          User      @relation("LenderBooks", fields: [lenderId], references: [id])

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  borrowRequests  BorrowRequest[]
  transactions    Transaction[]

  @@index([lenderId])
  @@index([rentalType])
  @@index([available])
  @@fulltext([title, author]) // PostgreSQL full-text search
  @@map("book_listings")
}

enum BookCondition {
  NEW
  LIKE_NEW
  GOOD
  ACCEPTABLE
}

enum RentalType {
  FREE
  PAID
}
```

### Borrow Request Entity

```prisma
model BorrowRequest {
  id              String   @id @default(cuid())

  // Request parties
  borrowerId      String
  borrower        User     @relation("BorrowerRequests", fields: [borrowerId], references: [id])

  lenderId        String
  lender          User     @relation("LenderRequests", fields: [lenderId], references: [id])

  bookListingId   String
  bookListing     BookListing @relation(fields: [bookListingId], references: [id])

  // Request status
  status          RequestStatus @default(PENDING)
  rejectionReason String?

  // Timestamps
  createdAt       DateTime  @default(now())
  approvedAt      DateTime?
  rejectedAt      DateTime?

  // Relations
  transaction     Transaction?  @relation("RequestTransaction")

  @@index([borrowerId])
  @@index([lenderId])
  @@index([status])
  @@unique([borrowerId, bookListingId, status]) // Prevent duplicate pending requests
  @@map("borrow_requests")
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}
```

### Transaction Entity

```prisma
model Transaction {
  id                  String   @id @default(cuid())

  // Transaction parties
  borrowerId          String
  borrower            User     @relation("BorrowerTransactions", fields: [borrowerId], references: [id])

  lenderId            String
  lender              User     @relation("LenderTransactions", fields: [lenderId], references: [id])

  bookListingId       String
  bookListing         BookListing @relation(fields: [bookListingId], references: [id])

  borrowRequestId     String   @unique
  borrowRequest       BorrowRequest @relation("RequestTransaction", fields: [borrowRequestId], references: [id])

  // Transaction status
  status              TransactionStatus @default(INITIATED)

  // Financial info
  depositAmount       Decimal  @db.Decimal(10, 2)
  rentalAmount        Decimal  @default(0) @db.Decimal(10, 2) // 0 for FREE rentals
  platformFee         Decimal  @default(0) @db.Decimal(10, 2) // 15% of rentalAmount

  // Evidence photos (Cloudinary URLs)
  beforeHandoverPhoto String?
  afterReturnPhoto    String?

  // Timestamps
  createdAt           DateTime @default(now())
  depositPaidAt       DateTime?
  handoverAt          DateTime?
  returnedAt          DateTime?
  completedAt         DateTime?

  // Relations
  paymentTransactions PaymentTransaction[]
  reviews             Review[]
  dispute             Dispute?

  @@index([borrowerId])
  @@index([lenderId])
  @@index([status])
  @@map("transactions")
}

enum TransactionStatus {
  INITIATED
  DEPOSIT_PAID
  BOOK_RECEIVED
  BOOK_RETURNED
  COMPLETED
  DISPUTED
  CANCELLED
}
```

### Payment Transaction Entity

```prisma
model PaymentTransaction {
  id                  String   @id @default(cuid())

  // Razorpay identifiers
  razorpayOrderId     String   @unique
  razorpayPaymentId   String?  @unique

  // Transaction details
  transactionId       String
  transaction         Transaction @relation(fields: [transactionId], references: [id])

  payerId             String   // User who made payment (borrower)

  type                PaymentType
  amount              Decimal  @db.Decimal(10, 2)
  currency            String   @default("INR")
  status              PaymentStatus @default(PENDING)

  // Razorpay webhook data
  gatewayResponse     Json?    // Full webhook payload

  // Timestamps
  createdAt           DateTime @default(now())
  completedAt         DateTime?
  refundedAt          DateTime?

  @@index([transactionId])
  @@index([status])
  @@map("payment_transactions")
}

enum PaymentType {
  DEPOSIT
  RENTAL
  REFUND
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}
```

### Review Entity

```prisma
model Review {
  id              String   @id @default(cuid())

  // Review parties
  reviewerId      String
  reviewer        User     @relation("ReviewerReviews", fields: [reviewerId], references: [id])

  revieweeId      String
  reviewee        User     @relation("RevieweeReviews", fields: [revieweeId], references: [id])

  transactionId   String
  transaction     Transaction @relation(fields: [transactionId], references: [id])

  // Review content
  rating          Int      // 1-5 stars
  comment         String?

  // Timestamp
  createdAt       DateTime @default(now())

  @@index([revieweeId])
  @@unique([reviewerId, transactionId]) // One review per user per transaction
  @@map("reviews")
}
```

### Dispute Entity

```prisma
model Dispute {
  id                  String   @id @default(cuid())

  // Dispute subject
  transactionId       String   @unique
  transaction         Transaction @relation(fields: [transactionId], references: [id])

  // Raised by
  raisedById          String
  raisedBy            User     @relation("DisputeInitiator", fields: [raisedById], references: [id])

  // Dispute details
  reason              DisputeReason
  description         String
  evidencePhotos      String[] // Cloudinary URLs

  // Counter-evidence
  counterDescription  String?
  counterEvidence     String[] // Cloudinary URLs

  // Admin resolution
  status              DisputeStatus @default(PENDING)
  resolutionOutcome   ResolutionOutcome?
  resolutionNotes     String?
  adminId             String?
  admin               Admin?   @relation(fields: [adminId], references: [id])

  // Timestamps
  createdAt           DateTime @default(now())
  resolvedAt          DateTime?

  @@index([status])
  @@index([adminId])
  @@map("disputes")
}

enum DisputeReason {
  DAMAGE
  NOT_RETURNED
  WRONG_CONDITION
  OTHER
}

enum DisputeStatus {
  PENDING
  RESOLVED
  REJECTED
}

enum ResolutionOutcome {
  REFUND_TO_BORROWER      // Full deposit to borrower
  KEEP_WITH_LENDER        // Full deposit to lender
  SPLIT_50_50             // 50% deposit to each party
}
```

### Admin Entity

```prisma
model Admin {
  id              String   @id @default(cuid())
  email           String   @unique
  passwordHash    String
  name            String

  // Permissions (for future role-based access)
  role            AdminRole @default(ADMIN)

  // Activity audit
  lastLoginAt     DateTime?
  createdAt       DateTime @default(now())

  // Relations
  disputesResolved Dispute[]

  @@index([email])
  @@map("admins")
}

enum AdminRole {
  ADMIN
  SUPER_ADMIN
}
```

### User Agreement Entity (GDPR Compliance)

```prisma
model UserAgreement {
  id              String   @id @default(cuid())

  userId          String
  user            User     @relation(fields: [userId], references: [id])

  agreementType   AgreementType
  version         String   // e.g., "v1.0", "v1.1"
  agreedAt        DateTime @default(now())
  ipAddress       String?

  @@index([userId])
  @@unique([userId, agreementType, version]) // One agreement per type per version
  @@map("user_agreements")
}

enum AgreementType {
  TOS              // Terms of Service
  PRIVACY          // Privacy Policy
  BORROWING_RULES  // Platform borrowing rules
}
```

---

## Derived Fields & Calculations

### User Reputation Score

Calculated from all reviews received:

```typescript
const calculateReputationScore = async (userId: string): Promise<number> => {
  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    select: { rating: true },
  });

  if (reviews.length === 0) return 0.0;

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  return totalRating / reviews.length; // Average rating
};
```

### Platform Fee Calculation

15% of rental amount only (not deposit):

```typescript
const calculatePlatformFee = (rentalAmount: number): number => {
  return rentalAmount * 0.15;
};
```

### Active Lenders (Admin Metric)

Lenders with at least one book listing and one completed transaction:

```typescript
const countActiveLenders = async (): Promise<number> => {
  return await prisma.user.count({
    where: {
      AND: [
        { listedBooks: { some: {} } },
        { transactionsAsLender: { some: { status: 'COMPLETED' } } },
      ],
    },
  });
};
```

### Repeat Borrower Rate (Admin Metric)

Percentage of borrowers who completed more than one transaction:

```typescript
const calculateRepeatBorrowerRate = async (): Promise<number> => {
  const totalBorrowers = await prisma.user.count({
    where: { transactionsAsBorrower: { some: { status: 'COMPLETED' } } },
  });

  const repeatBorrowers = await prisma.user.count({
    where: {
      transactionsAsBorrower: {
        many: { status: 'COMPLETED' },
      },
    },
  });

  return totalBorrowers > 0 ? (repeatBorrowers / totalBorrowers) * 100 : 0;
};
```

---

## Indexes & Performance

### Geographic Search Optimization

For location-based search (5km radius), use PostGIS extension:

```sql
-- Enable PostGIS (run manually in Neon SQL editor)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to book_listings table
ALTER TABLE book_listings ADD COLUMN location_geo geography(POINT, 4326);

-- Update geography from JSON location
UPDATE book_listings
SET location_geo = ST_SetSRID(
  ST_MakePoint(
    (location->>'lng')::float,
    (location->>'lat')::float
  ),
  4326
);

-- Create spatial index
CREATE INDEX idx_book_listings_location_geo ON book_listings USING GIST(location_geo);
```

**Query for books within 5km**:

```typescript
const nearbyBooks = await prisma.$queryRaw`
  SELECT * FROM book_listings
  WHERE ST_DWithin(
    location_geo,
    ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
    5000  -- 5km in meters
  )
  AND available = true
  ORDER BY location_geo <-> ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography
  LIMIT 20;
`;
```

### Full-Text Search for Books

```typescript
const searchBooks = await prisma.$queryRaw`
  SELECT * FROM book_listings
  WHERE to_tsvector('english', title || ' ' || author)
  @@ to_tsquery('english', ${searchQuery})
  AND available = true
  LIMIT 20;
`;
```

---

## Data Validation Rules (Zod Schemas)

### User Registration

```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/), // India mobile format
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)/), // Min 8 chars, 1 upper, 1 number
  name: z.string().min(2).max(100).optional(),
});
```

### Book Listing Creation

```typescript
export const CreateBookListingSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'ACCEPTABLE']),
  rentalType: z.enum(['FREE', 'PAID']),
  rentalPrice: z.number().positive().optional(),
  depositAmount: z.number().nonnegative().optional(),
  rentalDuration: z.number().int().min(1).max(90), // 1-90 days
  images: z.array(z.string().url()).min(2).max(5),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1),
  }),
}).refine(
  (data) => data.rentalType !== 'PAID' || (data.rentalPrice && data.depositAmount),
  { message: 'Rental price and deposit required for paid rentals' }
);
```

---

## Migration Strategy

### Initial Migration

```bash
# Generate initial migration
npx prisma migrate dev --name init

# Apply to Neon production
npx prisma migrate deploy
```

### Seed Data (Admin User)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 12);

  await prisma.admin.upsert({
    where: { email: 'admin@sharedreads.app' },
    update: {},
    create: {
      email: 'admin@sharedreads.app',
      passwordHash: adminPasswordHash,
      name: 'Platform Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Seed complete: Admin user created');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

---

## Constraints & Business Rules

### Constraint Enforcement

1. **Unique Borrow Requests**: A borrower cannot have multiple pending requests for the same book (enforced by unique constraint)

2. **Transaction State Machine**: Transactions must progress through states in order (enforced in business logic):
   ```
   INITIATED → DEPOSIT_PAID → BOOK_RECEIVED → BOOK_RETURNED → COMPLETED
   ```

3. **Review Submission**: Reviews can only be created after transaction status = COMPLETED (enforced in API)

4. **Deposit Requirements**:
   - PAID rentals: Must have both `rentalPrice` and `depositAmount`
   - FREE rentals: `depositAmount` optional, `rentalPrice` must be NULL

5. **Account Deletion**: Users cannot delete accounts with active transactions (status != COMPLETED/CANCELLED)

6. **OTP Expiration**: OTP codes expire after 10 minutes, enforced by comparing `otpExpiresAt` with current timestamp

---

## Data Retention & Cleanup

### 90-Day Photo Cleanup (Constitution Requirement)

```typescript
// Cron job: Daily at 2 AM
import { CronJob } from 'cron';

const photoCleanupJob = new CronJob('0 2 * * *', async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { lte: cutoffDate },
    },
  });

  for (const txn of expiredTransactions) {
    if (txn.beforeHandoverPhoto) {
      await cloudinary.uploader.destroy(extractPublicId(txn.beforeHandoverPhoto));
    }
    if (txn.afterReturnPhoto) {
      await cloudinary.uploader.destroy(extractPublicId(txn.afterReturnPhoto));
    }
  }

  console.log(`Cleaned up photos for ${expiredTransactions.length} transactions`);
});
```

---

## Conclusion

This data model provides:
- ✅ Type-safe database access via Prisma
- ✅ Complete audit trail (timestamps on all entities)
- ✅ GDPR compliance (user agreements, data retention policies)
- ✅ Performance optimization (indexes on search/filter fields, PostGIS for geographic queries)
- ✅ Constitution alignment (escrow tracking, photo evidence, 90-day cleanup)
- ✅ Scalability (supports 10K+ users, cursor-based pagination ready)

**Ready for API contract generation in Phase 1 next step.**
