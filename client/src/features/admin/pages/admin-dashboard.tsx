import { useEffect, useState } from 'react';
import { adminService } from '@/services/endpoints';
import { Users, Activity, BarChart2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => { if (res.data?.success) setStats(res.data.data); })
      .catch(() => toast.error('Failed to load admin dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Plants', value: stats?.totalPlants ?? '—', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Scans', value: stats?.totalScans ?? '—', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Active Today', value: stats?.activeToday ?? '—', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin Dashboard 🛡️</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Overview of the PlantSense platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="p-6 rounded-2xl border flex items-center justify-between" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>{card.label}</p>
              <h3 className="text-3xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>{card.value}</h3>
            </div>
            <div className={`p-3.5 rounded-xl ${card.bg} ${card.color}`}><card.icon className="w-6 h-6" /></div>
          </div>
        ))}
      </div>

      {stats?.recentUsers && (
        <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Recent Users</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((u: any) => (
              <div key={u._id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
