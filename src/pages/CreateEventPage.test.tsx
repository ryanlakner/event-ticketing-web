import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeEvent, paged } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

describe('CreateEventPage', () => {
  it('shows validation errors next to the fields they belong to', async () => {
    server.use(
      http.post(`${apiUrl}/api/events`, () =>
        HttpResponse.json(
          {
            status: 400,
            title: 'One or more validation errors occurred.',
            errors: {
              Name: ["'Name' must not be empty."],
              StartsAt: ["'Starts At' must be in the future."],
            },
          },
          { status: 400 },
        ),
      ),
    );
    const { user } = renderApp('/me/events/new', { roles: ['Organizer'] });

    await user.click(await screen.findByRole('button', { name: 'Create draft' }));

    expect(await screen.findByText("'Name' must not be empty.")).toBeInTheDocument();
    expect(screen.getByText("'Starts At' must be in the future.")).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('creates a draft and returns to My events', async () => {
    let body: Record<string, unknown> | undefined;
    const created = makeEvent({ id: 'new', name: 'Poetry Slam', status: 'Draft' });
    server.use(
      http.post(`${apiUrl}/api/events`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(created, { status: 201 });
      }),
      http.get(`${apiUrl}/api/me/events`, () => HttpResponse.json(paged([created]))),
    );
    const { user } = renderApp('/me/events/new', { roles: ['Organizer'] });

    await user.type(await screen.findByLabelText('Name'), 'Poetry Slam');
    await user.type(screen.getByLabelText('Venue'), 'Library');
    await user.type(screen.getByLabelText('Starts at'), '2030-05-01T19:00');
    await user.click(screen.getByRole('button', { name: 'Create draft' }));

    expect(await screen.findByRole('heading', { name: 'My events' })).toBeInTheDocument();
    // The heading renders before My events finishes loading, so wait for the list itself.
    expect(await screen.findByText('Draft', { selector: '.badge' })).toBeInTheDocument();
    expect(body).toMatchObject({ name: 'Poetry Slam', venue: 'Library', capacity: 100 });
    expect(new Date(body?.startsAt as string).toISOString()).toBe(body?.startsAt);
  });

  it('is only available to organizers', async () => {
    renderApp('/me/events/new', { roles: ['Customer'] });

    expect(await screen.findByRole('heading', { name: 'Not available' })).toBeInTheDocument();
  });
});
