export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Planora Tema Yöneticisi:
 * Açık / Koyu / Sistem seçeneklerini DOM'a uygular ve localStorage'a kaydeder.
 */
export function applyTheme(theme: ThemeMode): void {
  let isDark = false;
  if (theme === 'dark') {
    isDark = true;
  } else if (theme === 'light') {
    isDark = false;
  } else {
    // system
    isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  if (typeof document !== 'undefined') {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }

  try {
    localStorage.setItem('planora_theme_v1', theme);
  } catch {}
}

export function getSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem('planora_theme_v1') as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {}
  return 'light'; // Varsayılan açık tema (Indigo & Slate)
}

export function listenToSystemThemeChanges(onThemeChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getSavedTheme() === 'system') {
      onThemeChange();
    }
  };
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}
