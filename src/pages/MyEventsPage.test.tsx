import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { apiUrl, makeEvent, paged } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

describe('MyEventsPage', () => {
  it('publishes a draft and confirms it with a toast', async () => {
    let draft = makeEvent({ id: 'd1', name: 'Winter Lights Gala', status: 'Draft' });
    server.use(
      http.get(`${apiUrl}/api/me/events`, () => HttpResponse.json(paged([draft]))),
      http.post(`${apiUrl}/api/events/d1/publish`, () => {
        draft = { ...draft, status: 'Published' };
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { user } = renderApp('/me/events', { roles: ['Organizer'] });

    await user.click(await screen.findByRole('button', { name: 'Publish' }));

    expect(
      await screen.findByText('Published “Winter Lights Gala”. Reservations are open.'),
    ).toBeInTheDocument();
    const row = screen.getByRole('article');
    expect(await within(row).findByText('Published', { selector: '[data-status]' })).toBeVisible();
  });

  it('shows why an action failed in an error toast', async () => {
    server.use(
      http.get(`${apiUrl}/api/me/events`, () =>
        HttpResponse.json(paged([makeEvent({ id: 'd1', status: 'Draft' })])),
      ),
      http.post(`${apiUrl}/api/events/d1/publish`, () =>
        HttpResponse.json(
          { status: 409, title: 'Conflict', detail: 'The event has already started.' },
          { status: 409 },
        ),
      ),
    );
    const { user } = renderApp('/me/events', { roles: ['Organizer'] });

    await user.click(await screen.findByRole('button', { name: 'Publish' }));

    expect(await screen.findByText('The event has already started.')).toBeInTheDocument();
  });
});
