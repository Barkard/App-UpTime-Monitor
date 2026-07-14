import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="space-y-xs">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-label-mono uppercase tracking-wider text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface cursor-pointer focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
Select.displayName = 'Select';
