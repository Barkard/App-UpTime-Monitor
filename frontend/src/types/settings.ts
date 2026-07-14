export interface Settings {
  monitoring_interval_seconds: string;
  monitoring_timeout_seconds: string;
  max_concurrent_checks: string;
  log_retention_days: string;
  incident_retention_days: string;
}

export interface UpdateSettingsInput {
  monitoring_interval_seconds?: 10 | 30 | 60 | 300 | 600 | 1800 | 3600;
  monitoring_timeout_seconds?: number;
  max_concurrent_checks?: number;
  log_retention_days?: number;
  incident_retention_days?: number;
}

export const MONITORING_INTERVAL_OPTIONS = [
  { value: 10, label: '10 seconds' },
  { value: 30, label: '30 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 3600, label: '1 hour' },
] as const;
