import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-surface-container-highest px-sm py-xs text-body-sm text-on-surface shadow-2xl transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
