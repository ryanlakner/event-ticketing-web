import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './client';

/** Don't retry what retrying can't fix: 4xx responses such as 401, 403, 404, and 409. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export default function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } });
}
