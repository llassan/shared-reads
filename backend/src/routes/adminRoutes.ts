import { Router } from 'express'
import { adminAuthMiddleware } from '../middleware/adminMiddleware'
import {
  adminLogin,
  getPlatformStats,
  getPendingDisputes,
  resolveDispute,
  getAllUsers,
  suspendUser,
  activateUser,
} from '../controllers/adminController'

const router = Router()

// Public routes
router.post('/login', adminLogin)

// Protected admin routes
router.use(adminAuthMiddleware)

// Platform statistics
router.get('/stats', getPlatformStats)

// Dispute management
router.get('/disputes/pending', getPendingDisputes)
router.post('/disputes/:id/resolve', resolveDispute)

// User management
router.get('/users', getAllUsers)
router.post('/users/:id/suspend', suspendUser)
router.post('/users/:id/activate', activateUser)

export default router
