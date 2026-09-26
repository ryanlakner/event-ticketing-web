import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeEvent, makeReservation } from '../test/fixtures';
import renderApp, { testToken } from '../test/renderApp';
import server from '../test/server';

const event = makeEvent({ id: 'e1', name: 'Jazz Night', seatsAvailable: 5 });

describe('EventDetailPage', () => {
  it('lets a customer reserve seats and takes them to the held reservation', async () => {
    let sent: { authorization: string | null; body: unknown } | undefined;
    const reservation = makeReservation({ id: 'r1', eventId: 'e1', quantity: 2 });
    server.use(
      http.get(`${apiUrl}/api/events/e1`, () => HttpResponse.json(event)),
      http.post(`${apiUrl}/api/events/e1/reservations`, async ({ request }) => {
        sent = { authorization: request.headers.get('Authorization'), body: await request.json() };
        return HttpResponse.json(reservation, { status: 201 });
      }),
      http.get(`${apiUrl}/api/reservations/r1`, () => HttpResponse.json(reservation)),
    );
    const { user } = renderApp('/events/e1', { roles: ['Customer'] });

    const email = await screen.findByLabelText('Email for your tickets');
    expect(email).toHaveValue('fan@example.com');
    await user.clear(screen.getByLabelText('Seats'));
    await user.type(screen.getByLabelText('Seats'), '2');
    await user.click(screen.getByRole('button', { name: 'Reserve' }));

    expect(await screen.findByRole('heading', { name: /Reservation/ })).toBeInTheDocument();
    expect(screen.getByText(/Held for/)).toBeInTheDocument();
    expect(sent).toEqual({
      authorization: `Bearer ${testToken}`,
      body: { customerEmail: 'fan@example.com', quantity: 2 },
    });
  });

  it('shows why a reservation was refused', async () => {
    server.use(
      http.get(`${apiUrl}/api/events/e1`, () => HttpResponse.json(event)),
      http.post(`${apiUrl}/api/events/e1/reservations`, () =>
        HttpResponse.json(
          { status: 409, title: 'Conflict', detail: 'This event is sold out.' },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderApp('/events/e1', { roles: ['Customer'] });

    await user.click(await screen.findByRole('button', { name: 'Reserve' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This event is sold out.');
  });

  it('asks anonymous visitors to sign in instead of showing the form', async () => {
    server.use(http.get(`${apiUrl}/api/events/e1`, () => HttpResponse.json(event)));

    renderApp('/events/e1');

    expect(await screen.findByText('Sign in as a customer to reserve seats.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reserve' })).not.toBeInTheDocument();
  });

  it('shows a sold-out event without a form', async () => {
    server.use(
      http.get(`${apiUrl}/api/events/e1`, () =>
        HttpResponse.json(makeEvent({ id: 'e1', seatsAvailable: 0 })),
      ),
    );

    renderApp('/events/e1', { roles: ['Customer'] });

    expect(await screen.findByText('This event is sold out.')).toBeInTheDocument();
  });
});
