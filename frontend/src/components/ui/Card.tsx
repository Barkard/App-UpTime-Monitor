import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-surface-container border border-outline-variant rounded-xl p-md transition-all',
        className,
      )}
      {...props}
    />
  );
}
