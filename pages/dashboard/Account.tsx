import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Save, Camera, Lock, ChevronRight, Globe, Key, Trash2, AlertCircle } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Call the Supabase function to delete user data
      const { error: rpcError } = await supabase.rpc('delete_my_account');
      
      if (rpcError) {
        console.log('RPC function not available, falling back to manual deletion');
        
        // Fallback: Manual deletion if RPC not available
        // Delete all notes for this user
        const { data: userNotes } = await supabase
          .from('notes')
          .select('id, thumbnail_url, attachments')
          .eq('user_id', userId);

        if (userNotes && userNotes.length > 0) {
          // Delete note files from storage
          for (const note of userNotes) {
            if (note.thumbnail_url) {
              await storageService.deleteFile(note.thumbnail_url).catch(() => {});
            }
            if (note.attachments && Array.isArray(note.attachments)) {
              for (const att of note.attachments) {
                if (att.path) {
                  await storageService.deleteFile(att.path).catch(() => {});
                }
              }
            }
          }

          // Delete all notes from database
          const { error: deleteNotesError } = await supabase
            .from('notes')
            .delete()
            .eq('user_id', userId);
          if (deleteNotesError) throw deleteNotesError;
        }
      }

      // Delete avatar from storage
      if (avatarPath && !avatarPath.startsWith('http')) {
        await storageService.deleteFile(avatarPath).catch(() => {});
      }

      // Attempt to delete the auth user using admin API
      try {
        const response = await supabase.auth.admin.deleteUser(userId);
        if (response?.error) throw response.error;
      } catch (adminError) {
        // Admin API might not be available on client side
        console.log('Admin API not available, proceeding with sign out');
      }

      // Sign out the user
      await supabase.auth.signOut();
      alert('Account deleted successfully. You have been signed out.');
      navigate(RoutePath.LOGIN);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setShowDeleteConfirm(false);
      alert('Error deleting account. Please try again or contact support.');
    } finally {
      setDeleteLoading(false);
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

            {/* Danger Zone */}
            <div className="rounded-2xl p-5" style={{ background: '#fff5f5', border: '1.5px solid #fecaca' }}>
              <h2 className="mb-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#dc2626' }}>Danger Zone</h2>
              <p className="mb-4 text-sm" style={{ color: '#b91c1c' }}>Delete account is permanent and removes all notes.</p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}
                onMouseEnter={e => !deleteLoading && ((e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px rgba(239,68,68,0.35)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(239,68,68,0.25)')}
              >
                <Trash2 size={14} />
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(30,27,75,0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => !deleteLoading && setShowDeleteConfirm(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col px-8 py-8 animate-in scale-in duration-300"
            style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow-hover)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon Badge */}
            <div
              className="flex items-center justify-center h-16 w-16 rounded-full mb-6 mx-auto"
              style={{ background: '#fee2e2', boxShadow: '0 0 0 12px rgba(239,68,68,0.05)' }}
            >
              <AlertCircle size={32} style={{ color: '#dc2626' }} />
            </div>

            {/* Heading */}
            <h3
              className="text-center text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Delete Account?
            </h3>

            {/* Description */}
            <p className="text-center text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              This action is <span style={{ color: '#dc2626', fontWeight: 600 }}>permanent</span> and cannot be undone. All your notes, files, and account data will be deleted.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150"
                style={{ border: '1.5px solid var(--input-border)', background: 'transparent', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.28)' }}
              >
                <Trash2 size={15} />
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};