import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '@/services/endpoints';
import {
  Loader2,
  Leaf,
  Sparkles,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Calendar,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Popular Disease Quick Presets ────────────────────────────────────
const COMMON_DISEASES = [
  { name: 'Early Blight', plant: 'Tomato', icon: '🍅', type: 'Fungal' },
  { name: 'Late Blight', plant: 'Tomato / Potato', icon: '🥔', type: 'Oomycete' },
  { name: 'Powdery Mildew', plant: 'Cucumber / Rose', icon: '🥒', type: 'Foliar' },
  { name: 'Bacterial Spot', plant: 'Pepper / Tomato', icon: '🫑', type: 'Bacterial' },
  { name: 'Fusarium Wilt', plant: 'Tomato', icon: '🥀', type: 'Soil-borne' },
  { name: 'Spider Mites', plant: 'Houseplants', icon: '🕷️', type: 'Pest Vector' },
];

export default function Treatment() {
  const navigate = useNavigate();
  const [disease, setDisease] = useState('');
  const [plantType, setPlantType] = useState('Tomato');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disease.trim()) return toast.error('Please enter or select a disease name');
    try {
      setLoading(true);
      const res = await aiService.getTreatment({ disease, plantType });
      if (res.data?.success) {
        setResult(res.data.data?.treatment || res.data.data);
        toast.success(`Clinical treatment plan generated for ${disease}!`);
      }
    } catch {
      toast.error('Failed to generate treatment plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof COMMON_DISEASES[0]) => {
    setDisease(preset.name);
    setPlantType(preset.plant.split(' ')[0]);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in pb-16">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Plant Pathology & Treatment Station 💊
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Clinical Care
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Scientific organic and chemical intervention regimens: stop active sporulation, isolate pathogens, and revive plant foliage.
          </p>
        </div>

        {result && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 self-start sm:self-auto"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <Printer className="w-3.5 h-3.5" /> Print Prescription
          </button>
        )}
      </div>

      {/* ─── Search & Formulation Form ─────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl border flex flex-col gap-6 shadow-xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        {/* Preset Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
            Quick Specimen Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_DISEASES.map((d) => (
              <button
                key={d.name}
                type="button"
                onClick={() => handleSelectPreset(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  disease === d.name
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-500'
                    : 'hover:border-gray-400'
                }`}
                style={{
                  background: disease === d.name ? undefined : 'var(--bg-primary)',
                  borderColor: disease === d.name ? undefined : 'var(--border-default)',
                  color: disease === d.name ? undefined : 'var(--text-primary)',
                }}
              >
                <span>{d.icon}</span>
                <span>{d.name}</span>
                <span className="text-[10px] opacity-60">({d.plant})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Disease or Pathogen Name *
            </label>
            <input
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              placeholder="e.g. Early Blight, Powdery Mildew, Root Rot"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Host Plant Species
            </label>
            <input
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              placeholder="e.g. Tomato, Pepper, Eggplant"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
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
          className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl shadow-emerald-500/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Pathological Regimen...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Formulate Complete Treatment Plan
            </>
          )}
        </button>
      </form>

      {/* ─── PRESCRIPTION PLAN RESULTS ──────────────────────────────── */}
      {result && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Header Summary Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.02) 100%), var(--bg-card)',
              borderColor: 'var(--border-default)',
            }}
          >
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                Official Clinical Prescription
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                {result.disease || disease} in {plantType}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Estimated Cost of Treatment Supplies: <strong className="text-emerald-500">{result.estimatedCost || '$10-25'}</strong>
              </p>
            </div>

            {/* Direct CTA: Bridge to Innovation 3 Dosimeter */}
            <button
              onClick={() => navigate('/fertilizer')}
              className="px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <FlaskConical className="w-4 h-4" /> Calculate Dilution Dose in Dosimeter <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ─── Multi-Tier Solutions Grid ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organic Solutions */}
            <div
              className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                <Leaf className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Organic & Bio-Control Remedies
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {(result.organic || []).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                        {item.name || item}
                      </p>
                      {item.effectiveness && (
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {item.effectiveness} Efficacy
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chemical Solutions */}
            <div
              className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                <FlaskConical className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Chemical Interventions & Precautions
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {(result.chemical || []).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                  >
                    <p className="text-xs font-black text-blue-400 mb-1">
                      {item.name || item}
                    </p>
                    {item.description && (
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {item.description}
                      </p>
                    )}
                    {item.precautions && (
                      <p className="text-[11px] mt-1.5 text-amber-500 font-semibold flex items-center gap-1">
                        ⚠️ Caution: {item.precautions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── 3-Week Chronological Recovery Roadmap ───────────────── */}
          {result.recoveryTimeline && result.recoveryTimeline.length > 0 && (
            <div
              className="p-6 sm:p-8 rounded-3xl border flex flex-col gap-4"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                <Calendar className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Chronological Healing Roadmap
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {result.recoveryTimeline.map((stage: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border flex flex-col gap-2 relative overflow-hidden"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                      Week {stage.week || i + 1}
                    </span>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {stage.description || stage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Do's & Don'ts Comparison Grid ──────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Crucial Best Practices (Do's)
              </span>
              <ul className="flex flex-col gap-2">
                {(result.dos || ['Isolate plant immediately', 'Prune dead foliage with sterilized shears', 'Water at soil level']).map(
                  (d: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span className="text-emerald-500 font-bold">✓</span> {d}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/20 flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Fatal Mistakes to Avoid (Don'ts)
              </span>
              <ul className="flex flex-col gap-2">
                {(result.donts || ['Never overhead water infected foliage', 'Do not compost diseased cuttings', 'Do not over-fertilize with nitrogen']).map(
                  (d: string, i: number) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span className="text-rose-500 font-bold">✗</span> {d}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
