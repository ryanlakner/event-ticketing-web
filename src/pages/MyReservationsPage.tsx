import { Link } from 'react-router';

import { useMyReservations } from '../api/queries';
import { ErrorMessage } from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../lib/format';

export default function MyReservationsPage() {
  const reservations = useMyReservations();

  return (
    <section>
      <h1>My tickets</h1>
      {reservations.isPending && <p>Loading your reservations…</p>}
      {reservations.isError && <ErrorMessage error={reservations.error} />}
      {reservations.data?.items.length === 0 && (
        <p>
          No reservations yet. <Link to="/">Browse events</Link>.
        </p>
      )}
      <ul className="list">
        {reservations.data?.items.map((item) => (
          <li key={item.id}>
            <Link to={`/reservations/${item.id}`}>{item.eventName}</Link>
            <span>{formatDateTime(item.eventStartsAt)}</span>
            <span>
              {item.quantity} {item.quantity === 1 ? 'seat' : 'seats'}
            </span>
            <StatusBadge status={item.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
