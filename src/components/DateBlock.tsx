import cx from '../lib/cx';
import { formatDay, formatMonth } from '../lib/format';

interface DateBlockProps {
  iso: string;
  size?: 'md' | 'lg';
}

/** A calendar-style month and day, like a ticket stub. */
export default function DateBlock({ iso, size = 'md' }: DateBlockProps) {
  return (
    <div
      aria-hidden
      className={cx(
        'flex shrink-0 flex-col items-center justify-center rounded-xl bg-violet-500/10 font-bold text-violet-700 ring-1 ring-violet-500/20 dark:text-violet-300',
        size === 'lg' ? 'size-20' : 'size-14',
      )}
    >
      <span
        className={cx('tracking-wider uppercase', size === 'lg' ? 'text-sm' : 'text-[0.65rem]')}
      >
        {formatMonth(iso)}
      </span>
      <span className={cx('leading-none', size === 'lg' ? 'text-3xl' : 'text-xl')}>
        {formatDay(iso)}
      </span>
    </div>
  );
}
