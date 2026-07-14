import type { Device } from './device';

export type LogStatus = 'UP' | 'DOWN';

export interface MonitoringLog {
  id: string;
  deviceId: string;
  device?: Device;
  status: LogStatus;
  latency: number | null;
  errorMessage: string | null;
  timestamp: string;
}

export interface LogQuery {
  page?: number;
  limit?: number;
  deviceId?: string;
  status?: LogStatus;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface LogStats {
  up: number;
  down: number;
  total: number;
}

export interface Incident {
  id: string;
  deviceId: string;
  device?: Device;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
}

export interface IncidentQuery {
  page?: number;
  limit?: number;
  deviceId?: string;
  resolved?: boolean;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'ASC' | 'DESC';
}
