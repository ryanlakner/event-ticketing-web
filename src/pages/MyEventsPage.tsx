import { CalendarPlus, Plus } from 'lucide-react';
import { Link } from 'react-router';

import { useCancelEvent, useMyEvents, usePublishEvent } from '../api/queries';
import type { EventDto } from '../api/types';
import AvailabilityBar from '../components/AvailabilityBar';
import DateBlock from '../components/DateBlock';
import { ErrorMessage } from '../components/ErrorMessage';
import { ListSkeleton } from '../components/Skeletons';
import StatusBadge from '../components/StatusBadge';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { useToast } from '../components/toast/ToastContext';
import { formatWeekdayTime } from '../lib/format';
import { buttonClass, cardClass } from '../lib/styles';

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={`${cardClass} p-5`}>
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

function summarize(events: EventDto[]) {
  const live = events.filter((e) => e.status === 'Published');
  return {
    live: live.length,
    drafts: events.filter((e) => e.status === 'Draft').length,
    seatsSold: live.reduce((total, e) => total + (e.capacity - e.seatsAvailable), 0),
  };
}

export default function MyEventsPage() {
  const events = useMyEvents();
  const publish = usePublishEvent();
  const cancel = useCancelEvent();
  const toast = useToast();
  const stats = summarize(events.data?.items ?? []);

  const onPublish = (event: EventDto) =>
    publish.mutate(event.id, {
      onSuccess: () => toast.success(`Published “${event.name}”. Reservations are open.`),
      onError: toast.error,
    });

  const onCancel = (event: EventDto) =>
    cancel.mutate(event.id, {
      onSuccess: () => toast.success(`Cancelled “${event.name}”.`),
      onError: toast.error,
    });

  return (
    <Container>
      <PageHeader
        actions={
          <Link className={buttonClass('primary')} to="/me/events/new">
            <Plus aria-hidden className="size-4" />
            New event
          </Link>
        }
        description="Create drafts, publish when you're ready, and track sales."
        title="My events"
      />

      {events.data && events.data.items.length > 0 ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Live events" value={stats.live} />
          <Stat label="Drafts" value={stats.drafts} />
          <Stat label="Seats sold" value={stats.seatsSold} />
        </div>
      ) : null}

      {events.isPending ? <ListSkeleton /> : null}
      {events.isError ? <ErrorMessage error={events.error} /> : null}
      {events.data?.items.length === 0 ? (
        <EmptyState icon={CalendarPlus} title="You haven't created any events yet">
          <p>Start with a draft; publish it when you&apos;re ready to sell seats.</p>
        </EmptyState>
      ) : null}

      <ul className="space-y-3">
        {events.data?.items.map((item) => (
          <li key={item.id}>
            <article className={`${cardClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center`}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <DateBlock iso={item.startsAt} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold">
                      <Link
                        className="hover:text-violet-700 dark:hover:text-violet-300"
                        to={`/events/${item.id}`}
                      >
                        {item.name}
                      </Link>
                    </h2>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-ink-muted">
                    {item.venue} · {formatWeekdayTime(item.startsAt)}
                  </p>
                </div>
              </div>
              <div className="sm:w-48">
                {item.status === 'Cancelled' ? (
                  <p className="text-sm text-ink-muted">Reservations were cancelled</p>
                ) : (
                  <AvailabilityBar capacity={item.capacity} seatsAvailable={item.seatsAvailable} />
                )}
              </div>
              <div className="flex gap-2 sm:w-44 sm:justify-end">
                {item.status === 'Draft' ? (
                  <button
                    className={buttonClass('primary', 'sm')}
                    type="button"
                    onClick={() => onPublish(item)}
                  >
                    Publish
                  </button>
                ) : null}
                {item.status === 'Cancelled' ? null : (
                  <button
                    className={buttonClass('danger', 'sm')}
                    type="button"
                    onClick={() => onCancel(item)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Container>
  );
}
