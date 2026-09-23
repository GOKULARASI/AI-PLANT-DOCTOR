import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getCommunityOutbreaks } from '../controllers/outbreak.controller.js';

const router = Router();

// Allow authenticated users to view outbreak radar
router.use(protect);

router.get('/', getCommunityOutbreaks);

export default router;
