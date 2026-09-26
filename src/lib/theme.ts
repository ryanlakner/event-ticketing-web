export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

/** Also read by the inline script in index.html; keep the two in sync. */
const storageKey = 'event-ticketing:theme';
const darkQuery = '(prefers-color-scheme: dark)';

export function readThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, preference);
    }
  } catch {
    // Storage can be unavailable (e.g. disabled cookies); the choice just won't persist.
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia(darkQuery).matches;
}

export function resolveTheme(preference: ThemePreference): Theme {
  if (preference === 'system') {
    return systemPrefersDark() ? 'dark' : 'light';
  }
  return preference;
}

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

/** Calls back when the OS switches between light and dark; returns an unsubscribe function. */
export function onSystemThemeChange(callback: () => void): () => void {
  const media = window.matchMedia(darkQuery);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
