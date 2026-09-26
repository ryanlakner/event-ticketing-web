import { describe, expect, it } from 'vitest';

import { hasRole, userFromAccessToken } from './roles';

/** Builds an unsigned JWT the way issuers do: UTF-8 JSON, base64url-encoded. */
function token(claims: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(claims)}.signature`;
}

describe('userFromAccessToken', () => {
  it('reads Entra ID app roles from the roles array', () => {
    const user = userFromAccessToken(token({ name: 'Ada', roles: ['Organizer', 'Customer'] }));

    expect(user).toEqual({ name: 'Ada', roles: ['Organizer', 'Customer'] });
  });

  it('reads the single role claim that dotnet user-jwts emits', () => {
    const user = userFromAccessToken(token({ unique_name: 'dev@example.com', role: 'Customer' }));

    expect(user).toEqual({ name: 'dev@example.com', roles: ['Customer'] });
  });

  it('ignores roles this app does not know about', () => {
    const user = userFromAccessToken(token({ sub: 'x', roles: ['Organizer', 'Admin'] }));

    expect(user.roles).toEqual(['Organizer']);
  });

  it('decodes non-ASCII names', () => {
    expect(userFromAccessToken(token({ name: 'José Müller' })).name).toBe('José Müller');
  });

  it('treats a malformed token as having no roles', () => {
    expect(userFromAccessToken('not-a-jwt')).toEqual({ name: 'Signed in', roles: [] });
  });
});

describe('hasRole', () => {
  it('is false for anonymous visitors', () => {
    expect(hasRole(null, 'Customer')).toBe(false);
  });
});
