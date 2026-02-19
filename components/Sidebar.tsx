import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, PlusCircle, Settings, LogOut, Command, LogIn } from 'lucide-react';
import { RoutePath } from '../types';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(RoutePath.HOME, { replace: true });
  };

  const handleLogin = () => {
    navigate(RoutePath.LOGIN);
  };

  const navItems = [
    { icon: Home, label: 'Home', path: RoutePath.HOME },
    { icon: FileText, label: 'My Notes', path: RoutePath.NOTES },
    { icon: PlusCircle, label: 'Create Note', path: RoutePath.CREATE_NOTE },
    { icon: Settings, label: 'Account', path: RoutePath.ACCOUNT },
  ];

  const getIsActive = (path: string) => {
    if (path === RoutePath.HOME) return pathname === RoutePath.HOME;
    if (path === RoutePath.NOTES) return pathname.startsWith(RoutePath.NOTES) && pathname !== RoutePath.CREATE_NOTE;
    if (path === RoutePath.CREATE_NOTE) return pathname === RoutePath.CREATE_NOTE;
    return pathname.startsWith(path);
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 hidden md:flex md:flex-col"
      style={{
        background: 'var(--app-surface)',
        borderRight: '1.5px solid var(--app-border-soft)',
      }}
    >
      {/* Logo */}
      <div
        className="px-6 pt-7 pb-5"
        style={{ borderBottom: '1.5px solid var(--app-border-soft)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            }}
          >
            <Command size={18} />
          </div>
          <div>
            <p
              className="text-lg font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              AI Notes
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Personal workspace
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="px-4 py-5 flex-1">
        <p
          className="px-3 text-[10.5px] font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-accent-soft)' }}
        >
          Navigation
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = getIsActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150"
                style={
                  isActive
                    ? {
                        background: 'var(--nav-active-bg)',
                        color: 'var(--nav-active-text)',
                        border: '1.5px solid var(--nav-active-border)',
                        boxShadow: 'var(--card-shadow)',
                      }
                    : {
                        color: 'var(--text-secondary)',
                        border: '1.5px solid transparent',
                      }
                }
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <item.icon
                  size={18}
                  strokeWidth={2.2}
                  style={{ color: isActive ? 'var(--text-accent)' : 'var(--text-muted)', flexShrink: 0 }}
                />
                <span>{item.label}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--text-accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div
        className="p-4"
        style={{ borderTop: '1.5px solid var(--app-border-soft)' }}
      >
        {isAuthenticated ? (
          <div className="space-y-3">
            {/* User card */}
            <div
              className="rounded-xl px-3.5 py-3"
              style={{
                background: 'var(--badge-soft-bg)',
                border: '1.5px solid var(--card-border)',
              }}
            >
              <p className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent-soft)' }}>
                Signed in as
              </p>
              <p
                className="mt-0.5 text-sm font-bold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name || 'User'}
              </p>
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
              style={{
                border: '1.5px solid var(--app-border)',
                background: 'var(--app-surface)',
                color: 'var(--text-accent)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-300)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--app-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-all duration-150 hover:-translate-y-0.5"
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
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
};