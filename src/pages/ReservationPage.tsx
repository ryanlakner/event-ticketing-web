import { Link, useParams } from 'react-router';

import { useCancelReservation, useConfirmReservation, useReservation } from '../api/queries';
import { useAuth } from '../auth/AuthContext';
import { hasRole, Roles } from '../auth/roles';
import Countdown from '../components/Countdown';
import { ErrorMessage } from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../lib/format';

export default function ReservationPage() {
  const { reservationId = '' } = useParams();
  const { user } = useAuth();
  const reservation = useReservation(reservationId);
  const confirm = useConfirmReservation();
  const cancel = useCancelReservation();

  if (reservation.isPending) {
    return <p>Loading reservation…</p>;
  }
  if (reservation.isError) {
    return <ErrorMessage error={reservation.error} />;
  }

  const { data } = reservation;
  const isPending = data.status === 'Pending';
  const isActive = isPending || data.status === 'Confirmed';

  return (
    <section>
      <h1>
        Reservation <StatusBadge status={data.status} />
      </h1>
      {isPending && <Countdown until={data.expiresAt} />}
      <dl className="details">
        <dt>Event</dt>
        <dd>
          <Link to={`/events/${data.eventId}`}>{data.eventName}</Link>
        </dd>
        <dt>When</dt>
        <dd>{formatDateTime(data.eventStartsAt)}</dd>
        <dt>Seats</dt>
        <dd>{data.quantity}</dd>
        <dt>Tickets sent to</dt>
        <dd>{data.customerEmail}</dd>
        {data.confirmedAt && (
          <>
            <dt>Confirmed</dt>
            <dd>{formatDateTime(data.confirmedAt)}</dd>
          </>
        )}
      </dl>

      {(confirm.isError || cancel.isError) && (
        <ErrorMessage error={confirm.error ?? cancel.error} />
      )}
      <div className="actions">
        {isPending && hasRole(user, Roles.Customer) && (
          <button
            type="button"
            disabled={confirm.isPending}
            onClick={() => confirm.mutate(data.id)}
          >
            Confirm reservation
          </button>
        )}
        {isActive && (
          <button
            type="button"
            className="secondary"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(data.id)}
          >
            Cancel reservation
          </button>
        )}
      </div>
    </section>
  );
}
