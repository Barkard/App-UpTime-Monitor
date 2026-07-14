import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary px-lg py-sm rounded-lg font-bold flex items-center gap-sm shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none',
  secondary:
    'flex items-center gap-xs px-sm py-1.5 border border-primary text-primary rounded-lg text-body-sm hover:bg-primary hover:text-on-primary active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none',
  ghost:
    'p-2 text-on-surface-variant hover:text-primary transition-all relative active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
  icon: 'w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-all disabled:opacity-50 disabled:pointer-events-none',
  destructive:
    'p-2 text-on-surface-variant hover:text-error hover:bg-[#ffb4ab0d] rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
};

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}
