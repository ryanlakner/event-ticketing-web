import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useEvent, useReserveTickets } from '../api/queries';
import type { EventDto } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { hasRole, Roles } from '../auth/roles';
import { ErrorMessage, fieldErrors } from '../components/ErrorMessage';
import SignInButtons from '../components/SignInButtons';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../lib/format';

const maxTicketsPerReservation = 10;

function ReserveForm({ event }: { event: EventDto }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const reserve = useReserveTickets(event.id);
  const [email, setEmail] = useState(user?.name.includes('@') ? user.name : '');
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = Math.min(maxTicketsPerReservation, event.seatsAvailable);

  const onSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    reserve.mutate(
      { customerEmail: email, quantity },
      { onSuccess: async (reservation) => navigate(`/reservations/${reservation.id}`) },
    );
  };

  return (
    <form className="panel form" onSubmit={onSubmit}>
      <h2>Reserve seats</h2>
      <label htmlFor="email">
        Email for your tickets
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(changeEvent) => setEmail(changeEvent.target.value)}
        />
      </label>
      {fieldErrors(reserve.error, 'CustomerEmail') && (
        <p className="field-error">{fieldErrors(reserve.error, 'CustomerEmail')}</p>
      )}

      <label htmlFor="quantity">
        Seats
        <input
          id="quantity"
          type="number"
          min={1}
          max={maxQuantity}
          required
          value={quantity}
          onChange={(changeEvent) => setQuantity(Number(changeEvent.target.value))}
        />
      </label>

      {reserve.isError && <ErrorMessage error={reserve.error} />}
      <button type="submit" disabled={reserve.isPending}>
        {reserve.isPending ? 'Reserving…' : 'Reserve'}
      </button>
      <p className="muted">Seats are held for 10 minutes while you confirm.</p>
    </form>
  );
}

function ReservePanel({ event }: { event: EventDto }) {
  const { user } = useAuth();

  if (event.status !== 'Published') {
    return <p className="panel">Reservations are closed for this event.</p>;
  }
  if (event.seatsAvailable === 0) {
    return <p className="panel sold-out">This event is sold out.</p>;
  }
  if (!hasRole(user, Roles.Customer)) {
    return (
      <div className="panel">
        <p>Sign in as a customer to reserve seats.</p>
        {!user && (
          <div className="actions">
            <SignInButtons />
          </div>
        )}
      </div>
    );
  }
  return <ReserveForm event={event} />;
}

export default function EventDetailPage() {
  const { eventId = '' } = useParams();
  const event = useEvent(eventId);

  if (event.isPending) {
    return <p>Loading event…</p>;
  }
  if (event.isError) {
    return <ErrorMessage error={event.error} />;
  }

  const { data } = event;
  return (
    <section>
      <h1>
        {data.name} <StatusBadge status={data.status} />
      </h1>
      <dl className="details">
        <dt>When</dt>
        <dd>{formatDateTime(data.startsAt)}</dd>
        <dt>Where</dt>
        <dd>{data.venue}</dd>
        <dt>Seats left</dt>
        <dd>
          {data.seatsAvailable} of {data.capacity}
        </dd>
      </dl>
      {data.description && <p>{data.description}</p>}
      <ReservePanel event={data} />
    </section>
  );
}
