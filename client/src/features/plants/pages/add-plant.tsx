import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantService } from '@/services/endpoints';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Flower', 'Vegetable', 'Fruit', 'Herb', 'Succulent', 'Tree', 'Shrub', 'Houseplant', 'Other'];
const LOCATIONS = ['Indoor', 'Outdoor', 'Balcony', 'Garden', 'Greenhouse'];
const AGE_UNITS = ['days', 'weeks', 'months', 'years'];
const STATUSES = ['healthy', 'diseased', 'recovering', 'critical'];

export default function AddPlant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', category: 'Houseplant', type: '', location: 'Indoor',
    ageValue: '1', ageUnit: 'months', status: 'healthy', notes: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Plant name is required');
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('category', form.category);
      fd.append('type', form.type);
      fd.append('location', form.location);
      fd.append('age', form.ageValue);
      fd.append('ageUnit', form.ageUnit);
      fd.append('age[value]', form.ageValue);
      fd.append('age[unit]', form.ageUnit);
      fd.append('status', form.status);
      fd.append('notes', form.notes);
      if (imageFile) fd.append('image', imageFile);
      await plantService.createPlant(fd);
      toast.success('Plant added successfully!');
      navigate('/plants');
    } catch (err: any) {
      const errorMsg =
        typeof err?.response?.data?.message === 'string'
          ? err.response.data.message
          : err?.message || 'Failed to add plant';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all";
  const inputStyle = { background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl border hover:bg-emerald-500/10 transition-colors" style={{ borderColor: 'var(--border-default)' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Add New Plant 🌿</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Register a plant to track its health and care schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="p-6 rounded-2xl border space-y-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Plant Photo</h2>
          <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden"
            style={{ borderColor: imagePreview ? 'transparent' : 'var(--border-default)' }}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Upload className="w-8 h-8" />
                <p className="text-sm font-medium">Click to upload a photo</p>
                <p className="text-xs">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>

        {/* Basic Info */}
        <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Plant Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rose, Fern, Tomato" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Plant Type / Species</label>
              <input name="type" value={form.type} onChange={handleChange} placeholder="e.g. Rosa damascena" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Location</label>
              <select name="location" value={form.location} onChange={handleChange} className={inputClass} style={inputStyle}>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Age</label>
              <div className="flex gap-2">
                <input name="ageValue" type="number" min="0" value={form.ageValue} onChange={handleChange} className={inputClass} style={inputStyle} />
                <select name="ageUnit" value={form.ageUnit} onChange={handleChange} className={inputClass} style={inputStyle}>
                  {AGE_UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Health Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass} style={inputStyle}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Any extra details about this plant..."
              className={inputClass} style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl border font-bold text-sm transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🌱 Add Plant'}
          </button>
        </div>
      </form>
    </div>
  );
}
