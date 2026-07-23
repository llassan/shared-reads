import { Router } from 'express';
import { searchBooks } from '../controllers/searchController';

const router = Router();

// Public: browsing the marketplace must not require an account
router.get('/', searchBooks);

export default router;
