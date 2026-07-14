import { cn } from '../../utils/helpers';

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-container-high',
        className,
      )}
    />
  );
}
