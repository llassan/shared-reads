import { Router } from 'express';
import {
  createBorrowRequest,
  getMyRequests,
  getIncomingRequests,
  getBorrowRequest,
  approveBorrowRequest,
  rejectBorrowRequest,
  cancelBorrowRequest,
} from '../controllers/requestController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create borrow request
router.post('/', createBorrowRequest);

// Get my requests (as borrower)
router.get('/my-requests', getMyRequests);

// Get incoming requests (as lender)
router.get('/incoming', getIncomingRequests);

// Get single request
router.get('/:id', getBorrowRequest);

// Approve request (lender only)
router.post('/:id/approve', approveBorrowRequest);

// Reject request (lender only)
router.post('/:id/reject', rejectBorrowRequest);

// Cancel request (borrower only)
router.delete('/:id', cancelBorrowRequest);

export default router;
