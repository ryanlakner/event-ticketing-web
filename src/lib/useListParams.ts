import { useSearchParams } from 'react-router';

/**
 * Page and status filter kept in the URL (?page=2&status=Confirmed), so they survive a refresh
 * and work with the back button. Changing the filter returns to page 1.
 */
export default function useListParams<T extends string>(statuses: readonly T[]) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const rawStatus = params.get('status');
  const status = statuses.find((s) => s === rawStatus);

  const update = (next: { page?: number; status?: T | undefined }) => {
    const nextParams = new URLSearchParams(params);
    const nextStatus = 'status' in next ? next.status : status;
    const nextPage = 'status' in next ? 1 : (next.page ?? page);
    if (nextStatus) {
      nextParams.set('status', nextStatus);
    } else {
      nextParams.delete('status');
    }
    if (nextPage > 1) {
      nextParams.set('page', String(nextPage));
    } else {
      nextParams.delete('page');
    }
    setParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    page,
    status,
    setPage: (nextPage: number) => update({ page: nextPage }),
    setStatus: (nextStatus: T | undefined) => update({ status: nextStatus }),
  };
}
