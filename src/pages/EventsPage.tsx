import { type FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { useEvents } from '../api/queries';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatDateTime } from '../lib/format';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const [draft, setDraft] = useState(search);
  const events = useEvents(search);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams(draft.trim() ? { q: draft.trim() } : {});
  };

  return (
    <section>
      <h1>Upcoming events</h1>
      <form className="search" role="search" onSubmit={onSearch}>
        <label htmlFor="search">
          Search by name or venue
          <input
            id="search"
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <button type="submit">Search</button>
      </form>

      {events.isPending && <p>Loading events…</p>}
      {events.isError && <ErrorMessage error={events.error} />}
      {events.data?.items.length === 0 && <p>No events found.</p>}

      <ul className="card-grid">
        {events.data?.items.map((item) => (
          <li key={item.id} className="card">
            <h2>
              <Link to={`/events/${item.id}`}>{item.name}</Link>
            </h2>
            <p>{item.venue}</p>
            <p>{formatDateTime(item.startsAt)}</p>
            <p className={item.seatsAvailable === 0 ? 'sold-out' : undefined}>
              {item.seatsAvailable === 0 ? 'Sold out' : `${item.seatsAvailable} seats left`}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
