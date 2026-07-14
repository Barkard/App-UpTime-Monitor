import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, subscribeLiveLogs, subscribePulse } from '../services/websocket';
import { useRealtimeStore } from '../stores/realtimeStore';
import type {
  DeviceStatusChangedEvent,
  IncidentEvent,
  LiveLogEvent,
  PulseUpdateEvent,
} from '../types/realtime';

export function useRealtime() {
  const queryClient = useQueryClient();
  const setConnected = useRealtimeStore((s) => s.setConnected);
  const pushLiveLog = useRealtimeStore((s) => s.pushLiveLog);
  const setPulseBars = useRealtimeStore((s) => s.setPulseBars);
  const setDeviceStatus = useRealtimeStore((s) => s.setDeviceStatus);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      subscribeLiveLogs();
      subscribePulse();
    };
    const onDisconnect = () => setConnected(false);

    const onDeviceStatusChanged = (event: DeviceStatusChangedEvent) => {
      setDeviceStatus(event.deviceId, {
        status: event.status,
        latency: event.latency,
        timestamp: event.timestamp,
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    };

    const onLiveLog = (event: LiveLogEvent) => pushLiveLog(event);

    const onPulseUpdate = (event: PulseUpdateEvent) => setPulseBars(event.bars);

    const onIncident = (_event: IncidentEvent) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('device:status-changed', onDeviceStatusChanged);
    socket.on('live-log:new', onLiveLog);
    socket.on('pulse:update', onPulseUpdate);
    socket.on('incident:created', onIncident);
    socket.on('incident:resolved', onIncident);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('device:status-changed', onDeviceStatusChanged);
      socket.off('live-log:new', onLiveLog);
      socket.off('pulse:update', onPulseUpdate);
      socket.off('incident:created', onIncident);
      socket.off('incident:resolved', onIncident);
    };
  }, [queryClient, setConnected, pushLiveLog, setPulseBars, setDeviceStatus]);
}
