import { useState, useRef } from 'react';
import { aiService, reportService } from '@/services/endpoints';
import type { AIScanResult } from '@/types';
import { Upload, ScanLine, Loader2, ShieldCheck, ShieldAlert, Leaf, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ScanDisease() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIScanResult | null>(null);

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

  const handleScan = async () => {
    if (!imageFile) return toast.error('Please upload a plant image first');
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('image', imageFile);
      const res = await aiService.detectDisease(fd);
      if (res.data?.success) setResult(res.data.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Disease Scanner 🔍</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upload a photo of your plant to instantly detect diseases using AI</p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="relative rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all hover:border-emerald-500 flex items-center justify-center"
        style={{ borderColor: imagePreview ? 'transparent' : 'var(--border-default)', minHeight: '280px', background: 'var(--bg-card)' }}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Plant" className="w-full h-72 object-contain block" />
        ) : (
          <div className="flex flex-col items-center flex-shrink-0 text-center" style={{ gap: '12px', padding: '32px' }}>
            <div className="rounded-xl" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Upload className="w-8 h-8" />
            </div>
            <div className="flex flex-col mt-2">
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Drag & drop or click to upload</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Supports JPG, PNG, WEBP up to 10MB</p>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </div>

      <div className="flex" style={{ gap: '12px' }}>
        {imagePreview && (
          <button onClick={() => { setImagePreview(null); setImageFile(null); setResult(null); }}
            className="rounded-xl border font-bold text-sm transition-all hover:opacity-80 flex-shrink-0"
            style={{ padding: '12px 20px', borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
            Clear
          </button>
        )}
        <button onClick={handleScan} disabled={loading || !imageFile}
          className="flex-1 rounded-xl font-bold text-sm flex items-center justify-center transition-opacity"
          style={{ padding: '12px', background: 'var(--accent, #059669)', color: '#ffffff', opacity: (loading || !imageFile) ? '0.5' : '1', gap: '8px' }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><ScanLine className="w-4 h-4" /> Scan Now</>}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '16px' }}>
          {/* Status Banner */}
          <div className="rounded-2xl flex items-center" style={{ padding: '20px', gap: '16px', background: result.isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)' }}>
            {result.isHealthy
              ? <ShieldCheck className="w-8 h-8 flex-shrink-0" style={{ color: '#10b981' }} />
              : <ShieldAlert className="w-8 h-8 flex-shrink-0" style={{ color: '#ef4444' }} />}
            <div className="flex flex-col">
              <h2 className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>
                {result.isHealthy ? '✅ Plant is Healthy!' : `⚠️ ${result.disease?.name}`}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Health Score: <strong>{result.healthScore}%</strong>
                {!result.isHealthy && ` · Confidence: ${Math.round((result.disease?.confidence || 0) * 100)}%`}
              </p>
            </div>
          </div>

          {!result.isHealthy && (
            <>
              {/* Symptoms */}
              <div className="rounded-2xl border flex flex-col" style={{ padding: '20px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-bold flex items-center" style={{ color: 'var(--text-primary)', gap: '8px', marginBottom: '12px' }}>
                  <Leaf className="w-4 h-4 text-amber-500" /> Symptoms
                </h3>
                <ul className="flex flex-col" style={{ gap: '4px' }}>
                  {result.symptoms?.map((s, i) => <li key={i} className="text-sm flex items-start" style={{ color: 'var(--text-muted)', gap: '8px' }}><span style={{ marginTop: '-2px' }}>•</span>{s}</li>)}
                </ul>
              </div>

              {/* Treatments */}
              <div className="rounded-2xl border flex flex-col" style={{ padding: '20px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>🌿 Treatments</h3>
                {result.treatments?.organic?.length > 0 && (
                  <div className="flex flex-col" style={{ marginBottom: '16px' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>Organic</p>
                    <ul className="flex flex-col" style={{ gap: '4px' }}>{result.treatments.organic.map((t, i) => <li key={i} className="text-sm" style={{ color: 'var(--text-muted)' }}>• {t}</li>)}</ul>
                  </div>
                )}
                {result.treatments?.chemical?.length > 0 && (
                  <div className="flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#f59e0b' }}>Chemical</p>
                    <ul className="flex flex-col" style={{ gap: '4px' }}>{result.treatments.chemical.map((t, i) => <li key={i} className="text-sm" style={{ color: 'var(--text-muted)' }}>• {t}</li>)}</ul>
                  </div>
                )}
              </div>

              <button onClick={() => navigate('/treatment')} className="w-full rounded-xl font-bold text-sm flex items-center justify-center transition-opacity hover:opacity-90"
                style={{ padding: '16px', background: 'var(--accent, #059669)', color: '#ffffff', gap: '8px', marginTop: '8px' }}>
                Get Detailed Treatment Plan <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
