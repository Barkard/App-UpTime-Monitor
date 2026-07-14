import { api } from './api';
import type { ApiSuccess, PaginatedResult } from '../types/api';
import type {
  CheckResult,
  CreateDeviceInput,
  DashboardDevice,
  Device,
  DeviceQuery,
  DeviceWithStats,
  DiscoveredDevice,
  UpdateDeviceInput,
} from '../types/device';
import type {
  Incident,
  IncidentQuery,
  LogQuery,
  LogStats,
  MonitoringLog,
} from '../types/log';
import type { DashboardStats } from '../types/dashboard';
import type { Settings, UpdateSettingsInput } from '../types/settings';

function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  return promise.then((res) => res.data.data);
}

export const devicesApi = {
  list: (query: DeviceQuery = {}) =>
    unwrap<PaginatedResult<Device>>(api.get('/devices', { params: query })),
  get: (id: string) => unwrap<Device>(api.get(`/devices/${id}`)),
  getStats: (id: string) =>
    unwrap<DeviceWithStats>(api.get(`/devices/${id}/stats`)),
  create: (input: CreateDeviceInput) =>
    unwrap<Device>(api.post('/devices', input)),
  update: (id: string, input: UpdateDeviceInput) =>
    unwrap<Device>(api.patch(`/devices/${id}`, input)),
  remove: (id: string) => api.delete(`/devices/${id}`),
};

export const monitoringApi = {
  check: (deviceId: string) =>
    unwrap<CheckResult>(api.post(`/monitoring/check/${deviceId}`)),
  status: () =>
    unwrap<{ status: string; maxConcurrentChecks: number; interval: number }>(
      api.get('/monitoring/status'),
    ),
};

export const logsApi = {
  list: (query: LogQuery = {}) =>
    unwrap<PaginatedResult<MonitoringLog>>(api.get('/logs', { params: query })),
  stats: () => unwrap<LogStats>(api.get('/logs/stats')),
};

export const incidentsApi = {
  list: (query: IncidentQuery = {}) =>
    unwrap<PaginatedResult<Incident>>(api.get('/incidents', { params: query })),
  listByDevice: (deviceId: string, query: IncidentQuery = {}) =>
    unwrap<PaginatedResult<Incident>>(
      api.get(`/incidents/device/${deviceId}`, { params: query }),
    ),
};

export const networkApi = {
  discover: () =>
    unwrap<DiscoveredDevice[]>(api.get('/network/discover', { timeout: 30000 })),
};

export const settingsApi = {
  get: () => unwrap<Settings>(api.get('/settings')),
  update: (input: UpdateSettingsInput) =>
    unwrap<Settings>(api.patch('/settings', input)),
};

export const dashboardApi = {
  stats: () => unwrap<DashboardStats>(api.get('/dashboard/stats')),
  devices: () => unwrap<DashboardDevice[]>(api.get('/dashboard/devices')),
  incidents: (limit = 10) =>
    unwrap<Incident[]>(api.get('/dashboard/incidents', { params: { limit } })),
};
