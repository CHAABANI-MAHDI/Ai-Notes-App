import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Menu, Search, Sparkles, User, Settings, LogOut, Loader2, FileText, X, Home, PlusCircle } from 'lucide-react';
import { RoutePath, Note } from '../types';
import { noteService } from '../services/noteService';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { StorageImage } from '../components/ui/StorageImage';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    if (isProfileMenuOpen || showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, showResults]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        setShowResults(true);
        try {
          const results = await noteService.search(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    setIsMobileNavOpen(false);
    await logout();
    navigate(RoutePath.HOME, { replace: true });
  };

  const handleLogin = () => navigate(RoutePath.LOGIN);

  const handleNavigation = (path: string) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleSearchResultClick = (noteId: string) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(isAuthenticated ? RoutePath.NOTE_DETAIL.replace(':id', noteId) : RoutePath.LOGIN);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  const getPreviewText = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > 60 ? text.substring(0, 60) + '...' : text;
  };

  const mobileNavItems = [
    { icon: Home, label: 'Home', path: RoutePath.HOME },
    { icon: FileText, label: 'My Notes', path: RoutePath.NOTES },
    { icon: PlusCircle, label: 'Create Note', path: RoutePath.CREATE_NOTE },
    { icon: Settings, label: 'Account', path: RoutePath.ACCOUNT },
  ];

  const isHomePage = location.pathname === RoutePath.HOME;

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex overflow-x-hidden relative"
      style={{ background: 'var(--app-bg, #f5f3ff)' }}>
      <Sidebar />

      {/* Mobile Nav Overlay */}
      {isMobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(30, 27, 75, 0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 z-50 h-screen w-72 p-4 md:hidden flex flex-col"
            style={{
              background: 'var(--app-surface)',
              borderRight: '1.5px solid var(--app-border-soft)',
              boxShadow: 'var(--card-shadow-hover)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-lg font-extrabold"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                AI Notes
              </p>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg p-2 transition-all duration-150"
                style={{ color: 'var(--text-accent)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--nav-hover-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-1 flex-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150"
                style={{
                  border: '1.5px solid var(--app-border)',
                  background: 'var(--app-surface)',
                  color: 'var(--text-accent)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)';
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(99,102,241,0.35)';
                }}
              >
                Sign In
              </button>
            )}
          </aside>
        </>
      )}

      <main className="flex-1 flex flex-col min-h-screen md:pl-64 relative z-10">

        {/* ── Topbar ── */}
        <header
          className="sticky top-0 z-30 px-4 py-3 md:px-8"
          style={{
            background: 'var(--app-surface)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1.5px solid var(--app-border-soft)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center gap-3">

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-xl p-2 transition-all duration-150 md:hidden"
              style={{ border: '1.5px solid var(--app-border)', color: 'var(--text-accent)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--nav-hover-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Menu size={18} />
            </button>

            {/* Workspace pill */}
            <div
              className="hidden md:flex items-center gap-2.5 rounded-xl px-3 py-2"
              style={{
                background: 'var(--nav-active-bg)',
                border: '1.5px solid var(--nav-active-border)',
              }}
            >
              <div
                className="rounded-lg p-1.5 text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.30)' }}
              >
                <Home size={13} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-accent-soft)' }}>Workspace</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{isHomePage ? 'Home overview' : 'Dashboard'}</p>
              </div>
            </div>

            {/* Search bar */}
            <div ref={searchRef} className="relative w-full max-w-xl">
              <div
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-150"
                style={{
                  background: 'var(--badge-soft-bg)',
                  border: '1.5px solid var(--input-border)',
                }}
                onFocus={() => {}}
              >
                {isSearching ? (
                  <Loader2 size={15} className="animate-spin flex-shrink-0" style={{ color: 'var(--text-accent)' }} />
                ) : (
                  <div
                    className="flex-shrink-0 rounded-md p-1 text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    <Search size={11} />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Search your notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                {searchQuery ? (
                  <button
                    onClick={clearSearch}
                    className="flex-shrink-0 transition-colors duration-150"
                    style={{ color: 'var(--text-accent-soft)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-accent-soft)')}
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <span
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.28)' }}
                  >
                    <Sparkles size={9} />
                    AI
                  </span>
                )}
              </div>

              {/* Search results dropdown */}
              {showResults && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl"
                  style={{
                    background: 'var(--app-surface)',
                    border: '1.5px solid var(--app-border)',
                    boxShadow: 'var(--card-shadow-hover)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="max-h-72 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => handleSearchResultClick(note.id)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-all duration-150"
                          style={{ borderBottom: '1px solid var(--app-border-soft)' }}
                          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)')}
                          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                        >
                          <div
                            className="mt-0.5 rounded-lg p-1.5 flex-shrink-0"
                            style={{ background: 'var(--badge-purple-bg)', color: 'var(--badge-purple-text)' }}
                          >
                            <FileText size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {note.title || 'Untitled Note'}
                            </p>
                            <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                              {getPreviewText(note.content) || 'No content'}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-6 text-sm" style={{ color: 'var(--text-accent-soft)' }}>
                        No matching notes found.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2" ref={menuRef}>
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="rounded-full p-0.5 transition-all duration-150"
                    style={{
                      border: '2px solid var(--primary-300)',
                      boxShadow: 'var(--card-shadow)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-500)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow-hover)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
                    }}
                  >
                    <StorageImage
                      path={user?.avatarUrl}
                      fallbackSrc="https://picsum.photos/100/100"
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                      showLoading={false}
                    />
                  </button>

                  {/* Profile dropdown */}
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl p-2 transition-all duration-150"
                    style={{
                      background: 'var(--app-surface)',
                      border: '1.5px solid var(--app-border)',
                      boxShadow: 'var(--card-shadow-hover)',
                      backdropFilter: 'blur(12px)',
                      opacity: isProfileMenuOpen ? 1 : 0,
                      pointerEvents: isProfileMenuOpen ? 'all' : 'none',
                      transform: isProfileMenuOpen ? 'translateY(0)' : 'translateY(-6px)',
                    }}
                  >
                    {/* User info header */}
                    <div
                      className="mb-2 rounded-xl px-3 py-2.5"
                      style={{ background: 'var(--badge-soft-bg)', border: '1px solid var(--card-border)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>Signed in as</p>
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
                    </div>

                    <button
                      onClick={() => handleNavigation(RoutePath.ACCOUNT)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      }}
                    >
                      <User size={15} /> Profile
                    </button>

                    <button
                      onClick={() => handleNavigation(RoutePath.ACCOUNT)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Settings size={15} /> Settings
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 8px 22px rgba(99,102,241,0.45)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)')}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};