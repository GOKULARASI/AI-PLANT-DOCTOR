import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { getGrowthRecords, addGrowthRecord, deleteGrowthRecord } from '../controllers/growth.controller.js';

const router = Router();
router.use(protect);

router.get('/plant/:plantId', getGrowthRecords);
router.post('/', upload.single('image'), addGrowthRecord);
router.delete('/:id', deleteGrowthRecord);

export default router;
