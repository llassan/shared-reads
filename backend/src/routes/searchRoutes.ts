import { Router } from 'express';
import { searchBooks } from '../controllers/searchController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Search requires authentication
router.get('/', authenticate, searchBooks);

export default router;
