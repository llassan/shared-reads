# SharedReads Platform

> Peer-to-peer book sharing marketplace for campus communities

SharedReads enables lenders to list books (free or paid rental) and borrowers to search, request, and borrow books within a campus community. The platform provides trust mechanisms through email/phone verification, deposit escrow, photographic evidence, and admin dispute resolution.

## 🚀 Quick Start

See [quickstart.md](./specs/001-sharedreads-platform/quickstart.md) for detailed setup instructions.

### Prerequisites

- Node.js 20.x LTS
- PostgreSQL 15+ (or Neon account)
- Cloudinary account (free tier)
- Razorpay test account
- Resend account (free tier)
- Twilio account (trial credits)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd shared-reads

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev --name init
npx prisma db seed

# Start backend server
npm run dev

# In another terminal, install frontend dependencies
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your credentials

# Start frontend server
npm run dev
```

The backend will run on `http://localhost:3000` and frontend on `http://localhost:5173`.

## 📁 Project Structure

```
shared-reads/
├── backend/          # Node.js + Express + Prisma backend
├── frontend/         # React + TypeScript + Vite frontend
├── specs/            # Feature specifications and planning documents
└── .specify/         # Speckit configuration and templates
```

## 🎯 Phase 1 MVP Features

- ✅ User registration with email/phone OTP verification
- ✅ Book listing creation with photos and location
- ✅ Search and discovery within 5km radius
- ✅ Borrow request system
- ✅ Payment processing (Razorpay)
- ✅ Deposit escrow management
- ✅ Transaction lifecycle (handover → return → complete)
- ✅ Reviews and reputation system
- ✅ Dispute resolution with admin oversight
- ✅ Admin dashboard

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript 5
- Vite 5 (build tool)
- TailwindCSS 3 (styling)
- TanStack Query 5 (data fetching)
- React Router v6 (routing)
- React Hook Form + Zod (forms & validation)

**Backend:**
- Node.js 20 LTS
- Express 4.18 (API framework)
- Prisma 5 (ORM)
- PostgreSQL 15+ (database)
- JWT (authentication)
- Bcrypt (password hashing)

**Services:**
- Razorpay (payments)
- Cloudinary (image storage)
- Resend (email)
- Twilio (SMS)
- Neon (PostgreSQL hosting)

## 📚 Documentation

- [Specification](./specs/001-sharedreads-platform/spec.md) - Feature requirements
- [Implementation Plan](./specs/001-sharedreads-platform/plan.md) - Technical approach
- [Data Model](./specs/001-sharedreads-platform/data-model.md) - Database schema
- [API Contracts](./specs/001-sharedreads-platform/contracts/api-contract.yaml) - OpenAPI spec
- [Quick Start](./specs/001-sharedreads-platform/quickstart.md) - Developer onboarding
- [Tasks](./specs/001-sharedreads-platform/tasks.md) - Implementation tasks
- [Constitution](./specify/memory/constitution.md) - Project principles

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

**Frontend:** Vercel (recommended)
**Backend:** Railway or Render (recommended)
**Database:** Neon PostgreSQL serverless

See quickstart.md for deployment configuration.

## 📝 License

MIT

## 🤝 Contributing

This is a Phase 1 MVP project. Feature additions require:
- 500+ successful transactions OR
- Explicit constitution amendment

See [constitution.md](./.specify/memory/constitution.md) for governance rules.

---

**Built with ❤️ using [Speckit](https://github.com/anthropics/speckit)**
