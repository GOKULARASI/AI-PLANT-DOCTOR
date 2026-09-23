import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { plantService } from '@/services/endpoints';
import type { Plant } from '@/types';
import { 
  Sprout, Activity, ShieldAlert, Plus, ScanLine, 
  MessageSquare, Droplet, ArrowRight, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, healthy: 0, diseased: 0, critical: 0 });
  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await plantService.getStats().catch(() => ({ data: { success: true, data: { total: 0, healthy: 0, diseased: 0, critical: 0 } } }));
        if (statsRes.data?.success) setStats(statsRes.data.data);

        const plantsRes = await plantService.getPlants({ limit: '3' }).catch(() => ({ data: { success: true, data: [] } }));
        if (plantsRes.data?.success) setRecentPlants(plantsRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--accent, #059669)' }} />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Tracked', value: stats.total, icon: Sprout, color: 'text-emerald-500' },
    { label: 'Thriving', value: stats.healthy, icon: Activity, color: 'text-blue-500' },
    { label: 'Needs Care', value: stats.diseased, icon: ShieldAlert, color: 'text-amber-500' },
    { label: 'Critical', value: stats.critical, icon: ShieldAlert, color: 'text-rose-500' },
  ];

  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: '28px' }}>
      
      {/* Page Header */}
      <div className="flex flex-col" style={{ marginBottom: '-4px' }}>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Gardener'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Here is a quick overview of your garden's health status.
        </p>
      </div>

      {/* Stats - 4 Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: '20px' }}>
        {statCards.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border flex flex-col justify-between" 
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '120px' }}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
              <div className={`p-2 rounded-lg bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                 <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-3xl font-black block" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Quick Actions - 3 Column Responsive Grid */}
      <div className="flex flex-col">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '20px' }}>
          
          <button onClick={() => navigate('/scan')}
            className="p-6 rounded-2xl border flex flex-col items-start gap-4 transition-transform hover:-translate-y-1 text-left cursor-pointer relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: '#ffffff', borderColor: 'transparent', minHeight: '160px' }}>
            <div className="p-3 bg-white/20 rounded-xl relative z-10">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">Scan Plant</h3>
              <p className="text-sm opacity-90 leading-relaxed">Upload a photo to instantly diagnose plant diseases.</p>
            </div>
          </button>

          <button onClick={() => navigate('/plants/add')}
            className="p-6 rounded-2xl border flex flex-col items-start gap-4 transition-transform hover:-translate-y-1 text-left cursor-pointer"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '160px' }}>
            <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg, rgba(5, 150, 105, 0.1))', color: 'var(--accent, #059669)' }}>
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Add New Plant</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Register a new plant to track watering and care schedules.</p>
            </div>
          </button>

          <button onClick={() => navigate('/chatbot')}
            className="p-6 rounded-2xl border flex flex-col items-start gap-4 transition-transform hover:-translate-y-1 text-left cursor-pointer"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '160px' }}>
            <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg, rgba(5, 150, 105, 0.1))', color: 'var(--accent, #059669)' }}>
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Chat with AI Bot</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Ask our AI bot any questions about plant care, soil, and watering.</p>
            </div>
          </button>

        </div>
      </div>

      {/* Main Content Area split */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '28px' }}>
        
        {/* Recent Plants List */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>My Recent Plants</h2>
            <button onClick={() => navigate('/plants')} className="text-sm font-semibold flex items-center gap-1 hover:underline transition-colors" style={{ color: 'var(--accent, #059669)' }}>
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentPlants.length === 0 ? (
            <div className="p-8 rounded-2xl border text-center flex flex-col items-center justify-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
              <Sprout className="w-12 h-12 mb-3 opacity-30" style={{ color: 'var(--accent, #059669)' }} />
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>You haven't added any plants yet.</p>
              <button onClick={() => navigate('/plants/add')} className="py-2.5 px-5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer" style={{ background: 'var(--accent, #059669)' }}>
                Add Your First Plant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '20px' }}>
              {recentPlants.map((plant) => (
                <div key={plant._id} onClick={() => navigate(`/plants/${plant._id}`)}
                  className="rounded-2xl border overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform flex flex-col"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
                  
                  <div className="h-40 relative">
                    <img src={plant.image?.url || '/fallback-plant.jpg'} alt={plant.name} className="w-full h-full object-cover block" />
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider" 
                      style={{ 
                        background: plant.status === 'healthy' ? '#10b981' : plant.status === 'diseased' ? '#f59e0b' : '#ef4444', 
                        color: 'white' 
                      }}>
                      {plant.status}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{plant.name}</h4>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{plant.type}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <Droplet className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        Next Water: {plant.waterSchedule?.nextWatering ? new Date(plant.waterSchedule.nextWatering).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gardening Tips Panel */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Gardening Tips</h2>
          <div className="p-6 rounded-2xl border flex flex-col gap-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'var(--accent-bg, rgba(5, 150, 105, 0.1))', color: 'var(--accent, #059669)' }}>
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Watering Rules</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Always check soil moisture before watering. Overwatering is the #1 cause of plant death!</p>
              </div>
            </div>
            
            <hr className="border-t w-full" style={{ borderColor: 'var(--border-light)' }} />

            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: 'var(--accent-bg, rgba(5, 150, 105, 0.1))', color: 'var(--accent, #059669)' }}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Check Leaves</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Look under leaves once a week to spot pests or early disease symptoms before they spread.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
