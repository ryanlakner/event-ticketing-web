import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeReservation, paged } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

describe('MyReservationsPage', () => {
  it('filters reservations by status', async () => {
    const statusesRequested: (string | null)[] = [];
    server.use(
      http.get(`${apiUrl}/api/me/reservations`, ({ request }) => {
        const status = new URL(request.url).searchParams.get('status');
        statusesRequested.push(status);
        return HttpResponse.json(
          paged(
            status === 'Confirmed'
              ? [makeReservation({ id: 'r2', eventName: 'Confirmed show', status: 'Confirmed' })]
              : [makeReservation({ id: 'r1', eventName: 'Pending show' })],
          ),
        );
      }),
    );
    const { user } = renderApp('/me/reservations', { roles: ['Customer'] });

    expect(await screen.findByText('Pending show')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Confirmed' }));

    expect(await screen.findByText('Confirmed show')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(statusesRequested).toEqual([null, 'Confirmed']);
  });

  it('explains an empty filter', async () => {
    server.use(http.get(`${apiUrl}/api/me/reservations`, () => HttpResponse.json(paged([]))));

    renderApp('/me/reservations?status=Expired', { roles: ['Customer'] });

    expect(await screen.findByText('No expired reservations')).toBeInTheDocument();
  });
});
