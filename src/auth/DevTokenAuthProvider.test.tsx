import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useAuth } from './AuthContext';
import DevTokenAuthProvider from './DevTokenAuthProvider';

const organizerToken = `h.${btoa(JSON.stringify({ unique_name: 'org@example.com', role: 'Organizer' }))}.s`;

function Probe() {
  const auth = useAuth();
  return (
    <>
      <p>{auth.user ? `${auth.user.name} (${auth.user.roles.join(', ')})` : 'anonymous'}</p>
      <button type="button" onClick={async () => auth.signIn('Organizer')}>
        sign in
      </button>
      <button type="button" onClick={async () => auth.signOut()}>
        sign out
      </button>
    </>
  );
}

describe('DevTokenAuthProvider', () => {
  it('signs in with the configured token for a role and remembers it for the session', async () => {
    const user = userEvent.setup();
    render(
      <DevTokenAuthProvider tokens={{ Organizer: organizerToken }}>
        <Probe />
      </DevTokenAuthProvider>,
    );
    expect(screen.getByText('anonymous')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'sign in' }));

    expect(screen.getByText('org@example.com (Organizer)')).toBeInTheDocument();
    expect(sessionStorage.getItem('event-ticketing:dev-role')).toBe('Organizer');

    await user.click(screen.getByRole('button', { name: 'sign out' }));
    expect(screen.getByText('anonymous')).toBeInTheDocument();
  });
});
