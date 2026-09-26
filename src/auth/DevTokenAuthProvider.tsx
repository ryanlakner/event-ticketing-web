import { type ReactNode, useMemo, useState } from 'react';

import { type Auth, AuthContext } from './AuthContext';
import { type Role, userFromAccessToken } from './roles';

const storageKey = 'event-ticketing:dev-role';

function readStoredRole(tokens: Partial<Record<Role, string>>): Role | null {
  const stored = sessionStorage.getItem(storageKey);
  return stored && stored in tokens ? (stored as Role) : null;
}

interface DevTokenAuthProviderProps {
  tokens: Partial<Record<Role, string>>;
  children: ReactNode;
}

/**
 * Local development without an Entra ID tenant: "sign in" as whichever role has a token from
 * `dotnet user-jwts`, which the API accepts in its Development environment.
 */
export default function DevTokenAuthProvider({ tokens, children }: DevTokenAuthProviderProps) {
  const [role, setRole] = useState<Role | null>(() => readStoredRole(tokens));
  const token = role ? (tokens[role] ?? null) : null;

  const auth = useMemo<Auth>(
    () => ({
      mode: 'dev',
      user: token ? userFromAccessToken(token) : null,
      signInOptions: Object.keys(tokens) as Role[],
      signIn: async (selected) => {
        if (selected && tokens[selected]) {
          sessionStorage.setItem(storageKey, selected);
          setRole(selected);
        }
      },
      signOut: async () => {
        sessionStorage.removeItem(storageKey);
        setRole(null);
      },
      getAccessToken: async () => token,
    }),
    [token, tokens],
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
