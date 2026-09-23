import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/endpoints';
import { User, Mail, Phone, MapPin, Loader2, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', bio: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', location: user.location || '', bio: user.bio || '' });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authService.updateProfile(form);
      if (res.data?.success) {
        setUser(res.data.data);
        toast.success('Profile updated!');
      }
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      setPwLoading(true);
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to change password'); }
    finally { setPwLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500/40";
  const inputStyle = { background: 'var(--bg-card)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Profile ⚙️</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account information and settings</p>
      </div>

      {/* Avatar */}
      <div className="p-6 rounded-2xl border flex items-center gap-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl">
          {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : '🌿'}
        </div>
        <div>
          <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <div className="flex gap-2 mt-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {user?.role}
            </span>
            {user?.isVerified && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">Verified ✓</span>}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-light)' }}>
          <User className="w-4 h-4" /> Personal Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="your@email.com" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="City, Country" className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us about yourself..."
            className={inputClass} style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
        <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-light)' }}>
          <Lock className="w-4 h-4" /> Change Password
        </h2>
        {[
          { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
          { name: 'newPassword', label: 'New Password', placeholder: 'Min 6 characters' },
          { name: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
            <input type="password" value={(pwForm as any)[f.name]}
              onChange={(e) => setPwForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
              placeholder={f.placeholder} className={inputClass} style={inputStyle} />
          </div>
        ))}
        <button type="submit" disabled={pwLoading} className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
          {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Update Password
        </button>
      </form>
    </div>
  );
}
