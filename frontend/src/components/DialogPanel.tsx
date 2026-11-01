import { ReactNode } from 'react';

/** Keep the rounded frame separate from the element that owns the scrollbar. */
export function DialogPanel({ children, className, contentClassName }: {
  children: ReactNode;
  className: string;
  contentClassName: string;
}) {
  return <div className={`dialog-shell ${className}`} role="dialog" aria-modal="true">
    <div className={`dialog-scroll ${contentClassName}`}>{children}</div>
  </div>;
}
