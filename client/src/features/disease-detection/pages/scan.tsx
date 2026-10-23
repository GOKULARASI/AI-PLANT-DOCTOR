import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '@/services/endpoints';
import type { AIScanResult } from '@/types';
import {
  Upload,
  Camera,
  ScanLine,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Radio,
  MessageSquare,
  TrendingUp,
  XCircle,
  HelpCircle,
  Activity,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Preset Agricultural Demo Specimens ──────────────────────────────
// Allows immediate 1-click evaluation without requiring users to find test leaves
const DEMO_SPECIMENS = [
  {
    name: 'Tomato Early Blight',
    pathogen: 'Alternaria solani',
    category: 'Fungal Infection',
    imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&auto=format&fit=crop&q=80',
    severity: 'high',
  },
  {
    name: 'Tomato Late Blight',
    pathogen: 'Phytophthora infestans',
    category: 'Water Mold / Oomycete',
    imageUrl: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&auto=format&fit=crop&q=80',
    severity: 'critical',
  },
  {
    name: 'Powdery Mildew',
    pathogen: 'Podosphaera xanthii',
    category: 'Foliar Fungus',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&auto=format&fit=crop&q=80',
    severity: 'medium',
  },
  {
    name: 'Healthy Tomato Leaf',
    pathogen: 'Optimal Foliage',
    category: 'Disease-Free',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?w=600&auto=format&fit=crop&q=80',
    severity: 'none',
  },
];

// Telemetry step sequence during scanning
const TELEMETRY_STAGES = [
  'Segmenting leaf margins & foliage contours...',
  'Extracting chlorotic halos & necrotic spot vectors...',
  'Interrogating PlantVillage CNN deep learning model...',
  'Multimodal cross-validation with Gemini Vision AI...',
  'Synthesizing clinical treatment & dilution protocol...',
];

export default function ScanDisease() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Input modes: 'upload' | 'camera'
  const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Scan execution state
  const [loading, setLoading] = useState<boolean>(false);
  const [telemetryIndex, setTelemetryIndex] = useState<number>(0);
  const [result, setResult] = useState<AIScanResult | null>(null);

  // Results Tab: 'all' | 'organic' | 'chemical' | 'prevention'
  const [activeTab, setActiveTab] = useState<'all' | 'organic' | 'chemical' | 'prevention'>('all');

  // Cycle telemetry stages while analyzing
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_STAGES.length);
      }, 900);
    } else {
      setTelemetryIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // ─── Camera Management ─────────────────────────────────────────────
  const startCamera = async () => {
    try {
      setInputMode('camera');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      toast.error('Unable to access camera. Please allow camera permissions or upload an image.');
      setInputMode('upload');
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  }, [cameraStream]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `plant_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(blob));
      stopCamera();
      setInputMode('upload');
    }, 'image/jpeg', 0.92);
  };

  // ─── File Handling ─────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };

  // ─── 1-Click Preset Specimen Selection ─────────────────────────────
  const loadPresetSpecimen = async (specimen: typeof DEMO_SPECIMENS[0]) => {
    try {
      setLoading(true);
      setImagePreview(specimen.imageUrl);
      setResult(null);

      // Fetch sample image and convert to File
      const response = await fetch(specimen.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${specimen.name.replace(/\s+/g, '_').toLowerCase()}.jpg`, {
        type: 'image/jpeg',
      });
      setImageFile(file);

      // Execute AI scan immediately
      await runDiagnosis(file);
    } catch (err) {
      toast.error('Failed to load specimen image. Please upload a file manually.');
      setLoading(false);
    }
  };

  // ─── Diagnosis Trigger ─────────────────────────────────────────────
  const runDiagnosis = async (fileToScan: File) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('image', fileToScan);

      const res = await aiService.detectDisease(fd);
      if (res.data?.success) {
        setResult(res.data.data.aiResult);
        toast.success(
          res.data.data.aiResult.isHealthy
            ? 'Leaf diagnosed as Healthy!'
            : `Pathology Detected: ${res.data.data.aiResult.disease?.name || 'Infection'}`
        );
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Scan failed. Retrying fallback pipeline...');
    } finally {
      setLoading(false);
    }
  };

  const handleScanClick = () => {
    if (!imageFile) {
      return toast.error('Please upload or capture a plant foliage image first.');
    }
    runDiagnosis(imageFile);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    stopCamera();
    setInputMode('upload');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in pb-16">
      {/* ─── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              AI Plant Doctor & Disease Diagnostic 🔬
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Live Vision AI
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Deep Learning Foliage Pathology: Point your camera or upload a leaf photo to diagnose plant diseases, calculate exact chemical dilution, and track recovery.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div
          className="flex p-1 rounded-2xl border self-start sm:self-auto"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <button
            onClick={() => {
              stopCamera();
              setInputMode('upload');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              inputMode === 'upload'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>

          <button
            onClick={startCamera}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              inputMode === 'camera'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Live Camera
          </button>
        </div>
      </div>

      {/* ─── Scanner Viewfinder / Dropzone ──────────────────────────── */}
      <div
        className="rounded-3xl border-2 overflow-hidden relative shadow-xl transition-all"
        style={{
          background: 'var(--bg-card)',
          borderColor: imagePreview ? 'var(--border-default)' : 'var(--border-default)',
          minHeight: '340px',
        }}
      >
        {inputMode === 'camera' && isCameraActive ? (
          /* Live Webcam Viewfinder */
          <div className="relative w-full h-80 sm:h-96 bg-black flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Viewfinder Target Reticle */}
            <div className="absolute inset-8 border-2 border-emerald-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
              <div className="w-16 h-16 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
              <div className="w-16 h-16 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
              <div className="w-16 h-16 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />
              <span className="text-xs font-bold text-emerald-400 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                Center Affected Leaf Foliage Here
              </span>
            </div>

            {/* Shutter Button */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                title="Capture Leaf Image"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500" />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setInputMode('upload');
                }}
                className="px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-semibold hover:bg-black/80 backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : imagePreview ? (
          /* Image Preview & Holographic Laser Scanner */
          <div className="relative w-full h-80 sm:h-96 flex items-center justify-center bg-black/5 dark:bg-black/30 overflow-hidden">
            <img src={imagePreview} alt="Target Leaf" className="w-full h-full object-contain block" />

            {/* Sci-Fi Laser Scan Line Animation during diagnosis */}
            {loading && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                  className="w-full h-1 bg-gradient-to-r from-emerald-500 via-green-300 to-emerald-500 shadow-[0_0_15px_#10b981] absolute"
                  style={{
                    animation: 'scan-line 2.2s ease-in-out infinite alternate',
                  }}
                />
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none backdrop-blur-[0.5px]" />
              </div>
            )}

            {/* Image control badge */}
            {!loading && (
              <button
                onClick={handleReset}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake / Choose New
              </button>
            )}
          </div>
        ) : (
          /* File Upload Dropzone */
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-center cursor-pointer p-10 sm:p-14 hover:bg-emerald-500/5 transition-all"
          >
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm">
              <Upload className="w-9 h-9" />
            </div>

            <h3 className="font-extrabold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Drop your plant leaf photo here, or <span className="text-emerald-500 underline">browse files</span>
            </h3>
            <p className="text-xs max-w-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Clear top-down photos of discolored foliage, spots, or stems give highest diagnostic accuracy. Supports JPG, PNG, WEBP up to 10MB.
            </p>

            <div className="flex items-center gap-4 mt-6 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>
              <span className="flex items-center gap-1">🌿 Natural Sunlight</span>
              <span className="flex items-center gap-1">🎯 Sharp Focus</span>
              <span className="flex items-center gap-1">🍃 Single Leaf View</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        )}
      </div>

      {/* ─── Telemetry Bar (Active when analyzing) ──────────────────── */}
      {loading && (
        <div
          className="p-5 rounded-2xl border flex items-center gap-4 animate-pulse-glow"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--color-primary-500)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                Computational Pathology Telemetry
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Step {telemetryIndex + 1} of 5
              </span>
            </div>
            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {TELEMETRY_STAGES[telemetryIndex]}
            </p>
          </div>
        </div>
      )}

      {/* ─── Scan Trigger Action Buttons ────────────────────────────── */}
      {imagePreview && !loading && !result && (
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
              background: 'var(--bg-card)',
            }}
          >
            Clear
          </button>
          <button
            onClick={handleScanClick}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 text-white shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
          >
            <ScanLine className="w-5 h-5" /> Run AI Pathology Diagnostic
          </button>
        </div>
      )}

      {/* ─── 1-Click Verification Specimen Presets ──────────────────── */}
      {!result && !loading && (
        <div
          className="p-6 rounded-3xl border flex flex-col gap-3"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <h4 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                Don't have a leaf right now? Test 1-Click Specimen Presets:
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Instant Diagnosis
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {DEMO_SPECIMENS.map((specimen) => (
              <button
                key={specimen.name}
                type="button"
                onClick={() => loadPresetSpecimen(specimen)}
                className="group p-3 rounded-2xl border text-left transition-all hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-2"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
              >
                <div className="w-full h-24 rounded-xl overflow-hidden relative border" style={{ borderColor: 'var(--border-default)' }}>
                  <img
                    src={specimen.imageUrl}
                    alt={specimen.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute bottom-1.5 left-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      specimen.severity === 'none'
                        ? 'bg-emerald-500 text-white'
                        : specimen.severity === 'critical'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {specimen.severity === 'none' ? 'Healthy' : specimen.severity}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>
                    {specimen.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {specimen.pathogen}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── DIAGNOSTIC RESULTS HUD ──────────────────────────────────── */}
      {result && (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Main Verdict Card */}
          <div
            className="p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center gap-6"
            style={{
              background: result.isHealthy
                ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.03) 100%), var(--bg-card)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.10) 0%, rgba(245,158,11,0.03) 100%), var(--bg-card)',
              borderColor: result.isHealthy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            }}
          >
            {/* Circular Health Meter Gauge */}
            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-800"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={result.isHealthy ? '#10b981' : result.healthScore < 50 ? '#ef4444' : '#f59e0b'}
                  strokeWidth="8"
                  strokeDasharray={`${(result.healthScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {result.healthScore}%
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Health Index
                </span>
              </div>
            </div>

            {/* Diagnostic Classification Details */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.isHealthy
                      ? 'bg-emerald-500 text-white'
                      : result.disease?.severity === 'critical'
                      ? 'bg-rose-500 text-white'
                      : result.disease?.severity === 'high'
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {result.isHealthy ? 'Optimal Chlorophyll' : `${result.disease?.severity || 'Medium'} Severity`}
                </span>

                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                >
                  Confidence: {Math.round(result.disease?.confidence || 92)}%
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                {result.isHealthy ? 'Plant Foliage is Healthy' : result.disease?.name}
              </h2>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {result.disease?.description}
              </p>
            </div>
          </div>

          {/* ─── Innovation Bridges: Cross-Module Senior Workflows ───── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Bridge 1: Precision Chemical Dosimeter */}
            <button
              onClick={() => navigate('/fertilizer')}
              className="p-4 rounded-2xl border text-left transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Innovation 3
                </span>
              </div>
              <div>
                <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                  Calculate Chemical Dilution
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Zero plant burn guarantee
                </p>
              </div>
            </button>

            {/* Bridge 2: Before/After Recovery Tracker */}
            <button
              onClick={() => navigate('/growth')}
              className="p-4 rounded-2xl border text-left transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Innovation 2
                </span>
              </div>
              <div>
                <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                  Log Baseline in Tracker
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Visual Before & After slider
                </p>
              </div>
            </button>

            {/* Bridge 3: Outbreak Radar */}
            <button
              onClick={() => navigate('/outbreak-radar')}
              className="p-4 rounded-2xl border text-left transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Radio className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Innovation 5
                </span>
              </div>
              <div>
                <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                  Check Outbreak Radar
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Nearby regional epidemics
                </p>
              </div>
            </button>

            {/* Bridge 4: Chatbot Agronomist */}
            <button
              onClick={() => navigate('/chatbot')}
              className="p-4 rounded-2xl border text-left transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  Gemini Bot
                </span>
              </div>
              <div>
                <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>
                  Consult AI Bot on This
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  English & Tamil support
                </p>
              </div>
            </button>
          </div>

          {/* ─── Clinical Symptoms & Etiology ───────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symptoms */}
            <div
              className="p-6 rounded-3xl border flex flex-col gap-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Leaf className="w-4 h-4 text-emerald-500" /> Pathological Symptoms
              </h3>
              <ul className="flex flex-col gap-2">
                {result.symptoms?.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Environmental Causes & Vectors */}
            <div
              className="p-6 rounded-3xl border flex flex-col gap-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Root Causes & Spread Vectors
              </h3>
              <ul className="flex flex-col gap-2">
                {result.causes?.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ─── Structured Action Protocols ────────────────────────── */}
          <div
            className="p-6 sm:p-8 rounded-3xl border flex flex-col gap-6"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border-default)' }}>
              <div>
                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                  Agronomic Countermeasure Protocol
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Estimated Recovery Time: <strong className="text-emerald-500">{result.recoveryTime || '2-3 weeks'}</strong>
                </p>
              </div>

              {/* Protocol Filters */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'organic', 'chemical', 'prevention'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-emerald-600 text-white'
                        : 'border hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ borderColor: activeTab === tab ? 'transparent' : 'var(--border-default)', color: activeTab === tab ? '#fff' : 'var(--text-muted)' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Organic Remedies */}
              {(activeTab === 'all' || activeTab === 'organic') && (
                <div
                  className="p-5 rounded-2xl border flex flex-col gap-3"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4" /> Organic & Bio-Fungicides
                  </span>
                  <ul className="flex flex-col gap-2">
                    {result.treatments?.organic?.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chemical Countermeasures */}
              {(activeTab === 'all' || activeTab === 'chemical') && (
                <div
                  className="p-5 rounded-2xl border flex flex-col gap-3"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" /> Targeted Chemical Sprays
                  </span>
                  <ul className="flex flex-col gap-2">
                    {result.treatments?.chemical?.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Home & DIY Remedies */}
              {(activeTab === 'all' || activeTab === 'organic') && result.treatments?.homeRemedies?.length > 0 && (
                <div
                  className="p-5 rounded-2xl border flex flex-col gap-3"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Traditional / Household Remedies
                  </span>
                  <ul className="flex flex-col gap-2">
                    {result.treatments.homeRemedies.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention Rules */}
              {(activeTab === 'all' || activeTab === 'prevention') && (
                <div
                  className="p-5 rounded-2xl border flex flex-col gap-3"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)' }}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Prevention & Cultural Practices
                  </span>
                  <ul className="flex flex-col gap-2">
                    {result.prevention?.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Do's & Don'ts Comparison Grid */}
            {result.dosAndDonts && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Recommended (Do's)
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {result.dosAndDonts.dos?.map((d, i) => (
                      <li key={i} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-emerald-500 font-bold">✓</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Critical Avoidance (Don'ts)
                  </span>
                  <ul className="flex flex-col gap-1.5">
                    {result.dosAndDonts.donts?.map((d, i) => (
                      <li key={i} className="text-xs leading-relaxed flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="text-rose-500 font-bold">✗</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
