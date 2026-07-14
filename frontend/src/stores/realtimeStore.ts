import { create } from 'zustand';
import type { DeviceStatus } from '../types/device';
import type { LiveLogEvent } from '../types/realtime';
import { MAX_LIVE_LOGS, PULSE_BAR_COUNT } from '../utils/constants';

interface LiveLogEntry extends LiveLogEvent {
  id: string;
}

interface DeviceStatusEntry {
  status: DeviceStatus;
  latency: number | null;
  timestamp: string;
}

interface RealtimeState {
  connected: boolean;
  setConnected: (connected: boolean) => void;

  liveLogs: LiveLogEntry[];
  pushLiveLog: (log: LiveLogEvent) => void;

  pulseBars: number[];
  setPulseBars: (bars: number[]) => void;

  deviceStatus: Record<string, DeviceStatusEntry>;
  setDeviceStatus: (deviceId: string, entry: DeviceStatusEntry) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  liveLogs: [],
  pushLiveLog: (log) =>
    set((s) => ({
      liveLogs: [
        { ...log, id: crypto.randomUUID() },
        ...s.liveLogs,
      ].slice(0, MAX_LIVE_LOGS),
    })),

  pulseBars: Array(PULSE_BAR_COUNT).fill(0),
  setPulseBars: (bars) => set({ pulseBars: bars }),

  deviceStatus: {},
  setDeviceStatus: (deviceId, entry) =>
    set((s) => ({
      deviceStatus: { ...s.deviceStatus, [deviceId]: entry },
    })),
}));
