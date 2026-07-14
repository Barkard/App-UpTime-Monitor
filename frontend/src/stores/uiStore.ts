import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  deviceFormOpen: boolean;
  editingDeviceId: string | null;
  openDeviceForm: (deviceId?: string) => void;
  closeDeviceForm: () => void;

  toasts: Toast[];
  pushToast: (message: string, variant?: Toast['variant']) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  deviceFormOpen: false,
  editingDeviceId: null,
  openDeviceForm: (deviceId) =>
    set({ deviceFormOpen: true, editingDeviceId: deviceId ?? null }),
  closeDeviceForm: () => set({ deviceFormOpen: false, editingDeviceId: null }),

  toasts: [],
  pushToast: (message, variant = 'info') =>
    set((s) => ({
      toasts: [...s.toasts, { id: crypto.randomUUID(), message, variant }],
    })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
