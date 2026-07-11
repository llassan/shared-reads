import { Router } from 'express'
import { authenticate as authMiddleware } from '../middleware/auth'
import {
  getTransaction,
  confirmHandover,
  confirmReturn,
  completeTransaction,
  getMyTransactions,
} from '../controllers/transactionController'

const router = Router()

// All transaction routes require authentication
router.use(authMiddleware)

// Get all transactions for current user
router.get('/', getMyTransactions)

// Get specific transaction
router.get('/:id', getTransaction)

// Confirm book handover (lender)
router.post('/:id/handover', confirmHandover)

// Confirm book return (borrower)
router.post('/:id/return', confirmReturn)

// Complete transaction (lender)
router.post('/:id/complete', completeTransaction)

export default router
