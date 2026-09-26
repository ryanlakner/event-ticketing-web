import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  applyTheme,
  onSystemThemeChange,
  readThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '../lib/theme';
import { buttonClass } from '../lib/styles';

const order: ThemePreference[] = ['system', 'light', 'dark'];
const icons = { system: Monitor, light: Sun, dark: Moon };
const labels = { system: 'System', light: 'Light', dark: 'Dark' };

/** Cycles the theme: system → light → dark. */
export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(readThemePreference);

  useEffect(() => {
    applyTheme(preference);
    saveThemePreference(preference);
    // While following the OS, keep following it if it changes.
    return preference === 'system' ? onSystemThemeChange(() => applyTheme('system')) : undefined;
  }, [preference]);

  const next = order[(order.indexOf(preference) + 1) % order.length] ?? 'system';
  const Icon = icons[preference];

  return (
    <button
      aria-label={`Theme: ${labels[preference]}. Switch to ${labels[next]}.`}
      className={buttonClass('ghost', 'sm')}
      title={`Theme: ${labels[preference]}`}
      type="button"
      onClick={() => setPreference(next)}
    >
      <Icon aria-hidden className="size-4" />
    </button>
  );
}
