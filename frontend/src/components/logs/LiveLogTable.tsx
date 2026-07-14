import { useMemo } from 'react';
import { useRealtimeStore } from '../../stores/realtimeStore';
import { useDevices } from '../../hooks/useDevices';
import { useLogFilterStore } from '../../stores/filterStore';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MaterialIcon } from '../icons/MaterialIcon';
import { Table, TableBody, TableCell, TableHeadCell, TableHeader, TableRow } from '../ui/Table';
import { formatLatency, formatTimestamp } from '../../utils/formatters';

export function LiveLogTable() {
  const liveLogs = useRealtimeStore((s) => s.liveLogs);
  const { deviceId, status, setDeviceId, setStatus } = useLogFilterStore();
  const { data: devicesResult } = useDevices({ limit: 100 });

  const deviceNameById = useMemo(() => {
    const map = new Map<string, string>();
    devicesResult?.data.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [devicesResult]);

  const filtered = liveLogs.filter((log) => {
    if (deviceId && log.deviceId !== deviceId) return false;
    if (status && log.status !== status) return false;
    return true;
  });

  const handleExport = () => {
    const rows = filtered.map((log) => ({
      timestamp: log.timestamp,
      device: deviceNameById.get(log.deviceId) ?? log.deviceId,
      status: log.status,
      latency: log.latency,
      error: log.error,
    }));
    const csv = [
      'timestamp,device,status,latency,error',
      ...rows.map((r) => `${r.timestamp},${r.device},${r.status},${r.latency ?? ''},${r.error ?? ''}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[600px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center justify-between gap-md border-b border-outline-variant p-md">
        <div>
          <h3 className="text-headline-md text-on-surface">Live Event Log</h3>
          <p className="text-body-sm text-on-surface-variant">
            Monitoring {devicesResult?.meta.pagination?.total ?? 0} devices in real-time
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <Select
            className="w-40"
            value={status ?? ''}
            onChange={(e) => setStatus((e.target.value || undefined) as 'UP' | 'DOWN' | undefined)}
            options={[
              { value: 'UP', label: 'UP' },
              { value: 'DOWN', label: 'DOWN' },
            ]}
            placeholder="All severities"
          />
          <Select
            className="w-48"
            value={deviceId ?? ''}
            onChange={(e) => setDeviceId(e.target.value || undefined)}
            options={(devicesResult?.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
            placeholder="All devices"
          />
          <Button variant="secondary" onClick={handleExport}>
            <MaterialIcon name="download" className="!text-lg" />
            Export
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadCell>Timestamp</TableHeadCell>
              <TableHeadCell>Hostname</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell className="text-right">Latency</TableHeadCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-on-surface-variant">
                  Waiting for live events...
                </TableCell>
              </TableRow>
            )}
            {filtered.map((log) => (
              <TableRow key={log.id} className="animate-slide-in">
                <TableCell className="text-data-mono text-on-surface-variant">
                  {formatTimestamp(log.timestamp)}
                </TableCell>
                <TableCell className="text-data-mono text-on-surface">
                  {deviceNameById.get(log.deviceId) ?? log.deviceId}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      log.status === 'UP'
                        ? 'rounded border border-secondary/20 bg-secondary-container/20 px-sm py-0.5 text-label-caps text-secondary'
                        : 'rounded border border-error/20 bg-error-container/20 px-sm py-0.5 text-label-caps text-error'
                    }
                  >
                    {log.status}
                  </span>
                </TableCell>
                <TableCell
                  className={
                    'text-right text-data-mono ' +
                    (log.status === 'DOWN' ? 'text-error' : 'text-on-surface')
                  }
                >
                  {formatLatency(log.latency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
