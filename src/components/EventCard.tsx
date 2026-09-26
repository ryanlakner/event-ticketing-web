import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router';

import type { EventDto } from '../api/types';
import { formatWeekdayTime } from '../lib/format';
import { cardClass } from '../lib/styles';
import AvailabilityBar from './AvailabilityBar';
import DateBlock from './DateBlock';

export default function EventCard({ event }: { event: EventDto }) {
  return (
    <article
      className={`${cardClass} group relative flex h-full flex-col justify-between gap-6 p-5 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5`}
    >
      <div className="flex gap-4">
        <DateBlock iso={event.startsAt} />
        <div className="min-w-0">
          <h2 className="text-lg leading-snug font-semibold">
            {/* The link covers the whole card, so anywhere on it is clickable. */}
            <Link
              className="group-hover:text-violet-700 after:absolute after:inset-0 after:rounded-2xl dark:group-hover:text-violet-300"
              to={`/events/${event.id}`}
            >
              {event.name}
            </Link>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
            <Clock aria-hidden className="size-3.5 shrink-0" />
            {formatWeekdayTime(event.startsAt)}
          </p>
        </div>
      </div>
      <AvailabilityBar capacity={event.capacity} seatsAvailable={event.seatsAvailable} />
    </article>
  );
}
