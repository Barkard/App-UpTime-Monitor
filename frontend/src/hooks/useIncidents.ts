import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../services/endpoints';
import type { IncidentQuery } from '../types/log';

export function useIncidents(query: IncidentQuery) {
  return useQuery({
    queryKey: ['incidents', query],
    queryFn: () => incidentsApi.list(query),
  });
}

export function useDeviceIncidents(deviceId: string | undefined, query: IncidentQuery = {}) {
  return useQuery({
    queryKey: ['incidents', 'device', deviceId, query],
    queryFn: () => incidentsApi.listByDevice(deviceId!, query),
    enabled: !!deviceId,
  });
}
