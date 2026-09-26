import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  description = undefined,
  actions = undefined,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-10 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 text-ink-muted">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}
