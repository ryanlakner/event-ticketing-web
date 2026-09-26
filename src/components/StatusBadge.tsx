import type { EventStatus, ReservationStatus } from '../api/types';

export default function StatusBadge({ status }: { status: EventStatus | ReservationStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}
