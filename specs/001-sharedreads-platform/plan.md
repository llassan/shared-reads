# Implementation Plan: SharedReads Platform

**Branch**: `001-sharedreads-platform` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sharedreads-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

SharedReads is a peer-to-peer book-sharing marketplace enabling lenders to list books (free or paid rental) and borrowers to search, request, and borrow books within a campus community. The platform provides trust mechanisms through email/phone verification, deposit escrow, photographic evidence, and admin dispute resolution. Phase 1 MVP targets a single college campus with 50 lenders and 200 transactions to validate the model before scaling.

**Technical Approach**: Web application architecture with React/TypeScript frontend, Node.js/Express backend, PostgreSQL database, and Razorpay payment integration. Mobile-first responsive design without native apps. Constitution-mandated tech stack ensures type safety, proven patterns, and budget constraints (<₹3K/month).

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with React 18.x
- Backend: Node.js 20.x LTS (Active LTS as of 2025)

**Primary Dependencies**:
- Frontend: React 18+, Vite 5.x, TailwindCSS 3.x, TanStack Query (React Query) 5.x, React Router v6, Zod 3.x, React Hook Form 7.x
- Backend: Express 4.18+, Prisma ORM 5.x, @prisma/client 5.x, jsonwebtoken 9.x, bcrypt 5.1+, Zod 3.x
- Payment: Razorpay SDK (India market)
- Email/SMS: NEEDS CLARIFICATION - options: Resend, SendGrid, Twilio for SMS
- Image Storage: Cloudinary SDK

**Storage**: PostgreSQL 15+ (via Neon or Supabase serverless, free tier)

**Testing**:
- Frontend: Jest + React Testing Library (unit tests)
- Backend: Jest + Supertest (integration tests)
- E2E: Playwright (Phase 2+)
- Manual testing checklist for Phase 1 MVP

**Target Platform**:
- Web browsers (Chrome/Safari/Firefox on desktop and mobile)
- Responsive web app (320px to 1920px breakpoints)
- Hosting: Vercel (frontend), Railway or Render (backend)

**Project Type**: Web application (frontend + backend separation)

**Performance Goals**:
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- API response time: <200ms average
- Search results: <1s for 500-1000 books
- Lighthouse score: >90
- Frontend bundle: <500KB gzipped

**Constraints**:
- Monthly hosting budget: <₹3,000 during pilot phase
- Mobile-first design (all features must work on mobile)
- No in-app messaging (Phase 1)
- Single campus deployment initially (5km radius)
- Free tier limitations for all infrastructure services

**Scale/Scope**:
- Phase 1 target: 50 active lenders, 200 transactions, 500-1000 book listings
- Concurrent users: Support up to 100 concurrent users initially
- Storage: ~10GB for images (free tier), ~1GB database (free tier)
- Geographic scope: Single campus (~5km radius)
- Admin team: 1-2 people

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Lean & Proven Tech Stack
✅ **PASS** - All technologies match constitution requirements:
- Frontend: React 18+, TypeScript, Vite, TailwindCSS, React Query, React Router v6 ✓
- Backend: Node.js + Express, PostgreSQL, Prisma ORM, JWT authentication ✓
- Payment: Razorpay (India market) ✓
- File storage: Cloudinary ✓
- No additional frameworks introduced ✓

### Principle II: Mobile-First, Web-First
✅ **PASS**:
- Web-only delivery (no native apps in Phase 1) ✓
- Mobile-first breakpoints (320px minimum) ✓
- Touch targets 44px minimum (to be enforced in design) ✓
- Single column forms on mobile (to be enforced in design) ✓
- PWA features deferred to Phase 2+ ✓

### Principle III: MVP Discipline (NON-NEGOTIABLE)
✅ **PASS**:
- Phase 1 scope matches constitution exactly: authentication, book listing, search/discovery, request system, deposit management, reviews, photo upload, location matching, ToS/Privacy pages, admin dashboard ✓
- Explicitly excludes: in-app messaging, platform logistics, multiple payment gateways, social features, AI/recommendations, native apps, multi-language, real-time notifications, blockchain, gamification ✓
- Feature additions gated by 500+ transactions ✓

### Principle IV: Trust & Safety First
✅ **PASS**:
- Email OTP + Phone OTP verification required ✓
- Book listings require min 2 photos + condition rating + deposit (if paid) ✓
- Dispute resolution with photo evidence + 48hr admin SLA ✓
- Transaction photo documentation (before/after handover) ✓
- Deposit release contingent on lender confirmation ✓
- User reputation score (0-5) displayed ✓
- Reviews post-transaction only ✓

### Principle V: User Experience Simplicity
✅ **PASS** - Success criteria align with UX principles:
- Book listing <2 min (SC-002) ✓
- Search results <30 sec (SC-003) ✓
- Borrow request <5 clicks (SC-005) ✓
- Plain language error messages (to be enforced in implementation) ✓
- "Boringly reliable" design philosophy ✓

### Principle VI: Performance & Cost Efficiency
✅ **PASS**:
- Performance budgets: FCP <1.5s, TTI <3s, Lighthouse >90, bundle <500KB, API <200ms ✓
- Cost constraint: <₹3K/month enforced via free tier usage (Vercel, Railway/Render, Neon/Supabase, Cloudinary) ✓
- Free tier capacity validated for 10K+ users ✓

### Principle VII: Security by Default
✅ **PASS**:
- Input validation: Zod schemas on frontend + backend ✓
- SQL injection prevention: Prisma parameterized queries ✓
- XSS prevention: React escapes by default + Zod sanitization ✓
- Authentication: JWT with httpOnly cookies ✓
- Password policy: min 8 chars, 1 upper, 1 number, bcrypt 12 rounds ✓
- Authorization: Middleware on protected routes + row-level security ✓
- Rate limiting: Login (5/15min), API (100/15min), Image (10/hr) ✓
- HTTPS only, CORS whitelist, env variables, secrets rotation (90 days) ✓
- Payment security: No card storage, webhook verification, immutable logs ✓

### Principle VIII: Data Protection & Privacy
✅ **PASS**:
- Password hashing: bcrypt 12 rounds ✓
- PII encryption: Prisma field-level encryption ✓
- Payment data: Never stored (Razorpay handles) ✓
- Images: Cloudinary signed URLs + 90-day auto-delete ✓
- User agreements: Versioned with timestamp + IP ✓
- Policy updates: Force re-agreement ✓
- GDPR: User data export + deletion endpoints ✓

### Overall Constitution Compliance
**STATUS**: ✅ **PASS** - All 8 core principles satisfied

**Minor Clarification Needed**:
- Email/SMS provider selection (Resend vs SendGrid + Twilio) - will be resolved in Phase 0 research

**No violations to justify in Complexity Tracking section.**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/              # Environment config, database config
│   ├── models/              # Prisma schema and generated client
│   ├── middleware/          # Auth, validation, rate limiting, error handling
│   ├── controllers/         # Request handlers (auth, books, transactions, etc.)
│   ├── services/            # Business logic (payment, notifications, storage)
│   ├── routes/              # Express route definitions
│   ├── utils/               # Helpers (validation schemas, formatters)
│   └── server.ts            # Express app entry point
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   └── migrations/          # Database migration files
├── tests/
│   ├── integration/         # API endpoint tests
│   └── unit/                # Service and util tests
├── package.json
├── tsconfig.json
└── .env.example

frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/            # Login, Register, VerifyOTP
│   │   ├── books/           # BookCard, BookList, BookDetail, ListBookForm
│   │   ├── search/          # SearchBar, SearchFilters, SearchResults
│   │   ├── transactions/    # TransactionCard, TransactionStatus, PaymentFlow
│   │   ├── reviews/         # ReviewForm, ReviewList, RatingDisplay
│   │   ├── admin/           # AdminDashboard, UserManagement, DisputePanel
│   │   └── common/          # Button, Input, Modal, FileUpload, etc.
│   ├── pages/               # Route-level page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── BookDetailPage.tsx
│   │   ├── ListBookPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminPage.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBooks.ts
│   │   ├── useTransactions.ts
│   │   └── useLocation.ts
│   ├── api/                 # API client functions (React Query)
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   ├── transactions.ts
│   │   ├── payments.ts
│   │   └── admin.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── book.ts
│   │   ├── transaction.ts
│   │   └── api.ts
│   ├── lib/                 # Utilities and helpers
│   │   ├── queryClient.ts   # React Query setup
│   │   ├── axios.ts         # Axios instance with interceptors
│   │   └── validation.ts    # Zod schemas
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Vite entry point
│   └── index.css            # TailwindCSS imports
├── public/                  # Static assets
├── tests/
│   └── unit/                # Component tests (React Testing Library)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example

shared-reads/                # Repository root
├── backend/
├── frontend/
├── .specify/                # Speckit configuration
├── specs/                   # Feature specifications
├── README.md
├── .gitignore
└── package.json             # Workspace root (optional monorepo setup)
```

**Structure Decision**: Web application with frontend/backend separation. This structure:
- Separates concerns cleanly (API vs UI)
- Allows independent deployment (Vercel for frontend, Railway/Render for backend)
- Supports TypeScript across both codebases with shared type safety via API contracts
- Follows constitution principles (no monolith, clear boundaries)
- Enables parallel development of frontend and backend features
- Aligns with standard practices for React + Express applications

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations found.** All design decisions comply with constitution principles.

---

## Phase 0: Research Completed ✅

All technical unknowns resolved. See [research.md](./research.md) for:
- Email/SMS Provider: Resend + Twilio selected
- Razorpay Integration: Route API for escrow simulation
- Cloudinary Optimization: Free tier strategy with 90-day cleanup
- PostgreSQL Hosting: Neon serverless selected over Supabase
- Best practices for auth, state management, error handling

**All NEEDS CLARIFICATION items resolved.**

---

## Phase 1: Design & Contracts Completed ✅

### Generated Artifacts

1. **Data Model**: [data-model.md](./data-model.md)
   - Complete Prisma schema with 8 entities
   - Entity relationships and constraints
   - Database indexes for performance
   - PostGIS for geographic search
   - Validation rules (Zod schemas)
   - 90-day photo cleanup strategy

2. **API Contracts**: [contracts/api-contract.yaml](./contracts/api-contract.yaml)
   - OpenAPI 3.0.3 specification
   - 40+ RESTful endpoints across 9 domains
   - Complete request/response schemas
   - Error handling patterns
   - Authentication flow (JWT)
   - Payment flow (Razorpay)

3. **Developer Guide**: [quickstart.md](./quickstart.md)
   - 30-minute setup guide
   - Environment configuration
   - Database migration steps
   - Testing & verification
   - Troubleshooting guide
   - Pre-launch checklist

4. **Agent Context**: CLAUDE.md updated with technologies

---

## Constitution Check Re-Evaluation (Post-Design)

### Principle I: Lean & Proven Tech Stack
✅ **PASS** - No changes from initial check. All technologies remain constitution-compliant.
- Resend + Twilio selected (research validated free tier feasibility)
- Neon PostgreSQL selected (3GB storage vs Supabase 500MB)
- All dependencies align with required stack

### Principle II: Mobile-First, Web-First
✅ **PASS** - Design enforces mobile-first:
- API responses optimized for mobile (pagination, cursor-based)
- Image transformations use Cloudinary auto-resize
- Touch-friendly UI constraints in quickstart checklist

### Principle III: MVP Discipline (NON-NEGOTIABLE)
✅ **PASS** - Design strictly scoped to Phase 1:
- API contracts include only MVP features
- No messaging endpoints (deferred to Phase 2+)
- No multi-language support
- Admin dashboard scoped to essential metrics only

### Principle IV: Trust & Safety First
✅ **PASS** - Design implements all safety mechanisms:
- OTP verification flow (2 endpoints: verify + resend)
- Photo upload on handover/return (multipart/form-data endpoints)
- Dispute resolution workflow (raise → counter-evidence → admin resolve)
- Razorpay webhook verification in payment flow

### Principle V: User Experience Simplicity
✅ **PASS** - API design supports UX goals:
- Book listing creation: Single POST /books (1 API call)
- Search results: 1-second response via PostGIS spatial index
- Borrow flow: 3 API calls (request → approve → pay)

### Principle VI: Performance & Cost Efficiency
✅ **PASS** - Design optimizations in place:
- Cursor-based pagination (scales beyond 10K books)
- Database indexes on search fields
- Cloudinary auto-format/quality optimization
- Neon auto-pause reduces costs during low usage

### Principle VII: Security by Default
✅ **PASS** - Security measures in design:
- JWT Bearer auth on all protected endpoints
- Rate limiting specified in quickstart
- Razorpay webhook signature verification
- Cloudinary signed URLs for photo uploads
- Zod validation schemas in data model

### Principle VIII: Data Protection & Privacy
✅ **PASS** - Privacy compliance in design:
- User agreement tracking (UserAgreement entity)
- 90-day photo cleanup (cron job in data-model.md)
- No payment card storage (Razorpay handles)
- GDPR endpoints: GET /users/me (export), DELETE /users/me (deletion)

### Overall Re-Evaluation
**STATUS**: ✅ **PASS** - All 8 core principles satisfied post-design.

**No new violations introduced during design phase.**

---

## Summary

**Planning Phase Complete**: ✅

The SharedReads platform is fully planned with:
- **Technical Context**: Defined and validated
- **Constitution Compliance**: All 8 principles satisfied (pre and post-design)
- **Research**: All unknowns resolved (Resend, Twilio, Neon, Razorpay patterns)
- **Data Model**: 8 entities, full Prisma schema, performance optimizations
- **API Contracts**: 40+ endpoints, OpenAPI spec, complete request/response schemas
- **Developer Guide**: Quickstart setup in 30 minutes, troubleshooting, pre-launch checklist
- **Agent Context**: CLAUDE.md updated with technologies

**Ready for Phase 2**: Task generation via `/speckit.tasks`

---

## Files Generated

| File | Purpose | Status |
|------|---------|--------|
| plan.md | This file - implementation plan | ✅ Complete |
| research.md | Technology decisions and best practices | ✅ Complete |
| data-model.md | Database schema and validation rules | ✅ Complete |
| contracts/api-contract.yaml | OpenAPI 3.0.3 REST API specification | ✅ Complete |
| quickstart.md | Developer onboarding and setup guide | ✅ Complete |
| CLAUDE.md | Agent context file (root) | ✅ Updated |

**Next Command**: `/speckit.tasks` to generate actionable implementation tasks
