import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { useAuth } from '../auth/AuthContext';
import { hasRole, type Role } from '../auth/roles';
import SignInButtons from './SignInButtons';
import Container from './ui/Container';
import EmptyState from './ui/EmptyState';

/**
 * Shows its children only to users with the role. This is for navigation only: the API
 * enforces the same rules on every request.
 */
export default function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Container className="max-w-xl pt-16">
        <EmptyState icon={Lock} title="Sign in required">
          <p>Sign in as {role === 'Organizer' ? 'an organizer' : 'a customer'} to see this page.</p>
          <div className="mt-5 flex justify-center">
            <SignInButtons />
          </div>
        </EmptyState>
      </Container>
    );
  }

  if (!hasRole(user, role)) {
    return (
      <Container className="max-w-xl pt-16">
        <EmptyState icon={Lock} title="Not available">
          This page is for the {role} role. You&apos;re signed in as {user.name}.
        </EmptyState>
      </Container>
    );
  }

  // A fragment (not bare `children`) keeps this a synchronous component returning an element.
  return <>{children}</>;
}
