import React, { useEffect, useMemo, useState, useDeferredValue, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ArrowUpRight, Calendar, Search, LayoutGrid, List, Trash2, AlertCircle, X } from 'lucide-react';
import { Note, RoutePath } from '../../types';
import { noteService } from '../../services/noteService';
import { StorageImage } from '../../components/ui/StorageImage';

type ViewMode = 'grid' | 'list';

export const MyNotes: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try { const data = await noteService.getAll(); setNotes(data); }
      catch (error) { console.error('Failed to fetch notes', error); }
      finally { setLoading(false); }
    };
    fetchNotes();
  }, []);

  const getPreviewText = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleDeleteNote = useCallback(async (noteId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setDeleting(true);
    try {
      await noteService.delete(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete note', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeleting(false);
    }
  }, [notes]);

  const previewsById = useMemo(() => {
    const map = new Map<string, string>();
    notes.forEach(note => {
      map.set(note.id, getPreviewText(note.content));
    });
    return map;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) return notes;
    return notes.filter((note) => {
      const preview = previewsById.get(note.id) || '';
      return `${note.title} ${preview}`.toLowerCase().includes(normalized);
    });
  }, [notes, previewsById, deferredQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">

      {/* ── Header ── */}
      <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>My Notes</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Browse, open, and continue your latest drafts.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap lg:flex-nowrap">
            {/* Search */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-150 order-2 sm:order-1"
              style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)' }}
            >
              <Search size={15} style={{ color: 'var(--text-accent-soft)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full sm:w-52 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* View mode toggle */}
            <div
              className="flex items-center rounded-xl p-1 gap-0.5 order-3 sm:order-2"
              style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150"
                style={viewMode === 'grid'
                  ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#ffffff', boxShadow: '0 2px 8px rgba(99,102,241,0.28)' }
                  : { background: 'transparent', color: 'var(--text-accent-soft)' }
                }
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150"
                style={viewMode === 'list'
                  ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#ffffff', boxShadow: '0 2px 8px rgba(99,102,241,0.28)' }
                  : { background: 'transparent', color: 'var(--text-accent-soft)' }
                }
              >
                <List size={14} />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Create */}
            <button
              onClick={() => navigate(RoutePath.CREATE_NOTE)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 order-1 sm:order-3"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.28)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 22px rgba(99,102,241,0.38)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(99,102,241,0.28)')}
            >
              <Plus size={16} /> <span className="hidden sm:inline">Create Note</span><span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 animate-pulse rounded-2xl" style={{ background: 'var(--badge-soft-bg)', border: '1.5px solid var(--app-border-soft)' }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-2xl" style={{ background: 'var(--badge-soft-bg)', border: '1.5px solid var(--app-border-soft)' }} />
            ))}
          </div>
        )
      )}

      {/* ── Grid View ── */}
      {!loading && viewMode === 'grid' && filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(RoutePath.NOTE_DETAIL.replace(':id', note.id))}
              className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-2"
              style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
              }}
            >
              {/* Thumbnail */}
              <div className="relative h-28 w-full overflow-hidden sm:h-32 lg:h-36" style={{ background: 'var(--badge-soft-bg)', borderBottom: '1px solid var(--app-border-soft)' }}>
                {note.thumbnailUrl ? (
                  <>
                    <div className="absolute inset-0 z-10 transition-colors duration-500 group-hover:bg-indigo-900/10" />
                    <StorageImage path={note.thumbnailUrl} alt={note.title} className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110" />
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center" style={{ background: 'var(--badge-soft-bg)' }}>
                    <FileText size={48} strokeWidth={1} style={{ color: 'var(--text-accent-soft)' }} />
                  </div>
                )}
                <div className="absolute top-4 right-4 z-20">
                  <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'var(--app-surface)', color: 'var(--text-accent)', border: '1px solid var(--app-border)', backdropFilter: 'blur(8px)' }}>
                    <Calendar size={10} style={{ color: 'var(--text-accent-soft)' }} />
                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-3 sm:p-4 lg:p-5">
                <h3 className="mb-1.5 text-base font-bold tracking-tight leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="line-clamp-3 leading-relaxed text-xs mb-3 sm:mb-4" style={{ color: 'var(--text-muted)' }}>
                  {(previewsById.get(note.id) || '') || <span className="italic opacity-50">Empty note</span>}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--app-border-soft)' }}>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>ME</div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Edited just now</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(note.id);
                      }}
                      className="p-2 rounded-lg transition-all duration-150"
                      style={{ color: 'var(--text-muted)', background: 'transparent' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      title="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center text-xs font-bold" style={{ color: 'var(--text-accent-soft)' }}>
                      <span>Open</span>
                      <ArrowUpRight size={13} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── List View ── */}
      {!loading && viewMode === 'list' && filteredNotes.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => navigate(RoutePath.NOTE_DETAIL.replace(':id', note.id))}
              className="group cursor-pointer flex flex-col gap-3 rounded-2xl px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
              style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
              }}
            >
              {/* Index / mini thumb */}
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 h-11 w-11 rounded-xl overflow-hidden flex items-center justify-center"
                  style={{ background: 'var(--badge-soft-bg)', border: '1.5px solid var(--card-border)' }}
                >
                  {note.thumbnailUrl ? (
                    <StorageImage path={note.thumbnailUrl} alt={note.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-extrabold" style={{ color: 'var(--text-accent-soft)' }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Title + preview */}
                <div className="flex-1 min-w-0 sm:hidden">
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="mt-0.5 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {previewsById.get(note.id) || 'Empty note'}
                  </p>
                </div>
              </div>

              {/* Title + preview (desktop) */}
              <div className="hidden sm:block flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {previewsById.get(note.id) || 'Empty note'}
                </p>
              </div>

              {/* Meta + actions */}
              <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-accent-soft)' }}>
                  <Calendar size={11} style={{ color: 'var(--text-accent-soft)' }} />
                  {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>

                <div className="hidden md:block">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>ME</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(note.id);
                  }}
                  className="p-2 rounded-lg transition-all duration-150"
                  style={{ color: 'var(--text-muted)', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  title="Delete note"
                >
                  <Trash2 size={16} />
                </button>

                <div className="hidden sm:flex" style={{ color: 'var(--text-accent-soft)' }}>
                  <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filteredNotes.length === 0 && (
        <div
          className="flex h-80 flex-col items-center justify-center rounded-3xl text-center px-4"
          style={{ border: '2px dashed var(--card-border)', background: 'var(--badge-soft-bg)' }}
        >
          <div className="h-16 w-16 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'var(--app-surface)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}>
            <FileText size={28} style={{ color: 'var(--text-accent-soft)' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
          </h3>
          <p className="mb-6 max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>
            {notes.length === 0 ? 'Create your first note to get started.' : 'Try another keyword.'}
          </p>
          <button
            onClick={() => navigate(RoutePath.CREATE_NOTE)}
            className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 16px rgba(99,102,241,0.28)' }}
          >
            Create your first note
          </button>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={() => !deleting && setDeleteConfirm(null)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col px-8 py-8 animate-in scale-in duration-300"
            style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', boxShadow: '0 20px 60px rgba(2,6,23,0.45)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => !deleting && setDeleteConfirm(null)}
              className="absolute right-4 top-4 p-2 transition-colors duration-150 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              disabled={deleting}
            >
              <X size={20} />
            </button>

            {/* Icon Badge */}
            <div
              className="flex items-center justify-center h-16 w-16 rounded-full mb-6 mx-auto"
              style={{ background: 'rgba(244,63,94,0.12)', boxShadow: '0 0 0 12px rgba(244,63,94,0.12)' }}
            >
              <AlertCircle size={32} style={{ color: '#fb7185' }} />
            </div>

            {/* Heading */}
            <h3
              className="text-center text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Delete Note?
            </h3>

            {/* Description */}
            <p className="text-center text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              This action cannot be undone. The note will be permanently deleted.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150 disabled:opacity-60"
                style={{ border: '1.5px solid var(--app-border)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)'; }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteNote(deleteConfirm)}
                disabled={deleting}
                className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', boxShadow: '0 10px 26px rgba(225,29,72,0.45)' }}
              >
                <Trash2 size={15} />
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};