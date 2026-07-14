export const MAX_LIVE_LOGS = 25;
export const PULSE_BAR_COUNT = 45;
export const DASHBOARD_REFETCH_INTERVAL = 5000;

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Device Management', path: '/devices', icon: 'dns' },
  { label: 'Event Logs', path: '/logs', icon: 'monitor_heart' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
] as const;
