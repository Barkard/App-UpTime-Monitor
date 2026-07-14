import { cn } from '../../utils/helpers';

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-body-sm font-bold border-2 border-outline-variant',
        className,
      )}
    >
      {initials}
    </div>
  );
}
