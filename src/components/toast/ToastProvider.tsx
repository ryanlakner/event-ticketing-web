import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import cx from '../../lib/cx';
import { ToastContext, type Toasts } from './ToastContext';

type Tone = 'success' | 'error';

interface Toast {
  id: string;
  tone: Tone;
  message: string;
}

const lifetimes: Record<Tone, number> = { success: 4000, error: 8000 };

function messageOf(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Something went wrong.';
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = toast.tone === 'success' ? CircleCheck : CircleAlert;
  return (
    <div
      className={cx(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-surface p-4 text-sm font-medium shadow-lg',
        toast.tone === 'success' ? 'border-emerald-500/30' : 'border-rose-500/40',
      )}
    >
      <Icon
        aria-hidden
        className={cx(
          'mt-0.5 size-5 shrink-0',
          toast.tone === 'success' ? 'text-emerald-500' : 'text-rose-500',
        )}
      />
      <p className="flex-1">{toast.message}</p>
      <button
        aria-label="Dismiss"
        className="-m-1 cursor-pointer rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
        type="button"
        onClick={() => onDismiss(toast.id)}
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/**
 * Brief, auto-dismissing notifications. Both live regions are always rendered, because screen
 * readers only announce changes to a region that already exists.
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone: Tone, message: string) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone, message }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), lifetimes[tone]),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const api = useMemo<Toasts>(
    () => ({
      success: (message) => show('success', message),
      error: (error) => show('error', messageOf(error)),
    }),
    [show],
  );

  const byTone = (tone: Tone) =>
    toasts
      .filter((toast) => toast.tone === tone)
      .map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end">
        {/* Live regions rather than role="alert"/"status": the same announcements, without an
            always-present empty alert competing with the page's own inline alerts. */}
        <div aria-live="assertive" className="contents">
          {byTone('error')}
        </div>
        <div aria-live="polite" className="contents">
          {byTone('success')}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
