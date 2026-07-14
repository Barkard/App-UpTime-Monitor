import type { DeviceStatus } from './device';

export interface DeviceStatusChangedEvent {
  deviceId: string;
  status: DeviceStatus;
  latency: number | null;
  timestamp: string;
}

export interface DeviceCheckCompletedEvent {
  deviceId: string;
  success: boolean;
  latency: number | null;
  error: string | null;
  timestamp: string;
}

export interface LiveLogEvent {
  deviceId: string;
  status: DeviceStatus;
  latency: number | null;
  error: string | null;
  timestamp: string;
}

export interface IncidentEvent {
  incidentId: string;
  deviceId: string;
  deviceName: string;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
}

export interface PulseUpdateEvent {
  bars: number[];
  timestamp: string;
}
