import type { IPublicClientApplication } from '@azure/msal-browser';
import { lazy, type ReactNode, Suspense } from 'react';

import type { AuthConfig } from '../config';
import AnonymousAuthProvider from './AnonymousAuthProvider';
import DevTokenAuthProvider from './DevTokenAuthProvider';

// Split into its own chunk with MSAL, downloaded only when Entra ID sign-in is configured.
const MsalAuthProvider = lazy(async () => import('./MsalAuthProvider'));

interface AuthProviderProps {
  config: AuthConfig;
  /** An initialized MSAL instance when config.mode is "entra". */
  msal: IPublicClientApplication | null;
  children: ReactNode;
}

/** Picks the sign-in implementation for this build: Entra ID, local dev tokens, or none. */
export default function AuthProvider({ config, msal, children }: AuthProviderProps) {
  if (config.mode === 'entra' && msal) {
    return (
      <Suspense fallback={null}>
        <MsalAuthProvider apiScope={config.apiScope} instance={msal}>
          {children}
        </MsalAuthProvider>
      </Suspense>
    );
  }

  if (config.mode === 'dev') {
    return <DevTokenAuthProvider tokens={config.tokens}>{children}</DevTokenAuthProvider>;
  }

  return <AnonymousAuthProvider>{children}</AnonymousAuthProvider>;
}
