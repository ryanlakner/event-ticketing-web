import { createContext, useContext } from 'react';

export interface Toasts {
  /** A brief confirmation, announced politely to screen readers. */
  success: (message: string) => void;
  /** A failure, announced immediately. Accepts an ApiError, any Error, or a message. */
  error: (error: unknown) => void;
}

export const ToastContext = createContext<Toasts | null>(null);

export function useToast(): Toasts {
  const toasts = useContext(ToastContext);
  if (!toasts) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return toasts;
}
