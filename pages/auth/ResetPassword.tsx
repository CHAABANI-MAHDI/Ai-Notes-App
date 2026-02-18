import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { RoutePath } from '../../types';
import { Input } from '../../components/ui/Input';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is in password recovery flow
    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    checkRecoverySession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!password.trim()) {
      setError('Please enter a new password.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(RoutePath.LOGIN);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
      {/* Gradient orbs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-10" style={{ background: 'linear-gradient(135deg, #a78bfa, #c084fc)' }} />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-10" style={{ background: 'linear-gradient(135deg, #a78bfa, #c084fc)' }} />

      <div className="relative flex h-screen items-center justify-center px-4">
        <div className="w-full max-w-md animate-in fade-in duration-500">
          {/* Header */}
          <div className="mb-8 text-center">
            <button
              type="button"
              onClick={() => navigate(RoutePath.LOGIN)}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150"
              style={{ border: '1.5px solid var(--input-border)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#ffffff', fontFamily: "'DM Sans', sans-serif" }}>
              Reset Password
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create a new password to regain access to your account</p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleResetPassword}>
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
            >
              {/* Error Message */}
              {error && (
                <div
                  className="mb-6 rounded-xl p-4 flex gap-3 animate-in fade-in duration-200"
                  style={{ background: '#fee2e2', border: '1.5px solid #fecaca' }}
                >
                  <div style={{ color: '#dc2626', marginTop: '2px' }}>
                    <AlertCircleIcon size={18} />
                  </div>
                  <p className="text-sm flex-1" style={{ color: '#991b1b' }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div
                  className="mb-6 rounded-xl p-4 flex gap-3 animate-in fade-in duration-200"
                  style={{ background: '#dcfce7', border: '1.5px solid #bbf7d0' }}
                >
                  <div style={{ color: '#15803d' }}>
                    <Check size={18} />
                  </div>
                  <p className="text-sm flex-1" style={{ color: '#166534' }}>
                    Password reset successfully! Redirecting to login...
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {/* New Password */}
                <div className="relative">
                  <label className="ml-1 mb-2 block text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-accent-soft)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                      className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 disabled:opacity-60"
                      style={{
                        border: '1.5px solid var(--input-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-400)')}
                      onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150"
                      style={{ color: 'var(--text-accent-soft)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent-soft)')}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="ml-1 mb-2 block text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-accent-soft)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                      className="w-full rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150 disabled:opacity-60"
                      style={{
                        border: '1.5px solid var(--input-border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-400)')}
                      onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150"
                      style={{ color: 'var(--text-accent-soft)' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent-soft)')}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.28)' }}
              >
                {loading ? 'Resetting...' : success ? 'Reset Complete!' : 'Reset Password'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate(RoutePath.LOGIN)}
              className="font-semibold transition-colors duration-150"
              style={{ color: 'var(--text-accent)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.8')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Icon component for error
const AlertCircleIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
