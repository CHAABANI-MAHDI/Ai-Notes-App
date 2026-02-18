import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit3, Trash2, ArrowLeft, Calendar, Clock, AlertCircle, Paperclip, FileText, Download } from 'lucide-react';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { Note, RoutePath } from '../../types';
import { StorageImage } from '../../components/ui/StorageImage';

export const SingleNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
      try {
        const data = await noteService.getById(id);
        if (data) setNote(data); else navigate(RoutePath.NOTES);
      } catch (err) { console.error('Failed to fetch note', err); }
      finally { setLoading(false); }
    };
    fetchNote();
  }, [id, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsConfirmOpen(false); };
    if (isConfirmOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfirmOpen]);

  const performDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    setError(null);
    try {
      await noteService.delete(id);
      navigate(RoutePath.NOTES);
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Something went wrong while deleting this note. Please try again.');
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const downloadAttachment = async (path: string) => {
    const url = await storageService.getSignedUrl(path);
    if (url) window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--app-border)', borderTopColor: 'var(--text-accent)' }} />
      </div>
    );
  }
  if (!note) return null;

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-4 animate-in fade-in duration-300 pb-8 relative">

        {/* ── Sticky Nav ── */}
        <div
          className="sticky top-2 z-20 rounded-2xl p-2 sm:p-3"
          style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', boxShadow: 'var(--card-shadow)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(RoutePath.NOTES)}
              className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-semibold transition-all duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex gap-2">
              {/* Edit */}
              <button
                onClick={() => id && navigate(RoutePath.EDIT_NOTE.replace(':id', id))}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
                style={{ border: '1.5px solid var(--app-border)', background: 'var(--app-surface)', color: 'var(--text-accent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)'; }}
              >
                <Edit3 size={12} style={{ color: 'var(--text-accent-soft)' }} /> Edit
              </button>
              {/* Delete */}
              <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
                style={{ border: '1.5px solid #fecaca', background: '#fff5f5', color: '#dc2626' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff5f5'; }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2" style={{ background: '#fff5f5', border: '1.5px solid #fecaca', color: '#dc2626' }}>
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ── Article ── */}
        <article
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
        >
          {note.thumbnailUrl && (
            <div className="h-44 sm:h-56 w-full" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
              <StorageImage path={note.thumbnailUrl} alt={note.title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="p-4 sm:p-6 md:p-8">
            <h1
              className="mb-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}
            >
              {note.title}
            </h1>

            {/* Meta */}
            <div className="mb-6 flex flex-wrap gap-3 pb-4" style={{ borderBottom: '1.5px solid var(--app-border-soft)' }}>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>
                <Calendar size={12} style={{ color: 'var(--text-accent-soft)' }} />
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>
                <Clock size={12} style={{ color: 'var(--text-accent-soft)' }} />
                {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div
              className="prose prose-sm sm:prose-base max-w-none leading-7"
              style={{ color: 'var(--text-secondary)' }}
              dangerouslySetInnerHTML={{ __html: note.content }}
            />

            {/* Attachments */}
            {note.attachments && note.attachments.length > 0 && (
              <div className="mt-12 pt-8" style={{ borderTop: '1.5px solid var(--app-border-soft)' }}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Paperclip size={15} style={{ color: 'var(--text-accent-soft)' }} />
                  Attachments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {note.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                      style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; }}
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'var(--badge-purple-bg)', border: '1px solid var(--card-border)', color: 'var(--text-accent)' }}>
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{att.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-accent-soft)' }}>{(att.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        onClick={() => downloadAttachment(att.path)}
                        className="rounded-xl p-2 transition-all duration-150"
                        style={{ color: 'var(--text-accent-soft)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent-soft)'; }}
                        title="Download"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="relative w-full max-w-md rounded-3xl px-8 py-7 overflow-hidden"
            style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', boxShadow: '0 20px 60px rgba(2,6,23,0.45)' }}
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute top-0 left-0 w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(99,102,241,0.05))', borderRadius: 'inherit' }} />

            <div className="relative z-10 space-y-2 mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(244,63,94,0.12)', border: '1.5px solid rgba(244,63,94,0.35)' }}>
                <Trash2 size={20} style={{ color: '#fb7185' }} />
              </div>
              <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>Delete this note?</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This action cannot be undone. Are you sure you want to permanently delete this note?
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{ border: '1.5px solid var(--app-border)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)')}
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', boxShadow: '0 10px 26px rgba(225,29,72,0.45)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 14px 34px rgba(225,29,72,0.55)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 10px 26px rgba(225,29,72,0.45)')}
              >
                {isDeleting ? 'Deleting...' : 'Delete note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};