import { useState } from 'react';
import { TableCell, TableRow } from '../ui/Table';
import { StatusBadge } from '../ui/StatusBadge';
import { Chip } from '../ui/Chip';
import { Button } from '../ui/Button';
import { MaterialIcon } from '../icons/MaterialIcon';
import { formatRelativeTime } from '../../utils/formatters';
import { useDeleteDevice, useUpdateDevice } from '../../hooks/useDevices';
import { useUiStore } from '../../stores/uiStore';
import type { Device } from '../../types/device';

export function DeviceRow({ device }: { device: Device }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const openDeviceForm = useUiStore((s) => s.openDeviceForm);
  const pushToast = useUiStore((s) => s.pushToast);
  const updateDevice = useUpdateDevice();
  const deleteDevice = useDeleteDevice();

  const handleTogglePause = () => {
    updateDevice.mutate(
      { id: device.id, input: { isActive: !device.isActive } },
      {
        onSuccess: () =>
          pushToast(device.isActive ? 'Monitoring paused' : 'Monitoring resumed', 'success'),
      },
    );
  };

  const handleDelete = () => {
    deleteDevice.mutate(device.id, {
      onSuccess: () => pushToast('Device deleted', 'success'),
    });
    setConfirmingDelete(false);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container/20">
            <MaterialIcon name={device.protocol === 'TCP' ? 'dns' : 'router'} className="!text-lg text-primary" />
          </div>
          <span className="font-semibold text-on-surface">{device.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-data-mono">
        {device.host}
        {device.port ? `:${device.port}` : ''}
      </TableCell>
      <TableCell>
        <Chip>{device.protocol}</Chip>
      </TableCell>
      <TableCell className="text-body-sm text-on-surface-variant">
        {formatRelativeTime(device.lastCheck)}
      </TableCell>
      <TableCell>
        <StatusBadge status={device.lastStatus} isActive={device.isActive} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-xs">
          <Button
            variant="ghost"
            className="hover:text-primary p-xs rounded-lg"
            aria-label="Edit device"
            onClick={() => openDeviceForm(device.id)}
          >
            <MaterialIcon name="edit" className="!text-lg" />
          </Button>
          <Button
            variant="ghost"
            className="hover:text-tertiary p-xs rounded-lg"
            aria-label={device.isActive ? 'Pause monitoring' : 'Resume monitoring'}
            onClick={handleTogglePause}
          >
            <MaterialIcon name={device.isActive ? 'pause' : 'play_arrow'} className="!text-lg" />
          </Button>
          {confirmingDelete ? (
            <Button
              variant="destructive"
              className="text-error"
              aria-label="Confirm delete"
              onClick={handleDelete}
            >
              <MaterialIcon name="check" className="!text-lg" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              aria-label="Delete device"
              onClick={() => setConfirmingDelete(true)}
              onBlur={() => setConfirmingDelete(false)}
            >
              <MaterialIcon name="delete" className="!text-lg" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
