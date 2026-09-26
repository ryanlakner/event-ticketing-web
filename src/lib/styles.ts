import cx from './cx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm shadow-violet-600/30 hover:from-violet-500 hover:to-fuchsia-500',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-muted',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  /** Outlined: offers a destructive action. */
  danger: 'border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400',
  /** Solid: commits to a destructive action, e.g. in a confirmation dialog. */
  destructive: 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 hover:bg-rose-500',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
};

/** Shared button styling for <button> and link-styled-as-button elements. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md'): string {
  return cx(
    'inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-60',
    buttonVariants[variant],
    buttonSizes[size],
  );
}

export const inputClass =
  'mt-1.5 block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink shadow-xs transition placeholder:text-ink-muted/70 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 focus:outline-none aria-invalid:border-rose-500';

export const labelClass = 'block text-sm font-medium text-ink';

export const cardClass = 'rounded-2xl border border-line bg-surface shadow-xs';
