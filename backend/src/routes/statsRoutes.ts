import { Router } from 'express';
import { getPublicStats } from '../controllers/statsController';

const router = Router();

// Public — powers the landing page social-proof section
router.get('/', getPublicStats);

export default router;
