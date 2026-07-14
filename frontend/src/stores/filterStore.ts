import { create } from 'zustand';
import type { DeviceProtocol } from '../types/device';

interface DeviceFilterState {
  page: number;
  limit: number;
  search: string;
  protocol: DeviceProtocol | undefined;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setProtocol: (protocol: DeviceProtocol | undefined) => void;
  reset: () => void;
}

export const useDeviceFilterStore = create<DeviceFilterState>((set) => ({
  page: 1,
  limit: 10,
  search: '',
  protocol: undefined,
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  setProtocol: (protocol) => set({ protocol, page: 1 }),
  reset: () => set({ page: 1, search: '', protocol: undefined }),
}));

interface LogFilterState {
  page: number;
  limit: number;
  deviceId: string | undefined;
  status: 'UP' | 'DOWN' | undefined;
  setPage: (page: number) => void;
  setDeviceId: (deviceId: string | undefined) => void;
  setStatus: (status: 'UP' | 'DOWN' | undefined) => void;
}

export const useLogFilterStore = create<LogFilterState>((set) => ({
  page: 1,
  limit: 20,
  deviceId: undefined,
  status: undefined,
  setPage: (page) => set({ page }),
  setDeviceId: (deviceId) => set({ deviceId, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
}));
