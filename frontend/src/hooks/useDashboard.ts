import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/endpoints';
import { DASHBOARD_REFETCH_INTERVAL } from '../utils/constants';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.stats(),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

export function useDashboardDevices() {
  return useQuery({
    queryKey: ['dashboard', 'devices'],
    queryFn: () => dashboardApi.devices(),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}

export function useDashboardIncidents(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'incidents', limit],
    queryFn: () => dashboardApi.incidents(limit),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL,
  });
}
