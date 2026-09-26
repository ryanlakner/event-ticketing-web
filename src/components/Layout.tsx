import { NavLink, Outlet } from 'react-router';

import { useAuth } from '../auth/AuthContext';
import { hasRole, Roles } from '../auth/roles';
import SignInButtons from './SignInButtons';

export default function Layout() {
  const auth = useAuth();
  const { user } = auth;

  return (
    <>
      <header className="site-header">
        <NavLink to="/" className="brand">
          Event Ticketing
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/" end>
            Events
          </NavLink>
          {hasRole(user, Roles.Customer) && <NavLink to="/me/reservations">My tickets</NavLink>}
          {hasRole(user, Roles.Organizer) && <NavLink to="/me/events">My events</NavLink>}
        </nav>
        <div className="account">
          {user ? (
            <>
              <span>
                {user.name}
                {user.roles.length > 0 && <span className="muted"> · {user.roles.join(', ')}</span>}
              </span>
              <button type="button" onClick={async () => auth.signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <SignInButtons />
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
