import type { Role } from './auth/roles';

export type AuthConfig =
  | { mode: 'entra'; tenantId: string; clientId: string; apiScope: string }
  | { mode: 'dev'; tokens: Partial<Record<Role, string>> }
  | { mode: 'none' };

/**
 * Entra ID when its three settings are present; otherwise local dev tokens if any are set;
 * otherwise browse-only.
 */
export function readAuthConfig(env: ImportMetaEnv): AuthConfig {
  const { VITE_ENTRA_TENANT_ID, VITE_ENTRA_CLIENT_ID, VITE_API_SCOPE } = env;
  if (VITE_ENTRA_TENANT_ID && VITE_ENTRA_CLIENT_ID && VITE_API_SCOPE) {
    return {
      mode: 'entra',
      tenantId: VITE_ENTRA_TENANT_ID,
      clientId: VITE_ENTRA_CLIENT_ID,
      apiScope: VITE_API_SCOPE,
    };
  }

  const tokens: Partial<Record<Role, string>> = {};
  if (env.VITE_DEV_ORGANIZER_TOKEN) {
    tokens.Organizer = env.VITE_DEV_ORGANIZER_TOKEN;
  }
  if (env.VITE_DEV_CUSTOMER_TOKEN) {
    tokens.Customer = env.VITE_DEV_CUSTOMER_TOKEN;
  }
  if (Object.keys(tokens).length > 0) {
    return { mode: 'dev', tokens };
  }

  return { mode: 'none' };
}

/** The API's origin; an unset or empty VITE_API_BASE_URL means "same origin as this site". */
export function readApiBaseUrl(env: ImportMetaEnv): string {
  const configured = env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return configured;
  }
  return window.location.origin;
}
