import { useState } from 'react';
import { aiService } from '@/services/endpoints';
import { Loader2, Droplet, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaterScheduler() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({ plantType: '', location: 'Indoor', soilType: '', climate: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plantType.trim()) return toast.error('Plant type is required');
    try {
      setLoading(true);
      const res = await aiService.getWaterSchedule(form);
      if (res.data?.success) setResult(res.data.data);
    } catch {
      toast.error('Failed to get water schedule');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40";
  const inputStyle = { background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' };

  return (
    <div className="max-w-2xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Water Scheduler 💧</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Get personalized watering schedules for your plants</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border flex flex-col" style={{ gap: '16px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '16px' }}>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Plant Type *</label>
            <input name="plantType" value={form.plantType} onChange={handleChange} placeholder="e.g. Cactus, Fern, Tomato" className={inputClass} style={inputStyle} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Location</label>
            <select name="location" value={form.location} onChange={handleChange} className={inputClass} style={inputStyle}>
              {['Indoor', 'Outdoor', 'Greenhouse', 'Balcony'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Soil Type</label>
            <input name="soilType" value={form.soilType} onChange={handleChange} placeholder="e.g. Sandy, Clay, Loamy" className={inputClass} style={inputStyle} />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Climate</label>
            <input name="climate" value={form.climate} onChange={handleChange} placeholder="e.g. Tropical, Arid, Temperate" className={inputClass} style={inputStyle} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-xl font-bold text-sm flex items-center justify-center transition-opacity hover:opacity-90 mt-2"
          style={{ padding: '16px', background: 'var(--accent, #059669)', color: '#ffffff', gap: '8px', opacity: loading ? '0.5' : '1' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Schedule</>}
        </button>
      </form>

      {result && (
        <div className="p-6 rounded-2xl border flex flex-col animate-fade-in" style={{ gap: '16px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <Droplet className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Your Watering Schedule</h2>
          </div>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {typeof result === 'string' ? (
              <pre className="whitespace-pre-wrap font-sans">{result}</pre>
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
