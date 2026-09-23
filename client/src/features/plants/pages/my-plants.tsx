import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantService } from '@/services/endpoints';
import type { Plant } from '@/types';
import { Plus, Sprout, Search, Droplet, Loader2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyPlants() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await plantService.getPlants();
      if (res.data?.success) setPlants(res.data.data || []);
    } catch {
      toast.error('Failed to load plants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this plant?')) return;
    try {
      await plantService.deletePlant(id);
      setPlants((prev) => prev.filter((p) => p._id !== id));
      toast.success('Plant deleted');
    } catch {
      toast.error('Failed to delete plant');
    }
  };

  const filtered = plants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '32px' }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between" style={{ paddingBottom: '8px' }}>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            My Plants 🌱
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {plants.length} plant{plants.length !== 1 ? 's' : ''} in your garden
          </p>
        </div>
        <button
          onClick={() => navigate('/plants/add')}
          className="flex items-center gap-2 rounded-xl font-bold text-sm"
          style={{ background: 'var(--accent, #059669)', color: '#ffffff', padding: '10px 20px', border: 'none' }}
        >
          <Plus className="w-4 h-4" /> Add Plant
        </button>
      </div>

      {/* Search */}
      <div className="relative" style={{ maxWidth: '400px' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border text-sm outline-none"
          style={{ 
            background: 'var(--bg-card)', 
            borderColor: 'var(--border-default)', 
            color: 'var(--text-primary)',
            padding: '10px 16px 10px 36px' 
          }}
        />
      </div>

      {/* Plant Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-2xl" style={{ minHeight: '40vh', gap: '16px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <Sprout className="w-16 h-16 opacity-30" style={{ color: 'var(--accent, #059669)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No plants match your search.' : "You haven't added any plants yet."}
          </p>
          {!search && (
            <button 
               onClick={() => navigate('/plants/add')} 
               className="rounded-xl text-sm font-bold shadow-sm"
               style={{ background: 'var(--accent, #059669)', color: '#ffffff', padding: '10px 20px' }}
            >
              Add Your First Plant
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map((plant) => (
            <div
              key={plant._id}
              onClick={() => navigate(`/plants/${plant._id}`)}
              className="rounded-2xl border overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform flex flex-col"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <div className="relative overflow-hidden" style={{ height: '176px' }}>
                <img
                  src={plant.image?.url || '/fallback-plant.jpg'}
                  alt={plant.name}
                  className="w-full h-full object-cover block"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider"
                  style={{ 
                    background: plant.status === 'healthy' ? '#10b981' : plant.status === 'diseased' ? '#f59e0b' : '#ef4444', 
                    color: 'white' 
                  }}>
                  {plant.status}
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-between" style={{ padding: '16px', gap: '16px' }}>
                <div className="flex flex-col">
                  <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{plant.name}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{plant.type} · {plant.category}</p>
                </div>
                
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    <Droplet className="w-3.5 h-3.5 text-blue-500" />
                    <span>{plant.waterSchedule?.nextWatering ? new Date(plant.waterSchedule.nextWatering).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/plants/${plant._id}`); }}
                      className="rounded-lg flex items-center justify-center transition-colors"
                      style={{ padding: '6px', background: 'var(--accent-bg, rgba(5, 150, 105, 0.1))', color: 'var(--accent, #059669)' }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(plant._id, e)}
                      className="rounded-lg flex items-center justify-center transition-colors hover:bg-rose-500/10"
                      style={{ padding: '6px', color: '#ef4444' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
