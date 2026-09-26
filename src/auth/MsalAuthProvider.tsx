import { InteractionRequiredAuthError, type IPublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useCallback, useMemo } from 'react';

import { type Auth, AuthContext } from './AuthContext';
import { userFromAccessToken } from './roles';

interface MsalAuthProviderProps {
  instance: IPublicClientApplication;
  apiScope: string;
  children: ReactNode;
}

function MsalAuthBridge({ apiScope, children }: { apiScope: string; children: ReactNode }) {
  const { instance, accounts } = useMsal();
  const account = accounts[0] ?? null;

  const getAccessToken = useCallback(async () => {
    if (!account) {
      return null;
    }

    const request = { account, scopes: [apiScope] };
    try {
      return (await instance.acquireTokenSilent(request)).accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect(request);
      }
      throw error;
    }
  }, [account, apiScope, instance]);

  // App roles belong to the API, so they're in the API access token, not the ID token.
  const { data: roles = [] } = useQuery({
    queryKey: ['auth', 'roles', account?.homeAccountId],
    enabled: account !== null,
    staleTime: Infinity,
    queryFn: async () => {
      const token = await getAccessToken();
      return token ? userFromAccessToken(token).roles : [];
    },
  });

  const auth = useMemo<Auth>(
    () => ({
      mode: 'entra',
      user: account ? { name: account.name ?? account.username, roles } : null,
      signInOptions: [],
      signIn: async () => instance.loginRedirect({ scopes: [apiScope] }),
      signOut: async () => instance.logoutRedirect(),
      getAccessToken,
    }),
    [account, apiScope, getAccessToken, instance, roles],
  );

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/** Entra ID sign-in with MSAL: authorization code flow with PKCE, no client secret. */
export default function MsalAuthProvider({ instance, apiScope, children }: MsalAuthProviderProps) {
  return (
    <MsalProvider instance={instance}>
      <MsalAuthBridge apiScope={apiScope}>{children}</MsalAuthBridge>
    </MsalProvider>
  );
}
