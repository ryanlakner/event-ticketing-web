export const Roles = {
  Organizer: 'Organizer',
  Customer: 'Customer',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export interface AuthUser {
  name: string;
  roles: Role[];
}

const knownRoles = new Set<string>(Object.values(Roles));

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && knownRoles.has(value);
}

function decodePayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) {
    return {};
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
    const claims: unknown = JSON.parse(json);
    return typeof claims === 'object' && claims !== null ? (claims as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function firstString(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

/**
 * Reads the display name and app roles from an access token, to decide what UI to show. It does
 * not verify the token: the API validates every request and enforces access on its own.
 *
 * Entra ID puts app roles in a `roles` array; `dotnet user-jwts` uses a `role` claim.
 */
export function userFromAccessToken(token: string): AuthUser {
  const claims = decodePayload(token);
  const rawRoles = claims.roles ?? claims.role;
  const roles = (Array.isArray(rawRoles) ? rawRoles : [rawRoles]).filter(isRole);

  return {
    name:
      firstString(claims.name, claims.preferred_username, claims.unique_name, claims.sub) ??
      'Signed in',
    roles: [...new Set(roles)],
  };
}

export function hasRole(user: AuthUser | null, role: Role): boolean {
  return user?.roles.includes(role) ?? false;
}
