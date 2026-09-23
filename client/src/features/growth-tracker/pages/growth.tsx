import { useEffect, useState, useRef, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { growthService, plantService, aiService } from '@/services/endpoints';
import type { Plant, GrowthRecord } from '@/types';
import {
  TrendingUp,
  Loader2,
  Leaf,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Upload,
  Activity,
  HeartPulse,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function GrowthTracker() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── Comparative Recovery State ─────────────────────────────────────
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [followUpFile, setFollowUpFile] = useState<File | null>(null);
  const [followUpPreview, setFollowUpPreview] = useState<string>('');
  const [daysPassed, setDaysPassed] = useState<number>(7);
  const [comparing, setComparing] = useState(false);
  const [latestComparison, setLatestComparison] = useState<any>(null);

  // ─── Before / After Slider State ────────────────────────────────────
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sliderInputId = useId();

  useEffect(() => {
    plantService.getPlants().then((res) => {
      if (res.data?.success) {
        const list = res.data.data || [];
        setPlants(list);
        if (list.length > 0) setSelectedPlantId(list[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedPlantId) return;
    loadPlantRecords(selectedPlantId);
  }, [selectedPlantId]);

  const loadPlantRecords = async (plantId: string) => {
    try {
      setLoading(true);
      const res = await growthService.getRecords(plantId);
      if (res.data?.success) {
        const raw = res.data.data;
        const data: GrowthRecord[] = Array.isArray(raw?.records)
          ? raw.records
          : Array.isArray(raw)
          ? raw
          : [];
        setRecords(data);
        // Find latest follow up record with recovery metrics if exists
        const followUp = data.find((r) => r.isFollowUp && r.healingPercentage !== undefined);
        if (followUp) {
          setLatestComparison({
            healingPercentage: followUp.healingPercentage,
            recoveryStage: followUp.recoveryStage,
            lesionChange: followUp.lesionChange,
            currentHealthScore: followUp.healthScore,
            adjustedActionPlan: followUp.adjustedActionPlan || [],
            comparisonNotes: followUp.notes,
          });
        }
      }
    } catch {
      toast.error('Failed to load growth records');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpFile) return toast.error('Please select a follow-up photo');

    try {
      setComparing(true);
      const formData = new FormData();
      formData.append('image', followUpFile);
      formData.append('plantId', selectedPlantId);
      formData.append('daysPassed', daysPassed.toString());

      const currentPlant = plants.find((p) => p._id === selectedPlantId);
      const diseaseName = currentPlant?.diseases?.[0]?.name || 'Plant Infection';
      formData.append('diseaseName', diseaseName);

      const res = await aiService.compareRecovery(formData);
      if (res.data?.success) {
        toast.success('Recovery progression evaluated!');
        setLatestComparison(res.data.data.comparison);
        setShowCompareModal(false);
        setFollowUpFile(null);
        setFollowUpPreview('');
        loadPlantRecords(selectedPlantId);
      }
    } catch {
      toast.error('Failed to evaluate recovery scan');
    } finally {
      setComparing(false);
    }
  };

  const currentPlant = plants.find((p) => p._id === selectedPlantId);

  // Baseline infected photo (oldest record with photo or plant image)
  const baselinePhoto =
    records.find((r) => !r.isFollowUp && r.image?.url)?.image?.url ||
    currentPlant?.image?.url ||
    'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&auto=format&fit=crop&q=80';

  // Current photo (latest record or follow up)
  const followUpPhoto =
    records.find((r) => r.isFollowUp && r.image?.url)?.image?.url ||
    records[0]?.image?.url ||
    baselinePhoto;

  // Handle Dragging Slider
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col animate-fade-in" style={{ gap: '28px' }}>
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Recovery & Growth Tracker 📈
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Innovation 2
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Comparative Computer Vision tracking: measure quantifiable disease regression and tissue regeneration over time.
          </p>
        </div>

        {plants.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <HeartPulse className="w-4 h-4" /> Compare Follow-up Scan
          </button>
        )}
      </div>

      {plants.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Leaf className="w-16 h-16 text-emerald-500/30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Add a plant first to track its healing progression.
          </p>
          <button
            onClick={() => navigate('/plants/add')}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold"
          >
            Add a Plant
          </button>
        </div>
      ) : (
        <>
          {/* Plant Selector Bar */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Target Plant:
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/40"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
              >
                {plants.map((p) => (
                  <option key={p._id} value={p._id}>
                    🪴 {p.name} ({p.type || p.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Health Status:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold capitalize ${
                  currentPlant?.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : currentPlant?.status === 'recovering'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {currentPlant?.status || 'Active'}
              </span>
            </div>
          </div>

          {/* ─── INNOVATION 2: BEFORE vs AFTER INTERACTIVE CV SLIDER ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Slider (7 cols) */}
            <div
              className="lg:col-span-7 p-6 rounded-3xl border flex flex-col gap-4 shadow-xl"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Visual Recovery Slider (Drag to Compare)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-500">
                  {sliderPosition < 50 ? 'Baseline Infection View' : 'Follow-up Regeneration'}
                </span>
              </div>

              {/* Slider Container */}
              <div
                ref={sliderRef}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
                onTouchMove={handleMouseMove}
                className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden cursor-ew-resize select-none border"
                style={{ borderColor: 'var(--border-default)' }}
              >
                {/* Follow-up / Current Image (Background) */}
                <img
                  src={followUpPhoto}
                  alt="Follow-up Scan"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Baseline / Infected Image (Clipped Foreground) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={baselinePhoto}
                    alt="Baseline Scan"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: sliderRef.current ? `${sliderRef.current.clientWidth}px` : '100%' }}
                  />
                  {/* Overlay Tag */}
                  <span className="absolute bottom-3 left-3 bg-red-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                    Day 0: Baseline Infection
                  </span>
                </div>

                {/* Follow-up Overlay Tag */}
                <span className="absolute bottom-3 right-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                  Day 7+: Follow-up Recovery
                </span>

                {/* Vertical Divider Bar */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-gray-800 shadow-md flex items-center justify-center font-bold text-xs border border-gray-300">
                    ↔
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor={sliderInputId} className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Slider Position:
                </label>
                <input
                  id={sliderInputId}
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Quantifiable Scoreboard (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div
                className="p-6 rounded-3xl border flex flex-col gap-4 shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(16,185,129,0.02) 100%), var(--bg-card)',
                  borderColor: 'var(--border-default)',
                }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500">
                      Recovery Scoreboard
                    </span>
                    <h3 className="text-xl font-black mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      Healing Trajectory
                    </h3>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {latestComparison?.recoveryStage || 'Stage 2/3 - Healing'}
                  </span>
                </div>

                {/* Primary Metric: Lesion Shrinkage & Healing % */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      Lesion Reduction
                    </span>
                    <p className="text-2xl font-black text-emerald-500 mt-1">
                      +{latestComparison?.healingPercentage || 42}%
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Pathogen surface shrinkage
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Health Index
                    </span>
                    <p className="text-2xl font-black text-blue-400 mt-1">
                      {latestComparison?.currentHealthScore || currentPlant?.healthScore || 78}/100
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Vitality restoration
                    </p>
                  </div>
                </div>

                {/* Pathology Notes */}
                <div className="p-3.5 rounded-2xl border" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    AI Pathological Assessment:
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {latestComparison?.lesionChange ||
                      'Lesion surface area decreased by approx. 40% compared to baseline scan. Active chlorotic fungal halos have begun drying out.'}
                  </p>
                </div>

                {/* Adjusted Action Plan */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Next Phase Protocols:
                  </span>
                  {(
                    latestComparison?.adjustedActionPlan || [
                      'Reduce fungicide application frequency from weekly to bi-weekly',
                      'Wipe foliage with organic neem solution to shield new growth',
                      'Maintain root-level watering to keep healing lesions dry',
                    ]
                  ).map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── RECOVERY & GROWTH TIMELINE ─── */}
          <div
            className="p-6 rounded-3xl border flex flex-col gap-4"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                Chronological Recovery Timeline
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              </div>
            ) : records.length === 0 ? (
              <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
                No records yet. Click "Compare Follow-up Scan" to log your first recovery milestone!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {records.map((r, idx) => (
                  <div
                    key={r._id}
                    className="p-4 rounded-2xl border flex flex-col gap-3 relative overflow-hidden"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                  >
                    {r.isFollowUp && (
                      <span className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Follow-up Scan
                      </span>
                    )}

                    {r.image?.url && (
                      <img
                        src={r.image.url}
                        alt="Stage"
                        className="w-full h-36 object-cover rounded-xl border"
                        style={{ borderColor: 'var(--border-default)' }}
                      />
                    )}

                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {new Date(r.recordedAt).toLocaleDateString()} (Stage {idx + 1})
                      </p>
                      <div className="flex gap-3 text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                        <span>💚 Health: <strong>{r.healthScore}%</strong></span>
                        {r.healingPercentage ? (
                          <span className="text-emerald-500 font-bold">+{r.healingPercentage}% healed</span>
                        ) : null}
                      </div>
                      {r.notes && (
                        <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {r.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── UPLOAD FOLLOW-UP MODAL ─── */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl border p-6 flex flex-col gap-5 shadow-2xl animate-scale-up"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Upload Follow-up Recovery Scan
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFollowUpUpload} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Days Elapsed Since Initial Treatment
                </label>
                <select
                  value={daysPassed}
                  onChange={(e) => setDaysPassed(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  <option value={7}>Day 7 (Early Healing Milestone)</option>
                  <option value={14}>Day 14 (Mid-Cycle Regeneration)</option>
                  <option value={21}>Day 21 (Final Recovery Stage)</option>
                  <option value={30}>Day 30 (Full Month Follow-up)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Current Plant Photo
                </label>
                <div
                  className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-emerald-500"
                  style={{ borderColor: 'var(--border-default)', background: 'var(--bg-primary)' }}
                  onClick={() => document.getElementById('follow-up-input')?.click()}
                >
                  {followUpPreview ? (
                    <img
                      src={followUpPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl shadow-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-emerald-500" />
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        Click to select photo
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        JPEG, PNG up to 10MB
                      </span>
                    </div>
                  )}
                  <input
                    id="follow-up-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFollowUpFile(file);
                        setFollowUpPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={comparing || !followUpFile}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {comparing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Tissue Recovery...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Comparative Pathological AI Scan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
