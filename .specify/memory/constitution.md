<!--
SYNC IMPACT REPORT
==================
Version: 1.0.0 (initial creation)
Ratification Date: 2025-12-25
Last Amended: 2025-12-25

New Principles Added:
- I. Lean & Proven Tech Stack
- II. Mobile-First, Web-First
- III. MVP Discipline (NON-NEGOTIABLE)
- IV. Trust & Safety First
- V. User Experience Simplicity
- VI. Performance & Cost Efficiency
- VII. Security by Default
- VIII. Data Protection & Privacy

New Sections Added:
- Tech Stack Standards
- Business Model Implementation
- User Roles & Permissions
- Legal & Compliance Requirements
- Development Workflow
- Success Metrics & Analytics

Templates Status:
✅ plan-template.md - Aligned (Constitution Check gates compatible)
✅ spec-template.md - Aligned (User stories and requirements match principles)
✅ tasks-template.md - Aligned (Phase structure supports MVP-first approach)

Follow-up TODOs:
- None (all placeholders filled)

Notes:
- This constitution is specifically designed for SharedReads, a peer-to-peer book-sharing marketplace
- Emphasizes MVP discipline, trust/safety, and cost-consciousness
- Tech stack choices align with solo founder capabilities and budget constraints
- Phase-based approach supports hyper-local MVP strategy
-->

# SharedReads Web Platform Constitution

## Core Principles

### I. Lean & Proven Tech Stack

**Rules:**
- Frontend MUST use: React 18+ with TypeScript, Vite, TailwindCSS, React Query, React Router v6
- Backend MUST use: Node.js + Express, PostgreSQL, Prisma ORM, JWT authentication
- Payment integration MUST use: Razorpay (India) or Stripe (international) - pick ONE
- File storage MUST use: Cloudinary with free tier optimization
- NO introduction of additional frameworks without constitution amendment
- NO "shiny new technology" experiments in production code
- ALL technology choices MUST have: proven track record, active community, TypeScript support

**Rationale:** This stack leverages existing Node.js expertise, provides end-to-end type safety, scales to 10K users without rewrite, and stays within ₹3,000/month budget constraint.

### II. Mobile-First, Web-First

**Rules:**
- ALL interfaces MUST be designed mobile-first (320px breakpoint minimum)
- Phase 1 MUST deliver web-only (no native mobile apps)
- Progressive Web App (PWA) features deferred to Phase 2+
- Touch targets MUST be minimum 44px
- All forms MUST be single column on mobile
- Navigation MUST work with thumbs (bottom-reachable zones)

**Rationale:** Focuses initial development effort, reduces complexity, enables faster MVP launch, reaches users via existing browsers without app store friction.

### III. MVP Discipline (NON-NEGOTIABLE)

**Rules:**
- Phase 1 MUST include ONLY: authentication, book listing, search/discovery, request system, deposit management, basic reviews, photo upload, location matching, ToS/Privacy pages, admin dashboard
- Phase 1 MUST NOT include: in-app messaging (use WhatsApp/phone), platform logistics, multiple payment gateways, social features, AI/recommendations, native apps, multi-language, real-time notifications, blockchain, gamification
- Feature additions require: 500+ successful transactions OR explicit constitution amendment
- Every feature proposal MUST answer: "Can users transact books without this?"
- If answer is YES, feature is deferred to Phase 2+

**Rationale:** Prevents scope creep, focuses on core value proposition (trusted book sharing), enables faster time-to-market, reduces initial development and operational costs.

### IV. Trust & Safety First

**Rules:**
- User verification MUST include: email OTP + phone OTP before first transaction
- Book listings MUST include: minimum 2 photos, condition rating (NEW/LIKE_NEW/GOOD/ACCEPTABLE), deposit amount (if paid)
- Dispute resolution MUST provide: evidence submission (photos), admin review within 48 hours, binding platform decision
- ALL transactions MUST be photographically documented (before/after handover)
- Deposit release MUST be contingent on lender confirmation of return
- User reputation score (0-5) MUST be displayed on all profiles
- Review submission MUST be post-transaction only (no pre-borrow reviews)

**Rationale:** Trust is the primary barrier to peer-to-peer sharing; without robust safety mechanisms, platform fails. Photo evidence and escrow protect both parties.

### V. User Experience Simplicity

**Rules:**
- Book listing MUST complete in under 2 minutes (measured via analytics)
- Search results MUST appear within 30 seconds of query
- Borrowing request flow MUST complete in under 5 clicks
- Error messages MUST be plain language (no technical jargon)
- ALL CTAs (calls-to-action) MUST use warm colors (orange/yellow)
- UI MUST be "boringly reliable" over trendy
- NO UI animations that delay task completion

**Rationale:** Complexity is the enemy of adoption. Students and casual users need dead-simple flows. Every extra click is lost conversion.

### VI. Performance & Cost Efficiency

**Performance Budgets (NON-NEGOTIABLE):**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: >90
- Frontend bundle: <500KB gzipped
- API response time: <200ms average

**Cost Constraints:**
- Hosting: MUST stay within free tiers initially (Vercel frontend, Railway/Render backend)
- Database: MUST use Neon/Supabase PostgreSQL free tier
- Image storage: MUST stay within Cloudinary free tier (optimize/compress all uploads)
- Email: MUST use Resend/SendGrid free tier limits
- Total monthly cost MUST NOT exceed ₹3,000 until 500+ transactions achieved

**Rationale:** Performance directly impacts conversion rates. Cost discipline ensures runway for solo founder. Free tiers provide 10K+ user capacity.

### VII. Security by Default

**Mandatory Security Measures:**
- Input validation: Zod schemas on BOTH frontend + backend
- SQL injection: Prevented via Prisma parameterized queries
- XSS prevention: React escapes by default + sanitize user HTML
- Authentication: JWT with httpOnly cookies + refresh token rotation
- Password policy: Minimum 8 chars, 1 uppercase, 1 number, bcrypt hashing (12 rounds)
- Authorization: Middleware checks on EVERY protected route + row-level security
- Rate limiting: Login (5 attempts/15min), API (100 requests/15min/user), Image upload (10/hour)
- HTTPS: Forced redirect, no HTTP traffic allowed
- CORS: Whitelist only
- Secrets: Environment variables, NEVER committed, rotated every 90 days
- Payment security: NEVER store card details, webhook verification, immutable transaction logs

**Rationale:** Security breaches destroy trust platforms instantly. Defense-in-depth approach prevents common OWASP top 10 vulnerabilities.

### VIII. Data Protection & Privacy

**Rules:**
- Passwords: MUST be bcrypt hashed (12 rounds minimum)
- PII (Personally Identifiable Information): MUST be encrypted at rest using Prisma field-level encryption
- Payment data: MUST NEVER be stored (Razorpay/Stripe handles entirely)
- Images: MUST use Cloudinary signed URLs + auto-delete after 90 days if unused
- User agreements: MUST be versioned in database with timestamp + IP address
- Policy updates: MUST force re-agreement before next transaction
- GDPR compliance: MUST provide user data export + deletion endpoints
- Cookie policy: MUST disclose ALL tracking
- Data retention: MUST define and enforce limits

**Rationale:** Privacy laws (GDPR, India's PDPA) require compliance. User trust requires transparency. Minimizing stored PII reduces breach liability.

---

## Tech Stack Standards

### Required Dependencies (Frontend)
```json
{
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "@tanstack/react-query": "^5.0.0",
  "react-router-dom": "^6.0.0",
  "zod": "^3.0.0",
  "react-hook-form": "^7.0.0"
}
```

### Required Dependencies (Backend)
```json
{
  "express": "^4.18.0",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "zod": "^3.0.0"
}
```

### Infrastructure Constraints
- Frontend hosting: Vercel (free tier)
- Backend hosting: Railway or Render (free tier initially)
- Database: Neon or Supabase PostgreSQL (serverless, free tier)
- CDN: Cloudinary (free tier)
- Email: Resend or SendGrid (free tier)
- Analytics: Google Analytics 4 (free)
- Error tracking: Sentry (free tier) - added post-launch

---

## Business Model Implementation

### Revenue Flows (Technical Requirements)

**Commission System:**
- Free sharing: ₹0 platform fee
- Paid rentals: 15% commission (deducted automatically)
- Deposit: Held in escrow, released on lender confirmation of return
- Payment flow: Razorpay → Platform account (auto-split via Razorpay Route API)

**Payment State Machine (Database-Enforced):**
```
INITIATED → User requests book
DEPOSIT_HELD → Borrower pays deposit (if applicable)
RENTAL_PAID → Borrower pays rent (if applicable)
BOOK_RECEIVED → Lender confirms handover (photo required)
BOOK_RETURNED → Borrower returns (photo required)
DEPOSIT_RELEASED → System releases deposit to borrower
COMMISSION_DEDUCTED → Platform takes 15% cut (automatic)
```

**Required Tracking:**
- Transaction ID (unique, immutable)
- Timestamps for EACH state transition
- Photo evidence URLs (before/after)
- Dispute flags (boolean + reason enum)
- Platform fee amount (calculated, stored)

---

## User Roles & Permissions

### Role Structure
- **Lender**: Can list books, approve/reject requests, receive payments
- **Borrower**: Can search books, request borrows, pay deposits, leave reviews
- **Admin**: Platform management, dispute resolution (48-hour SLA)
- **SuperAdmin**: Full system access, user suspension, refund authority

**Dual Role Support:** Users MUST be able to act as BOTH lender AND borrower simultaneously.

### Permission Matrix

**Lender Permissions:**
- CREATE book listings
- UPDATE own listings only
- APPROVE/REJECT borrow requests
- VIEW own transaction history
- REPORT borrowers (abuse, damage, non-return)

**Borrower Permissions:**
- SEARCH books (location-filtered)
- REQUEST to borrow
- PAY deposits/rent
- REVIEW after return (not before)
- REPORT lenders (misrepresentation, safety issues)

**Admin Permissions:**
- VIEW all transactions (read-only except disputes)
- RESOLVE disputes (refund/keep/partial)
- SUSPEND users (temporary/permanent)
- REFUND deposits (dispute resolution only)
- VIEW analytics dashboard

**SuperAdmin Permissions:**
- All admin permissions
- DELETE users/books (emergency only)
- MODIFY transaction states (audit logged)
- ACCESS system logs

---

## Legal & Compliance Requirements

### Required Static Pages (Must Exist Before Launch)
- Terms of Service - Platform liability, user responsibilities
- Privacy Policy - Data collection, storage, usage (GDPR-compliant)
- Borrowing Rules - Damage policies, late fees, dispute process
- Cookie Policy - Tracking disclosure
- Copyright Policy - DMCA takedown process

### User Agreements (Database Schema Required)
```sql
user_agreements {
  user_id: UUID
  agreement_type: ENUM('TOS', 'PRIVACY', 'BORROWING_RULES')
  version: STRING (e.g., 'v1.0', 'v1.1')
  agreed_at: TIMESTAMP
  ip_address: STRING
}
```

**Enforcement Rules:**
- New users MUST agree to all current versions before first transaction
- Policy updates MUST trigger re-agreement flow
- Users who decline updated policies MUST be restricted from new transactions (existing transactions honored)

---

## Development Workflow

### Phase 1: MVP (Weeks 1-10)
**Deliverables:** Authentication, book listing, search, request flow, payment integration, reviews, admin panel, legal pages

**Required Milestones:**
- Week 2: Authentication + basic UI components
- Week 4: Book listing + search
- Week 6: Transaction flow + Razorpay integration
- Week 8: Reviews + dispute system
- Week 10: Admin panel + legal pages + production deploy

### Phase 2: Growth (After 500+ Transactions)
**Unlocked Features:** In-app chat, delivery partner integration, featured listings, membership plans, advanced search, wishlist, mobile apps

### Scaling Gates (Automated - Feature Flags)
Do NOT allow city expansion until ALL conditions met:
- ✓ 50+ active lenders
- ✓ 200+ successful transactions
- ✓ Dispute rate <2%
- ✓ Repeat borrower rate >30%
- ✓ Net Promoter Score >40

**Technical Implementation:** Database-backed feature flags checked before enabling new geographies.

### Testing Strategy

**Required Tests (Pre-Launch):**
- Unit tests: All utility functions, form validation, payment calculations, commission logic
- Integration tests: Registration flow, borrow-to-return flow, dispute resolution
- Manual testing: All forms, payment (test mode), emails, image uploads, mobile responsive

**Testing Tools:**
- Jest + React Testing Library (frontend unit tests)
- Playwright (E2E tests - Phase 2+)
- Manual checklist (pre-launch gate)

**Test Coverage Requirement:** >70% for payment and authentication code (critical paths)

---

## Success Metrics & Analytics

### Platform Metrics (Admin Dashboard - Required)
```javascript
{
  totalUsers: Number,
  activeLenders: Number,
  totalBooks: Number,
  transactionsThisMonth: Number,
  successfulReturns: Percentage,
  disputeRate: Percentage,  // Target: <2%
  repeatBorrowerRate: Percentage,  // Target: >30%
  avgTransactionValue: Currency,
  revenueThisMonth: Currency,
  topCategories: Array<String>
}
```

### Google Analytics Events (Required Tracking)
- `book_listed` - When lender creates listing
- `search_performed` - When user searches
- `request_sent` - When borrower requests book
- `payment_completed` - When deposit/rent paid
- `book_returned` - When return confirmed
- `review_submitted` - When review posted
- `dispute_raised` - When dispute created

**Purpose:** Data-driven decisions for Phase 2+ feature prioritization.

---

## Governance

### Amendment Procedure
1. Proposed changes MUST be documented in GitHub issue
2. Rationale MUST address: problem solved, alternatives rejected, impact on existing principles
3. Solo founder (Vikash) approves amendments
4. Version MUST increment per semantic versioning:
   - **MAJOR** (X.0.0): Breaking changes, principle removals, redefinitions
   - **MINOR** (1.X.0): New principles, new sections, material expansions
   - **PATCH** (1.0.X): Clarifications, typos, non-semantic refinements
5. Migration plan REQUIRED for breaking changes
6. Dependent templates MUST be updated within same commit

### Compliance Review
- Constitution review: After every 100 transactions OR quarterly (whichever comes first)
- All PRs MUST verify compliance with applicable principles
- Complexity violations MUST be justified in plan.md "Complexity Tracking" section
- Admin dashboard MUST display compliance metrics (dispute rate, repeat borrower rate, etc.)

### Decision Authority
- Technical decisions: Constitution principles override preferences
- Feature prioritization: User transaction data + MVP discipline principles
- Disputes (platform): Admin decision binding (within 48 hours)
- Disputes (governance): Solo founder (Vikash) has final say

### Failure Avoidance Checklist (Before Every Major Decision)
- [ ] Does this add complexity without clear user benefit?
- [ ] Can we solve this with rules instead of code?
- [ ] Does this require manual work that won't scale?
- [ ] Does this weaken trust/safety?
- [ ] Does this increase hosting costs >₹5,000/month?
- [ ] Does this delay MVP launch?
- [ ] Have we talked to users about this need?

**If ANY answer is YES → Defer to Phase 2+ or reject**

---

## The North Star

SharedReads feels **boringly reliable**.

A student lists a book in 2 minutes.
A borrower finds it in 30 seconds.
The deposit is held safely.
The book is returned.
The deposit is released automatically.
Both leave 5-star reviews.
No support ticket needed.

**This is success.**

---

**Version**: 1.0.0 | **Ratified**: 2025-12-25 | **Last Amended**: 2025-12-25
