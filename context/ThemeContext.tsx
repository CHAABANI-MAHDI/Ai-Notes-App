import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-notes-theme';

// ── CSS Variables injected globally based on active theme ──
const lightVars = `
  :root {
    --app-bg:              #f5f3ff;
    --app-surface:         #ffffff;
    --app-border:          #ddd6fe;
    --app-border-soft:     #ede9fe;

    --primary-50:          #f5f3ff;
    --primary-100:         #ede9fe;
    --primary-200:         #ddd6fe;
    --primary-300:         #c4b5fd;
    --primary-400:         #a78bfa;
    --primary-500:         #8b5cf6;
    --primary-600:         #7c3aed;
    --primary-700:         #6d28d9;
    --primary-800:         #5b21b6;
    --primary-900:         #4c1d95;
    --primary-950:         #2e1065;

    --accent-gradient:     linear-gradient(135deg, #6366f1, #7c3aed);
    --accent-shadow:       rgba(99, 102, 241, 0.28);
    --accent-shadow-lg:    rgba(99, 102, 241, 0.42);

    --text-primary:        #1e1b4b;
    --text-secondary:      #4b5563;
    --text-muted:          #9ca3af;
    --text-accent:         #6366f1;
    --text-accent-soft:    #a78bfa;

    --card-bg:             #ffffff;
    --card-border:         #ddd6fe;
    --card-shadow:         0 2px 12px rgba(99, 102, 241, 0.07);
    --card-shadow-hover:   0 12px 36px rgba(99, 102, 241, 0.18);

    --input-bg:            #faf9ff;
    --input-border:        #ddd6fe;
    --input-border-focus:  #8b5cf6;

    --nav-active-bg:       linear-gradient(135deg, #ede9fe, #f5f3ff);
    --nav-active-text:     #6366f1;
    --nav-active-border:   #ddd6fe;
    --nav-hover-bg:        #f5f3ff;

    --badge-purple-bg:     #ede9fe;
    --badge-purple-text:   #6366f1;
    --badge-soft-bg:       #faf9ff;
  }
`;

const darkVars = `
  :root {
    --app-bg:              #0f0d1a;
    --app-surface:         #13111f;
    --app-border:          #2a2545;
    --app-border-soft:     #231e3d;

    --primary-50:          #1a1535;
    --primary-100:         #231e3d;
    --primary-200:         #2a2545;
    --primary-300:         #3b3265;
    --primary-400:         #5b4d9e;
    --primary-500:         #7c6fd4;
    --primary-600:         #8b5cf6;
    --primary-700:         #a78bfa;
    --primary-800:         #c4b5fd;
    --primary-900:         #ddd6fe;
    --primary-950:         #ede9fe;

    --accent-gradient:     linear-gradient(135deg, #6366f1, #8b5cf6);
    --accent-shadow:       rgba(99, 102, 241, 0.35);
    --accent-shadow-lg:    rgba(99, 102, 241, 0.50);

    --text-primary:        #f0ecff;
    --text-secondary:      #b8b0e0;
    --text-muted:          #6b6392;
    --text-accent:         #a78bfa;
    --text-accent-soft:    #c4b5fd;

    --card-bg:             #1a1729;
    --card-border:         #2a2545;
    --card-shadow:         0 2px 12px rgba(0, 0, 0, 0.30);
    --card-shadow-hover:   0 12px 36px rgba(99, 102, 241, 0.20);

    --input-bg:            #1e1b30;
    --input-border:        #2a2545;
    --input-border-focus:  #7c3aed;

    --nav-active-bg:       linear-gradient(135deg, #2d1f5e, #1e1b30);
    --nav-active-text:     #c4b5fd;
    --nav-active-border:   #3b3265;
    --nav-hover-bg:        #1e1b30;

    --badge-purple-bg:     #2d1f5e;
    --badge-purple-text:   #c4b5fd;
    --badge-soft-bg:       #1a1729;
  }
`;

function injectThemeVars(theme: Theme) {
  const id = 'ai-notes-theme-vars';
  let tag = document.getElementById(id) as HTMLStyleElement | null;
  if (!tag) {
    tag = document.createElement('style');
    tag.id = id;
    document.head.appendChild(tag);
  }
  tag.textContent = theme === 'dark' ? darkVars : lightVars;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialTheme = (): Theme => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    injectThemeVars(theme);
  }, [theme]);

  // Inject on first render before paint
  useEffect(() => {
    injectThemeVars(theme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};