import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cardClass } from '../../lib/styles';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, children = undefined }: EmptyStateProps) {
  return (
    <div className={`${cardClass} flex flex-col items-center px-6 py-14 text-center`}>
      <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
        <Icon aria-hidden className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      {children ? <div className="mt-1 text-ink-muted">{children}</div> : null}
    </div>
  );
}
