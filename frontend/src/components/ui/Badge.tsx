import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

type BadgeTone = 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  primary: 'bg-primary-container/20 text-primary border-primary/20',
  secondary: 'bg-secondary-container/20 text-secondary border-secondary/20',
  tertiary: 'bg-tertiary-container/20 text-tertiary border-tertiary/20',
  error: 'bg-error-container/20 text-error border-error/20',
  neutral: 'bg-surface-container text-on-surface-variant border-outline-variant',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-sm py-1 rounded-full border text-label-caps',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
