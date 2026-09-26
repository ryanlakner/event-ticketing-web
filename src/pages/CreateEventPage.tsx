import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { useCreateEvent } from '../api/queries';
import EventForm from '../components/EventForm';
import { useToast } from '../components/toast/ToastContext';
import Container from '../components/ui/Container';

const blank = { name: '', description: '', venue: '', startsAt: '', capacity: 100 };

export default function CreateEventPage() {
  const navigate = useNavigate();
  const create = useCreateEvent();
  const toast = useToast();

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

      <EventForm
        error={create.error}
        initialValues={blank}
        isPending={create.isPending}
        pendingLabel="Creating…"
        submitLabel="Create draft"
        onSubmit={(request) =>
          create.mutate(request, {
            onSuccess: async () => {
              toast.success(
                `Draft “${request.name.trim()}” created. Publish it when you're ready.`,
              );
              await navigate('/me/events');
            },
          })
        }
      />
    </Container>
  );
}
