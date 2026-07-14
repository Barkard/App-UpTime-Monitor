import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { MaterialIcon } from '../icons/MaterialIcon';
import { Sparkline } from './Sparkline';
import { formatLatency, formatUptime } from '../../utils/formatters';
import { useDeviceStats } from '../../hooks/useDevices';
import type { DashboardDevice } from '../../types/device';

function trendLabel(uptime: number | null): string {
  if (uptime == null) return 'No data';
  if (uptime >= 99) return 'Excellent';
  if (uptime >= 95) return 'Normal';
  return 'Critical';
}

export function DeviceCard({ device }: { device: DashboardDevice }) {
  const { data: withStats } = useDeviceStats(device.id);
  const uptimePct = withStats?.stats.uptimePercentage24h ?? null;

  return (
    <Card className="hover:border-primary/50 transition-all space-y-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/20">
            <MaterialIcon
              name={device.protocol === 'TCP' ? 'dns' : 'router'}
              className="text-primary"
            />
          </div>
          <div>
            <p className="text-headline-md font-bold text-on-surface">{device.name}</p>
            <p className="text-data-mono text-on-surface-variant">
              {device.host}
              {device.port ? `:${device.port}` : ''}
            </p>
          </div>
        </div>
        <StatusBadge status={device.lastStatus} isActive={device.isActive} />
      </div>

      <div className="grid grid-cols-2 gap-md border-t border-outline-variant pt-md">
        <div>
          <p className="text-label-caps text-on-surface-variant">Latency</p>
          <p className="text-headline-md text-primary">
            {formatLatency(device.lastLatency)}
          </p>
        </div>
        <div>
          <p className="text-label-caps text-on-surface-variant">Uptime 24h</p>
          <p className="text-headline-md text-secondary">{formatUptime(uptimePct)}</p>
        </div>
      </div>

      <Sparkline data={device.sparkline} status={device.lastStatus} />

      <div className="flex items-center justify-between border-t border-outline-variant pt-sm">
        <span className="text-label-caps text-on-surface-variant/60">24H Trend</span>
        <span className="text-label-caps text-on-surface-variant">
          {trendLabel(uptimePct)}
        </span>
      </div>
    </Card>
  );
}

export function AddDeviceCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[220px] flex-col items-center justify-center gap-sm rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant transition-all hover:border-primary hover:bg-[#c3c0ff0d] hover:text-primary"
    >
      <MaterialIcon name="add" className="!text-4xl" />
      <span className="text-body-sm">Add Device</span>
    </button>
  );
}
