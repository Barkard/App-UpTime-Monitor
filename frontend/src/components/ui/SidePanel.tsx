import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/helpers';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SidePanel({ open, onClose, title, children, className }: SidePanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 transition-opacity duration-300',
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-[28rem] bg-surface-container-lowest shadow-2xl transform transition-transform duration-300 overflow-y-auto',
          open ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        {title && (
          <div className="border-b border-outline-variant p-lg">
            <h2 className="text-headline-md text-on-surface">{title}</h2>
          </div>
        )}
        <div className="p-lg">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
