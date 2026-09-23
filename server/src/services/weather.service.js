import WeatherCache from '../models/WeatherCache.js';

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather (with caching)
 */
export const getCurrentWeather = async (location = 'London') => {
  // Check cache first
  const cached = await WeatherCache.findOne({ location: location.toLowerCase() });
  if (cached && cached.expiresAt > new Date()) {
    return cached.data;
  }

  if (!process.env.OPENWEATHER_API_KEY) {
    return getMockWeather(location);
  }

  try {
    const url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      console.error('Weather API error:', data.message);
      return getMockWeather(location);
    }

    const weatherData = {
      location: data.name,
      country: data.sys?.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      condition: data.weather[0]?.main,
      description: data.weather[0]?.description,
      icon: data.weather[0]?.icon,
      visibility: data.visibility,
      clouds: data.clouds?.all,
      rainChance: data.rain ? Math.min(100, data.clouds?.all || 50) : (data.clouds?.all > 70 ? 60 : 20),
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString(),
    };

    // Cache the result
    await WeatherCache.findOneAndUpdate(
      { location: location.toLowerCase() },
      { data: weatherData, fetchedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
      { upsert: true }
    );

    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error.message);
    return getMockWeather(location);
  }
};

/**
 * Get 5-day forecast
 */
export const getForecast = async (location = 'London') => {
  if (!process.env.OPENWEATHER_API_KEY) {
    return getMockForecast();
  }

  try {
    const url = `${OPENWEATHER_BASE}/forecast?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=40`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== '200') {
      return getMockForecast();
    }

    // Group by day (take noon reading for each day)
    const dailyMap = {};
    data.list.forEach((item) => {
      const date = item.dt_txt.split(' ')[0];
      const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
      if (!dailyMap[date] || Math.abs(hour - 12) < Math.abs(parseInt(dailyMap[date].dt_txt.split(' ')[1]) - 12)) {
        dailyMap[date] = item;
      }
    });

    return Object.values(dailyMap).slice(0, 5).map((item) => ({
      date: item.dt_txt.split(' ')[0],
      temperature: Math.round(item.main.temp),
      tempMin: Math.round(item.main.temp_min),
      tempMax: Math.round(item.main.temp_max),
      humidity: item.main.humidity,
      condition: item.weather[0]?.main,
      description: item.weather[0]?.description,
      icon: item.weather[0]?.icon,
      windSpeed: item.wind.speed,
      rainChance: item.pop ? Math.round(item.pop * 100) : 0,
    }));
  } catch (error) {
    console.error('Forecast fetch error:', error.message);
    return getMockForecast();
  }
};

/**
 * Get plant care advice based on weather
 */
export const getPlantCareAdvice = (weather) => {
  const advice = [];

  if (weather.temperature > 35) {
    advice.push({ icon: '🌡️', title: 'Heat Alert', message: 'Move sensitive plants to shade. Water in early morning or late evening.' });
  } else if (weather.temperature < 5) {
    advice.push({ icon: '❄️', title: 'Frost Warning', message: 'Cover outdoor plants. Bring potted plants indoors.' });
  }

  if (weather.humidity > 80) {
    advice.push({ icon: '💧', title: 'High Humidity', message: 'Watch for fungal diseases. Ensure good air circulation.' });
  } else if (weather.humidity < 30) {
    advice.push({ icon: '🏜️', title: 'Low Humidity', message: 'Mist your plants. Consider using a humidifier for indoor plants.' });
  }

  if (weather.windSpeed > 10) {
    advice.push({ icon: '💨', title: 'Strong Wind', message: 'Stake tall plants. Move lightweight pots to sheltered areas.' });
  }

  if (weather.rainChance > 70) {
    advice.push({ icon: '🌧️', title: 'Rain Expected', message: 'Skip watering today. Check drainage to prevent waterlogging.' });
  }

  if (weather.condition === 'Clear' && weather.temperature > 25) {
    advice.push({ icon: '☀️', title: 'Sunny Day', message: 'Great day for photosynthesis! Ensure adequate watering.' });
  }

  if (advice.length === 0) {
    advice.push({ icon: '🌿', title: 'Good Conditions', message: 'Weather conditions are favorable for plant growth.' });
  }

  return advice;
};

// ─── Mock Data ───────────────────────────────────────────────────────
function getMockWeather(location) {
  return {
    location: location || 'New Delhi',
    country: 'IN',
    temperature: 32,
    feelsLike: 35,
    humidity: 65,
    pressure: 1012,
    windSpeed: 4.5,
    windDirection: 180,
    condition: 'Partly Cloudy',
    description: 'scattered clouds',
    icon: '03d',
    visibility: 10000,
    clouds: 40,
    rainChance: 25,
    sunrise: new Date().toISOString(),
    sunset: new Date().toISOString(),
  };
}

function getMockForecast() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return days.map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      date: date.toISOString().split('T')[0],
      temperature: 28 + Math.floor(Math.random() * 8),
      tempMin: 22 + Math.floor(Math.random() * 5),
      tempMax: 32 + Math.floor(Math.random() * 5),
      humidity: 50 + Math.floor(Math.random() * 30),
      condition: ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'][i],
      description: ['clear sky', 'few clouds', 'light rain', 'clear sky', 'overcast clouds'][i],
      icon: ['01d', '02d', '10d', '01d', '04d'][i],
      windSpeed: 2 + Math.random() * 6,
      rainChance: [10, 30, 75, 15, 45][i],
    };
  });
}

export default { getCurrentWeather, getForecast, getPlantCareAdvice };
