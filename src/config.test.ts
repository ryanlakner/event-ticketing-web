import { describe, expect, it } from 'vitest';

import { readAuthConfig } from './config';

describe('readAuthConfig', () => {
  it('uses Entra ID when all three settings are present', () => {
    const config = readAuthConfig({
      VITE_ENTRA_TENANT_ID: 'tenant',
      VITE_ENTRA_CLIENT_ID: 'client',
      VITE_API_SCOPE: 'api://api/access_as_user',
      VITE_DEV_CUSTOMER_TOKEN: 'ignored',
    } as ImportMetaEnv);

    expect(config).toEqual({
      mode: 'entra',
      tenantId: 'tenant',
      clientId: 'client',
      apiScope: 'api://api/access_as_user',
    });
  });

  it('falls back to local dev tokens', () => {
    const config = readAuthConfig({ VITE_DEV_ORGANIZER_TOKEN: 'org' } as ImportMetaEnv);

    expect(config).toEqual({ mode: 'dev', tokens: { Organizer: 'org' } });
  });

  it('is browse-only when nothing is configured', () => {
    expect(readAuthConfig({} as ImportMetaEnv)).toEqual({ mode: 'none' });
  });
});
