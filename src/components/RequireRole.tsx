import type { ReactNode } from 'react';

import { useAuth } from '../auth/AuthContext';
import { hasRole, type Role } from '../auth/roles';
import SignInButtons from './SignInButtons';

/**
 * Shows its children only to users with the role. This is for navigation only: the API
 * enforces the same rules on every request.
 */
export default function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="panel">
        <h1>Sign in required</h1>
        <p>Sign in as {role === 'Organizer' ? 'an organizer' : 'a customer'} to see this page.</p>
        <div className="actions">
          <SignInButtons />
        </div>
      </section>
    );
  }

  if (!hasRole(user, role)) {
    return (
      <section className="panel">
        <h1>Not available</h1>
        <p>
          This page is for the {role} role. You&apos;re signed in as {user.name}.
        </p>
      </section>
    );
  }

  // A fragment (not bare `children`) keeps this a synchronous component returning an element.
  return <>{children}</>;
}
