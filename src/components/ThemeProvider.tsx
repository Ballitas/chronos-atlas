'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_THEME, resolveTheme, ThemeConfig } from '@/lib/themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  setActiveTheme: (themeKey?: string | null, customOverride?: Partial<ThemeConfig> | null) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setActiveTheme: () => {},
  resetTheme: () => {},
});

function applyThemeToDocument(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-theme-mode', theme.mode);
  root.style.setProperty('--bg-primary', theme.bgPrimary);
  root.style.setProperty('--bg-surface', theme.bgSurface);
  root.style.setProperty('--bg-elevated', theme.bgElevated);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-foreground', theme.accentForeground);
  root.style.setProperty('--accent-soft', theme.accentSoft);
  root.style.setProperty('--border', theme.border);
  root.style.setProperty('--hero-gradient', theme.heroGradient);
  root.style.setProperty('--font-display', theme.fontDisplay);
  root.style.setProperty('--font-body', theme.fontBody);
  root.style.setProperty('--motif-style', theme.motifStyle);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setActiveTheme = useCallback(
    (themeKey?: string | null, customOverride?: Partial<ThemeConfig> | null) => {
      const resolved = resolveTheme(themeKey, customOverride);
      setTheme(resolved);
    },
    []
  );

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setActiveTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
