import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import {
  getPlants, getPlant, createPlant, updatePlant, deletePlant, getPlantStats, waterPlant,
} from '../controllers/plant.controller.js';

const router = Router();

router.use(protect); // All plant routes require auth

router.get('/stats', getPlantStats);
router.get('/', getPlants);
router.get('/:id', getPlant);
router.post('/', upload.single('image'), createPlant);
router.put('/:id', upload.single('image'), updatePlant);
router.delete('/:id', deletePlant);
router.post('/:id/water', waterPlant);

export default router;
