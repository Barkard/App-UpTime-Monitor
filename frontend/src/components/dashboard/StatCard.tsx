import type { ReactNode } from 'react';
import { Card } from '../ui/Card';
import { MaterialIcon } from '../icons/MaterialIcon';
import { cn } from '../../utils/helpers';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  trend?: string;
  tone?: 'primary' | 'secondary' | 'error';
}

const toneText: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  error: 'text-error',
};

export function StatCard({ label, value, icon, trend, tone = 'primary' }: StatCardProps) {
  return (
    <Card className="hover:border-primary/50 hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <p className="text-label-caps text-on-surface-variant">{label}</p>
        <MaterialIcon name={icon} className={cn(toneText[tone])} />
      </div>
      <p className="mt-sm text-display-lg-mobile font-bold text-on-surface">{value}</p>
      {trend && (
        <p className={cn('mt-xs text-body-sm', toneText[tone])}>{trend}</p>
      )}
    </Card>
  );
}
