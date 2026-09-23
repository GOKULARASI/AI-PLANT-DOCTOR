import { useState, useEffect, useId } from 'react';
import { aiService } from '@/services/endpoints';
import type { DosimeterPlan } from '@/types';
import {
  FlaskConical,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Droplets,
  Scale,
  Calendar,
  Info,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Layers,
  Leaf,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Fertilizer() {
  const [activeTab, setActiveTab] = useState<'dosimeter' | 'advisor'>('dosimeter');

  // ─── Dosimeter State ───────────────────────────────────────────────
  const [dosimeterForm, setDosimeterForm] = useState({
    plantType: 'Tomato',
    growthStage: 'Vegetative',
    containerType: 'pot' as 'pot' | 'ground',
    potDiameterInches: 10,
    landAreaSqFt: 10,
    fertilizerType: 'NPK 19-19-19',
    soilType: 'Potting Mix',
  });
  const [dosimeterPlan, setDosimeterPlan] = useState<DosimeterPlan | null>(null);
  const [dosimeterLoading, setDosimeterLoading] = useState(false);

  // ─── AI General Advisor State ──────────────────────────────────────
  const [advisorForm, setAdvisorForm] = useState({
    plantType: '',
    soilType: '',
    growthStage: '',
    issue: '',
  });
  const [advisorResult, setAdvisorResult] = useState<any>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Fetch initial dosimeter plan
  useEffect(() => {
    fetchDosage();
  }, [
    dosimeterForm.plantType,
    dosimeterForm.growthStage,
    dosimeterForm.containerType,
    dosimeterForm.potDiameterInches,
    dosimeterForm.landAreaSqFt,
    dosimeterForm.fertilizerType,
    dosimeterForm.soilType,
  ]);

  const fetchDosage = async () => {
    try {
      setDosimeterLoading(true);
      const res = await aiService.getDosimeter(dosimeterForm);
      if (res.data?.success) {
        setDosimeterPlan(res.data.data.dosagePlan);
      }
    } catch {
      // Quiet fail on auto-recalc
    } finally {
      setDosimeterLoading(false);
    }
  };

  const handleAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorForm.plantType.trim()) return toast.error('Plant type is required');
    try {
      setAdvisorLoading(true);
      const res = await aiService.getFertilizer(advisorForm);
      if (res.data?.success) {
        setAdvisorResult(res.data.data?.recommendation || res.data.data);
      }
    } catch {
      toast.error('Failed to generate fertilizer recommendations');
    } finally {
      setAdvisorLoading(false);
    }
  };

  const fertilizerOptions = [
    { name: 'NPK 19-19-19', type: 'Balanced Synthetic', icon: '🧪', risk: 'Medium' },
    { name: 'NPK 20-20-20', type: 'High Potency', icon: '⚡', risk: 'Medium-High' },
    { name: 'Urea (46-0-0)', type: 'High Nitrogen', icon: '🔥', risk: 'High Burn Risk' },
    { name: 'Neem Oil (1500ppm EC)', type: 'Organic Protectant', icon: '🌱', risk: 'Gentle' },
    { name: 'Epsom Salt (MgSO4)', type: 'Micronutrient Booster', icon: '✨', risk: 'Low' },
    { name: 'Copper Fungicide', type: 'Pathogen Defense', icon: '🛡️', risk: 'Moderate' },
    { name: 'Bone Meal', type: 'Phosphorus Root Feed', icon: '🦴', risk: 'Zero Burn' },
    { name: 'Vermicompost', type: 'Organic Humus', icon: '🪱', risk: 'Zero Burn' },
  ];

  const potSizeId = useId();

  return (
    <div className="max-w-5xl mx-auto flex flex-col animate-fade-in" style={{ gap: '28px' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Fertilizer & Precision Dosimeter 🌾
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Innovation 3
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Scientific volume-based chemical dilution engine designed to eliminate root burn and nutrient toxicity.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className="flex p-1 rounded-2xl border self-start sm:self-auto"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <button
            onClick={() => setActiveTab('dosimeter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dosimeter'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> Precision Dosimeter
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'advisor'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI General Advisor
          </button>
        </div>
      </div>

      {activeTab === 'dosimeter' ? (
        /* ─── DOSIMETER VIEW ─── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div
            className="lg:col-span-5 p-6 rounded-3xl border flex flex-col gap-5"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Dosage Parameters
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Auto-Recalculating
              </span>
            </div>

            {/* Target Fertilizer */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                Target Fertilizer or Chemical
              </label>
              <select
                value={dosimeterForm.fertilizerType}
                onChange={(e) => setDosimeterForm({ ...dosimeterForm, fertilizerType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              >
                {fertilizerOptions.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.icon} {f.name} ({f.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Plant Target & Growth Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Plant Species
                </label>
                <input
                  type="text"
                  value={dosimeterForm.plantType}
                  onChange={(e) => setDosimeterForm({ ...dosimeterForm, plantType: e.target.value })}
                  placeholder="e.g. Tomato, Rose"
                  className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Life Stage
                </label>
                <select
                  value={dosimeterForm.growthStage}
                  onChange={(e) => setDosimeterForm({ ...dosimeterForm, growthStage: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  <option value="Seedling">🌱 Seedling (Fragile)</option>
                  <option value="Vegetative">🌿 Vegetative (Active)</option>
                  <option value="Flowering">🌸 Flowering</option>
                  <option value="Fruiting">🍅 Fruiting</option>
                  <option value="Mature">🌳 Mature/Dormant</option>
                </select>
              </div>
            </div>

            {/* Container vs Ground Selection */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                Plant Medium / Environment
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDosimeterForm({ ...dosimeterForm, containerType: 'pot' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    dosimeterForm.containerType === 'pot'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  style={{ background: dosimeterForm.containerType === 'pot' ? undefined : 'var(--bg-primary)' }}
                >
                  🪴 Potted Container
                </button>
                <button
                  type="button"
                  onClick={() => setDosimeterForm({ ...dosimeterForm, containerType: 'ground' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    dosimeterForm.containerType === 'ground'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                  style={{ background: dosimeterForm.containerType === 'ground' ? undefined : 'var(--bg-primary)' }}
                >
                  🏡 Open Garden Plot
                </button>
              </div>
            </div>

            {/* Container Diameter or Ground Area Slider */}
            {dosimeterForm.containerType === 'pot' ? (
              <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={potSizeId} className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Pot Diameter: <span className="text-emerald-500 font-extrabold">{dosimeterForm.potDiameterInches}" Inches</span>
                  </label>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    ~{dosimeterPlan?.soilVolumeLiters || 7.5}L Soil Vol.
                  </span>
                </div>
                <input
                  id={potSizeId}
                  type="range"
                  min="4"
                  max="20"
                  step="2"
                  value={dosimeterForm.potDiameterInches}
                  onChange={(e) => setDosimeterForm({ ...dosimeterForm, potDiameterInches: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] mt-1 text-gray-500">
                  <span>4" (Small)</span>
                  <span>8" (Med)</span>
                  <span>12" (Large)</span>
                  <span>20" (Extra-large)</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Plot Bed Area: <span className="text-emerald-500 font-extrabold">{dosimeterForm.landAreaSqFt} sq. ft</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={dosimeterForm.landAreaSqFt}
                  onChange={(e) => setDosimeterForm({ ...dosimeterForm, landAreaSqFt: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}

            {/* Soil Type */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                Soil Mixture Texture
              </label>
              <select
                value={dosimeterForm.soilType}
                onChange={(e) => setDosimeterForm({ ...dosimeterForm, soilType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option value="Potting Mix">Standard Peat/Coco Potting Mix (Balanced)</option>
                <option value="Sandy Soil">Sandy / Well Draining (Leaches Fast)</option>
                <option value="Clay Soil">Clay Heavy (Salt Accumulates Quickly)</option>
                <option value="Loamy Garden Soil">Loamy Organic Garden Soil</option>
              </select>
            </div>
          </div>

          {/* Results Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {dosimeterPlan ? (
              <>
                {/* Primary Dose Hero Card */}
                <div
                  className="p-6 rounded-3xl border relative overflow-hidden flex flex-col gap-4 shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.02) 100%), var(--bg-card)',
                    borderColor: 'var(--border-default)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        Zero Root-Burn Prescription
                      </span>
                      <h2 className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
                        {dosimeterPlan.recommendedDose.householdMeasure}
                      </h2>
                      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Exact Weight: <strong className="text-emerald-500">{dosimeterPlan.recommendedDose.amount} {dosimeterPlan.recommendedDose.unit}</strong> of {dosimeterPlan.fertilizerType}
                      </p>
                    </div>

                    <div
                      className="px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-1.5"
                      style={{
                        background: `${dosimeterPlan.safetyColor}15`,
                        color: dosimeterPlan.safetyColor,
                        borderColor: `${dosimeterPlan.safetyColor}40`,
                      }}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {dosimeterPlan.safetyRating.split('(')[0].trim()}
                    </div>
                  </div>

                  {/* Water Dilution Requirement Banner */}
                  <div
                    className="p-4 rounded-2xl border flex items-center gap-4"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Droplets className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                        Dilution Ratio
                      </p>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Dissolve in exactly <span className="text-blue-400 font-extrabold">{dosimeterPlan.waterDilutionLiters} Liters</span> of fresh water
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Target Solution Concentration: {dosimeterPlan.recommendedDose.concentrationPerLiter}
                      </p>
                    </div>
                  </div>

                  {/* Osmotic Burn Risk Index Meter */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                        <AlertTriangle className="w-3.5 h-3.5" style={{ color: dosimeterPlan.safetyColor }} />
                        Osmotic Burn Risk Index
                      </span>
                      <span className="font-extrabold" style={{ color: dosimeterPlan.safetyColor }}>
                        {dosimeterPlan.burnRiskScore} / 10
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(dosimeterPlan.burnRiskScore / 10) * 100}%`,
                          backgroundColor: dosimeterPlan.safetyColor,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      <span>Safe / Zero Toxicity</span>
                      <span>Moderate Caution</span>
                      <span>High Burn Danger</span>
                    </div>
                  </div>

                  {/* Application Cycle */}
                  <div className="flex items-center gap-2 text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Application Frequency: <strong style={{ color: 'var(--text-primary)' }}>{dosimeterPlan.applicationFrequency}</strong></span>
                  </div>
                </div>

                {/* Safety Guardrails Checklist */}
                <div
                  className="p-5 rounded-3xl border flex flex-col gap-3"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                >
                  <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: 'var(--border-default)' }}>
                    <Info className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                      Mandatory Application Guardrails
                    </h4>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {dosimeterPlan.precautions.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {tip}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border" style={{ borderColor: 'var(--border-default)' }}>
                <FlaskConical className="w-10 h-10 text-emerald-500 animate-pulse mb-3" />
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Calculating Safe Dosage...</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── GENERAL ADVISOR VIEW ─── */
        <div className="flex flex-col gap-6">
          <form
            onSubmit={handleAdvisorSubmit}
            className="p-6 rounded-3xl border flex flex-col gap-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Plant Type *</label>
                <input
                  name="plantType"
                  value={advisorForm.plantType}
                  onChange={(e) => setAdvisorForm({ ...advisorForm, plantType: e.target.value })}
                  placeholder="e.g. Tomato, Mango, Rose"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Soil Type</label>
                <input
                  name="soilType"
                  value={advisorForm.soilType}
                  onChange={(e) => setAdvisorForm({ ...advisorForm, soilType: e.target.value })}
                  placeholder="e.g. Clay, Sandy, Red Loam"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Growth Stage</label>
                <select
                  name="growthStage"
                  value={advisorForm.growthStage}
                  onChange={(e) => setAdvisorForm({ ...advisorForm, growthStage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  <option value="">Select stage</option>
                  {['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Mature'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Observed Symptom</label>
                <input
                  name="issue"
                  value={advisorForm.issue}
                  onChange={(e) => setAdvisorForm({ ...advisorForm, issue: e.target.value })}
                  placeholder="e.g. Pale yellow leaves"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={advisorLoading}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 mt-2 bg-emerald-600 text-white"
            >
              {advisorLoading ? (
                <>
                  <FlaskConical className="w-4 h-4 animate-spin" /> Formulating Nutritional Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Get Comprehensive AI Recommendations
                </>
              )}
            </button>
          </form>

          {advisorResult && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Organic Options */}
                <div
                  className="p-6 rounded-3xl border flex flex-col gap-4"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                >
                  <div className="flex items-center gap-2 text-emerald-500 font-bold border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                    <Leaf className="w-5 h-5" />
                    <span>Organic & Natural Remedies</span>
                  </div>

                  {Array.isArray(advisorResult.organic) ? (
                    <div className="flex flex-col gap-3">
                      {advisorResult.organic.map((item: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name || item}</p>
                          {item.dosage && <p className="text-xs mt-1 text-emerald-500 font-semibold">Dosage: {item.dosage} • {item.frequency}</p>}
                          {item.applicationMethod && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.applicationMethod}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{JSON.stringify(advisorResult.organic)}</p>
                  )}
                </div>

                {/* Chemical Options */}
                <div
                  className="p-6 rounded-3xl border flex flex-col gap-4"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                >
                  <div className="flex items-center gap-2 text-blue-500 font-bold border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                    <FlaskConical className="w-5 h-5" />
                    <span>Inorganic / Chemical Treatments</span>
                  </div>

                  {Array.isArray(advisorResult.chemical) ? (
                    <div className="flex flex-col gap-3">
                      {advisorResult.chemical.map((item: any, i: number) => (
                        <div key={i} className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.name || item}</p>
                          {item.dosage && <p className="text-xs mt-1 text-blue-400 font-semibold">Dosage: {item.dosage} • {item.frequency}</p>}
                          {item.applicationMethod && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.applicationMethod}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{JSON.stringify(advisorResult.chemical)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
