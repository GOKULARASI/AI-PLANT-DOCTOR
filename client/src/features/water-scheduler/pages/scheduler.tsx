import { useState } from 'react';
import { aiService } from '@/services/endpoints';
import {
  Loader2,
  Droplet,
  Sparkles,
  Calendar,
  Clock,
  Sun,
  CloudRain,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRESET_PLANTS = ['Tomato', 'Chili Pepper', 'Rose', 'Monstera', 'Cucumber', 'Succulent'];

export default function WaterScheduler() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    plantType: 'Tomato',
    location: 'Outdoor',
    soilType: 'Loamy Potting Soil',
    climate: 'Tropical / Warm',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plantType.trim()) return toast.error('Plant type is required');
    try {
      setLoading(true);
      const res = await aiService.getWaterSchedule(form);
      if (res.data?.success) {
        setResult(res.data.data?.schedule || res.data.data);
        toast.success(`Smart irrigation schedule generated for ${form.plantType}!`);
      }
    } catch {
      toast.error('Failed to generate water schedule');
    } finally {
      setLoading(false);
    }
  };

  const scheduleData = result?.schedule || result;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in pb-16">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Smart Irrigation & Water Scheduler 💧
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Micro-Climatic Math
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Root-zone moisture management: calculate dynamic hydration volumes and weekly schedules to prevent foliar dampening and root rot.
        </p>
      </div>

      {/* ─── Input Configuration Form ──────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl border flex flex-col gap-6 shadow-xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        {/* Quick Plant Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
            Common Plants:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_PLANTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, plantType: p })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  form.plantType === p
                    ? 'border-blue-500 bg-blue-500/15 text-blue-500'
                    : 'hover:border-gray-400'
                }`}
                style={{
                  background: form.plantType === p ? undefined : 'var(--bg-primary)',
                  borderColor: form.plantType === p ? undefined : 'var(--border-default)',
                  color: form.plantType === p ? undefined : 'var(--text-primary)',
                }}
              >
                🌱 {p}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Plant Species *
            </label>
            <input
              name="plantType"
              value={form.plantType}
              onChange={handleChange}
              placeholder="e.g. Tomato, Cactus, Fern"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Environment Location
            </label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              {['Indoor (Low Evaporation)', 'Outdoor (Full Sun)', 'Greenhouse', 'Balcony / Container'].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Soil Composition
            </label>
            <input
              name="soilType"
              value={form.soilType}
              onChange={handleChange}
              placeholder="e.g. Peat Potting Mix, Clay, Sandy Loam"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Local Microclimate
            </label>
            <input
              name="climate"
              value={form.climate}
              onChange={handleChange}
              placeholder="e.g. Warm / Humid, Dry Arid, Temperate"
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl shadow-blue-500/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Calculating Evapotranspiration Rates...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Personalized Water Schedule
            </>
          )}
        </button>
      </form>

      {/* ─── SCHEDULE OUTPUT CARD ──────────────────────────────────── */}
      {scheduleData && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Hero Metrics */}
          <div
            className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(2,132,199,0.02) 100%), var(--bg-card)',
              borderColor: 'var(--border-default)',
            }}
          >
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-500">
                Hydration Prescription
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                {scheduleData.frequency || 'Every 2-3 Days'}
              </h2>
              <p className="text-xs font-semibold mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Best Time: <strong>{scheduleData.bestTime || 'Early morning (6-8 AM)'}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center flex-shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">
                Target Volume
              </span>
              <span className="text-2xl font-black text-blue-400">
                {scheduleData.amount || '250 - 350 ml'}
              </span>
              <span className="text-[10px] block text-gray-400 mt-0.5">per root zone watering</span>
            </div>
          </div>

          {/* 7-Day Interactive Weekly Schedule */}
          {Array.isArray(scheduleData.weeklySchedule) && (
            <div
              className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                <Calendar className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  7-Day Calendar Hydration Plan
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
                {scheduleData.weeklySchedule.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 transition-all ${
                      item.water
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-transparent opacity-60'
                    }`}
                    style={{ background: item.water ? undefined : 'var(--bg-primary)' }}
                  >
                    <span className="text-[11px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>
                      {item.day?.substring(0, 3) || `Day ${i + 1}`}
                    </span>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        item.water ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      <Droplet className="w-5 h-5" />
                    </div>

                    <div>
                      <span className="text-xs font-black block" style={{ color: item.water ? '#0284c7' : 'inherit' }}>
                        {item.water ? item.amount || 'Water' : 'Rest'}
                      </span>
                      <span className="text-[9px] block text-gray-400 truncate max-w-[80px]">
                        {item.notes || (item.water ? 'Deep soak' : 'No water')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seasonal Adjustments */}
          {scheduleData.seasonalAdjustments && (
            <div
              className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Sun className="w-5 h-5 text-amber-500" /> Dynamic Seasonal Adjustments
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border flex flex-col gap-1.5" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                  <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
                    <Sun className="w-4 h-4" /> Summer / Heatwaves
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {scheduleData.seasonalAdjustments.summer || 'Increase to daily morning hydration. Mulch soil to prevent evaporation.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border flex flex-col gap-1.5" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                  <span className="text-xs font-black uppercase text-blue-500 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4" /> Monsoon / Rainy
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {scheduleData.seasonalAdjustments.rainy || 'Skip manual irrigation on rainy days. Ensure drainage holes are free of debris.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border flex flex-col gap-1.5" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                  <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <Snowflake className="w-4 h-4" /> Winter / Dormancy
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {scheduleData.seasonalAdjustments.winter || 'Reduce frequency to weekly or bi-weekly. Roots take up water very slowly in cold soil.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Overwatering vs Underwatering Diagnostic Signs */}
          {scheduleData.signs && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Signs of Overwatering (Suffocation)
                </span>
                <ul className="flex flex-col gap-1.5">
                  {(scheduleData.signs.overwatering || ['Lower leaves turning yellow & soft', 'Soil smells sour / fungus gnats present', 'Stems feel mushy']).map(
                    (s: string, idx: number) => (
                      <li key={idx} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-amber-500 font-bold">•</span> {s}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex flex-col gap-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" /> Signs of Underwatering (Drought Stress)
                </span>
                <ul className="flex flex-col gap-1.5">
                  {(scheduleData.signs.underwatering || ['Crispy dry brown leaf margins', 'Plant drooping or wilting midday', 'Soil pulling away from pot edges']).map(
                    (s: string, idx: number) => (
                      <li key={idx} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-blue-500 font-bold">•</span> {s}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
