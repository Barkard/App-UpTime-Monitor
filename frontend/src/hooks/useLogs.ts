import { useQuery } from '@tanstack/react-query';
import { logsApi } from '../services/endpoints';
import type { LogQuery } from '../types/log';

export function useLogs(query: LogQuery) {
  return useQuery({
    queryKey: ['logs', query],
    queryFn: () => logsApi.list(query),
  });
}

export function useLogStats() {
  return useQuery({
    queryKey: ['logs', 'stats'],
    queryFn: () => logsApi.stats(),
    refetchInterval: 5000,
  });
}
