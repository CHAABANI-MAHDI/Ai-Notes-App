import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, FolderOpen, FileText, ShieldCheck, Loader2, NotebookPen, Sparkles, GraduationCap, Phone, Mail, MapPin, Linkedin, Github, ExternalLink } from 'lucide-react';
import { RoutePath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { noteService } from '../../services/noteService';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      if (isAuthenticated) {
        setIsCountLoading(true);
        try {
          const count = await noteService.getCount();
          setNoteCount(count);
        } catch (error) {
          console.error('Failed to fetch note count:', error);
          setNoteCount(0);
        } finally {
          setIsCountLoading(false);
        }
      }
    };
    fetchCount();
  }, [isAuthenticated]);

  const handleCreateClick = () => {
    navigate(isAuthenticated ? RoutePath.CREATE_NOTE : RoutePath.LOGIN);
  };

  const handleViewAllClick = () => {
    navigate(isAuthenticated ? RoutePath.NOTES : RoutePath.LOGIN);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-8">

      {/* ── Hero Card ── */}
      <section
        className="relative overflow-hidden rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #a78bfa 100%)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.28)',
        }}
      >
        {/* Soft decorative blobs */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full"
          style={{ background: 'rgba(255,255,255,0.10)', filter: 'blur(40px)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full"
          style={{ background: 'rgba(167,139,250,0.18)', filter: 'blur(48px)' }}
        />
        <div
          className="pointer-events-none absolute top-6 left-1/2 h-32 w-32 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(24px)' }}
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {/* Pill badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#ede9fe', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <Sparkles size={12} />
              AI-Powered Workspace
            </div>

            <h1
              className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}
            >
              {isAuthenticated
                ? `Welcome back, ${user?.name || 'User'} 👋`
                : 'Welcome to AI Notes 👋'}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
              {isAuthenticated
                ? 'Great to see you again. Capture ideas quickly and keep your notes organized in one place.'
                : 'Create an account to save notes, stay organized, and build your personal knowledge space.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 flex-shrink-0">
            {/* Primary white button */}
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'var(--app-surface)',
                color: 'var(--text-accent)',
                boxShadow: '0 4px 18px rgba(0,0,0,0.14)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.14)')}
            >
              <PlusCircle className="h-4 w-4" />
              New Note
            </button>

            {/* Ghost button */}
            <button
              onClick={handleViewAllClick}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.16)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.24)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
            >
              <FileText className="h-4 w-4" />
              View Notes
            </button>
          </div>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="grid gap-4 md:grid-cols-3">

        {/* Total Notes */}
        <div
          className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
          style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow-hover)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-300)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Notes</p>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', boxShadow: '0 3px 10px rgba(99,102,241,0.30)' }}
            >
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
          </div>
          <p
            className="mt-4 text-5xl font-extrabold leading-none"
            style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
          >
            {!isAuthenticated
              ? '—'
              : isCountLoading
              ? <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#6366f1' }} />
              : noteCount ?? '—'}
          </p>
          <p className="mt-2 text-xs font-medium" style={{ color: 'var(--text-accent-soft)' }}>notes created</p>
        </div>

        {/* Workspace */}
        <div
          className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
          style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow-hover)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-300)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Workspace</p>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', boxShadow: '0 3px 10px rgba(139,92,246,0.30)' }}
            >
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="mt-4 text-base font-bold" style={{ color: 'var(--text-primary)' }}>Secure & Synced</p>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Everything you write is saved safely and ready whenever you return.
          </p>
          {/* Mini status pill */}
          <div
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--badge-purple-bg)', color: 'var(--badge-purple-text)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
            All systems normal
          </div>
        </div>

        {/* Start Writing */}
        <div
          className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 cursor-pointer"
          style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow-hover)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-300)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--card-shadow)';
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--card-border)';
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Start Writing</p>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)', boxShadow: '0 3px 10px rgba(139,92,246,0.28)' }}
            >
              <NotebookPen className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="mt-4 text-base font-bold" style={{ color: 'var(--text-primary)' }}>Ready for a new note?</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Jump into the editor and start capturing ideas.</p>
          <button
            onClick={handleCreateClick}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-150 hover:gap-2.5"
            style={{ color: 'var(--text-accent)' }}
          >
            Open editor <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </section>

      {/* ── Features Section ── */}
      <section className="mt-12">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
            Why use AI Notes?
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Everything you need to organize your thoughts and ideas in one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { icon: '📝', title: 'Rich Editor', desc: 'Write with formatting, links, and embeds' },
            { icon: '🔐', title: 'Secure & Private', desc: 'Your notes are encrypted and safe' },
            { icon: '🌐', title: 'Access Anywhere', desc: 'Available on all your devices' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
              }}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
            </div>
          ))}

          <div
            className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 sm:col-span-2 md:col-span-3"
            style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
            }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-extrabold sm:h-20 sm:w-20"
                    style={{
                      background: 'var(--badge-purple-bg)',
                      border: '2px solid var(--primary-300)',
                      color: 'var(--text-accent)',
                    }}
                  >
                    <img 
                      src="https://media.licdn.com/dms/image/v2/D4D03AQHXBMQCpPh0vw/profile-displayphoto-shrink_400_400/B4DZOmAyJfHcAg-/0/1733657077434?e=1772668800&v=beta&t=p_IXHQdEuz6TzqPUP6pb7fNUU9fI90z-CRjTpfRW2Vg"
                      alt="MC" 
                      width={160} 
                      height={160}
                      style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.style.width = '100%';
                        fallback.style.height = '100%';
                        fallback.style.borderRadius = '50%';
                        fallback.style.background = 'var(--badge-purple-bg)';
                        fallback.style.display = 'flex';
                        fallback.style.alignItems = 'center';
                        fallback.style.justifyContent = 'center';
                        fallback.style.fontSize = 'clamp(18px, 2.5vw, 28px)';
                        fallback.style.fontWeight = 'bold';
                        fallback.style.color = 'var(--text-accent)';
                        fallback.textContent = 'MC';
                        (e.currentTarget as HTMLImageElement).parentElement?.appendChild(fallback);
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>
                      <span></span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                        style={{
                          background: 'var(--text-accent)',
                          color: 'var(--app-surface)',
                          letterSpacing: '0.35px',
                        }}
                      >
                        #2026
                      </span>
                    </p>
                    <h3 className="mt-0.5 text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                      Mahdi Chaabani
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--text-accent)' }}>
                      <GraduationCap size={14} />
                      Final Year Intern • Full Stack Developer
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Phone size={14} style={{ color: 'var(--text-accent-soft)' }} />
                    +216 93 245 735
                  </p>
                  <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ color: 'var(--text-accent-soft)' }} />
                    Manouba, Tunisia
                  </p>
                  <p className="flex items-center gap-2 text-sm sm:col-span-2" style={{ color: 'var(--text-secondary)' }}>
                    <Mail size={14} style={{ color: 'var(--text-accent-soft)' }} />
                    <span className="truncate">mahdi.chaabani.pro@gmail.com</span>
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {['MongoDB', 'Express', 'React', 'Node.js'].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{
                        background: 'var(--badge-soft-bg)',
                        border: '1px solid var(--card-border)',
                        color: 'var(--text-accent)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/mahdi-chaabani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 transition-all duration-150"
                  style={{ background: 'var(--badge-soft-bg)', border: '1px solid var(--card-border)', color: 'var(--text-accent)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--badge-soft-bg)')}
                  aria-label="LinkedIn"
                >
                  <Linkedin size={14} />
                </a>
                <a
                  href="https://github.com/CHAABANI-MAHDI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 transition-all duration-150"
                  style={{ background: 'var(--badge-soft-bg)', border: '1px solid var(--card-border)', color: 'var(--text-accent)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--badge-soft-bg)')}
                  aria-label="GitHub"
                >
                  <Github size={14} />
                </a>
                <a
                  href="https://mahdi-portfolio-blush.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.30)',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 22px rgba(99,102,241,0.40)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(99,102,241,0.30)')}
                >
                  <ExternalLink size={13} />
                  View Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

     
    </div>
  );
};