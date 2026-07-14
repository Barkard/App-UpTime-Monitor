import { useDashboardDevices, useDashboardIncidents, useDashboardStats } from '../hooks/useDashboard';
import { StatCard } from '../components/dashboard/StatCard';
import { DeviceCard, AddDeviceCard } from '../components/dashboard/DeviceCard';
import { WorldMap } from '../components/dashboard/WorldMap';
import { IncidentLogWidget } from '../components/dashboard/IncidentLogWidget';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Button } from '../components/ui/Button';
import { MaterialIcon } from '../components/icons/MaterialIcon';
import { useUiStore } from '../stores/uiStore';

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: devices, isLoading: devicesLoading } = useDashboardDevices();
  const { data: incidents } = useDashboardIncidents(10);
  const openDeviceForm = useUiStore((s) => s.openDeviceForm);

  return (
    <div className="space-y-xl">
      <section className="grid grid-cols-1 gap-gutter md:grid-cols-4">
        {statsLoading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <StatCard label="Total Devices" value={stats.total} icon="dns" tone="primary" />
            <StatCard
              label="Online"
              value={stats.up}
              icon="check_circle"
              tone="secondary"
              trend="Healthy checks"
            />
            <StatCard
              label="Offline"
              value={stats.down}
              icon="warning"
              tone="error"
              trend="Critical alerts"
            />
            <StatCard label="Active Devices" value={stats.active} icon="speed" tone="primary" />
          </>
        )}
      </section>

      <section className="space-y-md">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-lg text-on-surface">Device Grid</h2>
          <Button variant="primary" onClick={() => openDeviceForm()}>
            <MaterialIcon name="add" />
            Quick Add Host
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 xl:grid-cols-3">
          {devicesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-[280px]" />
            ))
          ) : (
            <>
              {devices?.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
              <AddDeviceCard onClick={() => openDeviceForm()} />
            </>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <WorldMap devices={devices ?? []} />
        </div>
        <div className="lg:col-span-4">
          <IncidentLogWidget incidents={incidents ?? []} />
        </div>
      </section>
    </div>
  );
}
