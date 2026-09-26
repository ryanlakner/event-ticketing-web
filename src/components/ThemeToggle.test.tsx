import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ThemeToggle from './ThemeToggle';

function prefersDark(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: dark, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
}

describe('ThemeToggle', () => {
  it('follows the operating system by default', () => {
    prefersDark(true);

    render(<ThemeToggle />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button')).toHaveAccessibleName('Theme: System. Switch to Light.');
  });

  it('cycles system → light → dark and remembers the choice', async () => {
    const user = userEvent.setup();
    prefersDark(true);
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('event-ticketing:theme')).toBe('light');

    await user.click(screen.getByRole('button'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('event-ticketing:theme')).toBe('dark');

    await user.click(screen.getByRole('button'));
    expect(localStorage.getItem('event-ticketing:theme')).toBeNull();
    expect(screen.getByRole('button')).toHaveAccessibleName('Theme: System. Switch to Light.');
  });

  it('starts from a saved preference', () => {
    prefersDark(true);
    localStorage.setItem('event-ticketing:theme', 'light');

    render(<ThemeToggle />);

    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
