import { LogOut, Ticket } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { hasRole, Roles } from '../auth/roles';
import cx from '../lib/cx';
import { buttonClass } from '../lib/styles';
import SignInButtons from './SignInButtons';
import Container from './ui/Container';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cx(
    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
    isActive ? 'bg-surface-muted text-ink' : 'text-ink-muted hover:text-ink',
  );
}

function initials(name: string): string {
  const letters = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase());
  return letters.join('') || '?';
}

export default function Layout() {
  const auth = useAuth();
  const { user } = auth;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/80 backdrop-blur-md">
        <Container className="flex h-16 items-center gap-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-linear-to-br from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-violet-600/40">
              <Ticket aria-hidden className="size-4.5" />
            </span>
            <span className="hidden sm:inline">Event Ticketing</span>
          </NavLink>

          <nav aria-label="Main" className="ml-2 flex flex-1 items-center gap-1 overflow-x-auto">
            <NavLink to="/" end className={navLinkClass}>
              Events
            </NavLink>
            {hasRole(user, Roles.Customer) ? (
              <NavLink to="/me/reservations" className={navLinkClass}>
                My tickets
              </NavLink>
            ) : null}
            {hasRole(user, Roles.Organizer) ? (
              <NavLink to="/me/events" className={navLinkClass}>
                My events
              </NavLink>
            ) : null}
          </nav>

          {user ? (
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid size-8 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-700 dark:text-violet-300"
              >
                {initials(user.name)}
              </span>
              <span className="hidden flex-col leading-tight md:flex">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-ink-muted">{user.roles.join(', ')}</span>
              </span>
              <button
                aria-label="Sign out"
                className={buttonClass('ghost', 'sm')}
                type="button"
                onClick={async () => auth.signOut()}
              >
                <LogOut aria-hidden className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <SignInButtons />
          )}
        </Container>
      </header>

      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      <footer className="border-t border-line py-6 text-sm text-ink-muted">
        <Container className="flex flex-wrap justify-between gap-2">
          <span>Event Ticketing — a portfolio project</span>
          <a
            className="hover:text-ink"
            href="https://github.com/ryanlakner/event-ticketing-web"
            rel="noreferrer"
            target="_blank"
          >
            Source on GitHub
          </a>
        </Container>
      </footer>
    </div>
  );
}
