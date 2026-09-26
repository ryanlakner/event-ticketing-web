import { ArrowLeft, CircleAlert } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useCreateEvent } from '../api/queries';
import { ErrorMessage, fieldErrors } from '../components/ErrorMessage';
import { useToast } from '../components/toast/ToastContext';
import Container from '../components/ui/Container';
import cx from '../lib/cx';
import { buttonClass, cardClass, inputClass, labelClass } from '../lib/styles';

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

export default function CreateEventPage() {
  const navigate = useNavigate();
  const create = useCreateEvent();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    description: '',
    venue: '',
    startsAt: '',
    capacity: 100,
  });

  const [missing, setMissing] = useState<Record<string, string>>({});

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Catch empty required fields here. An empty date can't even be sent: the API would reject
    // it as unreadable JSON rather than with a friendly validation message.
    const required: Record<string, string> = {};
    if (!form.name.trim()) {
      required.Name = 'Give the event a name.';
    }
    if (!form.venue.trim()) {
      required.Venue = 'Say where the event takes place.';
    }
    if (!form.startsAt) {
      required.StartsAt = 'Choose a date and time.';
    }
    setMissing(required);
    if (Object.keys(required).length > 0) {
      return;
    }

    create.mutate(
      {
        name: form.name,
        description: form.description || null,
        venue: form.venue,
        // <input type="datetime-local"> is local time; the API stores UTC.
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
        capacity: form.capacity,
      },
      {
        onSuccess: async () => {
          toast.success(`Draft “${form.name.trim()}” created. Publish it when you're ready.`);
          await navigate('/me/events');
        },
      },
    );
  };

  const fields = ['Name', 'Venue', 'StartsAt', 'Capacity', 'Description'];
  const error = (field: string) => missing[field] ?? fieldErrors(create.error, field);
  const invalid = (field: string) => (error(field) ? true : undefined);
  const describedBy = (field: string, id: string) => (error(field) ? `${id}-error` : undefined);
  // Anything the API reports that no field shows, e.g. a conflict, appears as a general error.
  const shownInline = fields.some((field) => fieldErrors(create.error, field));

  return (
    <Container className="max-w-3xl">
      <div className="pt-8 pb-6">
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
          to="/me/events"
        >
          <ArrowLeft aria-hidden className="size-4" />
          My events
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">New event</h1>
        <p className="mt-1 text-ink-muted">
          Events start as drafts; publish from My events to open reservations.
        </p>
      </div>

      <form className={`${cardClass} p-6 sm:p-8`} noValidate onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field className="sm:col-span-2" error={error('Name')} id="name" label="Name">
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
          <Field className="sm:col-span-2" error={error('Venue')} id="venue" label="Venue">
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
          <Field error={error('StartsAt')} id="startsAt" label="Starts at">
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
          <Field error={error('Capacity')} id="capacity" label="Capacity">
            <input
              aria-describedby={describedBy('Capacity', 'capacity')}
              aria-invalid={invalid('Capacity')}
              className={inputClass}
              id="capacity"
              min={1}
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            />
          </Field>
          <Field
            className="sm:col-span-2"
            error={error('Description')}
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

        {create.isError && !shownInline ? (
          <div className="mt-6">
            <ErrorMessage error={create.error} />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
          <Link className={buttonClass('ghost')} to="/me/events">
            Cancel
          </Link>
          <button className={buttonClass('primary')} disabled={create.isPending} type="submit">
            {create.isPending ? 'Creating…' : 'Create draft'}
          </button>
        </div>
      </form>
    </Container>
  );
}
