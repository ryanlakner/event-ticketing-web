import { CalendarDays, Clock, MapPin, Minus, Plus, Ticket, Users } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { useEvent, useReserveTickets } from '../api/queries';
import type { EventDto } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { hasRole, Roles } from '../auth/roles';
import AvailabilityBar from '../components/AvailabilityBar';
import DateBlock from '../components/DateBlock';
import { ErrorMessage, fieldErrors } from '../components/ErrorMessage';
import SignInButtons from '../components/SignInButtons';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/toast/ToastContext';
import Container from '../components/ui/Container';
import { formatLongDate, formatTime } from '../lib/format';
import { buttonClass, cardClass, inputClass, labelClass } from '../lib/styles';

const maxTicketsPerReservation = 10;

function ReserveForm({ event }: { event: EventDto }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reserve = useReserveTickets(event.id);
  const toast = useToast();
  const [email, setEmail] = useState(user?.name.includes('@') ? user.name : '');
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = Math.min(maxTicketsPerReservation, event.seatsAvailable);
  const emailError = fieldErrors(reserve.error, 'CustomerEmail');

  const onSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    reserve.mutate(
      { customerEmail: email, quantity },
      {
        onSuccess: async (reservation) => {
          toast.success('Seats held for 10 minutes. Confirm to keep them.');
          await navigate(`/reservations/${reservation.id}`);
        },
      },
    );
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <label className={labelClass} htmlFor="email">
        Email for your tickets
        <input
          aria-invalid={emailError ? true : undefined}
          className={inputClass}
          id="email"
          required
          type="email"
          value={email}
          onChange={(changeEvent) => setEmail(changeEvent.target.value)}
        />
      </label>
      {emailError ? <p className="text-sm text-rose-600 dark:text-rose-400">{emailError}</p> : null}

      <div>
        {/* Visible caption; the label below (screen-reader text) names the input itself. */}
        <span aria-hidden className={labelClass}>
          Seats
        </span>
        <div className="mt-1.5 flex items-center gap-2">
          <button
            aria-label="Remove a seat"
            className={buttonClass('secondary', 'md')}
            disabled={quantity <= 1}
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus aria-hidden className="size-4" />
          </button>
          <label className="flex-1" htmlFor="quantity">
            <span className="sr-only">Seats</span>
            <input
              className={`${inputClass} mt-0 text-center font-semibold tabular-nums`}
              id="quantity"
              max={maxQuantity}
              min={1}
              required
              type="number"
              value={quantity}
              onChange={(changeEvent) => setQuantity(Number(changeEvent.target.value))}
            />
          </label>
          <button
            aria-label="Add a seat"
            className={buttonClass('secondary', 'md')}
            disabled={quantity >= maxQuantity}
            type="button"
            onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
          >
            <Plus aria-hidden className="size-4" />
          </button>
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">Up to {maxQuantity} per reservation.</p>
      </div>

      {reserve.isError && !emailError ? <ErrorMessage error={reserve.error} /> : null}
      <button
        className={`${buttonClass('primary', 'lg')} w-full`}
        disabled={reserve.isPending}
        type="submit"
      >
        <Ticket aria-hidden className="size-5" />
        {reserve.isPending ? 'Reserving…' : 'Reserve'}
      </button>
      <p className="text-center text-xs text-ink-muted">
        Seats are held for 10 minutes while you confirm.
      </p>
    </form>
  );
}

function PanelMessage({ children }: { children: ReactNode }) {
  return <div className="space-y-4 text-center text-ink-muted">{children}</div>;
}

function ReservePanel({ event }: { event: EventDto }) {
  const { user } = useAuth();

  if (event.status !== 'Published') {
    return (
      <PanelMessage>
        <p>Reservations are closed for this event.</p>
      </PanelMessage>
    );
  }
  if (event.seatsAvailable === 0) {
    return (
      <PanelMessage>
        <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
          This event is sold out.
        </p>
        <Link className={buttonClass('secondary')} to="/">
          Browse other events
        </Link>
      </PanelMessage>
    );
  }
  if (!hasRole(user, Roles.Customer)) {
    return (
      <PanelMessage>
        <p>Sign in as a customer to reserve seats.</p>
        {user ? null : (
          <div className="flex justify-center">
            <SignInButtons />
          </div>
        )}
      </PanelMessage>
    );
  }
  return <ReserveForm event={event} />;
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-ink-muted">
        {icon}
      </span>
      <div>
        <dt className="text-sm text-ink-muted">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { eventId = '' } = useParams();
  const event = useEvent(eventId);

  if (event.isPending) {
    return (
      <Container className="pt-10">
        <div aria-hidden className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
        <p className="sr-only">Loading event…</p>
      </Container>
    );
  }
  if (event.isError) {
    return (
      <Container className="pt-10">
        <ErrorMessage error={event.error} />
      </Container>
    );
  }

  const { data } = event;
  return (
    <>
      <section className="border-b border-line bg-linear-to-br from-violet-600/15 via-fuchsia-500/10 to-transparent">
        <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center">
          <DateBlock iso={data.startsAt} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{data.name}</h1>
              {data.status === 'Published' ? null : <StatusBadge status={data.status} />}
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-muted">
              <span className="flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4" />
                {data.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock aria-hidden className="size-4" />
                {formatTime(data.startsAt)}
              </span>
            </p>
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 pt-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {data.description ? (
            <section>
              <h2 className="text-lg font-semibold">About this event</h2>
              <p className="mt-2 leading-relaxed text-ink-muted">{data.description}</p>
            </section>
          ) : null}
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail icon={<CalendarDays aria-hidden className="size-5" />} label="When">
              {formatLongDate(data.startsAt)} at {formatTime(data.startsAt)}
            </Detail>
            <Detail icon={<MapPin aria-hidden className="size-5" />} label="Where">
              {data.venue}
            </Detail>
          </dl>
          <section className={`${cardClass} p-5`}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-muted">
              <Users aria-hidden className="size-4" />
              Availability · {data.capacity.toLocaleString()} seats in total
            </h2>
            <AvailabilityBar capacity={data.capacity} seatsAvailable={data.seatsAvailable} />
          </section>
        </div>

        <aside className={`${cardClass} h-fit p-6 lg:sticky lg:top-24`}>
          <h2 className="mb-5 text-lg font-semibold">Reserve seats</h2>
          <ReservePanel event={data} />
        </aside>
      </Container>
    </>
  );
}
