import { cn } from '../../utils/helpers';
import type { DeviceStatus } from '../../types/device';

interface StatusBadgeProps {
  status: DeviceStatus | null;
  isActive?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  'UP' | 'DOWN' | 'PAUSED' | 'PENDING',
  { label: string; badge: string; dot: string; pulse?: string }
> = {
  UP: {
    label: 'UP',
    badge: 'bg-secondary-container text-on-secondary-container',
    dot: 'bg-secondary',
    pulse: 'animate-pulse-green',
  },
  DOWN: {
    label: 'DOWN',
    badge: 'bg-error-container text-on-error-container',
    dot: 'bg-error',
    pulse: 'animate-pulse-error',
  },
  PAUSED: {
    label: 'MONITORING PAUSED',
    badge: 'bg-outline/20 text-on-surface-variant',
    dot: 'bg-outline',
  },
  PENDING: {
    label: 'PENDING',
    badge: 'bg-outline/20 text-on-surface-variant',
    dot: 'bg-outline',
  },
};

export function StatusBadge({ status, isActive = true, className }: StatusBadgeProps) {
  const key = !isActive
    ? 'PAUSED'
    : status === 'DOWN'
      ? 'DOWN'
      : status === 'UP'
        ? 'UP'
        : 'PENDING';
  const config = STATUS_CONFIG[key];

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1 px-sm py-1 rounded-full text-label-caps',
        config.badge,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot, config.pulse)} />
      {config.label}
    </span>
  );
}
