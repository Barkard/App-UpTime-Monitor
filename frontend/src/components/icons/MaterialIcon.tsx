import { cn } from '../../utils/helpers';

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export function MaterialIcon({ name, filled, className }: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'icon-fill', className)}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
