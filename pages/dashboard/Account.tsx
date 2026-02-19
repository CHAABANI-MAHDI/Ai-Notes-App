import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Save, Camera, ChevronRight, Globe, Key, Download } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../supabaseClient';
import { RoutePath } from '../../types';
import { storageService } from '../../services/storageService';
import { StorageImage } from '../../components/ui/StorageImage';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({ fullName: '', displayName: '', timezone: 'UTC-8 (Pacific Time)' });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate(RoutePath.LOGIN); return; }
        setUserId(user.id);
        setEmail(user.email || '');
        setAvatarPath(user.user_metadata?.avatar_url || null);
        setFormData({
          fullName: user.user_metadata?.full_name || '',
          displayName: user.user_metadata?.display_name || '',
          timezone: user.user_metadata?.timezone || 'UTC-8 (Pacific Time)',
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userId) {
      try {
        setLoading(true);
        const path = await storageService.uploadUserFile(userId, 'avatars', userId, file);
        if (avatarPath && !avatarPath.startsWith('http')) {
          await storageService.deleteFile(avatarPath);
        }
        setAvatarPath(path);
        const { error } = await supabase.auth.updateUser({ data: { avatar_url: path } });
        if (error) throw error;
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName, display_name: formData.displayName, timezone: formData.timezone },
      });
      if (error) throw error;
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) return;
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset-password` });
      if (error) alert(`Error: ${error.message}`);
      else alert('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      alert('Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleExportNotes = async () => {
    setExportLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const payload = {
        exportedAt: new Date().toISOString(),
        userId,
        notes: data || [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-notes-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting notes:', error);
      alert('Failed to export notes. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(RoutePath.LOGIN);
  };

  if (fetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--app-border)', borderTopColor: 'var(--text-accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-accent-soft)' }}>Loading account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-16 animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Header Card ── */}
        <section
          className="rounded-2xl p-6"
          style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div
                className="group relative cursor-pointer"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <div
                  className="h-20 w-20 overflow-hidden rounded-full transition-all duration-200"
                  style={{ border: '2.5px solid var(--primary-300)', boxShadow: 'var(--card-shadow)' }}
                >
                  {avatarPath ? (
                    <StorageImage path={avatarPath} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: 'var(--badge-soft-bg)', color: 'var(--text-accent-soft)' }}>
                      <User size={32} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 rounded-full p-2 transition-all duration-150"
                  style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', boxShadow: 'var(--card-shadow)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--app-surface)')}
                >
                  <Camera size={14} style={{ color: 'var(--text-accent)' }} />
                </button>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.3px' }}>
                  Account
                </h1>
                <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Mail size={13} style={{ color: 'var(--text-accent-soft)' }} />
                  {email}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.30)' }}
              onMouseEnter={e => !loading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 22px rgba(99,102,241,0.40)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(99,102,241,0.30)')}
            >
              <Save size={15} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* ── Profile + Security Grid ── */}
        <section className="grid gap-5 lg:grid-cols-2">

          {/* Profile */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
            <h2 className="mb-4 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>Profile</h2>
            <div className="space-y-4">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Jane Doe" />
              <Input label="Display Name" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="Jane" />
              <div>
                <label className="ml-1 mb-2 block text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>Timezone</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-accent-soft)' }} />
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl py-3 pl-10 pr-10 text-sm outline-none transition-all duration-150"
                    style={{
                      border: '1.5px solid var(--input-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-400)')}
                    onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')}
                  >
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (London)</option>
                    <option>UTC+1 (Paris)</option>
                    <option>UTC+9 (Tokyo)</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90" size={14} style={{ color: 'var(--text-accent-soft)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Security */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
              <h2 className="mb-4 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>Security</h2>
              <div
                className="flex items-center justify-between rounded-xl p-3.5 transition-all duration-150"
                style={{ border: '1.5px solid var(--app-border-soft)', background: 'var(--input-bg)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl p-2.5" style={{ background: 'var(--badge-purple-bg)' }}>
                    <Key size={15} style={{ color: 'var(--text-accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Password</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Reset your password by email</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                  style={{ border: '1.5px solid var(--app-border)', background: 'var(--app-surface)', color: 'var(--text-accent)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)';
                  }}
                >
                  {resetLoading ? 'Sending...' : 'Reset'}
                </button>
              </div>
            </div>

            {/* Export Notes */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
              <h2 className="mb-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>Export Notes</h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Download a JSON backup of your notes and attachments metadata.</p>
              <button
                type="button"
                onClick={handleExportNotes}
                disabled={exportLoading}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 12px rgba(34,197,94,0.25)' }}
                onMouseEnter={e => !exportLoading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(34,197,94,0.35)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(34,197,94,0.25)')}
              >
                <Download size={14} />
                {exportLoading ? 'Exporting...' : 'Export Notes'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer Bar ── */}
        <section
          className="flex items-center justify-between rounded-2xl p-4"
          style={{ background: 'var(--input-bg)', border: '1.5px solid var(--app-border-soft)' }}
        >
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-semibold transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#dc2626')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
          >
            Sign Out
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(RoutePath.HOME)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150"
              style={{ border: '1.5px solid var(--app-border)', background: 'var(--app-surface)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--app-surface)')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.28)' }}
            >
              <Save size={14} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </section>
      </form>

    </div>
  );
};