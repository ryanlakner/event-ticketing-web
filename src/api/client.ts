import createClient, { type Middleware } from 'openapi-fetch';

import type { paths } from './schema';
import type { ValidationProblemDetails } from './types';

export type ApiClient = ReturnType<typeof createClient<paths>>;

/** A typed client for the Event Ticketing API that attaches the caller's access token. */
export function createApiClient(
  baseUrl: string,
  getAccessToken: () => Promise<string | null>,
): ApiClient {
  const client = createClient<paths>({ baseUrl });

  const authorization: Middleware = {
    async onRequest({ request }) {
      const token = await getAccessToken();
      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }
      return request;
    },
  };
  client.use(authorization);

  return client;
}

/** An RFC 9457 problem response from the API. */
export class ApiError extends Error {
  readonly status: number;

  readonly problem: ValidationProblemDetails | undefined;

  constructor(status: number, problem: ValidationProblemDetails | undefined) {
    super(problem?.detail ?? problem?.title ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** Field-level validation messages from a 400 response, keyed by property name. */
  get fieldErrors(): Record<string, string[]> {
    return this.problem?.errors ?? {};
  }
}

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/** Resolves to the response body, or throws an ApiError for any non-2xx response. */
export async function unwrap<T>(request: Promise<FetchResult<T>>): Promise<T> {
  const { data, error, response } = await request;
  if (!response.ok) {
    throw new ApiError(response.status, error as ValidationProblemDetails | undefined);
  }
  return data as T;
}
