import { type ReactNode, useMemo } from 'react';

import { useAuth } from '../auth/AuthContext';
import { ApiClientContext } from './ApiClientContext';
import { createApiClient } from './client';

interface ApiProviderProps {
  baseUrl: string;
  children: ReactNode;
}

/** Provides an API client that sends the signed-in user's token. Must be inside an auth provider. */
export default function ApiProvider({ baseUrl, children }: ApiProviderProps) {
  const { getAccessToken } = useAuth();
  const client = useMemo(() => createApiClient(baseUrl, getAccessToken), [baseUrl, getAccessToken]);
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}
