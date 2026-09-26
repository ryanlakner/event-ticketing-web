import { lazy } from 'react';
import { Route, Routes } from 'react-router';

import { Roles } from './auth/roles';
import Layout from './components/Layout';
import ConfirmProvider from './components/confirm/ConfirmProvider';
import RequireRole from './components/RequireRole';
import ToastProvider from './components/toast/ToastProvider';
import EventDetailPage from './pages/EventDetailPage';
import EventsPage from './pages/EventsPage';
import MyReservationsPage from './pages/MyReservationsPage';
import NotFoundPage from './pages/NotFoundPage';
import ReservationPage from './pages/ReservationPage';

// Organizer pages load on demand, so customers never download them. Layout's Suspense boundary
// shows a placeholder while a chunk loads.
const MyEventsPage = lazy(async () => import('./pages/MyEventsPage'));
const CreateEventPage = lazy(async () => import('./pages/CreateEventPage'));
const EditEventPage = lazy(async () => import('./pages/EditEventPage'));

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<EventsPage />} />
            <Route path="events/:eventId" element={<EventDetailPage />} />
            <Route path="reservations/:reservationId" element={<ReservationPage />} />
            <Route
              path="me/reservations"
              element={
                <RequireRole role={Roles.Customer}>
                  <MyReservationsPage />
                </RequireRole>
              }
            />
            <Route
              path="me/events"
              element={
                <RequireRole role={Roles.Organizer}>
                  <MyEventsPage />
                </RequireRole>
              }
            />
            <Route
              path="me/events/new"
              element={
                <RequireRole role={Roles.Organizer}>
                  <CreateEventPage />
                </RequireRole>
              }
            />
            <Route
              path="me/events/:eventId/edit"
              element={
                <RequireRole role={Roles.Organizer}>
                  <EditEventPage />
                </RequireRole>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </ConfirmProvider>
    </ToastProvider>
  );
}
