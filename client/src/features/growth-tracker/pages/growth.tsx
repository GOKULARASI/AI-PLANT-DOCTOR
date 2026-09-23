import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { growthService, plantService } from '@/services/endpoints';
import type { Plant, GrowthRecord } from '@/types';
import { TrendingUp, Loader2, Plus, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GrowthTracker() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    plantService.getPlants().then((res) => {
      if (res.data?.success) {
        const list = res.data.data || [];
        setPlants(list);
        if (list.length > 0) setSelectedPlant(list[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedPlant) return;
    setLoading(true);
    growthService.getRecords(selectedPlant)
      .then((res) => { if (res.data?.success) setRecords(res.data.data?.records || []); })
      .catch(() => toast.error('Failed to load growth records'))
      .finally(() => setLoading(false));
  }, [selectedPlant]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Growth Tracker 📈</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track the growth progress of your plants over time</p>
      </div>

      {plants.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Leaf className="w-16 h-16 text-emerald-500/30" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add plants first to track their growth.</p>
          <button onClick={() => navigate('/plants/add')} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">Add a Plant</button>
        </div>
      ) : (
        <>
          {/* Plant Selector */}
          <div className="p-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Select Plant</label>
            <select value={selectedPlant} onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
              {plants.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <TrendingUp className="w-12 h-12 text-emerald-500/30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No growth records yet for this plant.</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {records.map((record) => (
                <div key={record._id} className="p-5 rounded-2xl border flex gap-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  {record.image?.url && (
                    <img src={record.image.url} alt="Growth" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(record.recordedAt).toLocaleDateString()}</p>
                    <div className="flex gap-4 mt-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        📏 {record.height?.value} {record.height?.unit}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        🍃 {record.leafCount} leaves
                      </span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        💚 Health: {record.healthScore}%
                      </span>
                    </div>
                    {record.notes && <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{record.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
