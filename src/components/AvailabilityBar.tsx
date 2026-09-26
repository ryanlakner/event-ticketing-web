import cx from '../lib/cx';

interface AvailabilityBarProps {
  seatsAvailable: number;
  capacity: number;
}

function seatsLeftLabel(seats: number): string {
  return seats === 1 ? '1 seat left' : `${seats.toLocaleString()} seats left`;
}

/** How full an event is: a bar that turns amber when seats run low and red when sold out. */
export default function AvailabilityBar({ seatsAvailable, capacity }: AvailabilityBarProps) {
  const soldOut = seatsAvailable === 0;
  const low = !soldOut && (seatsAvailable <= 10 || seatsAvailable / capacity <= 0.15);
  const percentSold = capacity > 0 ? Math.round(((capacity - seatsAvailable) / capacity) * 100) : 0;

  let barColor = 'bg-emerald-500';
  if (soldOut) {
    barColor = 'bg-rose-500';
  } else if (low) {
    barColor = 'bg-amber-500';
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span
          className={cx(
            'font-medium',
            soldOut && 'text-rose-600 dark:text-rose-400',
            low && 'text-amber-600 dark:text-amber-400',
          )}
        >
          {soldOut ? 'Sold out' : seatsLeftLabel(seatsAvailable)}
        </span>
        {low ? (
          <span className="text-xs font-semibold text-amber-600 uppercase dark:text-amber-400">
            Selling fast
          </span>
        ) : null}
      </div>
      <div aria-hidden className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div className={cx('h-full rounded-full', barColor)} style={{ width: `${percentSold}%` }} />
      </div>
    </div>
  );
}
