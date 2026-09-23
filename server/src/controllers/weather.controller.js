import { getCurrentWeather, getForecast, getPlantCareAdvice } from '../services/weather.service.js';
import ApiResponse from '../utils/apiResponse.js';

export const getWeather = async (req, res, next) => {
  try {
    const location = req.query.location || req.user?.location || 'New Delhi';
    const weather = await getCurrentWeather(location);
    const advice = getPlantCareAdvice(weather);
    ApiResponse.success(res, 'Weather data retrieved.', { weather, advice });
  } catch (error) {
    next(error);
  }
};

export const getWeatherForecast = async (req, res, next) => {
  try {
    const location = req.query.location || req.user?.location || 'New Delhi';
    const forecast = await getForecast(location);
    ApiResponse.success(res, 'Forecast retrieved.', { forecast });
  } catch (error) {
    next(error);
  }
};

export default { getWeather, getWeatherForecast };
