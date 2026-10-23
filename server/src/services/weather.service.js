import WeatherCache from '../models/WeatherCache.js';

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * Calculate Agricultural Disease Vector Risk Index
 * Correlates temperature, humidity, rain chance, and clouds with fungal/bacterial sporulation cycles
 */
export const calculateDiseaseRisk = (weather) => {
  const { temperature = 25, humidity = 60, rainChance = 20, clouds = 30 } = weather;

  let riskScore = 15;
  const pathogens = [];

  // Fungal Blight Risk (Alternaria solani / Phytophthora infestans)
  if (humidity >= 75 && temperature >= 16 && temperature <= 28) {
    riskScore += 45;
    pathogens.push('Early Blight (Alternaria solani)', 'Late Blight (Phytophthora)');
  } else if (humidity >= 60 && temperature >= 20 && temperature <= 30) {
    riskScore += 25;
    pathogens.push('Foliar Leaf Spots / Anthracnose');
  }

  // Bacterial Splash Spread Risk (Xanthomonas)
  if (rainChance >= 60 || humidity >= 85) {
    riskScore += 30;
    pathogens.push('Bacterial Spot & Canker (Spore Splash)');
  }

  // Powdery Mildew Risk (Moderate humidity + shade / cloud cover)
  if (humidity >= 50 && humidity <= 75 && clouds >= 50 && temperature >= 18 && temperature <= 27) {
    riskScore += 20;
    pathogens.push('Powdery Mildew (Podosphaera)');
  }

  // Spider Mite Proliferation (Hot + dry air)
  if (temperature >= 32 && humidity <= 40) {
    riskScore += 25;
    pathogens.push('Two-Spotted Spider Mites (Dry Heat Flare)');
  }

  // Normalize 0 - 100
  const finalScore = Math.min(100, Math.max(10, Math.round(riskScore)));

  let level = 'Low';
  let sprayAdvice = 'Optimal weather conditions. Maintain standard maintenance and inspect weekly.';

  if (finalScore >= 75) {
    level = 'Critical';
    sprayAdvice = 'URGENT: Ambient humidity and temperature favor rapid epidemic sporulation. Apply protective bio-fungicide (Neem oil or Bacillus subtilis) before impending rain.';
  } else if (finalScore >= 50) {
    level = 'High';
    sprayAdvice = 'HIGH PATHOGEN RISK: Keep foliage dry. Irrigate at root base only and avoid overhead misting.';
  } else if (finalScore >= 30) {
    level = 'Moderate';
    sprayAdvice = 'Moderate humidity detected. Inspect leaf undersides for initial chlorotic lesions.';
  }

  return {
    score: finalScore,
    level,
    pathogens: pathogens.length > 0 ? pathogens : ['No active epidemiological surge detected'],
    sprayAdvice,
  };
};

/**
 * Calculate Evapotranspiration & Root Hydration Multiplier
 * Estimates daily millimetric water loss from soil surface
 */
export const calculateEvapotranspiration = (weather) => {
  const { temperature = 25, humidity = 60, windSpeed = 3, rainChance = 10 } = weather;

  // Approximate Penman-Monteith simplified reference evapotranspiration (ET0 mm/day)
  let et0 = 0.0023 * (temperature + 17.8) * Math.sqrt(Math.max(1, 40 - humidity * 0.3)) + windSpeed * 0.2;
  et0 = Math.round(Math.max(1.5, Math.min(9.5, et0)) * 10) / 10;

  let multiplier = 1.0;
  let wateringDirective = 'Standard regular watering schedule.';

  if (rainChance >= 70) {
    multiplier = 0.0;
    wateringDirective = 'Rain precipitation expected (>=70%). SKIP irrigation to prevent anaerobic root suffocation.';
  } else if (temperature >= 35 || (temperature >= 30 && humidity <= 35)) {
    multiplier = 1.35;
    wateringDirective = 'High evaporation rate. Increase hydration volume by 35% and apply before 8:00 AM.';
  } else if (humidity >= 80) {
    multiplier = 0.7;
    wateringDirective = 'Elevated ambient humidity slows soil drying. Reduce irrigation volume by 30%.';
  } else if (temperature <= 12) {
    multiplier = 0.5;
    wateringDirective = 'Cold dormancy window. Reduce watering to prevent cold root shock.';
  }

  return {
    dailyLossMm: et0,
    irrigationMultiplier: multiplier,
    wateringDirective,
  };
};

/**
 * Fetch Current Weather from OpenWeather (with Coordinates or Location Name)
 */
export const getCurrentWeather = async (params = {}) => {
  const { location = 'Chennai', lat, lon } = typeof params === 'string' ? { location: params } : params;

  // Construct cache key
  const cacheKey = (lat !== undefined && lon !== undefined && lat !== null && lon !== null)
    ? `coord_${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`
    : `city_${(location || 'chennai').toLowerCase()}`;

  // Check MongoDB cache first
  try {
    const cached = await WeatherCache.findOne({ location: cacheKey });
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }
  } catch (err) {
    console.warn('Weather cache lookup warning:', err.message);
  }

  // If no API key configured, return realistic agronomic simulated weather
  if (!process.env.OPENWEATHER_API_KEY) {
    const mock = getMockWeather(location, lat, lon);
    mock.source = 'PlantSense Meteorological Simulation (Add OPENWEATHER_API_KEY to .env for Live Satellite Data)';
    mock.diseaseRisk = calculateDiseaseRisk(mock);
    mock.evapotranspiration = calculateEvapotranspiration(mock);
    return mock;
  }

  try {
    let url = '';
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
      url = `${OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    } else {
      url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      console.warn(`OpenWeather API returned status ${data.cod}: ${data.message}. Falling back to simulation.`);
      return getMockWeather(location, lat, lon);
    }

    const weatherData = {
      location: data.name || location,
      country: data.sys?.country || 'IN',
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6 * 10) / 10, // m/s to km/h
      windDirection: data.wind?.deg || 0,
      condition: data.weather[0]?.main || 'Clear',
      description: data.weather[0]?.description || 'clear sky',
      icon: data.weather[0]?.icon || '01d',
      visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // in km
      clouds: data.clouds?.all || 0,
      rainChance: data.rain ? Math.min(100, Math.max(70, data.clouds?.all || 50)) : (data.clouds?.all > 70 ? 55 : 15),
      sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
      sunset: new Date(data.sys.sunset * 1000).toISOString(),
      coordinates: {
        lat: data.coord?.lat || lat || 0,
        lon: data.coord?.lon || lon || 0,
      },
      source: 'OpenWeather Live Satellite Network',
    };

    // Calculate agronomic indexes
    weatherData.diseaseRisk = calculateDiseaseRisk(weatherData);
    weatherData.evapotranspiration = calculateEvapotranspiration(weatherData);

    // Save to Cache for 30 minutes
    try {
      await WeatherCache.findOneAndUpdate(
        { location: cacheKey },
        { data: weatherData, fetchedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
        { upsert: true }
      );
    } catch (cacheErr) {
      console.warn('Weather cache save warning:', cacheErr.message);
    }

    return weatherData;
  } catch (error) {
    console.error('OpenWeather live fetch error:', error.message);
    return getMockWeather(location, lat, lon);
  }
};

/**
 * Fetch 5-Day / 3-Hour Forecast from OpenWeather
 */
export const getForecast = async (params = {}) => {
  const { location = 'Chennai', lat, lon } = typeof params === 'string' ? { location: params } : params;

  if (!process.env.OPENWEATHER_API_KEY) {
    return getMockForecast();
  }

  try {
    let url = '';
    if (lat !== undefined && lon !== undefined && lat !== null && lon !== null) {
      url = `${OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=40`;
    } else {
      url = `${OPENWEATHER_BASE}/forecast?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=40`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== '200') {
      return getMockForecast();
    }

    // Group by day (take midday reading ~12:00 for each day)
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
      condition: item.weather[0]?.main || 'Clear',
      description: item.weather[0]?.description || 'clear sky',
      icon: item.weather[0]?.icon || '01d',
      windSpeed: Math.round((item.wind?.speed || 0) * 3.6 * 10) / 10,
      rainChance: item.pop ? Math.round(item.pop * 100) : 0,
    }));
  } catch (error) {
    console.error('Forecast fetch error:', error.message);
    return getMockForecast();
  }
};

/**
 * Plant Care Directives Synthesized from Weather State
 */
export const getPlantCareAdvice = (weather) => {
  const advice = [];
  const { temperature = 25, humidity = 60, windSpeed = 5, rainChance = 10, condition = 'Clear' } = weather;

  if (temperature > 35) {
    advice.push({
      icon: '🌡️',
      title: 'Extreme Heat Stress Advisory',
      message: 'Foliage transpiration is at maximum. Provide shade cloth protection and soak root base early morning before 8 AM.',
    });
  } else if (temperature < 10) {
    advice.push({
      icon: '❄️',
      title: 'Cold Chilling Warning',
      message: 'Bring sensitive potted tomato plants indoors or apply root mulching to insulate roots from ground frost.',
    });
  }

  if (humidity >= 78) {
    advice.push({
      icon: '💧',
      title: 'Elevated Pathogen Humidity',
      message: 'Spore germination risk is high. Prune dense lower canopy to maximize ventilation between rows.',
    });
  } else if (humidity < 35) {
    advice.push({
      icon: '🏜️',
      title: 'Low Ambient Humidity',
      message: 'Dry atmosphere triggers spider mite blooms. Lightly mist foliage during cool morning hours.',
    });
  }

  if (windSpeed > 25) {
    advice.push({
      icon: '💨',
      title: 'High Wind Foliage Shearing',
      message: 'Stake vulnerable indeterminate tomato vines to prevent stem snapping. Move lightweight containers close to windbreaks.',
    });
  }

  if (rainChance >= 65) {
    advice.push({
      icon: '🌧️',
      title: 'Precipitation Incoming',
      message: 'Rain expected. Clear container saucer trays to prevent standing water accumulation and root suffocation.',
    });
  }

  if (condition === 'Clear' && temperature >= 22 && temperature <= 32) {
    advice.push({
      icon: '☀️',
      title: 'Optimal Photosynthesis Window',
      message: 'Ideal conditions for chlorophyll production and fruit development. Maintain regular nutrient regimen.',
    });
  }

  if (advice.length === 0) {
    advice.push({
      icon: '🌿',
      title: 'Favorable Microclimate',
      message: 'Atmospheric conditions are stable and balanced for continuous plant growth.',
    });
  }

  return advice;
};

// ─── Realistic Agricultural Simulated Weather Fallback ────────────────
function getMockWeather(location = 'Chennai', lat, lon) {
  return {
    location: location || 'Chennai',
    country: 'IN',
    temperature: 31,
    feelsLike: 35,
    humidity: 72,
    pressure: 1012,
    windSpeed: 14.2,
    windDirection: 140,
    condition: 'Partly Cloudy',
    description: 'scattered clouds',
    icon: '03d',
    visibility: 9,
    clouds: 45,
    rainChance: 25,
    sunrise: new Date().toISOString(),
    sunset: new Date().toISOString(),
    coordinates: {
      lat: lat || 13.0827,
      lon: lon || 80.2707,
    },
    source: 'PlantSense Meteorological Simulation',
  };
}

function getMockForecast() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return days.map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return {
      date: date.toISOString().split('T')[0],
      temperature: 29 + Math.floor(Math.random() * 5),
      tempMin: 23 + Math.floor(Math.random() * 3),
      tempMax: 33 + Math.floor(Math.random() * 4),
      humidity: 55 + Math.floor(Math.random() * 25),
      condition: ['Clear', 'Clouds', 'Rain', 'Clear', 'Clouds'][i],
      description: ['clear sky', 'few clouds', 'light rain', 'clear sky', 'scattered clouds'][i],
      icon: ['01d', '02d', '10d', '01d', '03d'][i],
      windSpeed: 8 + Math.round(Math.random() * 12),
      rainChance: [15, 30, 80, 20, 45][i],
    };
  });
}

export default {
  getCurrentWeather,
  getForecast,
  getPlantCareAdvice,
  calculateDiseaseRisk,
  calculateEvapotranspiration,
};
