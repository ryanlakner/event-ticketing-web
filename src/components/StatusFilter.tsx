import cx from '../lib/cx';

interface StatusFilterProps<T extends string> {
  statuses: readonly T[];
  /** The selected status, or undefined for "All". */
  value: T | undefined;
  onChange: (status: T | undefined) => void;
}

/** A row of toggle buttons for filtering a list by status. */
export default function StatusFilter<T extends string>({
  statuses,
  value,
  onChange,
}: StatusFilterProps<T>) {
  const options: { label: string; status: T | undefined }[] = [
    { label: 'All', status: undefined },
    ...statuses.map((status) => ({ label: status, status })),
  ];

  return (
    <div
      aria-label="Filter by status"
      className="mb-5 inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1"
      role="group"
    >
      {options.map(({ label, status }) => (
        <button
          key={label}
          aria-pressed={value === status}
          className={cx(
            'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition',
            value === status
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
          )}
          type="button"
          onClick={() => onChange(status)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
