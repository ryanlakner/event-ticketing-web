import { createContext, useContext } from 'react';

import type { AuthUser, Role } from './roles';

export type AuthMode = 'entra' | 'dev' | 'none';

export interface Auth {
  /** How sign-in works in this build; see src/config.ts. */
  mode: AuthMode;
  user: AuthUser | null;
  /** Roles offered as separate sign-in buttons (dev tokens); empty for a single sign-in. */
  signInOptions: Role[];
  signIn: (role?: Role) => Promise<void>;
  signOut: () => Promise<void>;
  /** A bearer token for the API, or null when signed out. */
  getAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<Auth | null>(null);

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used inside an auth provider.');
  }
  return auth;
}
