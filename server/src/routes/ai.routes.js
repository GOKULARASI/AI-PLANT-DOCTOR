import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { scanDisease, getAITreatment, getAIFertilizer, getAIWaterSchedule } from '../controllers/ai.controller.js';

const router = Router();

router.use(protect);

router.post('/detect-disease', upload.single('image'), scanDisease);
router.post('/treatment', getAITreatment);
router.post('/fertilizer', getAIFertilizer);
router.post('/water-schedule', getAIWaterSchedule);

export default router;
