import { useState } from 'react';
import { aiService } from '@/services/endpoints';
import { Loader2, Leaf, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Treatment() {
  const [disease, setDisease] = useState('');
  const [plantType, setPlantType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disease.trim()) return toast.error('Please enter a disease name');
    try {
      setLoading(true);
      const res = await aiService.getTreatment({ disease, plantType });
      if (res.data?.success) setResult(res.data.data);
    } catch {
      toast.error('Failed to get treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40";
  const inputStyle = { background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' };
  return (
    <div className="max-w-2xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Treatment Plans 💊</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Get AI-powered treatment recommendations for any plant disease</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl border flex flex-col" style={{ gap: '16px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Disease Name *</label>
          <input value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="e.g. Powdery Mildew, Leaf Blight" className={inputClass} style={inputStyle} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Plant Type (optional)</label>
          <input value={plantType} onChange={(e) => setPlantType(e.target.value)} placeholder="e.g. Rose, Tomato, Cucumber" className={inputClass} style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-xl font-bold text-sm flex items-center justify-center transition-opacity hover:opacity-90 mt-2"
          style={{ padding: '16px', background: 'var(--accent, #059669)', color: '#ffffff', gap: '8px', opacity: loading ? '0.5' : '1' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Get Treatment Plan</>}
        </button>
      </form>

      {result && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '16px' }}>
          {[
            { label: '🌿 Organic Treatments', items: result.organic || result.treatments?.organic, color: 'text-emerald-600' },
            { label: '⚗️ Chemical Treatments', items: result.chemical || result.treatments?.chemical, color: 'text-amber-600' },
            { label: '🏠 Home Remedies', items: result.homeRemedies || result.treatments?.homeRemedies, color: 'text-blue-600' },
            { label: '🛡️ Prevention', items: result.prevention, color: 'text-purple-600' },
          ].filter((s) => s.items?.length > 0).map((section, i) => (
            <div key={i} className="p-5 rounded-2xl border flex flex-col" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <h3 className={`font-bold mb-3 ${section.color}`}>{section.label}</h3>
              <ul className="flex flex-col" style={{ gap: '6px' }}>
                {section.items.map((item: string, j: number) => (
                  <li key={j} className="flex items-start text-sm" style={{ color: 'var(--text-muted)', gap: '8px' }}>
                    <Leaf className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-500" />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {result.recoveryTime && (
            <div className="p-4 rounded-2xl text-sm font-semibold text-center" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857' }}>
              ⏱️ Estimated Recovery Time: {result.recoveryTime}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
