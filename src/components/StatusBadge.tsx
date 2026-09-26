import type { EventStatus, ReservationStatus } from '../api/types';
import cx from '../lib/cx';

type Status = EventStatus | ReservationStatus;

const tints: Record<Status, string> = {
  Published: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
  Confirmed: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
  Draft: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  Pending: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  Cancelled: 'bg-surface-muted text-ink-muted ring-line',
  Expired: 'bg-surface-muted text-ink-muted ring-line',
};

const dots: Record<Status, string> = {
  Published: 'bg-emerald-500',
  Confirmed: 'bg-emerald-500',
  Draft: 'bg-amber-500',
  Pending: 'bg-amber-500',
  Cancelled: 'bg-slate-400',
  Expired: 'bg-slate-400',
};

interface StatusBadgeProps {
  status: Status;
  /** "solid" is a white pill that stays readable on the brand gradient in either theme. */
  variant?: 'tinted' | 'solid';
}

export default function StatusBadge({ status, variant = 'tinted' }: StatusBadgeProps) {
  return (
    <span
      data-status={status}
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        variant === 'solid' ? 'bg-white text-slate-900 shadow-sm ring-white' : tints[status],
      )}
    >
      <span aria-hidden className={cx('size-1.5 rounded-full', dots[status])} />
      {status}
    </span>
  );
}
