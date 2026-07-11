import { Router } from 'express'
import { authenticate as authMiddleware } from '../middleware/auth'
import {
  createDispute,
  addCounterEvidence,
  getDispute,
  getMyDisputes,
} from '../controllers/disputeController'

const router = Router()

// All dispute routes require authentication
router.use(authMiddleware)

// Create a dispute
router.post('/', createDispute)

// Get all disputes for current user
router.get('/my-disputes', getMyDisputes)

// Get specific dispute
router.get('/:id', getDispute)

// Add counter-evidence to a dispute
router.post('/:id/counter-evidence', addCounterEvidence)

export default router
