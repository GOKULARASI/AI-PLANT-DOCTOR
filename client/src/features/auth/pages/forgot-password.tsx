import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/endpoints';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const response = await authService.forgotPassword(email);
      if (response.data?.success) {
        setSuccess(true);
      } else {
        setError(response.data?.message || 'Failed to send password reset link');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border shadow-xl glass animate-fade-in"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Reset Password
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          We will send a password reset link to your email
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
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Check your email</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
          </p>
          <div className="pt-4">
            <Link to="/login" className="btn-primary py-2.5 px-6 rounded-xl inline-flex items-center gap-2 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl text-base flex items-center justify-center gap-2 mt-2 font-bold cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" /> Send Reset Link
              </>
            )}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: '#059669' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
