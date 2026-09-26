import { CalendarSearch, Search, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router';

import { useEvents } from '../api/queries';
import { ErrorMessage } from '../components/ErrorMessage';
import EventCard from '../components/EventCard';
import Pagination from '../components/Pagination';
import { EventGridSkeleton } from '../components/Skeletons';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [draft, setDraft] = useState(search);
  const events = useEvents(search, page);

  const goToPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage > 1) {
      next.set('page', String(nextPage));
    } else {
      next.delete('page');
    }
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams(draft.trim() ? { q: draft.trim() } : {});
  };

  const clearSearch = () => {
    setDraft('');
    setSearchParams({});
  };

  const count = events.data?.totalCount ?? 0;

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-violet-700 via-fuchsia-600 to-orange-500 text-white">
        {/* Soft light blooms for depth. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-32 size-96 rounded-full bg-orange-300/30 blur-3xl"
        />
        <Container className="relative py-16 sm:py-24">
          <p className="text-sm font-semibold tracking-widest text-white/80 uppercase">
            Live events near you
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Find your next night out
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">
            Reserve seats in seconds. We hold them for 10 minutes while you confirm.
          </p>

          <form
            className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white/15 p-2 ring-1 ring-white/25 backdrop-blur-md focus-within:ring-white/60"
            role="search"
            onSubmit={onSearch}
          >
            <label className="flex flex-1 items-center gap-2 pl-2" htmlFor="search">
              <Search aria-hidden className="size-5 shrink-0 text-white/80" />
              <span className="sr-only">Search by name or venue</span>
              <input
                className="w-full bg-transparent py-2 text-white placeholder:text-white/70 focus:outline-none"
                id="search"
                placeholder="Search events or venues"
                type="search"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
            <button
              className="h-11 cursor-pointer rounded-xl bg-white px-5 font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50"
              type="submit"
            >
              Search
            </button>
          </form>
        </Container>
      </section>

      <Container className="pt-10">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight">
            {search ? `Results for “${search}”` : 'Upcoming events'}
          </h2>
          <div className="flex items-center gap-3 text-sm text-ink-muted">
            {events.data ? <span>{count === 1 ? '1 event' : `${count} events`}</span> : null}
            {search ? (
              <button
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-medium text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
                type="button"
                onClick={clearSearch}
              >
                <X aria-hidden className="size-4" />
                Clear search
              </button>
            ) : null}
          </div>
        </div>

        {events.isPending ? <EventGridSkeleton /> : null}
        {events.isError ? <ErrorMessage error={events.error} /> : null}
        {events.data?.items.length === 0 ? (
          <EmptyState icon={CalendarSearch} title="No events found.">
            {search ? 'Try a different name or venue.' : 'Check back soon for new events.'}
          </EmptyState>
        ) : null}

        {events.data && events.data.items.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.data.items.map((item) => (
              <li key={item.id} className="h-full">
                <EventCard event={item} />
              </li>
            ))}
          </ul>
        ) : null}
        {events.data ? (
          <Pagination
            page={events.data.page}
            totalPages={events.data.totalPages}
            onPageChange={goToPage}
          />
        ) : null}
      </Container>
    </>
  );
}
