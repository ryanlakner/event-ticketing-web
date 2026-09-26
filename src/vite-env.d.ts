/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin in production, e.g. https://app-ticketing-dev-api.azurewebsites.net. Defaults to this site's origin. */
  readonly VITE_API_BASE_URL?: string;

  /** Entra ID sign-in (values printed by the API's infra/bootstrap/configure-github.sh). */
  readonly VITE_ENTRA_TENANT_ID?: string;
  readonly VITE_ENTRA_CLIENT_ID?: string;
  readonly VITE_API_SCOPE?: string;

  /** Local development without Entra ID: tokens from `dotnet user-jwts create --role ...`. */
  readonly VITE_DEV_ORGANIZER_TOKEN?: string;
  readonly VITE_DEV_CUSTOMER_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
