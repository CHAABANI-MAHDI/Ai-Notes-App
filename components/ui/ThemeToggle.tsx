import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] ${className}`}
      style={{
        background: 'var(--app-surface)',
        borderColor: 'var(--app-border)',
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-accent)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--app-surface)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};
