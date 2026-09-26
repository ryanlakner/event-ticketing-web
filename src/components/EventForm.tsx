import { CircleAlert } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router';

import type { EventRequest } from '../api/types';
import cx from '../lib/cx';
import { toDateTimeLocal } from '../lib/format';
import { buttonClass, cardClass, inputClass, labelClass } from '../lib/styles';
import { ErrorMessage, fieldErrors } from './ErrorMessage';

export interface EventFormValues {
  name: string;
  description: string;
  venue: string;
  /** ISO 8601, or empty for a new event. */
  startsAt: string;
  capacity: number;
}

interface FieldProps {
  id: string;
  label: string;
  error: string | undefined;
  className?: string;
  children: ReactNode;
}

function Field({ id, label, error, className = undefined, children }: FieldProps) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={id}>
        {label}
        {children}
      </label>
      {error ? (
        <p
          className="mt-1.5 flex items-center gap-1.5 text-sm text-rose-600 dark:text-rose-400"
          id={`${id}-error`}
        >
          <CircleAlert aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface EventFormProps {
  initialValues: EventFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  /** The last failed submission, whose validation errors show on their fields. */
  error: unknown;
  /** Seats already reserved; capacity can't go below this. */
  minCapacity?: number;
  onSubmit: (request: EventRequest) => void;
}

const fields = ['Name', 'Venue', 'StartsAt', 'Capacity', 'Description'];

/** The create and edit form for events, with client-side checks before anything is sent. */
export default function EventForm({
  initialValues,
  submitLabel,
  pendingLabel,
  isPending,
  error,
  minCapacity = 1,
  onSubmit,
}: EventFormProps) {
  const initialStartsAt = initialValues.startsAt ? toDateTimeLocal(initialValues.startsAt) : '';
  const [form, setForm] = useState({ ...initialValues, startsAt: initialStartsAt });
  const [missing, setMissing] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Catch empty required fields here. An empty date can't even be sent: the API would reject
    // it as unreadable JSON rather than with a friendly validation message.
    const problems: Record<string, string> = {};
    if (!form.name.trim()) {
      problems.Name = 'Give the event a name.';
    }
    if (!form.venue.trim()) {
      problems.Venue = 'Say where the event takes place.';
    }
    if (!form.startsAt) {
      problems.StartsAt = 'Choose a date and time.';
    }
    if (form.capacity < minCapacity) {
      problems.Capacity =
        minCapacity > 1
          ? `${minCapacity.toLocaleString()} seats are already reserved, so capacity can't go lower.`
          : 'Capacity must be at least 1.';
    }
    setMissing(problems);
    if (Object.keys(problems).length > 0) {
      return;
    }

    onSubmit({
      name: form.name,
      description: form.description || null,
      venue: form.venue,
      // The input is local time to the minute. Send the original timestamp unless the date was
      // changed, so editing other fields never silently drops the seconds.
      startsAt:
        form.startsAt === initialStartsAt && initialValues.startsAt
          ? initialValues.startsAt
          : new Date(form.startsAt).toISOString(),
      capacity: form.capacity,
    });
  };

  const errorFor = (field: string) => missing[field] ?? fieldErrors(error, field);
  const invalid = (field: string) => (errorFor(field) ? true : undefined);
  const describedBy = (field: string, id: string) => (errorFor(field) ? `${id}-error` : undefined);
  // Anything the API reports that no field shows, e.g. a conflict, appears as a general error.
  const shownInline = fields.some((field) => fieldErrors(error, field));

  return (
    <form className={`${cardClass} p-6 sm:p-8`} noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field className="sm:col-span-2" error={errorFor('Name')} id="name" label="Name">
          <input
            aria-describedby={describedBy('Name', 'name')}
            aria-invalid={invalid('Name')}
            className={inputClass}
            id="name"
            placeholder="e.g. Rust Belt Jazz Night"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field className="sm:col-span-2" error={errorFor('Venue')} id="venue" label="Venue">
          <input
            aria-describedby={describedBy('Venue', 'venue')}
            aria-invalid={invalid('Venue')}
            className={inputClass}
            id="venue"
            placeholder="e.g. The Grand Hall"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
        </Field>
        <Field error={errorFor('StartsAt')} id="startsAt" label="Starts at">
          <input
            aria-describedby={describedBy('StartsAt', 'startsAt')}
            aria-invalid={invalid('StartsAt')}
            className={inputClass}
            id="startsAt"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          />
        </Field>
        <Field error={errorFor('Capacity')} id="capacity" label="Capacity">
          <input
            aria-describedby={describedBy('Capacity', 'capacity')}
            aria-invalid={invalid('Capacity')}
            className={inputClass}
            id="capacity"
            min={minCapacity}
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          error={errorFor('Description')}
          id="description"
          label="Description (optional)"
        >
          <textarea
            className={cx(inputClass, 'resize-y')}
            id="description"
            placeholder="What should people know before they book?"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>
      </div>

      {error && !shownInline ? (
        <div className="mt-6">
          <ErrorMessage error={error} />
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
        <Link className={buttonClass('ghost')} to="/me/events">
          Cancel
        </Link>
        <button className={buttonClass('primary')} disabled={isPending} type="submit">
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
