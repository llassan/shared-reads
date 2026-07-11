# Feature Specification: SharedReads Platform

**Feature Branch**: `001-sharedreads-platform`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "Build SharedReads - a peer-to-peer book-sharing marketplace web application using React + TypeScript frontend and Node.js + Express + PostgreSQL backend. Core functionality: Lenders can list books (free or paid rental), Borrowers can search nearby books and request to borrow, Platform holds deposits in escrow and takes 15% commission on paid rentals only. Phase 1 MVP must include: User auth with phone/email verification, book listing with photos, location-based search, borrow request workflow, Razorpay payment integration for deposits/rentals, transaction tracking, basic reviews, and admin dispute resolution. Target: Launch in one college campus with 50 lenders, 200 transactions to prove model before scaling. Key constraints: Mobile-first web app, <₹3K/month hosting, no in-app messaging (Phase 1), users self-manage book handover, boringly reliable over flashy features."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Verification (Priority: P1)

A new user (student) discovers SharedReads through campus promotion and wants to join the platform to either lend books they own or borrow books they need. They register using their email and phone number, verify both via OTP codes, and complete their basic profile to establish their identity on the platform.

**Why this priority**: Without verified users, no transactions can occur. This is the entry point for all platform activity and establishes trust from the beginning. Email and phone verification prevent spam accounts and enable communication about transactions.

**Independent Test**: Can be fully tested by registering a new user, receiving and entering OTP codes for both email and phone, and confirming the user account is created and marked as verified in the system.

**Acceptance Scenarios**:

1. **Given** a new visitor on the landing page, **When** they click "Sign Up" and provide email, phone, and password, **Then** they receive OTP codes via email and SMS
2. **Given** a user has received OTP codes, **When** they enter valid codes for both email and phone within the time limit, **Then** their account is created and marked as verified
3. **Given** a user with invalid or expired OTP, **When** they attempt to verify, **Then** they see a clear error message and option to resend OTP
4. **Given** an existing user, **When** they attempt to register with the same email or phone, **Then** they see a message indicating the account already exists with a link to login
5. **Given** a registered user, **When** they return to the platform, **Then** they can log in with their email and password

---

### User Story 2 - List a Book for Sharing (Priority: P1)

A lender (book owner) wants to share a book they're not currently reading. They create a listing by entering the book title, author, uploading at least 2 photos showing the book's condition, selecting a condition rating (New, Like New, Good, Acceptable), setting their location, and choosing whether to offer it for free or charge a rental fee with deposit.

**Why this priority**: Without book listings, there's no marketplace. This is the supply side of the platform and must work seamlessly for lenders to contribute inventory.

**Independent Test**: Can be fully tested by a verified lender creating a book listing with all required information, confirming the listing appears in search results, and verifying all listing details are stored correctly.

**Acceptance Scenarios**:

1. **Given** a verified lender on their dashboard, **When** they click "List a Book" and fill in all required fields (title, author, condition, 2+ photos, location), **Then** the book listing is created and visible in search results
2. **Given** a lender creating a listing, **When** they choose "Free" rental type, **Then** they can specify an optional deposit amount for damage protection
3. **Given** a lender creating a listing, **When** they choose "Paid" rental type, **Then** they must specify both rental price and deposit amount
4. **Given** a lender creating a listing, **When** they upload fewer than 2 photos, **Then** they see a validation error and cannot submit until requirement is met
5. **Given** a lender with an active listing, **When** they view their dashboard, **Then** they can see all their listings, edit listing details, or mark a book as unavailable

---

### User Story 3 - Search and Request to Borrow (Priority: P1)

A borrower (student needing a book) searches for books by title, author, or category, filtering results to show only books available within their campus area. They view book details including condition, photos, lender reputation, and rental terms. They submit a borrow request which notifies the lender.

**Why this priority**: This is the demand side of the marketplace. Without search and request functionality, borrowers cannot discover and access books, making the platform useless.

**Independent Test**: Can be fully tested by a borrower searching for a book by title, viewing search results filtered by location, selecting a book, viewing all details, and submitting a borrow request that appears in the lender's pending requests.

**Acceptance Scenarios**:

1. **Given** a borrower on the search page, **When** they enter a book title or author name, **Then** they see relevant results showing books available within their location radius
2. **Given** search results displayed, **When** a borrower clicks on a book listing, **Then** they see full details including all photos, condition rating, lender profile, rental price/deposit, and availability status
3. **Given** a borrower viewing an available book, **When** they click "Request to Borrow" and confirm the request, **Then** the lender receives a notification and the request appears in the lender's dashboard as pending
4. **Given** a borrower viewing an unavailable book or a book they've already requested, **When** they attempt to request it, **Then** the request button is disabled with an explanatory message
5. **Given** a borrower has submitted a request, **When** they check their dashboard, **Then** they can view the status of all their borrow requests (pending, approved, rejected)

---

### User Story 4 - Approve Request and Handle Deposit (Priority: P2)

A lender receives a borrow request notification, reviews the borrower's profile and reputation, and either approves or rejects the request. Upon approval, the borrower is prompted to pay the deposit (and rental fee if applicable). The platform holds the deposit in escrow. Both parties coordinate handover details outside the platform.

**Why this priority**: This enables the transaction flow and establishes the financial trust mechanism (escrow deposit) that protects both parties.

**Independent Test**: Can be fully tested by a lender approving a request, borrower paying deposit via payment gateway, confirming funds are held in escrow, and both parties seeing updated transaction status.

**Acceptance Scenarios**:

1. **Given** a lender with pending requests, **When** they view a borrower's profile and click "Approve", **Then** the borrower receives a notification with payment instructions
2. **Given** a borrower with an approved request, **When** they click "Pay Deposit" and complete payment through the payment gateway, **Then** the deposit is held in escrow and transaction status updates to "Deposit Paid"
3. **Given** a lender reviewing a request, **When** they click "Reject" with an optional reason, **Then** the borrower is notified and the request is marked as rejected
4. **Given** a free rental with no deposit, **When** the lender approves the request, **Then** the transaction proceeds to "Approved" status without payment step
5. **Given** a paid rental, **When** the borrower completes payment, **Then** the total amount is correctly split between deposit (held in escrow) and rental fee (15% platform commission deducted, remainder to lender)

---

### User Story 5 - Confirm Handover and Return (Priority: P2)

When the lender and borrower meet to hand over the book, the lender confirms receipt of deposit payment and provides the book. The lender takes a "before" photo and confirms handover in the system. When the borrower returns the book, they upload an "after" photo and confirm return. The lender verifies the book condition and confirms return completion.

**Why this priority**: This completes the transaction lifecycle and provides photographic evidence for dispute resolution. Without this, there's no way to track book condition and resolve damage disputes.

**Independent Test**: Can be fully tested by lender confirming handover with photo upload, borrower confirming return with photo upload, and lender verifying condition and confirming final return, which releases the deposit.

**Acceptance Scenarios**:

1. **Given** a transaction with deposit paid, **When** the lender meets the borrower and uploads a "before" photo, then confirms handover, **Then** transaction status updates to "Book Received" and borrower can now return it
2. **Given** a transaction in "Book Received" status, **When** the borrower returns the book, uploads an "after" photo, and confirms return, **Then** the lender receives a notification to verify the book condition
3. **Given** a lender reviewing a returned book, **When** they confirm the book is in acceptable condition and click "Confirm Return", **Then** the deposit is released to the borrower (minus any damage deductions if applicable)
4. **Given** photos uploaded during handover and return, **When** either party views the transaction history, **Then** they can see timestamped photos as evidence of book condition
5. **Given** a transaction completed successfully, **When** both parties view the transaction, **Then** they are prompted to leave a review for each other

---

### User Story 6 - Leave and View Reviews (Priority: P3)

After a successful transaction completion, both the lender and borrower can leave a review rating (1-5 stars) and optional comment about their experience. Reviews are visible on user profiles and help build reputation scores that other users see when deciding whether to transact.

**Why this priority**: Reviews build trust in the marketplace by making reputation visible. While important for long-term platform health, the platform can function without reviews initially.

**Independent Test**: Can be fully tested by completing a transaction, submitting reviews from both lender and borrower perspectives, and verifying reviews appear on user profiles with calculated reputation scores.

**Acceptance Scenarios**:

1. **Given** a completed transaction, **When** a lender or borrower clicks "Leave Review", **Then** they can submit a star rating (1-5) and optional text comment about the other party
2. **Given** a user has submitted a review, **When** the other party views the transaction, **Then** they can see the review but cannot edit or delete it
3. **Given** a user profile with multiple reviews, **When** anyone views the profile, **Then** they see the average rating (0-5 stars) and a list of recent reviews
4. **Given** a completed transaction, **When** a user attempts to leave multiple reviews for the same transaction, **Then** the system prevents duplicate reviews
5. **Given** a user has not completed any transactions, **When** their profile is viewed, **Then** it shows "No reviews yet" with a default rating display

---

### User Story 7 - Raise and Resolve Disputes (Priority: P3)

If a book is damaged, not returned on time, or misrepresented, either party can raise a dispute by providing evidence (photos, description). An admin reviews the dispute, examines evidence from both parties, and makes a binding decision about deposit refund (full refund to borrower, keep with lender, or partial split).

**Why this priority**: Disputes will be rare but critical to handle when they occur. The admin resolution mechanism protects platform integrity and user trust.

**Independent Test**: Can be fully tested by creating a dispute scenario, submitting evidence from both parties, having an admin review and make a decision, and verifying the resolution is executed (deposit distributed according to decision).

**Acceptance Scenarios**:

1. **Given** an active transaction, **When** a lender or borrower clicks "Raise Dispute" and submits evidence (photos, description, reason), **Then** the dispute is created with status "Pending" and both parties plus admin are notified
2. **Given** a dispute has been raised by one party, **When** the other party views the dispute, **Then** they can submit their own evidence and explanation
3. **Given** an admin reviewing a dispute, **When** they examine all evidence and make a decision (refund full deposit to borrower, keep with lender, or split 50/50), **Then** the decision is marked as final and executed
4. **Given** a dispute resolved by admin, **When** either party views the dispute, **Then** they see the admin's decision, rationale, and the executed deposit distribution
5. **Given** a dispute is created, **When** 48 hours have passed without admin resolution, **Then** both parties receive an escalation notification

---

### User Story 8 - Admin Dashboard and User Management (Priority: P3)

Platform administrators can view all users, transactions, disputes, and key metrics (total users, active lenders, total books, transaction volume, dispute rate, repeat borrower rate). They can suspend or ban users for policy violations, manually refund deposits in exceptional cases, and monitor platform health.

**Why this priority**: Admin tools are essential for platform management but not required for the core user-to-user transaction flow. Can be built after core marketplace functions are working.

**Independent Test**: Can be fully tested by an admin logging in, viewing the dashboard with all key metrics, searching for users/transactions, suspending a test user account, and verifying the suspension takes effect.

**Acceptance Scenarios**:

1. **Given** an admin user logged in, **When** they access the admin dashboard, **Then** they see key metrics: total users, active lenders, total books listed, transactions this month, successful return rate, dispute rate, repeat borrower rate
2. **Given** an admin viewing the user list, **When** they search for a user by email or name and select them, **Then** they can view full user details, transaction history, and reputation
3. **Given** an admin reviewing a user account, **When** they click "Suspend User" with a reason, **Then** the user is marked as suspended and cannot create new listings or requests (existing transactions continue)
4. **Given** an admin viewing all disputes, **When** they filter by status (pending, resolved) and select a dispute, **Then** they can review all evidence and make a binding decision
5. **Given** an admin monitoring platform metrics, **When** dispute rate exceeds 2% or other warning thresholds are crossed, **Then** the dashboard displays warning indicators

---

### Edge Cases

- What happens when a borrower pays deposit but never picks up the book? (Lender can report non-pickup, admin reviews and refunds deposit to borrower after investigation)
- What happens when a lender becomes unresponsive after approving a request? (Borrower can cancel request after 48 hours and receive automatic refund if deposit was paid)
- What happens when a borrower never returns the book? (Lender can raise dispute after agreed rental period expires, admin reviews and may forfeit deposit to lender)
- What happens when payment gateway is temporarily unavailable? (User sees clear error message, transaction remains in "Approved" status until payment succeeds, retry mechanism available)
- What happens when a user tries to list the same book multiple times? (System allows it - same physical book could be relisted after previous transaction completes)
- What happens when a user attempts to borrow their own listed book? (System prevents this with validation error)
- What happens when a book is damaged during transit/use? (Borrower should note this in "after" photo, lender can raise dispute, admin reviews evidence and may partially forfeit deposit)
- What happens when a user deletes their account with active transactions? (System prevents account deletion until all active transactions are completed or resolved)
- What happens when both parties rate each other 1 star? (Reviews are still published, reputation score is calculated from all reviews not just one transaction)
- What happens when geographic search returns no results? (User sees "No books found nearby" message with suggestion to expand search radius or list their own books)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & User Management

- **FR-001**: System MUST allow new users to register with email address, phone number, and password
- **FR-002**: System MUST send OTP verification codes to both email and phone number upon registration
- **FR-003**: System MUST require both email and phone verification before allowing user to create listings or requests
- **FR-004**: System MUST validate email format and phone number format before sending OTP
- **FR-005**: System MUST enforce password requirements (minimum 8 characters, at least 1 uppercase letter, 1 number)
- **FR-006**: System MUST allow users to log in with email and password
- **FR-007**: System MUST allow users to reset forgotten passwords via email verification
- **FR-008**: System MUST create a unique user profile for each registered user containing: name, email, phone, location, profile photo (optional), reputation score, join date
- **FR-009**: System MUST prevent duplicate registrations with the same email or phone number

#### Book Listing Management

- **FR-010**: System MUST allow verified lenders to create book listings with: title, author, description (optional), condition rating (NEW/LIKE_NEW/GOOD/ACCEPTABLE), rental type (FREE/PAID)
- **FR-011**: System MUST require minimum 2 photos and maximum 5 photos per book listing
- **FR-012**: System MUST allow lenders to specify their location (address or geographic coordinates) for each listing
- **FR-013**: System MUST allow lenders to specify deposit amount for all listings (required for PAID rentals, optional for FREE rentals)
- **FR-014**: System MUST require rental price for PAID rental type listings
- **FR-015**: System MUST allow lenders to specify rental duration in days
- **FR-016**: System MUST allow lenders to mark listings as available or unavailable
- **FR-017**: System MUST allow lenders to edit their own listings (except when book is currently borrowed)
- **FR-018**: System MUST allow lenders to delete their own listings (only when no active transactions exist for that book)
- **FR-019**: System MUST display all lender's listings on their dashboard

#### Search & Discovery

- **FR-020**: System MUST allow borrowers to search for books by title, author, or keywords
- **FR-021**: System MUST filter search results to show only books within a configurable radius of the borrower's location (default: 5km for campus launch)
- **FR-022**: System MUST display search results showing: book title, author, condition, primary photo thumbnail, rental price (or "Free"), lender name, lender rating, distance from borrower
- **FR-023**: System MUST allow borrowers to view full details of any book listing including: all photos, complete description, lender profile, rental terms, availability status
- **FR-024**: System MUST show "Unavailable" status for books currently borrowed or marked unavailable by lender
- **FR-025**: System MUST allow filtering search results by: condition rating, rental type (free/paid), availability, distance

#### Borrow Request Workflow

- **FR-026**: System MUST allow borrowers to submit borrow requests for available books
- **FR-027**: System MUST prevent borrowers from requesting their own listed books
- **FR-028**: System MUST prevent duplicate requests (borrower cannot request the same book twice while a request is pending or active)
- **FR-029**: System MUST notify lenders when they receive a new borrow request
- **FR-030**: System MUST display all pending requests on the lender's dashboard
- **FR-031**: System MUST allow lenders to approve or reject pending requests
- **FR-032**: System MUST allow lenders to provide an optional rejection reason
- **FR-033**: System MUST notify borrowers when their request is approved or rejected

#### Payment & Escrow

- **FR-034**: System MUST integrate with payment gateway (Razorpay) for deposit and rental payment processing
- **FR-035**: System MUST prompt borrower to pay deposit (and rental fee if applicable) upon request approval
- **FR-036**: System MUST hold deposit amount in escrow until transaction completion
- **FR-037**: System MUST calculate and deduct 15% platform commission from rental fees (not from deposits)
- **FR-038**: System MUST transfer rental fee (minus commission) to lender account after successful handover confirmation
- **FR-039**: System MUST support zero-payment flow for free rentals with no deposit
- **FR-040**: System MUST record all payment transactions with: transaction ID, timestamp, amount, type (deposit/rental), status
- **FR-041**: System MUST prevent transaction progression if required payment fails or is incomplete

#### Transaction Tracking & Handover

- **FR-042**: System MUST track transaction status through states: INITIATED → DEPOSIT_PAID → BOOK_RECEIVED → BOOK_RETURNED → COMPLETED
- **FR-043**: System MUST allow lenders to upload "before handover" photo and confirm handover completion
- **FR-044**: System MUST allow borrowers to upload "after return" photo and confirm return completion
- **FR-045**: System MUST allow lenders to verify returned book condition and confirm transaction completion
- **FR-046**: System MUST store timestamped photos for each transaction as evidence
- **FR-047**: System MUST release deposit to borrower upon lender's confirmation of successful return
- **FR-048**: System MUST display transaction status and history for both lenders and borrowers on their dashboards

#### Reviews & Reputation

- **FR-049**: System MUST allow both lender and borrower to submit one review per completed transaction
- **FR-050**: System MUST require star rating (1-5) for each review (text comment optional)
- **FR-051**: System MUST prevent review submission before transaction completion
- **FR-052**: System MUST calculate user reputation score as average of all received ratings (0-5 scale)
- **FR-053**: System MUST display user reputation score on user profiles and in search results
- **FR-054**: System MUST prevent users from editing or deleting submitted reviews
- **FR-055**: System MUST display all reviews received by a user on their profile page

#### Dispute Resolution

- **FR-056**: System MUST allow lenders or borrowers to raise disputes during active transactions
- **FR-057**: System MUST require dispute evidence: reason (damage/non-return/misrepresentation/other), description, supporting photos
- **FR-058**: System MUST notify both parties and admin when a dispute is raised
- **FR-059**: System MUST allow both parties to submit evidence and explanations
- **FR-060**: System MUST allow admin to review all dispute evidence and make a binding decision
- **FR-061**: System MUST support dispute resolution outcomes: refund full deposit to borrower, keep full deposit with lender, partial split (percentage configurable by admin)
- **FR-062**: System MUST execute deposit distribution according to admin decision
- **FR-063**: System MUST enforce 48-hour SLA for admin dispute resolution with escalation notification
- **FR-064**: System MUST mark disputes as "Resolved" after admin decision is executed

#### Admin Dashboard & Management

- **FR-065**: System MUST provide admin login with separate admin credentials (not regular user accounts)
- **FR-066**: System MUST display admin dashboard with metrics: total users, active lenders, total books listed, transactions this month, successful returns percentage, dispute rate, repeat borrower rate, average transaction value, revenue this month
- **FR-067**: System MUST allow admin to search and view all users, transactions, and disputes
- **FR-068**: System MUST allow admin to suspend user accounts with reason (prevents new listings/requests, existing transactions continue)
- **FR-069**: System MUST allow admin to manually refund deposits in exceptional cases with audit logging
- **FR-070**: System MUST highlight warning indicators when dispute rate exceeds 2% or repeat borrower rate falls below 30%
- **FR-071**: System MUST provide admin access to view all transaction photos and evidence

#### Data Integrity & Security

- **FR-072**: System MUST prevent users from deleting accounts with active transactions or pending disputes
- **FR-073**: System MUST log all state transitions for transactions with timestamp and triggering user
- **FR-074**: System MUST validate all user inputs to prevent injection attacks and malformed data
- **FR-075**: System MUST enforce authorization checks ensuring users can only modify their own listings/requests
- **FR-076**: System MUST rate limit sensitive actions: login attempts (5 per 15 minutes), image uploads (10 per hour)

### Key Entities

- **User**: Represents a platform participant who can act as lender, borrower, or both. Contains profile information (name, email, phone, location, profile photo), verification status (email verified, phone verified), reputation score (calculated from reviews), role indicators (can be lender and borrower simultaneously), join date, account status (active, suspended, deleted).

- **Book Listing**: Represents a book available for sharing. Contains book information (title, author, description), condition rating (NEW/LIKE_NEW/GOOD/ACCEPTABLE), rental terms (rental type FREE/PAID, rental price, deposit amount, rental duration in days), listing metadata (lender reference, location coordinates/address, photos array, availability status, created date, last updated date).

- **Borrow Request**: Represents a borrower's request to borrow a specific book. Contains references to borrower, lender, and book listing, request status (PENDING/APPROVED/REJECTED), timestamps (created, approved/rejected), optional rejection reason.

- **Transaction**: Represents the full lifecycle of a book borrow from request approval to completion. Contains references to borrower, lender, book listing, status (INITIATED/DEPOSIT_PAID/BOOK_RECEIVED/BOOK_RETURNED/COMPLETED/DISPUTED), payment information (deposit amount, rental amount, platform fee, payment transaction IDs), evidence photos (before handover, after return), timestamps for each state transition, completion date.

- **Review**: Represents post-transaction feedback from one user about another. Contains reviewer reference, reviewee reference, transaction reference, rating (1-5 stars), optional text comment, timestamp, prevents duplicates (one review per user per transaction).

- **Dispute**: Represents a contested transaction requiring admin intervention. Contains transaction reference, raised by user reference, reason enum (DAMAGE/NOT_RETURNED/WRONG_CONDITION/OTHER), evidence (description, photo URLs), counter-evidence from other party, admin decision (status: PENDING/RESOLVED/REJECTED, resolution outcome, resolution notes), timestamps (created, resolved), admin user reference.

- **Payment Transaction**: Represents a financial transaction processed through payment gateway. Contains transaction ID (from payment gateway), transaction type (DEPOSIT/RENTAL), amount, status (PENDING/COMPLETED/FAILED/REFUNDED), user reference (payer), timestamps (initiated, completed), gateway response data.

- **Admin**: Represents platform administrator with elevated permissions. Contains admin credentials, permissions (view all data, resolve disputes, suspend users, refund deposits), activity audit log.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete registration and verification in under 3 minutes
- **SC-002**: Lenders can create a book listing with photos in under 2 minutes
- **SC-003**: Borrowers can find relevant books within 30 seconds of starting a search
- **SC-004**: Search results appear within 1 second of query submission for typical campus catalog size (500-1000 books)
- **SC-005**: Borrow request workflow from request to payment completion takes under 5 clicks for borrower
- **SC-006**: Payment processing completes within 30 seconds of borrower confirming payment
- **SC-007**: Platform successfully processes 200 transactions within first 3 months of campus launch
- **SC-008**: Dispute rate remains below 2% of total transactions
- **SC-009**: 95% of disputes are resolved by admin within 48-hour SLA
- **SC-010**: Repeat borrower rate exceeds 30% (users who borrow more than once)
- **SC-011**: Platform successfully supports 50 active lenders in pilot campus
- **SC-012**: 90% of users successfully complete their first transaction on first attempt without support intervention
- **SC-013**: Average user reputation score across platform exceeds 4.0 stars (out of 5)
- **SC-014**: Platform remains within hosting budget constraint of ₹3,000 per month during pilot phase
- **SC-015**: Mobile web interface achieves >90 Lighthouse score on performance, accessibility, and best practices
- **SC-016**: Zero critical security vulnerabilities (SQL injection, XSS, authentication bypass) in security audit
- **SC-017**: Photo uploads complete successfully 95% of the time on first attempt across common mobile devices and network conditions
- **SC-018**: Transaction completion rate (approved requests that reach COMPLETED status) exceeds 85%
- **SC-019**: User-to-user trust score measured by survey reaches >70% ("I feel safe transacting on this platform")
- **SC-020**: Platform onboards minimum 50 lenders and achieves 200 completed transactions before expanding beyond pilot campus (scaling gate criteria met)

### Assumptions

- Campus target is a single college/university with geographic radius of approximately 5km
- Users have access to smartphones with camera and internet connectivity
- Payment gateway (Razorpay) integration will be available and functional in test and production modes
- Email and SMS delivery services will reliably deliver OTP codes within 2 minutes
- Users will coordinate book handover logistics (meeting location/time) through external channels (phone, WhatsApp) as in-app messaging is explicitly excluded from Phase 1
- Lenders own the books they list and have authority to rent/share them
- Rental durations will typically range from 1 day to 30 days (configurable by lender)
- Book condition ratings follow standardized definitions: NEW (unread, perfect), LIKE_NEW (read once, no damage), GOOD (visible wear, no major damage), ACCEPTABLE (significant wear, functional)
- Platform commission of 15% is deducted only from rental fees, never from deposits
- Deposit amounts are suggested by lenders based on book value and replacement cost
- Geographic location is captured via browser geolocation API or manual address entry
- Admin team consists of 1-2 people during pilot phase who can respond to disputes within 48 hours
- Legal agreements (Terms of Service, Privacy Policy) are prepared before launch and users must accept during registration
- Photo uploads are compressed and optimized to stay within free tier limits of hosting provider
- Transaction history and evidence photos are retained for minimum 90 days for dispute resolution purposes
