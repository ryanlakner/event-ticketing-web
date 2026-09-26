import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';

import { ApiClientContext } from '../api/ApiClientContext';
import { createApiClient } from '../api/client';
import App from '../App';
import { type Auth, AuthContext } from '../auth/AuthContext';
import type { Role } from '../auth/roles';
import { apiUrl } from './fixtures';

export const testToken = 'test-access-token';

interface RenderAppOptions {
  /** Signed-in roles; omit for an anonymous visitor. */
  roles?: Role[];
}

/** Renders the whole app at a URL, with a signed-in (or anonymous) user and a real API client. */
export default function renderApp(route: string, { roles }: RenderAppOptions = {}) {
  const auth: Auth = {
    mode: 'dev',
    user: roles ? { name: 'fan@example.com', roles } : null,
    signInOptions: ['Organizer', 'Customer'],
    signIn: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    getAccessToken: async () => (roles ? testToken : null),
  };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <ApiClientContext.Provider value={createApiClient(apiUrl, auth.getAccessToken)}>
          <MemoryRouter initialEntries={[route]}>
            <App />
          </MemoryRouter>
        </ApiClientContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

  return { ...view, auth, user: userEvent.setup() };
}
