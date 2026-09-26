import { ChevronLeft, ChevronRight } from 'lucide-react';

import { buttonClass } from '../lib/styles';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Previous/next paging; renders nothing when everything fits on one page. */
export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      <button
        className={buttonClass('secondary', 'sm')}
        disabled={page <= 1}
        type="button"
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden className="size-4" />
        Previous
      </button>
      <span aria-current="page" className="text-sm text-ink-muted tabular-nums">
        Page {page} of {totalPages}
      </span>
      <button
        className={buttonClass('secondary', 'sm')}
        disabled={page >= totalPages}
        type="button"
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
