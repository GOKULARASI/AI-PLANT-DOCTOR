import { useEffect, useState } from 'react';
import { weatherService } from '@/services/endpoints';
import type { Weather, Forecast, WeatherAdvice } from '@/types';
import { Cloud, Droplets, Wind, Thermometer, Loader2, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WeatherPage() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [advice, setAdvice] = useState<WeatherAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');

  const fetchWeather = async (loc?: string) => {
    try {
      setLoading(true);
      const [wRes, fRes] = await Promise.all([
        weatherService.getCurrent(loc),
        weatherService.getForecast(loc),
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
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  const handleSearch = () => { if (query.trim()) fetchWeather(query.trim()); };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Weather 🌤️</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Check weather conditions and get plant care advice</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
        </div>
        <button onClick={handleSearch} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">Search</button>
      </div>

      {weather && (
        <>
          {/* Current Weather */}
          <div className="p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{weather.location}, {weather.country}</p>
                <h2 className="text-6xl font-black mt-2">{weather.temperature}°C</h2>
                <p className="text-base mt-2 opacity-90">{weather.description}</p>
                <p className="text-sm opacity-75">Feels like {weather.feelsLike}°C</p>
              </div>
              <Cloud className="w-20 h-20 opacity-30" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              {[
                { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
                { icon: Thermometer, label: 'Rain', value: `${weather.rainChance}%` },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <s.icon className="w-5 h-5 opacity-70" />
                  <div>
                    <p className="text-xs opacity-70">{s.label}</p>
                    <p className="font-bold text-sm">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Care Directives from Weather */}
          {advice.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sparkles className="w-5 h-5 text-amber-500" /> Weather-Based Crop Directives
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {advice.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border flex items-start gap-3"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </h4>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="flex flex-col" style={{ gap: '12px' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>5-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {forecast.slice(0, 5).map((f, i) => (
                  <div key={i} className="p-4 rounded-2xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{new Date(f.date).toLocaleDateString(undefined, { weekday: 'short' })}</p>
                    <p className="text-xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{f.temperature}°</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{f.condition}</p>
                    <p className="text-xs text-blue-500 mt-1">💧 {f.rainChance}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
