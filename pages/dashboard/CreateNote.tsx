import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Wand2, X, Calendar, Loader2, Paperclip, File as FileIcon, FileText, Zap, Sparkles } from 'lucide-react';
import { Editor } from '../../components/ui/Editor';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { aiService } from '../../services/aiService';
import { RoutePath, NoteAttachment } from '../../types';
import { supabase } from '../../supabaseClient';
import { StorageImage } from '../../components/ui/StorageImage';

export const CreateNote: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [originalCoverPath, setOriginalCoverPath] = useState<string | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<NoteAttachment[]>([]);
  const [enhancing, setEnhancing] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const checkLimitAndFetch = async () => {
      setLoading(true);
      try {
        if (id) {
          const note = await noteService.getById(id);
          if (note) {
            setTitle(note.title); setContent(note.content);
            setImagePreview(note.thumbnailUrl || null);
            setOriginalCoverPath(note.thumbnailUrl || null);
            setExistingAttachments(note.attachments || []);
          } else { navigate(RoutePath.NOTES); }
        }
      } catch (error) { console.error('Failed to initialize note view', error); }
      finally { setLoading(false); }
    };
    checkLimitAndFetch();
  }, [id, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      setNewAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeNewAttachment = (index: number) => setNewAttachments(prev => prev.filter((_, i) => i !== index));
  const removeExistingAttachment = async (att: NoteAttachment) => {
    setExistingAttachments(prev => prev.filter(a => a.path !== att.path));
    try { await storageService.deleteFile(att.path); } catch (err) { console.error(err); }
  };
  const handleRemoveCover = () => {
    setImagePreview(null);
    setCoverFile(null);
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAIEnhance = async () => {
    if (!content || content === '<p><br></p>') return;
    setEnhancing(true);
    try {
      const result = await aiService.enhanceContent({
        content,
        tone: 'professional',
        action: 'improve',
      });
      setContent(result.enhancedContent);
    } catch (error) {
      console.error('AI enhancement failed:', error);
      alert('Failed to enhance content. Please try again.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      let noteId = id;
      if (!noteId) { const newNote = await noteService.create({ title, content, tags: [] }); noteId = newNote.id; }
      let finalThumbnailUrl = imagePreview;
      if (coverFile) {
        finalThumbnailUrl = await storageService.uploadUserFile(user.id, 'note-covers', noteId, coverFile);
      } else if (!imagePreview) { finalThumbnailUrl = undefined; }

      if (originalCoverPath && originalCoverPath !== finalThumbnailUrl) {
        await storageService.deleteFile(originalCoverPath);
      }

      const uploadedAttachments: NoteAttachment[] = [];
      for (const file of newAttachments) {
        const path = await storageService.uploadUserFile(user.id, 'note-attachments', noteId, file);
        uploadedAttachments.push({ name: file.name, size: file.size, type: file.type, path, id: path });
      }
      await noteService.update(noteId, { title, content, thumbnailUrl: finalThumbnailUrl || undefined, attachments: [...existingAttachments, ...uploadedAttachments] });
      navigate(RoutePath.NOTE_DETAIL.replace(':id', noteId));
    } catch (error: any) {
      if (error?.message === 'FREE_LIMIT_REACHED') {
        setShowLimitModal(true);
      } else {
        console.error(error); alert('Failed to save note.');
      }
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--text-accent)' }} />
      </div>
    );
  }

  const hasContent = content && content !== '<p><br></p>';
  const canSave = title.trim().length > 0 || hasContent;

  return (
    <>
    <div className="mx-auto max-w-5xl animate-in fade-in duration-500 pb-20">

      {/* ── Sticky Nav ── */}
      <nav
        className="sticky top-2 z-30 mb-6 flex items-center justify-between rounded-2xl px-4 py-3 transition-all"
        style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', boxShadow: 'var(--card-shadow)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-px" style={{ background: 'var(--app-border-soft)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-accent-soft)' }}>{id ? 'Edit Note' : 'New Draft'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!hasContent || enhancing}
            onClick={handleAIEnhance}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 disabled:opacity-40"
            style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-accent)' }}
            onMouseEnter={e => !(!hasContent || enhancing) && ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)')}
          >
            <Wand2 size={14} style={{ color: 'var(--text-accent)' }} className={enhancing ? 'animate-spin' : ''} />
            {enhancing ? 'Enhancing...' : 'AI Enhance'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.28)' }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </nav>

      {/* ── Editor Card ── */}
      <div
        className="relative min-h-[70vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
      >
        {/* Cover image */}
        {imagePreview && (
          <div className="relative aspect-[21/9] w-full group" style={{ borderBottom: '1px solid var(--app-border-soft)' }}>
            <StorageImage path={imagePreview} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <label className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors" style={{ background: 'var(--app-surface)', color: 'var(--text-secondary)', border: '1px solid var(--app-border)', backdropFilter: 'blur(8px)' }}>
                Change <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              <button onClick={handleRemoveCover} className="rounded-xl p-1.5 transition-colors" style={{ background: 'var(--app-surface)', color: 'var(--text-secondary)', border: '1px solid var(--app-border)', backdropFilter: 'blur(8px)' }}>
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 px-6 py-8 md:px-10 md:py-10">
          {/* Toolbar row */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>
              <Calendar size={12} />
              {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <label
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150"
                style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-accent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; }}
              >
                <Paperclip size={13} style={{ color: 'var(--text-accent-soft)' }} /> Attach File
                <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
              </label>
              {!imagePreview && (
                <label
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150"
                  style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                >
                  <ImageIcon size={13} style={{ color: 'var(--text-accent-soft)' }} /> Add Cover
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-none bg-transparent text-4xl sm:text-5xl font-extrabold placeholder:text-slate-200 focus:outline-none focus:ring-0 p-0 mb-8 tracking-tight leading-tight"
            style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
            autoFocus
          />

          {/* Editor */}
          <div className="relative min-h-[400px]">
            <Editor value={content} onChange={setContent} placeholder="Press '/' for commands..." className="text-lg leading-relaxed min-h-[400px]" style={{ color: 'var(--text-secondary)' }} />
          </div>

          {/* Attachments */}
          {(newAttachments.length > 0 || existingAttachments.length > 0) && (
            <div className="mt-12 pt-8 animate-in fade-in duration-300" style={{ borderTop: '1.5px solid var(--app-border-soft)' }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Paperclip size={15} style={{ color: 'var(--text-accent-soft)' }} />
                Attachments ({newAttachments.length + existingAttachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {existingAttachments.map((att) => (
                  <div
                    key={att.path}
                    className="group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; }}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'var(--badge-purple-bg)', color: 'var(--text-accent)', border: '1px solid var(--card-border)' }}>
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{att.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-accent-soft)' }}>{formatFileSize(att.size)}</p>
                    </div>
                    <button onClick={() => removeExistingAttachment(att)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', color: 'var(--text-muted)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#dc2626'; (e.currentTarget as HTMLElement).style.borderColor = '#fca5a5'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)'; }}>
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
                {newAttachments.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{ border: '1.5px solid var(--input-border)', background: 'var(--input-bg)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; }}
                  >
                    <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: 'var(--badge-purple-bg)', border: '1px solid var(--card-border)' }}>
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
                      ) : (
                        <FileIcon size={18} style={{ color: 'var(--text-accent)' }} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-accent)' }}>Ready to upload</p>
                    </div>
                    <button onClick={() => removeNewAttachment(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200" style={{ background: 'var(--app-surface)', border: '1.5px solid var(--app-border)', color: 'var(--text-muted)' }}>
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-3 text-center" style={{ borderTop: '1.5px solid var(--app-border-soft)', background: 'var(--input-bg)' }}>
          <p className="text-xs" style={{ color: 'var(--text-accent-soft)' }}>Your note will be saved securely.</p>
        </div>
      </div>
    </div>

    {showLimitModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        style={{ background: 'rgba(30,27,75,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={() => setShowLimitModal(false)}
      >
        <div
          className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col items-center px-8 py-12 animate-in scale-in duration-300"
          style={{ background: 'var(--card-bg)', border: '1.5px solid var(--card-border)', boxShadow: 'var(--card-shadow-hover)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon Badge */}
          <div
            className="flex items-center justify-center h-16 w-16 rounded-full mb-6"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #c084fc)', boxShadow: '0 8px 32px rgba(167,139,250,0.28)' }}
          >
            <Zap size={32} style={{ color: '#ffffff', strokeWidth: 2.5 }} />
          </div>

          {/* Heading */}
          <h3
            className="text-center text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Plan Limit Reached
          </h3>

          {/* Description */}
          <p className="text-center text-sm leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            Your free plan is limited to{' '}
            <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>5 notes</span>. Upgrade to Pro to unlock unlimited creation and advanced features.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full mb-6">
            <button
              onClick={() => {
                setShowLimitModal(false);
                navigate(RoutePath.NOTES);
              }}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-150"
              style={{ border: '1.5px solid var(--input-border)', background: 'transparent', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              Back to My Notes
            </button>
            <button
              onClick={() => setShowLimitModal(false)}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #c084fc)', boxShadow: '0 4px 14px rgba(167,139,250,0.28)' }}
            >
              <Sparkles size={15} />
              Upgrade to Pro
            </button>
          </div>

          {/* Social Proof Footer */}
          <div className="text-center py-4" style={{ borderTop: '1px solid var(--app-border-soft)' }}>
            <p className="text-xs" style={{ color: 'var(--text-accent-soft)' }}>
              Join 2,000+ users on Pro
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
};