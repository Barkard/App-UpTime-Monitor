import { useDashboardDevices, useDashboardStats } from '../../hooks/useDashboard';
import { StatCard } from '../dashboard/StatCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';
import { formatLatency } from '../../utils/formatters';

export function StatsOverview() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: devices } = useDashboardDevices();

  const latencies = (devices ?? [])
    .map((d) => d.lastLatency)
    .filter((v): v is number => v !== null);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
      <StatCard label="Total Devices" value={stats.total} icon="dns" tone="primary" />
      <StatCard label="Healthy" value={stats.up} icon="check_circle" tone="secondary" />
      <StatCard label="Critical" value={stats.down} icon="warning" tone="error" />
      <StatCard
        label="Avg Latency"
        value={formatLatency(avgLatency)}
        icon="speed"
        tone="primary"
      />
    </div>
  );
}
