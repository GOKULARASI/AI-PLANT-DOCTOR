import { useEffect, useState, useId } from 'react';
import { weatherService } from '@/services/endpoints';
import type { Weather, Forecast, WeatherAdvice } from '@/types';
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Loader2,
  Search,
  Sparkles,
  MapPin,
  Navigation,
  Compass,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  AlertTriangle,
  ShieldAlert,
  Sprout,
  CheckCircle2,
  Sun,
  CloudRain,
  Radio,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Major Agricultural Farming Hub Presets ───────────────────────────
const AGRI_HUBS = [
  { name: 'Coimbatore', region: 'Tamil Nadu, IN', lat: 11.0168, lon: 76.9558, type: 'Tomatoes & Cotton' },
  { name: 'Nashik', region: 'Maharashtra, IN', lat: 19.9975, lon: 73.7898, type: 'Grapes & Onions' },
  { name: 'Guntur', region: 'Andhra Pradesh, IN', lat: 16.3067, lon: 80.4365, type: 'Chili Belt' },
  { name: 'Punjab', region: 'Ludhiana, IN', lat: 30.9010, lon: 75.8573, type: 'Wheat & Rice' },
  { name: 'Almería', region: 'Andalusia, Spain', lat: 36.8381, lon: -2.4597, type: 'Greenhouse Capital' },
  { name: 'Fresno', region: 'California, US', lat: 36.7468, lon: -119.7726, type: 'Central Valley' },
];

export default function WeatherPage() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [advice, setAdvice] = useState<WeatherAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isUsingGps, setIsUsingGps] = useState(false);
  const searchInputId = useId();

  // Fetch weather by either query string or coordinates
  const fetchWeather = async (params?: string | { location?: string; lat?: number; lon?: number }) => {
    try {
      setLoading(true);
      const [wRes, fRes] = await Promise.all([
        weatherService.getCurrent(params || 'Coimbatore'),
        weatherService.getForecast(params || 'Coimbatore'),
      ]);

      if (wRes.data?.success) {
        setWeather(wRes.data.data?.weather || wRes.data.data);
        if (wRes.data.data?.advice) setAdvice(wRes.data.data.advice);
      }

      if (fRes.data?.success) {
        const list = Array.isArray(fRes.data.data)
          ? fRes.data.data
          : fRes.data.data?.forecast || [];
        setForecast(list);
      }
    } catch {
      toast.error('Failed to load OpenWeather meteorological data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Coimbatore');
  }, []);

  // ─── 1-Click Browser Live GPS Location ──────────────────────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }

    toast.loading('Acquiring field GPS coordinates...', { id: 'gps-toast' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('gps-toast');
        const { latitude, longitude } = pos.coords;
        setIsUsingGps(true);
        toast.success(`GPS Acquired: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
        fetchWeather({ lat: latitude, lon: longitude });
      },
      (err) => {
        toast.dismiss('gps-toast');
        toast.error('GPS permission denied or timed out. Please enter city name manually.');
        setIsUsingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsUsingGps(false);
    fetchWeather(query.trim());
  };

  const handleSelectHub = (hub: typeof AGRI_HUBS[0]) => {
    setIsUsingGps(false);
    setQuery(hub.name);
    fetchWeather({ lat: hub.lat, lon: hub.lon, location: hub.name });
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in pb-16">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              OpenWeather Satellite & Agronomic Radar 🛰️
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Live Satellite Feed
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Real-time atmospheric telemetry via OpenWeather API: micro-climatic disease vector risk, evapotranspiration rates, and rain protection directives.
          </p>
        </div>

        {/* GPS Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm ${
            isUsingGps
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
              : 'hover:border-emerald-500'
          }`}
          style={{
            background: isUsingGps ? undefined : 'var(--bg-card)',
            borderColor: isUsingGps ? undefined : 'var(--border-default)',
            color: isUsingGps ? undefined : 'var(--text-primary)',
          }}
          title="Query OpenWeather using your device's exact GPS coordinates"
        >
          <Navigation className={`w-3.5 h-3.5 ${isUsingGps ? 'animate-spin' : ''}`} />
          {isUsingGps ? 'Live GPS Active' : 'Use My GPS Location'}
        </button>
      </div>

      {/* ─── Search Bar & Agricultural Hubs ─────────────────────────── */}
      <div
        className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              id={searchInputId}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search any global city or farming region (e.g. Coimbatore, Nashik, Almería, London)..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-2xl font-black text-sm text-white shadow-md shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}
          >
            Query Satellite
          </button>
        </div>

        {/* 1-Click Farming Hub Presets */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
            Popular Agricultural Farming Hubs:
          </span>
          <div className="flex flex-wrap gap-2">
            {AGRI_HUBS.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => handleSelectHub(hub)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 hover:border-blue-500"
                style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>{hub.name}</span>
                <span className="text-[10px] opacity-60">({hub.type})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Connecting to OpenWeather Satellite Network...
          </p>
        </div>
      ) : weather ? (
        <>
          {/* ─── Hero Weather Card (OpenWeather Satellite Display) ─────── */}
          <div
            className="p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #059669 40%, #0284c7 100%)',
              color: '#ffffff',
              minHeight: '260px',
            }}
          >
            {/* Top Bar with Location and Source Network */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-300" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">
                    {weather.location}, {weather.country}
                  </h2>
                  {weather.coordinates && (
                    <p className="text-[11px] text-emerald-200">
                      Coordinates: {weather.coordinates.lat.toFixed(2)}°N, {weather.coordinates.lon.toFixed(2)}°E
                    </p>
                  )}
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md self-start sm:self-auto border border-white/20">
                🛰️ {weather.source || 'OpenWeather Live API'}
              </span>
            </div>

            {/* Main Temperature & Condition */}
            <div className="flex items-center justify-between my-6 z-10">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl sm:text-7xl font-black tracking-tighter">
                    {weather.temperature}°C
                  </span>
                  <span className="text-sm font-semibold opacity-90">
                    Feels like {weather.feelsLike}°C
                  </span>
                </div>
                <p className="text-lg font-bold capitalize mt-1 text-emerald-100">
                  {weather.description} • {weather.condition}
                </p>
              </div>

              <Cloud className="w-24 h-24 sm:w-28 sm:h-28 opacity-25" />
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/20 z-10">
              <div className="flex items-center gap-2.5">
                <Droplets className="w-5 h-5 text-cyan-300" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider opacity-75">Humidity</p>
                  <p className="font-black text-sm">{weather.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Wind className="w-5 h-5 text-emerald-200" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider opacity-75">Wind Speed</p>
                  <p className="font-black text-sm">{weather.windSpeed} km/h</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <CloudRain className="w-5 h-5 text-blue-200" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider opacity-75">Rain Chance</p>
                  <p className="font-black text-sm">{weather.rainChance}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Gauge className="w-5 h-5 text-amber-200" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider opacity-75">Pressure</p>
                  <p className="font-black text-sm">{weather.pressure} hPa</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Dual Agricultural Analytical Indexes ─────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Index 1: Agricultural Disease Vector Risk */}
            <div
              className="p-6 sm:p-7 rounded-3xl border flex flex-col justify-between gap-4 shadow-xl"
              style={{
                background: weather.diseaseRisk?.level === 'Critical' || weather.diseaseRisk?.level === 'High'
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(245,158,11,0.02) 100%), var(--bg-card)'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.02) 100%), var(--bg-card)',
                borderColor: weather.diseaseRisk?.level === 'Critical' ? 'rgba(239,68,68,0.3)' : 'var(--border-default)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" /> Meteorological Pathology Risk
                  </span>
                  <h3 className="text-xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                    Fungal & Bacterial Spore Risk
                  </h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    weather.diseaseRisk?.level === 'Critical'
                      ? 'bg-rose-500 text-white'
                      : weather.diseaseRisk?.level === 'High'
                      ? 'bg-orange-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {weather.diseaseRisk?.level || 'Moderate'} Alert
                </span>
              </div>

              {/* Pathogens under surveillance */}
              <div>
                <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Vulnerable Pathogen Threats in This Weather:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weather.diseaseRisk?.pathogens.map((p, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold border"
                      style={{
                        background: 'var(--bg-primary)',
                        borderColor: 'var(--border-default)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      ⚠️ {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Spray Directive */}
              <div
                className="p-3.5 rounded-2xl border"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
              >
                <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">
                  Protective Field Protocol:
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {weather.diseaseRisk?.sprayAdvice}
                </p>
              </div>
            </div>

            {/* Index 2: Evapotranspiration & Smart Irrigation */}
            <div
              className="p-6 sm:p-7 rounded-3xl border flex flex-col justify-between gap-4 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(2,132,199,0.02) 100%), var(--bg-card)',
                borderColor: 'var(--border-default)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" /> Penman-Monteith Evapotranspiration
                  </span>
                  <h3 className="text-xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                    Soil Moisture Loss Index
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-blue-400">
                    {weather.evapotranspiration?.dailyLossMm || 4.2} mm
                  </span>
                  <span className="text-[10px] block text-gray-400">estimated daily loss</span>
                </div>
              </div>

              {/* Multiplier Badge */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Irrigation Multiplier: {weather.evapotranspiration?.irrigationMultiplier || 1.0}x
                </div>
                <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Factor applied to standard hydration schedule
                </span>
              </div>

              {/* Watering Directive */}
              <div
                className="p-3.5 rounded-2xl border"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
              >
                <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">
                  Irrigation Decision:
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {weather.evapotranspiration?.wateringDirective}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Comprehensive Microclimatic Telemetry Grid ───────────── */}
          <div
            className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <h3 className="font-extrabold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              OpenWeather Atmospheric Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                <Sunrise className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Sunrise</p>
                  <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                    {weather.sunrise ? new Date(weather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:15 AM'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                <Sunset className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Sunset</p>
                  <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                    {weather.sunset ? new Date(weather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:45 PM'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                <Eye className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Foliage Visibility</p>
                  <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                    {weather.visibility || 10} km
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                <Compass className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Wind Vector</p>
                  <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                    {weather.windDirection || 140}° Bearing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Plant Care Directives Synthesized from Weather ─────────── */}
          {advice.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-5 h-5 text-amber-500" /> Weather-Based Crop Directives
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {advice.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </h4>
                      <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 5-Day OpenWeather Forecast ──────────────────────────── */}
          {forecast.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                5-Day Agricultural Satellite Forecast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {forecast.slice(0, 5).map((f, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-3xl border text-center flex flex-col items-center justify-between gap-2 shadow-sm"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <p className="text-xs font-black uppercase text-gray-400">
                      {new Date(f.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>

                    <div className="my-1">
                      <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                        {f.temperature}°C
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {f.tempMin}° / {f.tempMax}°
                      </p>
                    </div>

                    <span className="text-xs font-semibold capitalize truncate max-w-[100px]" style={{ color: 'var(--text-muted)' }}>
                      {f.condition}
                    </span>

                    <div className="flex items-center gap-2 text-xs pt-1 border-t w-full justify-center" style={{ borderColor: 'var(--border-light)' }}>
                      <span className="text-blue-400 font-bold">💧 {f.rainChance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
