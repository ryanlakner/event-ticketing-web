import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeEvent, paged } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

const event = makeEvent({
  id: 'e1',
  name: 'Jazz Night',
  venue: 'Grand Hall',
  capacity: 150,
  seatsAvailable: 122,
});

describe('EditEventPage', () => {
  it('loads the current details and saves changes', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.get(`${apiUrl}/api/events/e1`, () => HttpResponse.json(event)),
      http.put(`${apiUrl}/api/events/e1`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(`${apiUrl}/api/me/events`, () => HttpResponse.json(paged([event]))),
    );
    const { user } = renderApp('/me/events/e1/edit', { roles: ['Organizer'] });

    const name = await screen.findByLabelText('Name');
    expect(name).toHaveValue('Jazz Night');
    expect(screen.getByLabelText('Starts at')).not.toHaveValue('');
    await user.clear(name);
    await user.type(name, 'Jazz Night: Encore');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved changes to “Jazz Night: Encore”.')).toBeInTheDocument();
    // My events is lazy-loaded, so wait for it rather than assuming it has rendered.
    expect(await screen.findByRole('heading', { name: 'My events' })).toBeInTheDocument();
    expect(body).toMatchObject({ name: 'Jazz Night: Encore', venue: 'Grand Hall', capacity: 150 });
    expect(body?.startsAt).toBe(event.startsAt);
  });

  it('keeps capacity at or above the seats already reserved', async () => {
    server.use(http.get(`${apiUrl}/api/events/e1`, () => HttpResponse.json(event)));
    const { user } = renderApp('/me/events/e1/edit', { roles: ['Organizer'] });

    const capacity = await screen.findByLabelText('Capacity');
    await user.clear(capacity);
    await user.type(capacity, '20');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    // 150 - 122 = 28 reserved; nothing is sent (an unmocked PUT would fail the test).
    expect(
      screen.getByText("28 seats are already reserved, so capacity can't go lower."),
    ).toBeInTheDocument();
  });

  it("doesn't offer a form for cancelled events", async () => {
    server.use(
      http.get(`${apiUrl}/api/events/e1`, () =>
        HttpResponse.json(makeEvent({ id: 'e1', status: 'Cancelled' })),
      ),
    );

    renderApp('/me/events/e1/edit', { roles: ['Organizer'] });

    expect(await screen.findByText('This event was cancelled')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });
});
