import type { EventDto, PagedResult, ReservationDto } from '../api/types';

export const apiUrl = 'http://localhost';

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export function makeEvent(overrides: Partial<EventDto> = {}): EventDto {
  return {
    id: '0199a1b2-0000-7000-8000-000000000001',
    name: 'Rust Belt Jazz Night',
    description: 'An evening of live jazz.',
    venue: 'The Grand Hall',
    startsAt: inDays(30),
    capacity: 150,
    seatsAvailable: 150,
    status: 'Published',
    createdAt: inDays(-1),
    updatedAt: null,
    ...overrides,
  };
}

export function makeReservation(overrides: Partial<ReservationDto> = {}): ReservationDto {
  return {
    id: '0199a1b2-0000-7000-8000-00000000000a',
    eventId: makeEvent().id,
    eventName: makeEvent().name,
    eventStartsAt: makeEvent().startsAt,
    customerId: 'customer-1',
    customerEmail: 'fan@example.com',
    quantity: 2,
    status: 'Pending',
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    confirmedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function paged<T>(items: T[]): PagedResult<T> {
  return { items, page: 1, pageSize: 20, totalCount: items.length, totalPages: 1 };
}
