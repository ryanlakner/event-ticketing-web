import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useToast } from './ToastContext';
import ToastProvider from './ToastProvider';

function Trigger() {
  const toast = useToast();
  return (
    <>
      <button type="button" onClick={() => toast.success('Saved')}>
        save
      </button>
      <button type="button" onClick={() => toast.error(new Error('Nope'))}>
        fail
      </button>
    </>
  );
}

describe('ToastProvider', () => {
  afterEach(() => vi.useRealTimers());

  it('dismisses success toasts after a few seconds and errors after longer', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    act(() => screen.getByRole('button', { name: 'save' }).click());
    act(() => screen.getByRole('button', { name: 'fail' }).click());
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Nope')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(screen.getByText('Nope')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText('Nope')).not.toBeInTheDocument();
  });

  it('can be dismissed by hand', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    act(() => screen.getByRole('button', { name: 'save' }).click());
    act(() => screen.getByRole('button', { name: 'Dismiss' }).click());

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('announces toasts through polite and assertive live regions', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    act(() => screen.getByRole('button', { name: 'save' }).click());
    act(() => screen.getByRole('button', { name: 'fail' }).click());

    expect(screen.getByText('Saved').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Nope').closest('[aria-live]')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
  });
});
