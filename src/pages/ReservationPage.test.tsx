import { fireEvent, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeReservation } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

describe('ReservationPage', () => {
  it('confirms a pending reservation and shows the updated status', async () => {
    let current = makeReservation({ id: 'r1' });
    server.use(
      http.get(`${apiUrl}/api/reservations/r1`, () => HttpResponse.json(current)),
      http.post(`${apiUrl}/api/reservations/r1/confirm`, () => {
        current = { ...current, status: 'Confirmed', confirmedAt: new Date().toISOString() };
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderApp('/reservations/r1', { roles: ['Customer'] });

    await user.click(await screen.findByRole('button', { name: 'Confirm reservation' }));

    expect(await screen.findByText('Confirmed', { selector: '[data-status]' })).toBeInTheDocument();
    expect(screen.getByText('Reservation confirmed. Enjoy the show!')).toBeInTheDocument();
    expect(screen.queryByText(/Held for/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm reservation' })).not.toBeInTheDocument();
  });

  it('explains when the hold has already expired', async () => {
    server.use(
      http.get(`${apiUrl}/api/reservations/r1`, () =>
        HttpResponse.json(makeReservation({ id: 'r1' })),
      ),
      http.post(`${apiUrl}/api/reservations/r1/confirm`, () =>
        HttpResponse.json(
          { status: 409, title: 'Conflict', detail: 'The reservation hold has expired.' },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderApp('/reservations/r1', { roles: ['Customer'] });

    await user.click(await screen.findByRole('button', { name: 'Confirm reservation' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('The reservation hold has expired.');
  });

  it('reports a reservation that belongs to someone else as not found', async () => {
    server.use(
      http.get(`${apiUrl}/api/reservations/r1`, () =>
        HttpResponse.json(
          { status: 404, title: 'Not Found', detail: "Reservation 'r1' was not found." },
          { status: 404 },
        ),
      ),
    );

    renderApp('/reservations/r1', { roles: ['Customer'] });

    expect(await screen.findByRole('alert')).toHaveTextContent("Reservation 'r1' was not found.");
  });
});

describe('ReservationPage cancellation', () => {
  it('asks before cancelling, and does nothing if the customer backs out', async () => {
    let cancelled = false;
    server.use(
      http.get(`${apiUrl}/api/reservations/r1`, () =>
        HttpResponse.json(makeReservation({ id: 'r1', quantity: 2 })),
      ),
      http.post(`${apiUrl}/api/reservations/r1/cancel`, () => {
        cancelled = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderApp('/reservations/r1', { roles: ['Customer'] });

    await user.click(await screen.findByRole('button', { name: 'Cancel reservation' }));
    const dialog = screen.getByRole('dialog', { name: 'Cancel this reservation?' });
    expect(dialog).toHaveAccessibleDescription(/Your 2 seats go back on sale/);

    await user.click(within(dialog).getByRole('button', { name: 'Keep reservation' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(cancelled).toBe(false);
  });

  it('cancels once confirmed', async () => {
    let current = makeReservation({ id: 'r1' });
    server.use(
      http.get(`${apiUrl}/api/reservations/r1`, () => HttpResponse.json(current)),
      http.post(`${apiUrl}/api/reservations/r1/cancel`, () => {
        current = { ...current, status: 'Cancelled' };
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderApp('/reservations/r1', { roles: ['Customer'] });

    await user.click(await screen.findByRole('button', { name: 'Cancel reservation' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel reservation' }),
    );

    expect(await screen.findByText('Cancelled', { selector: '[data-status]' })).toBeInTheDocument();
    expect(screen.getByText('Reservation cancelled. Your seats are back on sale.')).toBeVisible();
  });

  it('treats Escape as backing out', async () => {
    server.use(
      http.get(`${apiUrl}/api/reservations/r1`, () =>
        HttpResponse.json(makeReservation({ id: 'r1' })),
      ),
    );
    const { user } = renderApp('/reservations/r1', { roles: ['Customer'] });

    await user.click(await screen.findByRole('button', { name: 'Cancel reservation' }));
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
