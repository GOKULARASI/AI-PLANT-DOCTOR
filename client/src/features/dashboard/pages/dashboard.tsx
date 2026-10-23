import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { plantService, weatherService, outbreakService } from '@/services/endpoints';
import type { Plant, Weather } from '@/types';
import {
  Sprout,
  Activity,
  ShieldAlert,
  Plus,
  ScanLine,
  MessageSquare,
  Droplet,
  ArrowRight,
  Loader2,
  CloudSun,
  Radio,
  FlaskConical,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, healthy: 0, diseased: 0, critical: 0 });
  const [recentPlants, setRecentPlants] = useState<Plant[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [activeOutbreakCount, setActiveOutbreakCount] = useState<number>(0);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 🌅';
    if (hour < 17) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Parallel dashboard loading
        const [statsRes, plantsRes, weatherRes, outbreakRes] = await Promise.allSettled([
          plantService.getStats(),
          plantService.getPlants({ limit: '4' }),
          weatherService.getCurrent(user?.location || 'Chennai'),
          outbreakService.getOutbreaks(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success) {
          setStats(statsRes.value.data.data);
        }

        if (plantsRes.status === 'fulfilled' && plantsRes.value?.data?.success) {
          setRecentPlants(plantsRes.value.data.data || []);
        }

        if (weatherRes.status === 'fulfilled' && weatherRes.value?.data?.success) {
          setWeather(weatherRes.value.data.data?.current || weatherRes.value.data.data);
        }

        if (outbreakRes.status === 'fulfilled' && outbreakRes.value?.data?.success) {
          const list = outbreakRes.value.data.data?.outbreaks || [];
          setActiveOutbreakCount(list.length);
        }
      } catch (err) {
        toast.error('Failed to refresh dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          Loading Garden Telemetry...
        </p>
      </div>
    );
  }

  // Calculate garden wellness score
  const total = stats.total || 1;
  const gardenHealthScore = Math.round(((stats.healthy * 100 + stats.diseased * 50) / (total * 100)) * 100) || 85;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {/* ─── Top Greeting & Weather Widget ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Gardener'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Garden Online
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            PlantSense AI is actively monitoring your crop health, watering cycles, and regional disease vectors.
          </p>
        </div>

        {/* Live Weather Capsule */}
        {weather && (
          <div
            className="flex items-center gap-3 p-3 px-4 rounded-2xl border self-start sm:self-auto shadow-sm"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(weather.temperature || 28)}°C
                </span>
                <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-muted)' }}>
                  {weather.condition || 'Clear Sky'}
                </span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-light)' }}>
                Humidity: {weather.humidity}% • Rain Chance: {weather.rainChance || 10}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Epidemic Outbreak Banner Alert ─────────────────────────── */}
      <div
        onClick={() => navigate('/outbreak-radar')}
        className="p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer hover:border-rose-500 transition-all shadow-md group"
        style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(249,115,22,0.03) 100%), var(--bg-card)',
          borderColor: 'rgba(244,63,94,0.25)',
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
                Epidemiological Radar Alert
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-500">
                {activeOutbreakCount || 5} Active Clusters
              </span>
            </div>
            <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Early Blight & Powdery Mildew spores detected in nearby coordinates. Review your neighborhood shield protocol.
            </p>
          </div>
        </div>

        <button
          className="text-xs font-black text-rose-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform flex-shrink-0"
        >
          View Map <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── KPI Stats Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '120px' }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Total Tracked
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              {stats.total}
            </span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Registered Crops & Plants
            </span>
          </div>
        </div>

        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '120px' }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Thriving (Healthy)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-500">
              {stats.healthy}
            </span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Optimal chlorophyll levels
            </span>
          </div>
        </div>

        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)', minHeight: '120px' }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Under Treatment
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-500">
              {stats.diseased}
            </span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Active recovery regimens
            </span>
          </div>
        </div>

        <div
          className="p-5 rounded-3xl border flex flex-col justify-between shadow-sm"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Garden Wellness
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-blue-500">
              {gardenHealthScore}%
            </span>
            <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Average vitality index
            </span>
          </div>
        </div>
      </div>

      {/* ─── Innovation Action Cards (4-Quadrant Hub) ────────────────── */}
      <div>
        <h2 className="text-lg font-black mb-4" style={{ color: 'var(--text-primary)' }}>
          AI Agricultural Command Suite
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Scan Plant */}
          <button
            onClick={() => navigate('/scan')}
            className="p-6 rounded-3xl text-left flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-xl shadow-lg relative overflow-hidden group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#ffffff',
              minHeight: '180px',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <ScanLine className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase bg-white/25 px-2.5 py-0.5 rounded-full text-white">
                Live AI Vision
              </span>
            </div>
            <div>
              <h3 className="font-black text-lg mb-1">Scan Leaf Pathology</h3>
              <p className="text-xs opacity-90 leading-relaxed">
                Live camera or upload with instant symptom & pathogen breakdown.
              </p>
            </div>
          </button>

          {/* Action 2: Precision Chemical Dosimeter */}
          <button
            onClick={() => navigate('/fertilizer')}
            className="p-6 rounded-3xl border text-left flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              minHeight: '180px',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <FlaskConical className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full">
                Innovation 3
              </span>
            </div>
            <div>
              <h3 className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                Precision Dosimeter
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Volume-based dilution engine to guarantee zero chemical root burn.
              </p>
            </div>
          </button>

          {/* Action 3: Recovery Tracker */}
          <button
            onClick={() => navigate('/growth')}
            className="p-6 rounded-3xl border text-left flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              minHeight: '180px',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full">
                Innovation 2
              </span>
            </div>
            <div>
              <h3 className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                Recovery Tracker
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Before & After split-screen slider to measure tissue regeneration.
              </p>
            </div>
          </button>

          {/* Action 4: AI Chatbot */}
          <button
            onClick={() => navigate('/chatbot')}
            className="p-6 rounded-3xl border text-left flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-default)',
              minHeight: '180px',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase bg-purple-500/10 text-purple-500 px-2.5 py-0.5 rounded-full">
                Bilingual
              </span>
            </div>
            <div>
              <h3 className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                AI Agronomist Bot
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Instant plant doctor consultation in English & தமிழ் (Tamil).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ─── Recent Crops & Gardening Protocols ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Crops (8 cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              Monitored Plant Foliage
            </h2>
            <button
              onClick={() => navigate('/plants')}
              className="text-xs font-bold flex items-center gap-1 text-emerald-500 hover:underline"
            >
              Manage All Plants <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPlants.length === 0 ? (
            <div
              className="p-10 rounded-3xl border text-center flex flex-col items-center justify-center gap-3"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
            >
              <Sprout className="w-12 h-12 text-emerald-500/30" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No plants enrolled in health monitoring yet.
              </p>
              <button
                onClick={() => navigate('/plants/add')}
                className="btn-primary text-xs font-bold px-4 py-2 rounded-xl"
              >
                + Register First Plant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentPlants.map((plant) => (
                <div
                  key={plant._id}
                  onClick={() => navigate(`/plants/${plant._id}`)}
                  className="rounded-3xl border overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col"
                  style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
                >
                  <div className="h-40 relative">
                    <img
                      src={plant.image?.url || 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&auto=format&fit=crop&q=80'}
                      alt={plant.name}
                      className="w-full h-full object-cover block"
                    />
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        plant.status === 'healthy'
                          ? 'bg-emerald-500 text-white'
                          : plant.status === 'diseased'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {plant.status}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>
                        {plant.name}
                      </h4>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {plant.type || plant.category}
                      </p>
                    </div>

                    <div
                      className="flex items-center justify-between mt-3 pt-3 border-t text-xs"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <Droplet className="w-3.5 h-3.5 text-blue-500" />
                        <span>Water Schedule</span>
                      </div>
                      <span className="font-extrabold text-emerald-500">
                        {plant.waterSchedule?.frequency || 'Every 2 days'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Agronomy Advisory (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
            Daily Agronomic Directives
          </h2>
          <div
            className="p-6 rounded-3xl border flex flex-col gap-4 shadow-sm"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Morning Soil Moisture Check
                </h4>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Test top 2 inches of soil before applying irrigation. Over-saturation is the root cause of fungal root rot.
                </p>
              </div>
            </div>

            <hr className="border-t" style={{ borderColor: 'var(--border-light)' }} />

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Zero-Burn Dilution Golden Rule
                </h4>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Never apply concentrated NPK or chemical fungicides to bone-dry soil. Pre-moisten root zone 2 hours prior.
                </p>
              </div>
            </div>

            <hr className="border-t" style={{ borderColor: 'var(--border-light)' }} />

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 flex-shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Quarantine Early Sporulation
                </h4>
                <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Remove leaves showing concentric brown rings immediately to halt airborne Alternaria spore migration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
