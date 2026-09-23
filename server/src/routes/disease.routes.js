import { Router } from 'express';
import { getDiseases, getDisease } from '../controllers/disease.controller.js';

const router = Router();

router.get('/', getDiseases);
router.get('/:id', getDisease);

export default router;
