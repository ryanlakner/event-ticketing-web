import { Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

import cx from '../lib/cx';
import { formatCountdown } from '../lib/format';

interface CountdownProps {
  /** When the hold started, to show how much of it remains. */
  from: string;
  until: string;
}

/** Live countdown and progress bar for a reservation hold. */
export default function Countdown({ from, until }: CountdownProps) {
  const start = new Date(from).getTime();
  const deadline = new Date(until).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = deadline - now;
  if (remaining <= 0) {
    return (
      <p className="flex items-center gap-2 font-medium text-rose-600 dark:text-rose-400">
        <Timer aria-hidden className="size-4" />
        Hold expired
      </p>
    );
  }

  const fraction = Math.min(1, remaining / Math.max(1, deadline - start));
  const urgent = remaining <= 60_000;

  return (
    <div aria-live="polite">
      <p
        className={cx(
          'flex items-center gap-2 text-sm font-medium',
          urgent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-300',
        )}
      >
        <Timer aria-hidden className="size-4" />
        <span>
          Held for{' '}
          <strong className="font-mono text-base tabular-nums">{formatCountdown(remaining)}</strong>
        </span>
      </p>
      <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cx(
            'h-full rounded-full transition-[width] duration-1000 ease-linear',
            urgent ? 'bg-rose-500' : 'bg-amber-500',
          )}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </div>
  );
}
