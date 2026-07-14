import { useDevices } from '../hooks/useDevices';
import { useDebounce } from '../hooks/useDebounce';
import { useDeviceFilterStore } from '../stores/filterStore';
import { useUiStore } from '../stores/uiStore';
import { StatsOverview } from '../components/devices/StatsOverview';
import { DevicesTable } from '../components/devices/DevicesTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MaterialIcon } from '../components/icons/MaterialIcon';

export function Devices() {
  const { page, limit, search, setPage, setSearch } = useDeviceFilterStore();
  const openDeviceForm = useUiStore((s) => s.openDeviceForm);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useDevices({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  return (
    <div className="space-y-lg">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-headline-lg text-on-surface">Device Management</h2>
          <p className="text-body-sm text-on-surface-variant">
            Monitor and manage all registered network devices.
          </p>
        </div>
        <Button variant="primary" onClick={() => openDeviceForm()}>
          <MaterialIcon name="add" />
          Add New Device
        </Button>
      </div>

      <StatsOverview />

      <Input
        placeholder="Search by name or host..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-[24rem]"
      />

      <DevicesTable result={data} isLoading={isLoading} onPageChange={setPage} />
    </div>
  );
}
