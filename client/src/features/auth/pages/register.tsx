import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/endpoints';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.register({ name, email, password });
      if (response.data?.success) {
        const { user, token } = response.data.data;
        setAuth(user, token);
        toast.success('Registration successful! Welcome.');
        navigate('/dashboard');
      } else {
        setError(response.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email already exists or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border shadow-xl glass animate-fade-in"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Get Started
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Create your free PlantSense AI account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3 border bg-red-500/10 text-red-500 text-sm font-medium"
             style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5 w-full">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-light)' }}>
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="space-y-1.5 w-full">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-light)' }}>
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-light)' }} />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="space-y-1.5 w-full">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-light)' }}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-light)' }} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-medium"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 rounded-xl text-base flex items-center justify-center gap-2 mt-2 font-bold cursor-pointer disabled:opacity-50 transition-all"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" /> Sign Up
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link to="/login" className="font-bold hover:underline" style={{ color: '#059669' }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
