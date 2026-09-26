import type { ReactNode } from 'react';

import { type Auth, AuthContext } from './AuthContext';

const anonymous: Auth = {
  mode: 'none',
  user: null,
  signInOptions: [],
  signIn: async () => {},
  signOut: async () => {},
  getAccessToken: async () => null,
};

/** Browse-only: used when neither Entra ID nor dev tokens are configured. */
export default function AnonymousAuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={anonymous}>{children}</AuthContext.Provider>;
}
