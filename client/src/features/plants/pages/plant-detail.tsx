import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { plantService } from '@/services/endpoints';
import type { Plant } from '@/types';
import { ArrowLeft, Droplet, Leaf, ShieldAlert, Loader2, Activity, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    plantService.getPlant(id)
      .then((res) => { if (res.data?.success) setPlant(res.data.data?.plant || res.data.data); })
      .catch(() => toast.error('Failed to load plant'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleWater = async () => {
    if (!id) return;
    try {
      await plantService.waterPlant(id);
      toast.success('Watering logged!');
    } catch {
      toast.error('Failed to log watering');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Leaf className="w-12 h-12 text-emerald-500/30" />
        <p style={{ color: 'var(--text-muted)' }}>Plant not found.</p>
        <button onClick={() => navigate('/plants')} className="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">Back to Plants</button>
      </div>
    );
  }

  const statusColor = plant.status === 'healthy' ? 'text-emerald-600 bg-emerald-500/10' :
    plant.status === 'diseased' ? 'text-amber-600 bg-amber-500/10' :
      plant.status === 'critical' ? 'text-rose-600 bg-rose-500/10' : 'text-blue-600 bg-blue-500/10';

  return (
    <div className="max-w-4xl mx-auto flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      {/* Header */}
      <div className="flex items-center" style={{ gap: '16px' }}>
        <button onClick={() => navigate('/plants')} className="rounded-xl border transition-colors hover:bg-emerald-500/10" style={{ padding: '8px', borderColor: 'var(--border-default)' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{plant.name}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{plant.type} · {plant.category}</p>
        </div>
        <span className={`ml-auto text-xs font-bold uppercase ${statusColor}`} style={{ padding: '6px 12px', borderRadius: '9999px' }}>{plant.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '24px' }}>
        {/* Image */}
        <div className="lg:col-span-1 border rounded-2xl overflow-hidden" style={{ borderColor: 'var(--border-default)', minHeight: '300px' }}>
          <img src={plant.image?.url || '/fallback-plant.jpg'} alt={plant.name} className="w-full h-full object-cover block" />
        </div>

        {/* Info */}
        <div className="lg:col-span-2 flex flex-col" style={{ gap: '16px' }}>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: '16px' }}>
            {[
              { icon: Activity, label: 'Health Score', value: `${plant.healthScore}%`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
              { icon: MapPin, label: 'Location', value: plant.location, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
              { icon: Clock, label: 'Age', value: `${plant.age?.value} ${plant.age?.unit}`, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
            ].map((s, i) => (
              <div key={i} className="border flex items-center rounded-2xl" style={{ padding: '16px', gap: '12px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ padding: '10px', background: s.bg, color: s.color }}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Watering Card */}
          <div className="border rounded-2xl" style={{ padding: '20px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: '12px' }}>
                <div className="rounded-xl flex items-center justify-center" style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Droplet className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Watering Schedule</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Next: {plant.waterSchedule?.nextWatering ? new Date(plant.waterSchedule.nextWatering).toLocaleDateString() : 'Not set'}
                    {' '} · {plant.waterSchedule?.frequency || 'N/A'} · {plant.waterSchedule?.amount || 'N/A'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleWater} 
                className="font-bold text-xs rounded-xl"
                style={{ padding: '8px 16px', background: 'var(--accent, #059669)', color: '#ffffff' }}
              >
                Log Watering
              </button>
            </div>
          </div>

          {/* Disease History */}
          <div className="border rounded-2xl" style={{ padding: '20px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center" style={{ gap: '8px', marginBottom: '12px' }}>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Disease History</p>
            </div>
            {plant.diseases?.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No diseases recorded. Your plant is healthy! 🎉</p>
            ) : (
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {plant.diseases.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl" style={{ padding: '10px', background: 'var(--bg-primary)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                    <span 
                      className="text-xs rounded-full" 
                      style={{ 
                        padding: '2px 8px', 
                        background: d.resolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                        color: d.resolved ? '#10b981' : '#f59e0b' 
                      }}
                    >
                      {d.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {plant.notes && (
            <div className="border rounded-2xl" style={{ padding: '20px', background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <p className="font-bold text-sm" style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Notes</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{plant.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex" style={{ gap: '12px' }}>
        <button 
          onClick={() => navigate('/scan')} 
          className="font-bold text-sm rounded-xl"
          style={{ padding: '12px 24px', background: 'var(--accent, #059669)', color: '#ffffff' }}
        >
          🔍 Scan for Disease
        </button>
        <button 
          onClick={() => navigate('/growth')} 
          className="font-bold text-sm rounded-xl border transition-all hover:opacity-80"
          style={{ padding: '12px 24px', borderColor: 'var(--border-default)', color: 'var(--text-primary)', background: 'var(--bg-card)' }}
        >
          📈 Track Growth
        </button>
      </div>
    </div>
  );
}
