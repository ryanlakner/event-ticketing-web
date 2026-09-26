import { screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { apiUrl, paged } from '../test/fixtures';
import renderApp from '../test/renderApp';
import server from '../test/server';

describe('Layout', () => {
  beforeEach(() => {
    server.use(http.get(`${apiUrl}/api/events`, () => HttpResponse.json(paged([]))));
  });

  const navLinks = () =>
    within(screen.getByRole('navigation', { name: 'Main' }))
      .getAllByRole('link')
      .map((link) => link.textContent);

  it('shows customers their tickets', () => {
    renderApp('/', { roles: ['Customer'] });

    expect(navLinks()).toEqual(['Events', 'My tickets']);
  });

  it('shows organizers their events', () => {
    renderApp('/', { roles: ['Organizer'] });

    expect(navLinks()).toEqual(['Events', 'My events']);
  });

  it('offers sign-in to anonymous visitors', async () => {
    const { auth, user } = renderApp('/');

    expect(navLinks()).toEqual(['Events']);
    await user.click(screen.getByRole('button', { name: 'Sign in as customer' }));

    expect(auth.signIn).toHaveBeenCalledWith('Customer');
  });
});
