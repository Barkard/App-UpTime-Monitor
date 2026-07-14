import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';
import { MaterialIcon } from '../icons/MaterialIcon';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

export function Chip({ children, className, onRemove, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'bg-surface-container text-on-surface-variant text-[10px] font-bold uppercase px-sm py-1 rounded-full border border-outline-variant inline-flex items-center gap-xs',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="hover:text-error"
        >
          <MaterialIcon name="close" className="!text-sm" />
        </button>
      )}
    </span>
  );
}
