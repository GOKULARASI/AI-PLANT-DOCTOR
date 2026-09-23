import { useEffect, useState } from 'react';
import { adminService } from '@/services/endpoints';
import { Users, Trash2, Shield, ShieldOff, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getUsers()
      .then((res) => { if (res.data?.success) setUsers(res.data.data || []); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUser(id, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: newRole } : u));
      toast.success(`Role changed to ${newRole}`);
    } catch { toast.error('Failed to update role'); }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: '32px' }}>
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Manage Users 👥</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{users.length} registered users</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
          style={{ padding: '10px 16px 10px 36px', background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }} />
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="w-full border-collapse text-left" style={{ minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-default)' }}>
                {['User', 'Email', 'Role', 'Verified', 'Actions'].map((h) => (
                  <th key={h} className="text-xs font-bold uppercase tracking-wider" style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-sm" style={{ padding: '48px', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    No users found.
                  </td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user._id} className="border-t" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-light)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div className="flex items-center" style={{ gap: '12px' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="text-sm" style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{user.email}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span 
                      className="text-xs font-bold rounded-full" 
                      style={{ 
                        padding: '4px 10px', 
                        background: user.role === 'admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: user.role === 'admin' ? '#a855f7' : '#10b981'
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span 
                      className="text-xs font-bold rounded-full" 
                      style={{ 
                        padding: '4px 10px', 
                        background: user.isVerified ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: user.isVerified ? '#3b82f6' : '#6b7280'
                      }}
                    >
                      {user.isVerified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div className="flex" style={{ gap: '8px' }}>
                      <button onClick={() => toggleRole(user._id, user.role)}
                        className="rounded-lg transition-colors" title="Toggle role"
                        style={{ padding: '6px', color: '#a855f7' }}
                      >
                        {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(user._id)}
                        className="rounded-lg transition-colors" title="Delete user"
                        style={{ padding: '6px', color: '#f43f5e' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
