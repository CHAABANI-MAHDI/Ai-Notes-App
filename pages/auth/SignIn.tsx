import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Command, Mail, Lock, CheckCircle, Sparkles, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RoutePath } from '../../types';
import { supabase } from '../../supabaseClient';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const successMessage = location.state?.successMessage;
  const prefilledEmail = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert(error.message); } else { navigate(RoutePath.HOME); }
    } catch (err) {
      console.error('Login error:', err);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) {
        if (error.message?.toLowerCase().includes('provider') && error.message?.toLowerCase().includes('not enabled')) {
          alert('Google sign-in is not enabled in Supabase. Enable the Google provider in your Supabase Auth settings.');
        } else {
          alert(error.message);
        }
        setLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      alert('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);
    setForgotLoading(true);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      setForgotLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/#${RoutePath.RESET_PASSWORD}`,
      });
      if (error) {
        setForgotError(error.message || 'Failed to send reset email. Please try again.');
      } else {
        setForgotSuccess(true);
        setForgotEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotError('An unexpected error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8"
      style={{ background: 'var(--app-bg)' }}
    >
      <div className="mx-auto mb-6 flex max-w-5xl justify-end">
        <ThemeToggle />
      </div>

      <div
        className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl lg:grid-cols-2"
        style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--card-border)',
          boxShadow: 'var(--card-shadow-hover)',
        }}
      >
        {/* ── Left Panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 50%, #7c3aed 100%)' }}
        >
          {/* Blobs */}
          <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full"
            style={{ background: 'rgba(255,255,255,0.09)', filter: 'blur(40px)' }} />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full"
            style={{ background: 'rgba(167,139,250,0.15)', filter: 'blur(48px)' }} />
          <div className="pointer-events-none absolute top-1/2 right-8 h-36 w-36 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', filter: 'blur(24px)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.30)' }}
            >
              <Command size={20} />
            </div>
            <p className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>AI Notes</p>
          </div>

          {/* Headline */}
          <div className="relative z-10">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
            >
              <Sparkles size={11} /> Your workspace awaits
            </div>
            <h2 className="text-3xl font-extrabold leading-tight" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}>
              Write smarter, every day.
            </h2>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Continue where you left off and keep all your notes in one clean dashboard.
            </p>
          </div>

          {/* Feature list */}
          <div className="relative z-10 space-y-3">
            {['Fast note creation', 'Secure cloud sync', 'Rich editor with attachments'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.20)' }}
                >✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="p-6 sm:p-10">
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}
          >
            Sign In
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back to your workspace.</p>

          {/* Success message */}
          {successMessage && (
            <div
              className="mt-5 flex items-start gap-2.5 rounded-xl p-3.5 text-sm"
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                color: '#166534',
              }}
            >
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: '#16a34a' }} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={prefilledEmail} placeholder="name@example.com" icon={Mail} />
            
            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-accent-soft)' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl py-2.5 pl-10 pr-10 text-sm outline-none transition-all duration-150"
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

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--text-accent)' }}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="font-bold transition-colors duration-150"
                style={{ color: 'var(--text-accent)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--primary-600)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
              }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)')}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'var(--app-border-soft)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>or</span>
            <div className="h-px flex-1" style={{ background: 'var(--app-border-soft)' }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
            style={{
              border: '1.5px solid var(--app-border)',
              background: 'var(--app-surface)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--card-shadow)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
            }}
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.1333 0 4.0833.7333 5.6333 1.95L15.4 8.0167c-1.0833-.8667-2.2833-1.3-3.4-1.3-3.05 0-5.5167 2.4667-5.5167 5.2833s2.4667 5.2833 5.5167 5.2833c2.6167 0 4.4333-1.5833 4.8833-4.0833h-4.8833v-2.8h7.95c.1.5167.15 1.05.15 1.6167 0 4.6333-3.1667 8.4333-8.1 8.4333z" fill="currentColor" />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to={RoutePath.SIGNUP}
              className="font-bold transition-colors duration-150"
              style={{ color: 'var(--text-accent)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--primary-600)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(30,27,75,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowForgotPassword(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col px-8 py-8 animate-in scale-in duration-300"
            style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow-hover)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="absolute right-4 top-4 p-2 transition-colors duration-150 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>

            {/* Icon Badge */}
            <div
              className="flex items-center justify-center h-16 w-16 rounded-full mb-6 mx-auto"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #c084fc)', boxShadow: '0 8px 32px rgba(167,139,250,0.28)' }}
            >
              <Mail size={32} style={{ color: '#ffffff', strokeWidth: 2.5 }} />
            </div>

            {/* Heading */}
            <h3
              className="text-center text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Reset Password
            </h3>

            {/* Description */}
            <p className="text-center text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {/* Error Message */}
            {forgotError && (
              <div
                className="mb-6 rounded-xl p-4 flex gap-3 animate-in fade-in duration-200"
                style={{ background: '#fee2e2', border: '1.5px solid #fecaca' }}
              >
                <AlertCircle size={18} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
                <p className="text-sm" style={{ color: '#991b1b' }}>
                  {forgotError}
                </p>
              </div>
            )}

            {/* Success Message */}
            {forgotSuccess && (
              <div
                className="mb-6 rounded-xl p-4 flex gap-3 animate-in fade-in duration-200"
                style={{ background: '#dcfce7', border: '1.5px solid #bbf7d0' }}
              >
                <CheckCircle size={18} style={{ color: '#15803d', marginTop: '2px', flexShrink: 0 }} />
                <p className="text-sm" style={{ color: '#166534' }}>
                  Check your email for a password reset link!
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="ml-1 mb-2 block text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-accent-soft)' }} />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={forgotLoading || forgotSuccess}
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all duration-150 disabled:opacity-60"
                    style={{
                      border: '1.5px solid var(--input-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-400)')}
                    onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotLoading || forgotSuccess}
                className="w-full rounded-xl px-5 py-3 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.28)' }}
              >
                {forgotLoading ? 'Sending...' : forgotSuccess ? 'Email Sent!' : 'Send Reset Link'}
              </button>

              {/* Back to login */}
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                disabled={forgotLoading}
                className="w-full rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150"
                style={{ border: '1.5px solid var(--input-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                Back to Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};