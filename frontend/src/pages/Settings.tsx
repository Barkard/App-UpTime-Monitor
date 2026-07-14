import { useEffect, useState } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useUiStore } from '../stores/uiStore';
import { MONITORING_INTERVAL_OPTIONS } from '../types/settings';

export function Settings() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const pushToast = useUiStore((s) => s.pushToast);

  const [form, setForm] = useState({
    monitoring_interval_seconds: '60',
    monitoring_timeout_seconds: '3',
    max_concurrent_checks: '20',
    log_retention_days: '30',
    incident_retention_days: '365',
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        monitoring_interval_seconds: Number(form.monitoring_interval_seconds) as 10 | 30 | 60 | 300 | 600 | 1800 | 3600,
        monitoring_timeout_seconds: Number(form.monitoring_timeout_seconds),
        max_concurrent_checks: Number(form.max_concurrent_checks),
        log_retention_days: Number(form.log_retention_days),
        incident_retention_days: Number(form.incident_retention_days),
      });
      pushToast('Settings updated', 'success');
    } catch (err) {
      pushToast((err as { message?: string })?.message ?? 'Failed to update settings', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[36rem] space-y-md">
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-[36rem] space-y-lg">
      <div>
        <h2 className="text-headline-lg text-on-surface">Settings</h2>
        <p className="text-body-sm text-on-surface-variant">
          Configure monitoring behavior and data retention.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-lg">
          <Select
            label="Monitoring Interval"
            value={form.monitoring_interval_seconds}
            onChange={(e) => setForm((f) => ({ ...f, monitoring_interval_seconds: e.target.value }))}
            options={MONITORING_INTERVAL_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Input
            label="Check Timeout (seconds)"
            type="number"
            min={1}
            max={30}
            value={form.monitoring_timeout_seconds}
            onChange={(e) => setForm((f) => ({ ...f, monitoring_timeout_seconds: e.target.value }))}
          />
          <Input
            label="Max Concurrent Checks"
            type="number"
            min={5}
            max={100}
            value={form.max_concurrent_checks}
            onChange={(e) => setForm((f) => ({ ...f, max_concurrent_checks: e.target.value }))}
          />
          <Input
            label="Log Retention (days)"
            type="number"
            min={1}
            max={365}
            value={form.log_retention_days}
            onChange={(e) => setForm((f) => ({ ...f, log_retention_days: e.target.value }))}
          />
          <Input
            label="Incident Retention (days)"
            type="number"
            min={30}
            max={1095}
            value={form.incident_retention_days}
            onChange={(e) => setForm((f) => ({ ...f, incident_retention_days: e.target.value }))}
          />
          <Button type="submit" variant="primary" disabled={updateSettings.isPending}>
            Save Settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
