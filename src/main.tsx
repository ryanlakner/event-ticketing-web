import './index.css';

import type { IPublicClientApplication } from '@azure/msal-browser';
import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import ApiProvider from './api/ApiProvider';
import createQueryClient from './api/createQueryClient';
import App from './App';
import AuthProvider from './auth/AuthProvider';
import { type AuthConfig, readApiBaseUrl, readAuthConfig } from './config';

async function initializeMsal(config: AuthConfig): Promise<IPublicClientApplication | null> {
  if (config.mode !== 'entra') {
    return null;
  }

  // Loaded only when Entra ID is configured, keeping MSAL out of other builds' bundles.
  const { createStandardPublicClientApplication } = await import('@azure/msal-browser');
  const msal = await createStandardPublicClientApplication({
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      redirectUri: `${window.location.origin}/`,
    },
    cache: { cacheLocation: 'sessionStorage' },
  });

  // Complete a sign-in redirect before the app renders.
  const result = await msal.handleRedirectPromise();
  if (result?.account) {
    msal.setActiveAccount(result.account);
  }
  return msal;
}

async function start() {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Missing #root element.');
  }

  const config = readAuthConfig(import.meta.env);
  const msal = await initializeMsal(config);

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider config={config} msal={msal}>
          <ApiProvider baseUrl={readApiBaseUrl(import.meta.env)}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ApiProvider>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

start().catch((error: unknown) => {
  document.body.textContent = `The app failed to start: ${String(error)}`;
});
