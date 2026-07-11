import { Router } from 'express';
import {
  createBookListing,
  getMyListings,
  getBookListing,
  updateBookListing,
  deleteBookListing,
  toggleAvailability,
} from '../controllers/bookController';
import { authenticate } from '../middleware/auth';
import { uploadBookImages } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create book listing (with image upload)
router.post('/', uploadLimiter, uploadBookImages, createBookListing);

// Get my listings
router.get('/my-listings', getMyListings);

// Get single listing
router.get('/:id', getBookListing);

// Update listing (with optional image upload)
router.put('/:id', uploadLimiter, uploadBookImages, updateBookListing);

// Delete listing
router.delete('/:id', deleteBookListing);

// Toggle availability
router.patch('/:id/availability', toggleAvailability);

export default router;
