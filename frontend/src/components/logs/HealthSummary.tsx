import { useLogStats } from '../../hooks/useLogs';
import { useIncidents } from '../../hooks/useIncidents';
import { useDashboardDevices } from '../../hooks/useDashboard';
import { MaterialIcon } from '../icons/MaterialIcon';
import { formatLatency, formatUptime } from '../../utils/formatters';

function HealthCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string | number;
  tone: 'secondary' | 'error' | 'primary';
}) {
  const toneBg = {
    secondary: 'bg-secondary-container/20 text-secondary',
    error: 'bg-error-container/20 text-error',
    primary: 'bg-primary-container/20 text-primary',
  }[tone];

  return (
    <div className="flex items-center gap-md rounded-lg border border-outline-variant bg-surface-container p-md">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneBg}`}>
        <MaterialIcon name={icon} />
      </div>
      <div>
        <p className="text-label-mono uppercase text-on-surface-variant">{label}</p>
        <p className="text-headline-md font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

export function HealthSummary() {
  const { data: logStats } = useLogStats();
  const { data: incidents } = useIncidents({ resolved: false, limit: 100 });
  const { data: devices } = useDashboardDevices();

  const uptimePct = logStats && logStats.total > 0 ? (logStats.up / logStats.total) * 100 : 100;
  const latencies = (devices ?? [])
    .map((d) => d.lastLatency)
    .filter((v): v is number => v !== null);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  return (
    <div className="grid grid-cols-1 gap-sm">
      <HealthCard icon="check_circle" label="Uptime 24h" value={formatUptime(uptimePct)} tone="secondary" />
      <HealthCard
        icon="emergency_home"
        label="Active Incidents"
        value={incidents?.meta.pagination?.total ?? 0}
        tone="error"
      />
      <HealthCard icon="speed" label="Avg Latency" value={formatLatency(avgLatency)} tone="primary" />
    </div>
  );
}
