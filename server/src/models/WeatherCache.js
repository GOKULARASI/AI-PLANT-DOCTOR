import mongoose from 'mongoose';

const weatherCacheSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 min cache
    index: { expires: 0 }, // TTL index — auto-delete expired docs
  },
});

const WeatherCache = mongoose.model('WeatherCache', weatherCacheSchema);
export default WeatherCache;
