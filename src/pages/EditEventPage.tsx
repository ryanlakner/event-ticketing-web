import { ArrowLeft, Ban } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { useEvent, useUpdateEvent } from '../api/queries';
import { ErrorMessage } from '../components/ErrorMessage';
import EventForm from '../components/EventForm';
import { useToast } from '../components/toast/ToastContext';
import Container from '../components/ui/Container';
import EmptyState from '../components/ui/EmptyState';

export default function EditEventPage() {
  const { eventId = '' } = useParams();
  const navigate = useNavigate();
  const event = useEvent(eventId);
  const update = useUpdateEvent(eventId);
  const toast = useToast();

  let body;
  if (event.isPending) {
    body = <div aria-hidden className="h-96 animate-pulse rounded-2xl bg-surface-muted" />;
  } else if (event.isError) {
    body = <ErrorMessage error={event.error} />;
  } else if (event.data.status === 'Cancelled') {
    body = (
      <EmptyState icon={Ban} title="This event was cancelled">
        Cancelled events can&apos;t be edited.
      </EmptyState>
    );
  } else {
    const { data } = event;
    body = (
      <EventForm
        error={update.error}
        initialValues={{
          name: data.name,
          description: data.description,
          venue: data.venue,
          startsAt: data.startsAt,
          capacity: data.capacity,
        }}
        isPending={update.isPending}
        minCapacity={Math.max(1, data.capacity - data.seatsAvailable)}
        pendingLabel="Saving…"
        submitLabel="Save changes"
        onSubmit={(request) =>
          update.mutate(request, {
            onSuccess: async () => {
              toast.success(`Saved changes to “${request.name.trim()}”.`);
              await navigate('/me/events');
            },
          })
        }
      />
    );
  }

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
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Edit event</h1>
        <p className="mt-1 text-ink-muted">
          Changes apply straight away, including to published events.
        </p>
      </div>
      {body}
    </Container>
  );
}
