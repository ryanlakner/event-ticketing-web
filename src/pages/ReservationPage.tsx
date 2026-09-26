import { ArrowLeft, CircleCheck, Clock, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { useCancelReservation, useConfirmReservation, useReservation } from '../api/queries';
import { useAuth } from '../auth/AuthContext';
import { hasRole, Roles } from '../auth/roles';
import Countdown from '../components/Countdown';
import { ErrorMessage } from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { useConfirm } from '../components/confirm/ConfirmContext';
import { useToast } from '../components/toast/ToastContext';
import Container from '../components/ui/Container';
import { formatLongDate, formatTime } from '../lib/format';
import { buttonClass } from '../lib/styles';

interface TicketFieldProps {
  label: string;
  className?: string;
  children: ReactNode;
}

function TicketField({ label, className = undefined, children }: TicketFieldProps) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</dt>
      <dd className="mt-0.5 font-semibold wrap-break-word">{children}</dd>
    </div>
  );
}

export default function ReservationPage() {
  const { reservationId = '' } = useParams();
  const { user } = useAuth();
  const reservation = useReservation(reservationId);
  const confirm = useConfirmReservation();
  const cancel = useCancelReservation();
  const toast = useToast();
  const confirmDialog = useConfirm();

  if (reservation.isPending) {
    return (
      <Container className="max-w-2xl pt-10">
        <div aria-hidden className="h-96 animate-pulse rounded-3xl bg-surface-muted" />
        <p className="sr-only">Loading reservation…</p>
      </Container>
    );
  }
  if (reservation.isError) {
    return (
      <Container className="max-w-2xl pt-10">
        <ErrorMessage error={reservation.error} />
      </Container>
    );
  }

  const { data } = reservation;
  const isPending = data.status === 'Pending';
  const isActive = isPending || data.status === 'Confirmed';

  return (
    <Container className="max-w-2xl pt-8">
      <Link
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        to={`/events/${data.eventId}`}
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to event
      </Link>

      {data.status === 'Confirmed' ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          <CircleCheck aria-hidden className="size-5 shrink-0" />
          You&apos;re going! Tickets are on their way to {data.customerEmail}.
        </p>
      ) : null}

      {/* A ticket: event stub on top, perforation, then the reservation details. */}
      <article className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface shadow-xl shadow-violet-500/5">
        <div className="bg-linear-to-br from-violet-700 via-fuchsia-600 to-orange-500 p-6 text-white sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              <span className="block text-sm font-semibold tracking-widest text-white/75 uppercase">
                Reservation
              </span>
              {data.eventName}
            </h1>
            <span className="shrink-0">
              <StatusBadge status={data.status} variant="solid" />
            </span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-white/85">
            <Clock aria-hidden className="size-4" />
            {formatLongDate(data.eventStartsAt)} at {formatTime(data.eventStartsAt)}
          </p>
        </div>

        <div aria-hidden className="relative h-6">
          <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-line" />
          <div className="absolute top-0 -left-3 size-6 rounded-full border border-line bg-canvas" />
          <div className="absolute top-0 -right-3 size-6 rounded-full border border-line bg-canvas" />
        </div>

        <div className="space-y-6 p-6 pt-2 sm:p-8 sm:pt-2">
          {isPending ? <Countdown from={data.createdAt} until={data.expiresAt} /> : null}

          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <TicketField label="Seats">{data.quantity}</TicketField>
            <TicketField label="Reference">{data.id.slice(-8).toUpperCase()}</TicketField>
            <TicketField className="col-span-2 sm:col-span-1" label="Tickets sent to">
              {data.customerEmail}
            </TicketField>
          </dl>

          <Link
            className="flex items-center gap-1.5 text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
            to={`/events/${data.eventId}`}
          >
            <MapPin aria-hidden className="size-4" />
            Event details
          </Link>

          {confirm.isError || cancel.isError ? (
            <ErrorMessage error={confirm.error ?? cancel.error} />
          ) : null}

          {isActive ? (
            <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
              {isPending && hasRole(user, Roles.Customer) ? (
                <button
                  className={buttonClass('primary', 'lg')}
                  disabled={confirm.isPending}
                  type="button"
                  onClick={() =>
                    confirm.mutate(data.id, {
                      onSuccess: () => toast.success('Reservation confirmed. Enjoy the show!'),
                    })
                  }
                >
                  <CircleCheck aria-hidden className="size-5" />
                  Confirm reservation
                </button>
              ) : null}
              <button
                className={buttonClass('danger', 'lg')}
                disabled={cancel.isPending}
                type="button"
                onClick={async () => {
                  const seats =
                    data.quantity === 1 ? 'Your seat goes' : `Your ${data.quantity} seats go`;
                  const confirmed = await confirmDialog({
                    title: 'Cancel this reservation?',
                    description: `${seats} back on sale for ${data.eventName}. This can't be undone.`,
                    confirmLabel: 'Cancel reservation',
                    cancelLabel: 'Keep reservation',
                  });
                  if (confirmed) {
                    cancel.mutate(data.id, {
                      onSuccess: () =>
                        toast.success('Reservation cancelled. Your seats are back on sale.'),
                    });
                  }
                }}
              >
                Cancel reservation
              </button>
            </div>
          ) : null}
        </div>
      </article>
    </Container>
  );
}
