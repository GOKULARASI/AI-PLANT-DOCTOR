import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '@/services/endpoints';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authService.verifyEmail(token || '');
        if (response.data?.success) {
          setSuccess(true);
          setMessage(response.data.message || 'Your email has been verified successfully.');
        } else {
          setSuccess(false);
          setMessage(response.data?.message || 'Verification failed. The token may be invalid or expired.');
        }
      } catch (err: any) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'An error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border shadow-xl glass text-center animate-fade-in"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      {loading ? (
        <div className="py-12 space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Verifying email...</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Please wait while we verify your account.</p>
        </div>
      ) : success ? (
        <div className="py-8 space-y-5">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Email Verified!</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {message} You can now access your full account features.
          </p>
          <div className="pt-4">
            <Link to="/login" className="btn-primary py-2.5 px-6 rounded-xl inline-flex items-center gap-2 text-sm font-bold">
              Sign In to Account
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-8 space-y-5">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-red-500">Verification Failed</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
          <div className="pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: '#059669' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
