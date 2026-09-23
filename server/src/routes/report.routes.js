import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getReports, getReport, downloadReport, deleteReport } from '../controllers/report.controller.js';

const router = Router();
router.use(protect);

router.get('/', getReports);
router.get('/:id', getReport);
router.get('/:id/download', downloadReport);
router.delete('/:id', deleteReport);

export default router;
