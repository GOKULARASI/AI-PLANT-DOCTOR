import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getWeather, getWeatherForecast } from '../controllers/weather.controller.js';

const router = Router();
router.use(protect);

router.get('/current', getWeather);
router.get('/forecast', getWeatherForecast);

export default router;
