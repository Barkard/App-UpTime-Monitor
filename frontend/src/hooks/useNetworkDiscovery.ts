import { useMutation } from '@tanstack/react-query';
import { networkApi } from '../services/endpoints';

export function useNetworkDiscovery() {
  return useMutation({
    mutationFn: () => networkApi.discover(),
  });
}
