import { getCurrentWeather, getForecast, getPlantCareAdvice } from '../services/weather.service.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Get current weather with agricultural pathology metrics
 * Supports both coordinates (?lat=..&lon=..) and city name (?location=..)
 */
export const getWeather = async (req, res, next) => {
  try {
    const { location, lat, lon } = req.query;
    const queryParams = {
      location: location || req.user?.location || 'Chennai',
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    };

    const weather = await getCurrentWeather(queryParams);
    const advice = getPlantCareAdvice(weather);

    ApiResponse.success(res, 'Weather data retrieved.', { weather, advice });
  } catch (error) {
    next(error);
  }
};

/**
 * Get 5-day / 3-hour agricultural weather forecast
 * Supports both coordinates and city name
 */
export const getWeatherForecast = async (req, res, next) => {
  try {
    const { location, lat, lon } = req.query;
    const queryParams = {
      location: location || req.user?.location || 'Chennai',
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    };

    const forecast = await getForecast(queryParams);
    ApiResponse.success(res, 'Forecast retrieved.', { forecast });
  } catch (error) {
    next(error);
  }
};

export default { getWeather, getWeatherForecast };
