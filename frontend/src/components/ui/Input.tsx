import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="space-y-xs">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-label-mono uppercase tracking-wider text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all',
              error && 'border-error focus:ring-error',
              suffix && 'pr-10',
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant text-body-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-body-sm text-error">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
