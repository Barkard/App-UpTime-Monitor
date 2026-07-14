import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '../services/endpoints';
import type {
  CreateDeviceInput,
  DeviceQuery,
  UpdateDeviceInput,
} from '../types/device';

export function useDevices(query: DeviceQuery) {
  return useQuery({
    queryKey: ['devices', query],
    queryFn: () => devicesApi.list(query),
  });
}

export function useDevice(id: string | undefined) {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => devicesApi.get(id!),
    enabled: !!id,
  });
}

export function useDeviceStats(id: string | undefined) {
  return useQuery({
    queryKey: ['devices', id, 'stats'],
    queryFn: () => devicesApi.getStats(id!),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeviceInput) => devicesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDeviceInput }) =>
      devicesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => devicesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
