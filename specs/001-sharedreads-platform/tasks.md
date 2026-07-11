# Tasks: SharedReads Platform

**Input**: Design documents from `/specs/001-sharedreads-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing checklist included. No automated test tasks generated per spec requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow the web application structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create repository root directory structure (backend/, frontend/, specs/, .specify/)
- [ ] T002 [P] Initialize backend Node.js project with package.json in backend/
- [ ] T003 [P] Initialize frontend Vite + React project with package.json in frontend/
- [ ] T004 [P] Configure TypeScript for backend in backend/tsconfig.json
- [ ] T005 [P] Configure TypeScript for frontend in frontend/tsconfig.json
- [ ] T006 [P] Install backend dependencies: express, @prisma/client, bcrypt, jsonwebtoken, zod, razorpay, cloudinary, resend, twilio, cors, helmet, dotenv
- [ ] T007 [P] Install frontend dependencies: react, react-dom, react-router-dom, @tanstack/react-query, react-hook-form, zod, axios, tailwindcss
- [ ] T008 [P] Configure TailwindCSS in frontend/tailwind.config.js
- [ ] T009 [P] Configure Vite in frontend/vite.config.ts
- [ ] T010 [P] Create backend environment template in backend/.env.example
- [ ] T011 [P] Create frontend environment template in frontend/.env.example
- [ ] T012 Create gitignore files for both backend/ and frontend/ (.env, node_modules, dist, build)
- [ ] T013 Create README.md at repository root with project overview

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Setup

- [ ] T014 Initialize Prisma in backend/prisma/ with `npx prisma init`
- [ ] T015 Create Prisma schema in backend/prisma/schema.prisma with all 9 models (User, BookListing, BorrowRequest, Transaction, PaymentTransaction, Review, Dispute, Admin, UserAgreement)
- [ ] T016 Configure database connection URL in backend/prisma/schema.prisma for PostgreSQL (Neon)
- [ ] T017 Generate Prisma Client with `npx prisma generate`
- [ ] T018 Create initial database migration with `npx prisma migrate dev --name init`
- [ ] T019 Create database seed file in backend/prisma/seed.ts for admin user
- [ ] T020 Run database seed to create default admin account

### Backend Core Infrastructure

- [ ] T021 [P] Create database connection utility in backend/src/config/database.ts
- [ ] T022 [P] Create environment configuration loader in backend/src/config/env.ts
- [ ] T023 [P] Create Express app setup in backend/src/server.ts with CORS, helmet, JSON parsing
- [ ] T024 [P] Create error handling middleware in backend/src/middleware/errorHandler.ts
- [ ] T025 [P] Create JWT utility functions (sign, verify) in backend/src/utils/jwt.ts
- [ ] T026 [P] Create bcrypt utility functions (hash, compare) in backend/src/utils/bcrypt.ts
- [ ] T027 [P] Create Zod validation middleware factory in backend/src/middleware/validate.ts
- [ ] T028 [P] Create authentication middleware in backend/src/middleware/auth.ts
- [ ] T029 [P] Create rate limiting middleware in backend/src/middleware/rateLimit.ts (express-rate-limit)
- [ ] T030 [P] Create Cloudinary config in backend/src/config/cloudinary.ts
- [ ] T031 [P] Create Razorpay config in backend/src/config/razorpay.ts
- [ ] T032 [P] Create Resend email service in backend/src/services/emailService.ts
- [ ] T033 [P] Create Twilio SMS service in backend/src/services/smsService.ts
- [ ] T034 [P] Create Cloudinary upload service in backend/src/services/uploadService.ts
- [ ] T035 Create main router in backend/src/routes/index.ts to aggregate all route modules

### Frontend Core Infrastructure

- [ ] T036 [P] Create Axios instance with interceptors in frontend/src/lib/axios.ts
- [ ] T037 [P] Create React Query client in frontend/src/lib/queryClient.ts
- [ ] T038 [P] Create auth context provider in frontend/src/hooks/useAuth.ts
- [ ] T039 [P] Create TailwindCSS base styles in frontend/src/index.css
- [ ] T040 [P] Create React Router setup in frontend/src/App.tsx
- [ ] T041 [P] Create common UI components: Button in frontend/src/components/common/Button.tsx
- [ ] T042 [P] Create common UI components: Input in frontend/src/components/common/Input.tsx
- [ ] T043 [P] Create common UI components: Modal in frontend/src/components/common/Modal.tsx
- [ ] T044 [P] Create common UI components: Toast notification system in frontend/src/components/common/Toast.tsx
- [ ] T045 [P] Create common UI components: FileUpload in frontend/src/components/common/FileUpload.tsx
- [ ] T046 [P] Create common UI components: LoadingSpinner in frontend/src/components/common/LoadingSpinner.tsx
- [ ] T047 Create TypeScript types for User in frontend/src/types/user.ts
- [ ] T048 Create TypeScript types for Book in frontend/src/types/book.ts
- [ ] T049 Create TypeScript types for Transaction in frontend/src/types/transaction.ts
- [ ] T050 Create TypeScript types for API responses in frontend/src/types/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Verification (Priority: P1) 🎯 MVP

**Goal**: Enable new users to register with email/phone and verify via OTP codes, establishing their identity on the platform

**Independent Test**: Register a new user, receive OTP codes via email and SMS, enter valid codes, confirm account is created and marked as verified

### Implementation for User Story 1

- [ ] T051 [P] [US1] Create User model validation schema in backend/src/utils/validationSchemas.ts (registerSchema, verifyOtpSchema, loginSchema)
- [ ] T052 [P] [US1] Create OTP generation utility in backend/src/utils/otp.ts (generate 6-digit OTP, hash with bcrypt)
- [ ] T053 [US1] Create auth controller in backend/src/controllers/authController.ts with register function (send OTP to email + SMS)
- [ ] T054 [US1] Add verifyOtp function to auth controller in backend/src/controllers/authController.ts (validate OTP, mark user verified, return JWT tokens)
- [ ] T055 [US1] Add resendOtp function to auth controller in backend/src/controllers/authController.ts (rate limited to 3/hour)
- [ ] T056 [US1] Add login function to auth controller in backend/src/controllers/authController.ts (email + password, return JWT tokens)
- [ ] T057 [US1] Add logout function to auth controller in backend/src/controllers/authController.ts (invalidate refresh token)
- [ ] T058 [US1] Create auth routes in backend/src/routes/authRoutes.ts (POST /register, /verify-otp, /resend-otp, /login, /logout)
- [ ] T059 [US1] Register auth routes in backend/src/routes/index.ts under /api/v1/auth
- [ ] T060 [P] [US1] Create RegisterPage component in frontend/src/pages/RegisterPage.tsx with form (email, phone, password)
- [ ] T061 [P] [US1] Create VerifyOtpPage component in frontend/src/pages/VerifyOtpPage.tsx with OTP input fields
- [ ] T062 [P] [US1] Create LoginPage component in frontend/src/pages/LoginPage.tsx with email + password form
- [ ] T063 [P] [US1] Create auth API functions in frontend/src/api/auth.ts (register, verifyOtp, resendOtp, login, logout)
- [ ] T064 [US1] Add registration route to React Router in frontend/src/App.tsx (/register)
- [ ] T065 [US1] Add OTP verification route to React Router in frontend/src/App.tsx (/verify-otp)
- [ ] T066 [US1] Add login route to React Router in frontend/src/App.tsx (/login)
- [ ] T067 [US1] Implement useAuth hook logic in frontend/src/hooks/useAuth.ts (store JWT in localStorage, auto-refresh)
- [ ] T068 [US1] Create ProtectedRoute component in frontend/src/components/common/ProtectedRoute.tsx (redirect to login if not authenticated)
- [ ] T069 [US1] Add error handling for duplicate email/phone registration in backend auth controller
- [ ] T070 [US1] Add password strength validation (min 8 chars, 1 upper, 1 number) in backend validation schema
- [ ] T071 [US1] Add OTP expiration check (10 minutes) in backend verifyOtp function

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - List a Book for Sharing (Priority: P1)

**Goal**: Enable verified lenders to create book listings with photos, condition details, and rental terms

**Independent Test**: Verified lender creates a book listing with title, author, 2+ photos, condition rating, location, and rental type; confirm listing appears in search results

### Implementation for User Story 2

- [ ] T072 [P] [US2] Create BookListing validation schema in backend/src/utils/validationSchemas.ts (createBookListingSchema, updateBookListingSchema)
- [ ] T073 [P] [US2] Create book listing controller in backend/src/controllers/booksController.ts with createListing function (upload 2-5 photos to Cloudinary)
- [ ] T074 [US2] Add getMyListings function to books controller in backend/src/controllers/booksController.ts (return all listings for authenticated user)
- [ ] T075 [US2] Add getListingById function to books controller in backend/src/controllers/booksController.ts (public endpoint, includes lender info)
- [ ] T076 [US2] Add updateListing function to books controller in backend/src/controllers/booksController.ts (lender only, no active transactions)
- [ ] T077 [US2] Add deleteListing function to books controller in backend/src/controllers/booksController.ts (lender only, no active transactions)
- [ ] T078 [US2] Create book routes in backend/src/routes/booksRoutes.ts (POST /books, GET /books, GET /books/:id, PUT /books/:id, DELETE /books/:id)
- [ ] T079 [US2] Register book routes in backend/src/routes/index.ts under /api/v1/books
- [ ] T080 [US2] Add authorization check middleware to books routes (only verified users can create listings)
- [ ] T081 [P] [US2] Create ListBookPage component in frontend/src/pages/ListBookPage.tsx with multi-step form
- [ ] T082 [P] [US2] Create BookCard component in frontend/src/components/books/BookCard.tsx (display thumbnail, title, author, price)
- [ ] T083 [P] [US2] Create BookList component in frontend/src/components/books/BookList.tsx (grid of BookCard components)
- [ ] T084 [P] [US2] Create DashboardPage component in frontend/src/pages/DashboardPage.tsx (shows user's listings and requests)
- [ ] T085 [P] [US2] Create book API functions in frontend/src/api/books.ts (createListing, getMyListings, getListingById, updateListing, deleteListing)
- [ ] T086 [US2] Add list-book route to React Router in frontend/src/App.tsx (/list-book)
- [ ] T087 [US2] Add dashboard route to React Router in frontend/src/App.tsx (/dashboard)
- [ ] T088 [US2] Implement image upload with Cloudinary optimization (WebP, quality auto, max 1200px) in frontend FileUpload component
- [ ] T089 [US2] Add location picker using browser geolocation API in frontend ListBookPage component
- [ ] T090 [US2] Add rental type toggle (Free/Paid) with conditional fields (rental price + deposit for Paid) in frontend ListBookPage
- [ ] T091 [US2] Add validation for min 2, max 5 photos in frontend ListBookPage form
- [ ] T092 [US2] Add edit/delete buttons to user's listings on Dashboard with confirmation modals

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Search and Request to Borrow (Priority: P1)

**Goal**: Enable borrowers to search for books by title/author with location filtering and submit borrow requests

**Independent Test**: Borrower searches for a book by title, views results filtered by location, selects a book, views all details, and submits a borrow request that appears in lender's pending requests

### Implementation for User Story 3

- [ ] T093 [P] [US3] Create search controller in backend/src/controllers/searchController.ts with searchBooks function (PostGIS for location filtering, full-text search)
- [ ] T094 [US3] Add PostGIS extension to database (ALTER TABLE book_listings ADD COLUMN location_geo geography(POINT, 4326); CREATE INDEX idx_book_listings_location_geo ON book_listings USING GIST(location_geo);)
- [ ] T095 [US3] Implement location-based search query (ST_DWithin for 5km radius) in backend search controller
- [ ] T096 [US3] Implement full-text search on title + author in backend search controller
- [ ] T097 [US3] Add search filters (condition, rentalType, availableOnly) in backend search controller
- [ ] T098 [US3] Add cursor-based pagination (limit 20 results) in backend search controller
- [ ] T099 [US3] Create search routes in backend/src/routes/searchRoutes.ts (GET /search/books with query params)
- [ ] T100 [US3] Register search routes in backend/src/routes/index.ts under /api/v1/search
- [ ] T101 [P] [US3] Create BorrowRequest validation schema in backend/src/utils/validationSchemas.ts (createRequestSchema)
- [ ] T102 [P] [US3] Create requests controller in backend/src/controllers/requestsController.ts with createRequest function
- [ ] T103 [US3] Add getMyRequests function to requests controller (filter by role: borrower/lender, status)
- [ ] T104 [US3] Add validation to prevent borrowing own book in backend requests controller
- [ ] T105 [US3] Add validation to prevent duplicate pending requests in backend requests controller
- [ ] T106 [US3] Create requests routes in backend/src/routes/requestsRoutes.ts (POST /requests, GET /requests)
- [ ] T107 [US3] Register requests routes in backend/src/routes/index.ts under /api/v1/requests
- [ ] T108 [P] [US3] Create SearchPage component in frontend/src/pages/SearchPage.tsx with search bar and filters
- [ ] T109 [P] [US3] Create SearchBar component in frontend/src/components/search/SearchBar.tsx (title/author input)
- [ ] T110 [P] [US3] Create SearchFilters component in frontend/src/components/search/SearchFilters.tsx (condition, rental type, radius)
- [ ] T111 [P] [US3] Create SearchResults component in frontend/src/components/search/SearchResults.tsx (displays BookCard grid with distance)
- [ ] T112 [P] [US3] Create BookDetailPage component in frontend/src/pages/BookDetailPage.tsx (all photos, lender profile, rental terms, request button)
- [ ] T113 [P] [US3] Create search API functions in frontend/src/api/search.ts (searchBooks with filters)
- [ ] T114 [P] [US3] Create requests API functions in frontend/src/api/requests.ts (createRequest, getMyRequests)
- [ ] T115 [US3] Add search route to React Router in frontend/src/App.tsx (/search)
- [ ] T116 [US3] Add book detail route to React Router in frontend/src/App.tsx (/books/:id)
- [ ] T117 [US3] Implement useLocation hook in frontend/src/hooks/useLocation.ts (browser geolocation with fallback)
- [ ] T118 [US3] Add location permission request on SearchPage mount
- [ ] T119 [US3] Add "Request to Borrow" button on BookDetailPage (disabled if own book or already requested)
- [ ] T120 [US3] Add borrower requests section to Dashboard (pending, approved, rejected tabs)
- [ ] T121 [US3] Add lender requests section to Dashboard (pending approvals list)

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: User Story 4 - Approve Request and Handle Deposit (Priority: P2)

**Goal**: Enable lenders to approve/reject borrow requests and borrowers to pay deposits via Razorpay, with escrow holding

**Independent Test**: Lender approves a request, borrower pays deposit via Razorpay test gateway, confirm funds are held in escrow and transaction status updates to "Deposit Paid"

### Implementation for User Story 4

- [ ] T122 [P] [US4] Add approveRequest function to requests controller in backend/src/controllers/requestsController.ts (creates Transaction with status INITIATED)
- [ ] T123 [P] [US4] Add rejectRequest function to requests controller with optional reason in backend/src/controllers/requestsController.ts
- [ ] T124 [US4] Create transaction controller in backend/src/controllers/transactionsController.ts with getTransactionById function
- [ ] T125 [US4] Add createPaymentOrder function to transactions controller (Razorpay order creation for deposit + rental)
- [ ] T126 [US4] Add verifyPayment function to transactions controller (Razorpay signature verification, update transaction status to DEPOSIT_PAID)
- [ ] T127 [US4] Add Razorpay webhook handler in backend/src/controllers/webhooksController.ts (verify signature, process payment events)
- [ ] T128 [US4] Create transaction routes in backend/src/routes/transactionsRoutes.ts (GET /transactions/:id, POST /transactions/:id/pay, POST /transactions/:id/verify-payment)
- [ ] T129 [US4] Create webhook routes in backend/src/routes/webhooksRoutes.ts (POST /webhooks/razorpay)
- [ ] T130 [US4] Register transaction and webhook routes in backend/src/routes/index.ts
- [ ] T131 [US4] Add approval/rejection routes to requests router (POST /requests/:id/approve, POST /requests/:id/reject)
- [ ] T132 [US4] Calculate platform commission (15% of rental fee, not deposit) in backend payment order creation
- [ ] T133 [US4] Implement Razorpay Route API for split payments (deposit to escrow, rental fee to lender minus commission) in backend
- [ ] T134 [P] [US4] Create TransactionPage component in frontend/src/pages/TransactionPage.tsx (shows transaction details and actions)
- [ ] T135 [P] [US4] Create PaymentFlow component in frontend/src/components/transactions/PaymentFlow.tsx (Razorpay checkout integration)
- [ ] T136 [P] [US4] Create TransactionStatus component in frontend/src/components/transactions/TransactionStatus.tsx (visual status indicator)
- [ ] T137 [P] [US4] Create transactions API functions in frontend/src/api/transactions.ts (getTransaction, createPaymentOrder, verifyPayment)
- [ ] T138 [US4] Add transaction route to React Router in frontend/src/App.tsx (/transactions/:id)
- [ ] T139 [US4] Add Razorpay SDK script to frontend/public/index.html
- [ ] T140 [US4] Implement Razorpay checkout modal on "Pay Deposit" button click in frontend PaymentFlow component
- [ ] T141 [US4] Add approve/reject buttons to lender's pending requests on Dashboard
- [ ] T142 [US4] Add payment status tracking (pending → processing → completed) in frontend TransactionPage
- [ ] T143 [US4] Add notification when borrower receives payment approval in frontend
- [ ] T144 [US4] Handle free rentals (no deposit, skip payment step) in backend transaction creation

**Checkpoint**: At this point, User Story 4 should be fully functional and testable independently

---

## Phase 7: User Story 5 - Confirm Handover and Return (Priority: P2)

**Goal**: Enable lenders to confirm handover with before photo and borrowers to confirm return with after photo, completing the transaction lifecycle

**Independent Test**: Lender confirms handover with photo upload (status → BOOK_RECEIVED), borrower confirms return with photo upload, lender verifies condition and confirms final return (releases deposit, status → COMPLETED)

### Implementation for User Story 5

- [ ] T145 [P] [US5] Add confirmHandover function to transactions controller in backend/src/controllers/transactionsController.ts (upload before photo, update status to BOOK_RECEIVED)
- [ ] T146 [P] [US5] Add confirmReturn function to transactions controller (borrower uploads after photo, update status to BOOK_RETURNED)
- [ ] T147 [P] [US5] Add verifyReturn function to transactions controller (lender confirms condition, update status to COMPLETED, release deposit via Razorpay)
- [ ] T148 [US5] Add handover/return routes to transactions router (POST /transactions/:id/confirm-handover, POST /transactions/:id/confirm-return, POST /transactions/:id/verify-return)
- [ ] T149 [US5] Implement deposit refund via Razorpay in backend verifyReturn function
- [ ] T150 [US5] Add photo evidence storage with Cloudinary signed URLs in backend
- [ ] T151 [US5] Add transaction state validation (can only confirm handover if DEPOSIT_PAID, can only confirm return if BOOK_RECEIVED) in backend
- [ ] T152 [P] [US5] Create ConfirmHandoverModal component in frontend/src/components/transactions/ConfirmHandoverModal.tsx (photo upload + confirm button)
- [ ] T153 [P] [US5] Create ConfirmReturnModal component in frontend/src/components/transactions/ConfirmReturnModal.tsx (photo upload + confirm button)
- [ ] T154 [P] [US5] Create VerifyReturnModal component in frontend/src/components/transactions/VerifyReturnModal.tsx (condition check + notes)
- [ ] T155 [US5] Add confirmHandover, confirmReturn, verifyReturn functions to frontend/src/api/transactions.ts
- [ ] T156 [US5] Add "Confirm Handover" button for lender on TransactionPage (visible when status = DEPOSIT_PAID)
- [ ] T157 [US5] Add "Confirm Return" button for borrower on TransactionPage (visible when status = BOOK_RECEIVED)
- [ ] T158 [US5] Add "Verify Return" button for lender on TransactionPage (visible when status = BOOK_RETURNED)
- [ ] T159 [US5] Display before/after photos on TransactionPage with timestamps
- [ ] T160 [US5] Add review prompt after transaction completion (COMPLETED status)
- [ ] T161 [US5] Add notification when lender needs to verify return in frontend

**Checkpoint**: At this point, User Story 5 should be fully functional and testable independently

---

## Phase 8: User Story 6 - Leave and View Reviews (Priority: P3)

**Goal**: Enable users to leave star ratings and comments after completed transactions, building reputation scores

**Independent Test**: Complete a transaction, submit reviews from both lender and borrower perspectives, verify reviews appear on user profiles with calculated average ratings

### Implementation for User Story 6

- [ ] T162 [P] [US6] Create Review validation schema in backend/src/utils/validationSchemas.ts (createReviewSchema with rating 1-5, optional comment)
- [ ] T163 [P] [US6] Create reviews controller in backend/src/controllers/reviewsController.ts with createReview function
- [ ] T164 [US6] Add getUserReviews function to reviews controller (returns all reviews for a user with average rating)
- [ ] T165 [US6] Add validation to prevent review before transaction completion in backend reviews controller
- [ ] T166 [US6] Add validation to prevent duplicate reviews (one per user per transaction) in backend reviews controller
- [ ] T167 [US6] Implement reputation score calculation (average of all received ratings) in backend
- [ ] T168 [US6] Create cron job to update user reputation scores daily in backend/src/jobs/updateReputationScores.ts
- [ ] T169 [US6] Create reviews routes in backend/src/routes/reviewsRoutes.ts (POST /reviews, GET /users/:id/reviews)
- [ ] T170 [US6] Register reviews routes in backend/src/routes/index.ts under /api/v1/reviews
- [ ] T171 [P] [US6] Create ReviewForm component in frontend/src/components/reviews/ReviewForm.tsx (star rating selector + comment textarea)
- [ ] T172 [P] [US6] Create ReviewList component in frontend/src/components/reviews/ReviewList.tsx (displays review cards with ratings)
- [ ] T173 [P] [US6] Create RatingDisplay component in frontend/src/components/reviews/RatingDisplay.tsx (star visualization)
- [ ] T174 [P] [US6] Create ProfilePage component in frontend/src/pages/ProfilePage.tsx (public user profile with reviews)
- [ ] T175 [P] [US6] Create reviews API functions in frontend/src/api/reviews.ts (createReview, getUserReviews)
- [ ] T176 [US6] Add profile route to React Router in frontend/src/App.tsx (/users/:id)
- [ ] T177 [US6] Add "Leave Review" button on completed transactions in Dashboard
- [ ] T178 [US6] Display average rating on user profiles (book listings, transaction pages, search results)
- [ ] T179 [US6] Add review submission modal triggered after transaction completion
- [ ] T180 [US6] Show "No reviews yet" placeholder for users with no completed transactions

**Checkpoint**: At this point, User Story 6 should be fully functional and testable independently

---

## Phase 9: User Story 7 - Raise and Resolve Disputes (Priority: P3)

**Goal**: Enable users to raise disputes with photo evidence and admins to make binding resolution decisions

**Independent Test**: Create a dispute scenario, submit evidence from both parties, have an admin review and make a decision (refund/keep/split deposit), verify resolution is executed

### Implementation for User Story 7

- [ ] T181 [P] [US7] Create Dispute validation schema in backend/src/utils/validationSchemas.ts (createDisputeSchema with reason, description, photos)
- [ ] T182 [P] [US7] Create disputes controller in backend/src/controllers/disputesController.ts with createDispute function
- [ ] T183 [US7] Add submitCounterEvidence function to disputes controller (other party submits their evidence)
- [ ] T184 [US7] Add getAllDisputes function to disputes controller (admin only, with status filter)
- [ ] T185 [US7] Add resolveDispute function to disputes controller (admin only, executes deposit distribution)
- [ ] T186 [US7] Implement 48-hour SLA escalation notifications in backend/src/jobs/disputeEscalation.ts
- [ ] T187 [US7] Update transaction status to DISPUTED when dispute created in backend
- [ ] T188 [US7] Implement deposit distribution logic (REFUND_TO_BORROWER, KEEP_WITH_LENDER, SPLIT_50_50) in backend
- [ ] T189 [US7] Create disputes routes in backend/src/routes/disputesRoutes.ts (POST /disputes, POST /disputes/:id/counter-evidence)
- [ ] T190 [US7] Register disputes routes in backend/src/routes/index.ts under /api/v1/disputes
- [ ] T191 [P] [US7] Create DisputeModal component in frontend/src/components/disputes/DisputeModal.tsx (reason dropdown, description, photo uploads)
- [ ] T192 [P] [US7] Create DisputeDetail component in frontend/src/components/disputes/DisputeDetail.tsx (shows evidence from both parties)
- [ ] T193 [P] [US7] Create disputes API functions in frontend/src/api/disputes.ts (createDispute, submitCounterEvidence)
- [ ] T194 [US7] Add "Raise Dispute" button on active transactions in frontend TransactionPage
- [ ] T195 [US7] Add dispute status indicator on disputed transactions in frontend
- [ ] T196 [US7] Add counter-evidence submission form for other party in frontend
- [ ] T197 [US7] Show escalation warning when 48 hours passed without resolution in frontend

**Checkpoint**: At this point, User Story 7 should be fully functional and testable independently

---

## Phase 10: User Story 8 - Admin Dashboard and User Management (Priority: P3)

**Goal**: Enable admins to view platform metrics, manage users, and resolve disputes

**Independent Test**: Admin logs in, views dashboard with all key metrics, searches for users/transactions, suspends a test user account, and verifies the suspension takes effect

### Implementation for User Story 8

- [ ] T198 [P] [US8] Create admin auth controller in backend/src/controllers/adminController.ts with adminLogin function
- [ ] T199 [P] [US8] Add getDashboardMetrics function to admin controller (calculate all platform KPIs)
- [ ] T200 [US8] Add searchUsers function to admin controller (search by email/name, filter by status)
- [ ] T201 [US8] Add getUserDetails function to admin controller (full user info + transaction history)
- [ ] T202 [US8] Add suspendUser function to admin controller (mark user as suspended, prevent new listings/requests)
- [ ] T203 [US8] Add getDisputeDetails function to admin controller (view all evidence from both parties)
- [ ] T204 [US8] Add resolveDispute function to admin controller (make binding decision, execute deposit distribution)
- [ ] T205 [US8] Implement active lenders calculation (users with >1 completed transaction as lender) in backend
- [ ] T206 [US8] Implement repeat borrower rate calculation (borrowers with >1 completed transaction) in backend
- [ ] T207 [US8] Implement dispute rate calculation (<2% warning threshold) in backend
- [ ] T208 [US8] Create admin routes in backend/src/routes/adminRoutes.ts (POST /admin/login, GET /admin/dashboard, GET /admin/users, etc.)
- [ ] T209 [US8] Register admin routes in backend/src/routes/index.ts under /api/v1/admin
- [ ] T210 [P] [US8] Create AdminPage component in frontend/src/pages/AdminPage.tsx (protected route, admin role check)
- [ ] T211 [P] [US8] Create AdminDashboard component in frontend/src/components/admin/AdminDashboard.tsx (displays all metrics with charts)
- [ ] T212 [P] [US8] Create UserManagement component in frontend/src/components/admin/UserManagement.tsx (search users, view details, suspend)
- [ ] T213 [P] [US8] Create DisputePanel component in frontend/src/components/admin/DisputePanel.tsx (list disputes, review evidence, make decision)
- [ ] T214 [P] [US8] Create admin API functions in frontend/src/api/admin.ts (adminLogin, getDashboard, searchUsers, suspendUser, resolveDispute)
- [ ] T215 [US8] Add admin route to React Router in frontend/src/App.tsx (/admin)
- [ ] T216 [US8] Add admin role check middleware to frontend ProtectedRoute for admin pages
- [ ] T217 [US8] Display warning indicators when dispute rate >2% or repeat borrower <30% in admin dashboard
- [ ] T218 [US8] Add admin resolution form with three options (Refund to Borrower, Keep with Lender, Split 50/50) + notes field
- [ ] T219 [US8] Show admin activity audit log (last login, recent actions) on admin dashboard

**Checkpoint**: At this point, User Story 8 should be fully functional and testable independently

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T220 [P] Create HomePage component in frontend/src/pages/HomePage.tsx (landing page with hero, features, CTA)
- [ ] T221 [P] Create NotFoundPage component in frontend/src/pages/NotFoundPage.tsx (404 error page)
- [ ] T222 [P] Create Terms of Service static page in frontend/src/pages/TermsOfServicePage.tsx
- [ ] T223 [P] Create Privacy Policy static page in frontend/src/pages/PrivacyPolicyPage.tsx
- [ ] T224 [P] Create Borrowing Rules static page in frontend/src/pages/BorrowingRulesPage.tsx
- [ ] T225 [P] Add navigation header component in frontend/src/components/common/Header.tsx (logo, search, profile, notifications)
- [ ] T226 [P] Add footer component in frontend/src/components/common/Footer.tsx (links to legal pages, social media)
- [ ] T227 [P] Implement responsive mobile menu in frontend Header component (hamburger menu for <768px)
- [ ] T228 [P] Add Google Analytics 4 tracking in frontend/public/index.html with required events (book_listed, search_performed, request_sent, payment_completed, book_returned, review_submitted, dispute_raised)
- [ ] T229 [P] Add Lighthouse performance optimization: code splitting with React.lazy() for AdminPage in frontend/src/App.tsx
- [ ] T230 [P] Add image lazy loading to BookCard and SearchResults components in frontend
- [ ] T231 [P] Implement 90-day photo cleanup cron job in backend/src/jobs/cleanupOldPhotos.ts
- [ ] T232 [P] Add database indexes for performance: books.location_geo, transactions.status, users.email, users.phone
- [ ] T233 [P] Create deployment configuration for Vercel in frontend/vercel.json
- [ ] T234 [P] Create deployment configuration for Railway/Render in backend/railway.json or render.yaml
- [ ] T235 [P] Add environment variable validation on backend startup in backend/src/config/env.ts
- [ ] T236 [P] Add health check endpoint in backend/src/routes/healthRoutes.ts (GET /health returns database connection status)
- [ ] T237 [P] Add API documentation with Swagger/OpenAPI in backend/src/docs/swagger.yaml
- [ ] T238 Add error boundary component in frontend/src/components/common/ErrorBoundary.tsx (catch React errors)
- [ ] T239 Run Lighthouse audit and fix performance issues to achieve >90 score
- [ ] T240 Run frontend bundle analysis and optimize to <500KB gzipped
- [ ] T241 Test mobile responsive design on real devices (iOS Safari, Android Chrome)
- [ ] T242 Run security audit with npm audit and fix vulnerabilities
- [ ] T243 Create pre-launch manual testing checklist based on quickstart.md validation steps
- [ ] T244 Execute manual testing checklist: user registration flow end-to-end
- [ ] T245 Execute manual testing checklist: book listing creation with image uploads
- [ ] T246 Execute manual testing checklist: search and borrow request flow
- [ ] T247 Execute manual testing checklist: payment with Razorpay test cards
- [ ] T248 Execute manual testing checklist: handover and return with photos
- [ ] T249 Execute manual testing checklist: review submission
- [ ] T250 Execute manual testing checklist: dispute creation and admin resolution
- [ ] T251 Execute manual testing checklist: admin dashboard metrics accuracy
- [ ] T252 Verify all constitution compliance requirements (mobile-first, no messaging, <₹3K/month budget, photo cleanup, etc.)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (Phase 5)**: Depends on User Story 2 (needs BookListing model)
- **User Story 4 (Phase 6)**: Depends on User Story 3 (needs BorrowRequest)
- **User Story 5 (Phase 7)**: Depends on User Story 4 (needs Transaction with payments)
- **User Story 6 (Phase 8)**: Depends on User Story 5 (needs completed transactions)
- **User Story 7 (Phase 9)**: Depends on User Story 5 (needs transactions for disputes)
- **User Story 8 (Phase 10)**: Depends on all previous stories (needs data to display metrics)
- **Polish (Phase 11)**: Depends on desired user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
   ↓
Phase 2 (Foundational) ← BLOCKS ALL USER STORIES
   ↓
   ├─→ User Story 1 (Auth) ← INDEPENDENT
   ├─→ User Story 2 (Listings) ← INDEPENDENT
   └─→ User Story 3 (Search) ← Depends on US2
          ↓
       User Story 4 (Payments) ← Depends on US3
          ↓
       User Story 5 (Handover/Return) ← Depends on US4
          ├─→ User Story 6 (Reviews) ← Depends on US5
          ├─→ User Story 7 (Disputes) ← Depends on US5
          └─→ User Story 8 (Admin) ← Depends on US1-7 for data
```

### Within Each User Story

- Backend models before backend controllers
- Backend controllers before backend routes
- Backend routes before frontend API functions
- Frontend API functions before frontend components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks T001-T013 can run in parallel (different files, no dependencies)
- **Phase 2 (Foundational)**:
  - Database setup (T014-T020) must run sequentially
  - Backend infrastructure (T021-T035) all tasks marked [P] can run in parallel
  - Frontend infrastructure (T036-T050) all tasks marked [P] can run in parallel
- **Within each User Story**: All tasks marked [P] can run in parallel (different files, no overlapping edits)
- **User Stories 1 and 2** can be developed in parallel (independent of each other)
- **After Foundational Phase**: Different team members can work on US1, US2 simultaneously

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch all [P] tasks for US1 together:
Task T051: Create validation schemas
Task T052: Create OTP utility
Task T060: Create RegisterPage
Task T061: Create VerifyOtpPage
Task T062: Create LoginPage
Task T063: Create auth API functions

# Then sequentially:
Task T053: Create auth controller (needs validation schemas + OTP utility)
Task T054-T057: Add controller functions (depends on T053)
Task T058-T059: Create routes (depends on controller)
Task T064-T066: Add routes to React Router (depends on pages)
Task T067-T071: Final integration and error handling
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. **STOP and VALIDATE**: Test User Story 1 independently (register → OTP → login)
5. Deploy/demo if ready

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Auth MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Listings added!)
4. Add User Story 3 → Test independently → Deploy/Demo (Search + Request added!)
5. Continue with User Stories 4-8 in priority order
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T050)
2. Once Foundational is done:
   - Developer A: User Story 1 (T051-T071)
   - Developer B: User Story 2 (T072-T092)
3. Then proceed sequentially: US3 → US4 → US5 → US6 → US7 → US8
4. Stories integrate independently

---

## Notes

- [P] tasks = different files, no dependencies within that phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Manual testing only** - no automated test tasks per spec
- All paths assume web app structure: backend/src/ and frontend/src/
- Use quickstart.md for testing guidance and troubleshooting
- Constitution compliance checks in Phase 11 polish tasks
