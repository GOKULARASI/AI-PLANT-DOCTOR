// Plant categories
export const PLANT_CATEGORIES = [
  'Flowers',
  'Vegetables',
  'Fruits',
  'Indoor',
  'Outdoor',
  'Medicinal',
  'Herbs',
  'Succulents',
  'Trees',
  'Other',
];

// Plant health statuses
export const PLANT_STATUS = {
  HEALTHY: 'healthy',
  DISEASED: 'diseased',
  RECOVERING: 'recovering',
  CRITICAL: 'critical',
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Notification types
export const NOTIFICATION_TYPES = {
  WATER: 'water',
  FERTILIZER: 'fertilizer',
  DISEASE: 'disease',
  WEATHER: 'weather',
  SYSTEM: 'system',
};

// Severity levels
export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

// Seasons
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

// Soil types
export const SOIL_TYPES = [
  'Loamy',
  'Sandy',
  'Clay',
  'Silt',
  'Peat',
  'Chalky',
  'Saline',
];

export default {
  PLANT_CATEGORIES,
  PLANT_STATUS,
  USER_ROLES,
  NOTIFICATION_TYPES,
  SEVERITY_LEVELS,
  SEASONS,
  SOIL_TYPES,
};
