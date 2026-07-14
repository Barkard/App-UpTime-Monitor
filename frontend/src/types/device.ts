export type DeviceProtocol = 'ICMP' | 'TCP';
export type DeviceStatus = 'UP' | 'DOWN' | 'INACTIVE';

export interface Device {
  id: string;
  name: string;
  host: string;
  protocol: DeviceProtocol;
  port: number | null;
  isActive: boolean;
  lastCheck: string | null;
  lastStatus: DeviceStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceStats {
  averageLatency24h: number | null;
  averageLatency7d: number | null;
  uptimePercentage24h: number;
  uptimePercentage7d: number;
  totalChecks24h: number;
  upChecks24h: number;
  downChecks24h: number;
}

export interface DeviceWithStats extends Device {
  stats: DeviceStats;
}

export interface DashboardDevice {
  id: string;
  name: string;
  host: string;
  protocol: DeviceProtocol;
  port: number | null;
  lastCheck: string | null;
  lastStatus: DeviceStatus | null;
  lastLatency: number | null;
  isActive: boolean;
  sparkline: (number | null)[];
}

export interface CreateDeviceInput {
  name: string;
  host: string;
  protocol: DeviceProtocol;
  port?: number;
  isActive?: boolean;
}

export type UpdateDeviceInput = Partial<CreateDeviceInput>;

export interface DeviceQuery {
  page?: number;
  limit?: number;
  search?: string;
  protocol?: DeviceProtocol;
  isActive?: boolean;
  sortBy?: 'name' | 'host' | 'protocol' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CheckResult {
  deviceId: string;
  success: boolean;
  latency: number | null;
  error: string | null;
  timestamp: string;
}

export interface DiscoveredDevice {
  ip: string;
  hostname: string | null;
  mac: string | null;
  vendor: string | null;
  alreadyMonitored: boolean;
  existingDeviceId: string | null;
}
