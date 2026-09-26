import { Link } from 'react-router';

import { useCancelEvent, useMyEvents, usePublishEvent } from '../api/queries';
import { ErrorMessage } from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime } from '../lib/format';

export default function MyEventsPage() {
  const events = useMyEvents();
  const publish = usePublishEvent();
  const cancel = useCancelEvent();

  return (
    <section>
      <div className="page-heading">
        <h1>My events</h1>
        <Link className="button" to="/me/events/new">
          New event
        </Link>
      </div>
      {events.isPending && <p>Loading your events…</p>}
      {events.isError && <ErrorMessage error={events.error} />}
      {(publish.isError || cancel.isError) && (
        <ErrorMessage error={publish.error ?? cancel.error} />
      )}
      {events.data?.items.length === 0 && <p>You haven&apos;t created any events yet.</p>}
      <ul className="list">
        {events.data?.items.map((item) => (
          <li key={item.id}>
            <Link to={`/events/${item.id}`}>{item.name}</Link>
            <span>{formatDateTime(item.startsAt)}</span>
            <span>
              {item.seatsAvailable} / {item.capacity} left
            </span>
            <StatusBadge status={item.status} />
            <span className="actions">
              {item.status === 'Draft' && (
                <button type="button" onClick={() => publish.mutate(item.id)}>
                  Publish
                </button>
              )}
              {item.status !== 'Cancelled' && (
                <button type="button" className="secondary" onClick={() => cancel.mutate(item.id)}>
                  Cancel
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
