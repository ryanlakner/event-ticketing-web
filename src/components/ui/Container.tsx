import type { ReactNode } from 'react';

import cx from '../../lib/cx';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className = undefined }: ContainerProps) {
  return <div className={cx('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}
