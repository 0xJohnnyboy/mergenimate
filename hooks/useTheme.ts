import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('theme-mode');
    return (stored as ThemeMode) || 'system';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);

    const applyTheme = (theme: 'light' | 'dark') => {
      document.documentElement.setAttribute('data-theme', theme);
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      handleChange(mediaQuery);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(mode);
    }
  }, [mode]);

  return { mode, setMode };
};
