import { ChevronRight, Ticket } from 'lucide-react';
import { Link } from 'react-router';

import { useMyReservations } from '../api/queries';
import type { ReservationStatus } from '../api/types';
import DateBlock from '../components/DateBlock';
import { ErrorMessage } from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import { ListSkeleton } from '../components/Skeletons';
import StatusBadge from '../components/StatusBadge';
import StatusFilter from '../components/StatusFilter';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { formatWeekdayTime } from '../lib/format';
import useListParams from '../lib/useListParams';
import { buttonClass, cardClass } from '../lib/styles';

const statuses: readonly ReservationStatus[] = ['Pending', 'Confirmed', 'Cancelled', 'Expired'];

export default function MyReservationsPage() {
  const { page, status, setPage, setStatus } = useListParams(statuses);
  const reservations = useMyReservations(status, page);

  return (
    <Container>
      <PageHeader description="Your reservations, soonest event first." title="My tickets" />
      <StatusFilter statuses={statuses} value={status} onChange={setStatus} />
      {reservations.isPending ? <ListSkeleton /> : null}
      {reservations.isError ? <ErrorMessage error={reservations.error} /> : null}
      {reservations.data?.items.length === 0 && status ? (
        <EmptyState icon={Ticket} title={`No ${status.toLowerCase()} reservations`}>
          <p>Try another filter.</p>
        </EmptyState>
      ) : null}
      {reservations.data?.items.length === 0 && !status ? (
        <EmptyState icon={Ticket} title="No reservations yet">
          <p>Find an event you love and reserve a seat.</p>
          <Link className={`${buttonClass('primary')} mt-5`} to="/">
            Browse events
          </Link>
        </EmptyState>
      ) : null}
      <ul className="space-y-3">
        {reservations.data?.items.map((item) => (
          <li key={item.id}>
            <article
              className={`${cardClass} group relative flex items-center gap-4 p-4 transition hover:border-violet-500/40`}
            >
              <DateBlock iso={item.eventStartsAt} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">
                  <Link className="after:absolute after:inset-0" to={`/reservations/${item.id}`}>
                    {item.eventName}
                  </Link>
                </h2>
                <p className="text-sm text-ink-muted">
                  {formatWeekdayTime(item.eventStartsAt)} ·{' '}
                  {item.quantity === 1 ? '1 seat' : `${item.quantity} seats`}
                </p>
              </div>
              <StatusBadge status={item.status} />
              <ChevronRight
                aria-hidden
                className="size-5 text-ink-muted transition group-hover:translate-x-0.5"
              />
            </article>
          </li>
        ))}
      </ul>
      {reservations.data ? (
        <Pagination
          page={reservations.data.page}
          totalPages={reservations.data.totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </Container>
  );
}
