import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Command, Mail, Lock, User, Smile, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RoutePath } from '../../types';
import { supabase } from '../../supabaseClient';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const displayName = formData.get('displayName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, display_name: displayName } },
      });
      if (error) {
        alert(error.message);
      } else {
        navigate(RoutePath.LOGIN, {
          state: {
            email,
            successMessage: 'Your account has been created. Please check your email and verify your address before logging in.',
          },
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
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
              <Sparkles size={11} /> Free to get started
            </div>
            <h2 className="text-3xl font-extrabold leading-tight" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}>
              Start your personal note system.
            </h2>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Create an account and organize ideas, tasks, and knowledge in one smart workspace.
            </p>
          </div>

          {/* Feature list */}
          <div className="relative z-10 space-y-3">
            {['Structured note dashboard', 'Rich writing editor', 'Ready for daily workflows'].map((f) => (
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
            Create Account
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Set up your workspace in less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input id="fullName" name="fullName" type="text" required placeholder="Full Name" icon={User} />
            <Input id="displayName" name="displayName" type="text" required placeholder="Display Name (e.g. Jane)" icon={Smile} />
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="name@example.com" icon={Mail} />
            
            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-accent-soft)' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
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
              {loading ? 'Creating account...' : 'Create Account'}
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
            Already have an account?{' '}
            <Link
              to={RoutePath.LOGIN}
              className="font-bold transition-colors duration-150"
              style={{ color: 'var(--text-accent)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--primary-600)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};