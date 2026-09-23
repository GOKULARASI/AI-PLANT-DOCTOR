import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/endpoints';
import { Lock, ArrowLeft, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.resetPassword(token || '', password);
      if (response.data?.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        setError(response.data?.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border shadow-xl glass animate-fade-in"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Create New Password
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Enter a strong, secure password for your account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-3 border bg-red-500/10 text-red-500 text-sm font-medium"
             style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Password Reset Complete</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
          <div className="pt-4">
            <Link to="/login" className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
              Go to Login <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-light)' }}>
              New Password
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--text-light)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-light)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <RefreshCw className="w-5 h-5" /> Reset Password
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
