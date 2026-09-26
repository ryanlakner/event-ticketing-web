import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from './ApiClientContext';
import { unwrap } from './client';
import type {
  EventDto,
  EventRequest,
  EventStatus,
  PagedResult,
  ReservationDto,
  ReservationStatus,
  ReserveTicketsRequest,
} from './types';

export const queryKeys = {
  events: ['events'] as const,
  eventList: (search: string, page: number) => ['events', 'list', { search, page }] as const,
  event: (id: string) => ['events', 'detail', id] as const,
  myEvents: (status?: EventStatus) => ['me', 'events', { status }] as const,
  myReservations: (status?: ReservationStatus) => ['me', 'reservations', { status }] as const,
  reservation: (id: string) => ['reservations', id] as const,
};

export function useEvents(search: string, page = 1) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.eventList(search, page),
    queryFn: async (): Promise<PagedResult<EventDto>> =>
      unwrap(
        api.GET('/api/events', {
          params: { query: { status: 'Published', search: search || undefined, page } },
        }),
      ),
  });
}

export function useEvent(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: async () => unwrap(api.GET('/api/events/{id}', { params: { path: { id } } })),
  });
}

export function useMyEvents(status?: EventStatus) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.myEvents(status),
    queryFn: async (): Promise<PagedResult<EventDto>> =>
      unwrap(api.GET('/api/me/events', { params: { query: { status, pageSize: 100 } } })),
  });
}

export function useMyReservations(status?: ReservationStatus) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.myReservations(status),
    queryFn: async (): Promise<PagedResult<ReservationDto>> =>
      unwrap(api.GET('/api/me/reservations', { params: { query: { status, pageSize: 100 } } })),
  });
}

export function useReservation(id: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: queryKeys.reservation(id),
    queryFn: async () => unwrap(api.GET('/api/reservations/{id}', { params: { path: { id } } })),
  });
}

export function useCreateEvent() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: EventRequest) => unwrap(api.POST('/api/events', { body })),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['me', 'events'] }),
  });
}

export function useUpdateEvent(id: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: EventRequest) =>
      unwrap(api.PUT('/api/events/{id}', { params: { path: { id } }, body })),
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.events }),
        queryClient.invalidateQueries({ queryKey: ['me', 'events'] }),
      ]),
  });
}

export function usePublishEvent() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(api.POST('/api/events/{id}/publish', { params: { path: { id } } })),
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me', 'events'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events }),
      ]),
  });
}

export function useCancelEvent() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(api.POST('/api/events/{id}/cancel', { params: { path: { id } } })),
    onSuccess: async () => queryClient.invalidateQueries(),
  });
}

export function useReserveTickets(eventId: string) {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ReserveTicketsRequest) =>
      unwrap(
        api.POST('/api/events/{id}/reservations', { params: { path: { id: eventId } }, body }),
      ),
    onSuccess: async () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.event(eventId) }),
        queryClient.invalidateQueries({ queryKey: ['me', 'reservations'] }),
      ]),
  });
}

function useReservationAction(action: 'confirm' | 'cancel') {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(
        action === 'confirm'
          ? api.POST('/api/reservations/{id}/confirm', { params: { path: { id } } })
          : api.POST('/api/reservations/{id}/cancel', { params: { path: { id } } }),
      ),
    onSuccess: async (_, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reservation(id) }),
        queryClient.invalidateQueries({ queryKey: ['me', 'reservations'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.events }),
      ]),
  });
}

export const useConfirmReservation = () => useReservationAction('confirm');
export const useCancelReservation = () => useReservationAction('cancel');
