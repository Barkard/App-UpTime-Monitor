import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SidePanel } from '../ui/SidePanel';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { MaterialIcon } from '../icons/MaterialIcon';
import { useUiStore } from '../../stores/uiStore';
import { useCreateDevice, useDevice, useUpdateDevice } from '../../hooks/useDevices';
import { useNetworkDiscovery } from '../../hooks/useNetworkDiscovery';
import { deviceFormSchema, type DeviceFormValues } from '../../utils/validators';
import type { DiscoveredDevice } from '../../types/device';

function DiscoverySuggestions({
  onPick,
}: {
  onPick: (device: DiscoveredDevice) => void;
}) {
  const discovery = useNetworkDiscovery();
  const results = discovery.data ?? [];

  return (
    <div className="space-y-sm rounded-lg border border-outline-variant bg-surface-container-low p-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-mono uppercase tracking-wider text-on-surface-variant">
            Discover on your network
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Scans your local Wi-Fi/LAN subnet for responsive devices (ICMP ping sweep).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => discovery.mutate()}
          disabled={discovery.isPending}
        >
          <MaterialIcon
            name="wifi_find"
            className={discovery.isPending ? 'animate-spin-slow !text-lg' : '!text-lg'}
          />
          {discovery.isPending ? 'Scanning...' : 'Scan'}
        </Button>
      </div>

      {discovery.isSuccess && results.length === 0 && (
        <p className="text-body-sm text-on-surface-variant">No responsive devices found.</p>
      )}

      {results.length > 0 && (
        <ul className="max-h-60 space-y-xs overflow-y-auto">
          {results.map((device) => (
            <li key={device.ip}>
              <button
                type="button"
                disabled={device.alreadyMonitored}
                onClick={() => onPick(device)}
                className="flex w-full items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-left transition-colors hover:border-primary/50 hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div>
                  <p className="text-data-mono text-on-surface">{device.ip}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {device.hostname ?? device.vendor ?? 'Unknown device'}
                    {device.mac ? ` · ${device.mac}` : ''}
                  </p>
                </div>
                {device.alreadyMonitored ? (
                  <span className="text-label-caps text-on-surface-variant">Added</span>
                ) : (
                  <MaterialIcon name="add" className="!text-lg text-primary" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DeviceFormPanel() {
  const deviceFormOpen = useUiStore((s) => s.deviceFormOpen);
  const editingDeviceId = useUiStore((s) => s.editingDeviceId);
  const closeDeviceForm = useUiStore((s) => s.closeDeviceForm);
  const pushToast = useUiStore((s) => s.pushToast);

  const isEditing = !!editingDeviceId;
  const { data: existingDevice } = useDevice(editingDeviceId ?? undefined);
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: { name: '', host: '', protocol: 'ICMP', port: '', isActive: true },
  });

  const protocol = watch('protocol');

  const handlePickDiscovered = (device: DiscoveredDevice) => {
    setValue('name', device.hostname ?? device.vendor ?? device.ip);
    setValue('host', device.ip);
    setValue('protocol', 'ICMP');
  };

  useEffect(() => {
    if (existingDevice) {
      reset({
        name: existingDevice.name,
        host: existingDevice.host,
        protocol: existingDevice.protocol,
        port: existingDevice.port != null ? String(existingDevice.port) : '',
        isActive: existingDevice.isActive,
      });
    } else if (!isEditing) {
      reset({ name: '', host: '', protocol: 'ICMP', port: '', isActive: true });
    }
  }, [existingDevice, isEditing, reset]);

  const onSubmit = async (values: DeviceFormValues) => {
    const payload = {
      name: values.name,
      host: values.host,
      protocol: values.protocol,
      port: values.port === '' ? undefined : Number(values.port),
      isActive: values.isActive,
    };

    try {
      if (isEditing && editingDeviceId) {
        await updateDevice.mutateAsync({ id: editingDeviceId, input: payload });
        pushToast('Device updated', 'success');
      } else {
        await createDevice.mutateAsync(payload);
        pushToast('Device created', 'success');
      }
      closeDeviceForm();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Something went wrong';
      pushToast(message, 'error');
    }
  };

  return (
    <SidePanel
      open={deviceFormOpen}
      onClose={closeDeviceForm}
      title={isEditing ? 'Edit Device' : 'Add New Device'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
        {!isEditing && <DiscoverySuggestions onPick={handlePickDiscovered} />}

        <Input label="Name" placeholder="Core Router 1" {...register('name')} error={errors.name?.message} />
        <Input label="Host / IP" placeholder="192.168.1.1" {...register('host')} error={errors.host?.message} />
        <Select
          label="Protocol"
          options={[
            { value: 'ICMP', label: 'ICMP (Ping)' },
            { value: 'TCP', label: 'TCP Port' },
          ]}
          {...register('protocol')}
        />
        {protocol === 'TCP' && (
          <Input
            label="Port"
            type="number"
            placeholder="443"
            {...register('port')}
            error={errors.port?.message}
          />
        )}
        <label className="flex items-center gap-sm text-body-sm text-on-surface-variant">
          <input type="checkbox" {...register('isActive')} className="rounded" />
          Monitoring active
        </label>

        <div className="flex gap-md border-t border-outline-variant pt-lg">
          <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={closeDeviceForm}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1 justify-center" disabled={isSubmitting}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </SidePanel>
  );
}
