import { ApiError } from '../api/client';

/** Shows an API problem response (or any error) as an accessible alert. */
export function ErrorMessage({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <p className="alert" role="alert">
      {message}
    </p>
  );
}

/** Field-level messages from a 400 validation problem, for inline form errors. */
export function fieldErrors(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) {
    return undefined;
  }
  const key = Object.keys(error.fieldErrors).find((k) => k.toLowerCase() === field.toLowerCase());
  return key ? error.fieldErrors[key]?.join(' ') : undefined;
}
