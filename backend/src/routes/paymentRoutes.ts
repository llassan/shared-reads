import { Router } from 'express'
import { authenticate as authMiddleware } from '../middleware/auth'
import {
  createPaymentOrder,
  verifyPayment,
  getTransactionPayment,
  initiateRefund,
} from '../controllers/paymentController'

const router = Router()

// All payment routes require authentication
router.use(authMiddleware)

// Create payment order for a transaction
router.post('/create-order', createPaymentOrder)

// Verify payment after successful payment
router.post('/verify', verifyPayment)

// Get payment details for a transaction
router.get('/transaction/:transactionId', getTransactionPayment)

// Initiate refund for a transaction
router.post('/refund', initiateRefund)

export default router
