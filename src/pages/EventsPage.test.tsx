import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeEvent, paged } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

describe('EventsPage', () => {
  it('lists published events with seat availability', async () => {
    let requestedStatus: string | null = null;
    server.use(
      http.get(`${apiUrl}/api/events`, ({ request }) => {
        requestedStatus = new URL(request.url).searchParams.get('status');
        return HttpResponse.json(
          paged([
            makeEvent({ id: 'e1', name: 'Jazz Night', seatsAvailable: 12 }),
            makeEvent({ id: 'e2', name: 'Chess Open', seatsAvailable: 0 }),
          ]),
        );
      }),
    );

    renderApp('/');

    expect(await screen.findByRole('link', { name: 'Jazz Night' })).toHaveAttribute(
      'href',
      '/events/e1',
    );
    expect(screen.getByText('12 seats left')).toBeInTheDocument();
    expect(screen.getByText('Sold out')).toBeInTheDocument();
    expect(requestedStatus).toBe('Published');
  });

  it('searches by name or venue', async () => {
    const searches: (string | null)[] = [];
    server.use(
      http.get(`${apiUrl}/api/events`, ({ request }) => {
        searches.push(new URL(request.url).searchParams.get('search'));
        return HttpResponse.json(paged([]));
      }),
    );
    const { user } = renderApp('/');

    await user.type(screen.getByLabelText('Search by name or venue'), 'jazz');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('No events found.')).toBeInTheDocument();
    expect(searches).toEqual([null, 'jazz']);
  });

  it('shows the API problem detail when loading fails', async () => {
    server.use(
      http.get(`${apiUrl}/api/events`, () =>
        HttpResponse.json(
          { status: 503, title: 'Service Unavailable', detail: 'Try again shortly.' },
          { status: 503 },
        ),
      ),
    );

    renderApp('/');

    expect(await screen.findByRole('alert', {}, { timeout: 5000 })).toHaveTextContent(
      'Try again shortly.',
    );
  });
});

describe('EventsPage paging', () => {
  it('pages through events', async () => {
    const pagesRequested: (string | null)[] = [];
    server.use(
      http.get(`${apiUrl}/api/events`, ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        pagesRequested.push(page);
        const name = page === '2' ? 'Second page event' : 'First page event';
        return HttpResponse.json({
          ...paged([makeEvent({ id: `e${page}`, name })]),
          page: Number(page),
          totalCount: 10,
          totalPages: 2,
        });
      }),
    );
    const { user } = renderApp('/');

    expect(await screen.findByText('First page event')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Second page event')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(pagesRequested).toEqual(['1', '2']);
  });
});
