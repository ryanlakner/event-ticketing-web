import { LogIn } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { buttonClass } from '../lib/styles';

/** Sign-in controls: one button for Entra ID, or one per role with local dev tokens. */
export default function SignInButtons() {
  const auth = useAuth();

  if (auth.mode === 'none') {
    return <span className="text-sm text-ink-muted">Sign-in isn&apos;t configured</span>;
  }

  if (auth.signInOptions.length > 0) {
    return (
      <div className="flex gap-2">
        {auth.signInOptions.map((role, index) => (
          <button
            key={role}
            aria-label={`Sign in as ${role.toLowerCase()}`}
            className={buttonClass(index === 0 ? 'secondary' : 'primary', 'sm')}
            type="button"
            onClick={async () => auth.signIn(role)}
          >
            {/* The short label on phones is part of the accessible name, as WCAG 2.5.3 asks. */}
            <span className="sm:hidden">{role}</span>
            <span className="hidden sm:inline">Sign in as {role.toLowerCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      className={buttonClass('primary', 'sm')}
      type="button"
      onClick={async () => auth.signIn()}
    >
      <LogIn aria-hidden className="size-4" />
      Sign in
    </button>
  );
}
