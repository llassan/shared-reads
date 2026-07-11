import { Router } from 'express'
import { authenticate as authMiddleware } from '../middleware/auth'
import {
  createReview,
  getUserReviews,
  getTransactionReviews,
  canReviewTransaction,
} from '../controllers/reviewController'

const router = Router()

// All review routes require authentication
router.use(authMiddleware)

// Create a review
router.post('/', createReview)

// Get reviews for a specific user
router.get('/user/:userId', getUserReviews)

// Get reviews for a specific transaction
router.get('/transaction/:transactionId', getTransactionReviews)

// Check if user can review a transaction
router.get('/can-review/:transactionId', canReviewTransaction)

export default router
