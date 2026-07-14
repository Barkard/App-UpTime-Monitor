import { useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import { MaterialIcon } from '../icons/MaterialIcon';
import { cn } from '../../utils/helpers';

const TONE_CLASSES = {
  success: 'border-secondary/50 text-secondary',
  error: 'border-error/50 text-error',
  info: 'border-primary/50 text-primary',
};

const TONE_ICONS = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

function ToastItem({ id, message, variant }: { id: string; message: string; variant: keyof typeof TONE_CLASSES }) {
  const dismissToast = useUiStore((s) => s.dismissToast);

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(id), 4000);
    return () => clearTimeout(timer);
  }, [id, dismissToast]);

  return (
    <div
      className={cn(
        'animate-slide-in flex items-center gap-sm rounded-lg border bg-surface-container-lowest px-md py-sm text-body-sm shadow-2xl',
        TONE_CLASSES[variant],
      )}
    >
      <MaterialIcon name={TONE_ICONS[variant]} className="!text-lg" />
      <span className="text-on-surface">{message}</span>
    </div>
  );
}

export function ToastStack() {
  const toasts = useUiStore((s) => s.toasts);

  return (
    <div className="fixed bottom-lg right-lg z-[60] space-y-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
