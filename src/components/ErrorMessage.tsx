import { CircleAlert } from 'lucide-react';

import { ApiError } from '../api/client';

/** Shows an API problem response (or any error) as an accessible alert. */
export function ErrorMessage({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <p
      className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300"
      role="alert"
    >
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

/**
 * Field-level messages from a 400 validation problem, for inline form errors. Matches keys from
 * FluentValidation ("StartsAt") and from JSON binding failures ("$.startsAt") alike.
 */
export function fieldErrors(error: unknown, field: string): string | undefined {
  if (!(error instanceof ApiError)) {
    return undefined;
  }
  const key = Object.keys(error.fieldErrors).find(
    (k) => k.replace(/^\$\./, '').toLowerCase() === field.toLowerCase(),
  );
  return key ? error.fieldErrors[key]?.join(' ') : undefined;
}
