import { TriangleAlert } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { buttonClass } from '../../lib/styles';
import { type Confirm, ConfirmContext, type ConfirmOptions } from './ConfirmContext';

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (confirmed: boolean) => void;
}

/**
 * A confirmation dialog for destructive actions, on the native <dialog> element: it's modal,
 * traps focus, closes on Escape, and returns focus to the button that opened it.
 */
export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const confirm = useCallback<Confirm>(
    async (options) =>
      new Promise<boolean>((resolve) => {
        setPending({ options, resolve });
      }),
    [],
  );

  useEffect(() => {
    if (pending && !dialog.current?.open) {
      dialog.current?.showModal();
    }
  }, [pending]);

  const settle = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
    dialog.current?.close();
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialog}
        aria-describedby="confirm-description"
        aria-labelledby="confirm-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-6 text-ink shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          // Escape: settle as "backed out" ourselves, so the promise always resolves.
          event.preventDefault();
          settle(false);
        }}
      >
        {pending ? (
          <>
            <div className="flex gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <TriangleAlert aria-hidden className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold" id="confirm-title">
                  {pending.options.title}
                </h2>
                <p className="mt-1 text-ink-muted" id="confirm-description">
                  {pending.options.description}
                </p>
              </div>
            </div>
            {/* The safe choice comes first, so it gets initial focus. */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className={buttonClass('secondary')}
                type="button"
                onClick={() => settle(false)}
              >
                {pending.options.cancelLabel}
              </button>
              <button
                className={buttonClass('destructive')}
                type="button"
                onClick={() => settle(true)}
              >
                {pending.options.confirmLabel}
              </button>
            </div>
          </>
        ) : null}
      </dialog>
    </ConfirmContext.Provider>
  );
}
