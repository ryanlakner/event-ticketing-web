import { cardClass } from '../lib/styles';

const cardIds = ['one', 'two', 'three', 'four', 'five', 'six'];

function EventCardSkeleton() {
  return (
    <div className={`${cardClass} animate-pulse p-5`}>
      <div className="flex gap-4">
        <div className="size-14 rounded-xl bg-surface-muted" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 rounded bg-surface-muted" />
          <div className="h-3 w-1/2 rounded bg-surface-muted" />
          <div className="h-3 w-2/5 rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-6 h-1.5 rounded-full bg-surface-muted" />
    </div>
  );
}

/** Placeholder cards while events load, so the layout doesn't jump. */
export function EventGridSkeleton() {
  return (
    <div aria-hidden className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cardIds.map((id) => (
        <EventCardSkeleton key={id} />
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div aria-hidden className="space-y-3">
      {cardIds.slice(0, 3).map((id) => (
        <div key={id} className={`${cardClass} flex animate-pulse items-center gap-4 p-4`}>
          <div className="size-14 rounded-xl bg-surface-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-surface-muted" />
            <div className="h-3 w-1/4 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
