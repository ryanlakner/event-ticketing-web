import type { components } from './schema';

type Schemas = components['schemas'];

export type EventDto = Schemas['EventDto'];
export type EventStatus = Schemas['EventStatus'];
export type EventRequest = Schemas['EventRequest'];
export type ReservationDto = Schemas['ReservationDto'];
export type ReservationStatus = Schemas['ReservationStatus'];
export type ReserveTicketsRequest = Schemas['ReserveTicketsRequest'];
export type ProblemDetails = Schemas['ProblemDetails'];
export type ValidationProblemDetails = Schemas['ValidationProblemDetails'];

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
