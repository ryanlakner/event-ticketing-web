import { type FormEvent, type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';

import { ApiError } from '../api/client';
import { useCreateEvent } from '../api/queries';
import { ErrorMessage, fieldErrors } from '../components/ErrorMessage';

interface FieldProps {
  id: string;
  label: string;
  error: string | undefined;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <>
      <label htmlFor={id}>
        {label}
        {children}
      </label>
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </>
  );
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const create = useCreateEvent();
  const [form, setForm] = useState({
    name: '',
    description: '',
    venue: '',
    startsAt: '',
    capacity: 100,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate(
      {
        name: form.name,
        description: form.description || null,
        venue: form.venue,
        // <input type="datetime-local"> is local time; the API stores UTC.
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
        capacity: form.capacity,
      },
      { onSuccess: async () => navigate('/me/events') },
    );
  };

  const error = (field: string) => fieldErrors(create.error, field);
  const hasFieldErrors =
    create.error instanceof ApiError && Object.keys(create.error.fieldErrors).length > 0;

  return (
    <section>
      <h1>New event</h1>
      <form className="panel form" onSubmit={onSubmit} noValidate>
        <Field id="name" label="Name" error={error('Name')}>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field id="venue" label="Venue" error={error('Venue')}>
          <input
            id="venue"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
        </Field>
        <Field id="startsAt" label="Starts at" error={error('StartsAt')}>
          <input
            id="startsAt"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          />
        </Field>
        <Field id="capacity" label="Capacity" error={error('Capacity')}>
          <input
            id="capacity"
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
        </Field>
        <Field id="description" label="Description (optional)" error={error('Description')}>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        {create.isError && !hasFieldErrors && <ErrorMessage error={create.error} />}
        <button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creating…' : 'Create draft'}
        </button>
        <p className="muted">
          Events start as drafts; publish from My events to open reservations.
        </p>
      </form>
    </section>
  );
}
