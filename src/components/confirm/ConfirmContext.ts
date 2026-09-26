import { createContext, useContext } from 'react';

export interface ConfirmOptions {
  title: string;
  description: string;
  /** Label for the destructive action, e.g. "Cancel event". */
  confirmLabel: string;
  /** Label for backing out, e.g. "Keep event". */
  cancelLabel: string;
}

/** Asks the user to confirm; resolves true if they did, false if they backed out. */
export type Confirm = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<Confirm | null>(null);

export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used inside ConfirmProvider.');
  }
  return confirm;
}
