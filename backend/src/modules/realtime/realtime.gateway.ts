import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DeviceStatus } from '../devices/entities/device.entity';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private clientRooms = new Map<string, Set<string>>();

  constructor() {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clientRooms.set(client.id, new Set());
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientRooms.delete(client.id);
  }

  @SubscribeMessage('join:device-room')
  handleJoinDeviceRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() deviceId: string,
  ) {
    const room = `device:${deviceId}`;
    client.join(room);
    const rooms = this.clientRooms.get(client.id) || new Set();
    rooms.add(room);
    this.clientRooms.set(client.id, rooms);
    this.logger.debug(`Client ${client.id} joined ${room}`);
  }

  @SubscribeMessage('leave:device-room')
  handleLeaveDeviceRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() deviceId: string,
  ) {
    const room = `device:${deviceId}`;
    client.leave(room);
    const rooms = this.clientRooms.get(client.id);
    if (rooms) rooms.delete(room);
  }

  @SubscribeMessage('subscribe:live-logs')
  handleSubscribeLiveLogs(@ConnectedSocket() client: Socket) {
    client.join('live-logs');
    const rooms = this.clientRooms.get(client.id) || new Set();
    rooms.add('live-logs');
    this.clientRooms.set(client.id, rooms);
  }

  @SubscribeMessage('unsubscribe:live-logs')
  handleUnsubscribeLiveLogs(@ConnectedSocket() client: Socket) {
    client.leave('live-logs');
    const rooms = this.clientRooms.get(client.id);
    if (rooms) rooms.delete('live-logs');
  }

  @SubscribeMessage('subscribe:pulse')
  handleSubscribePulse(@ConnectedSocket() client: Socket) {
    client.join('pulse');
    const rooms = this.clientRooms.get(client.id) || new Set();
    rooms.add('pulse');
    this.clientRooms.set(client.id, rooms);
  }

  @SubscribeMessage('unsubscribe:pulse')
  handleUnsubscribePulse(@ConnectedSocket() client: Socket) {
    client.leave('pulse');
    const rooms = this.clientRooms.get(client.id);
    if (rooms) rooms.delete('pulse');
  }

  emitDeviceStatus(
    deviceId: string,
    status: DeviceStatus,
    latency: number | null,
  ) {
    this.server.to(`device:${deviceId}`).emit('device:status-changed', {
      deviceId,
      status,
      latency,
      timestamp: new Date().toISOString(),
    });
  }

  emitCheckResult(
    deviceId: string,
    success: boolean,
    latency: number | null,
    error: string | null,
  ) {
    this.server.to(`device:${deviceId}`).emit('device:check-completed', {
      deviceId,
      success,
      latency,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  emitLiveLog(log: {
    deviceId: string;
    status: DeviceStatus;
    latency: number | null;
    error: string | null;
    timestamp: string;
  }) {
    this.server.to('live-logs').emit('live-log:new', log);
  }

  emitIncidentCreated(incident: {
    incidentId: string;
    deviceId: string;
    deviceName: string;
    startedAt: string;
    resolvedAt: string | null;
    duration: number | null;
  }) {
    this.server
      .to(`device:${incident.deviceId}`)
      .emit('incident:created', incident);
    this.server.emit('incident:created', incident);
  }

  emitIncidentResolved(incident: {
    incidentId: string;
    deviceId: string;
    deviceName: string;
    startedAt: string;
    resolvedAt: string;
    duration: number;
  }) {
    this.server
      .to(`device:${incident.deviceId}`)
      .emit('incident:resolved', incident);
    this.server.emit('incident:resolved', incident);
  }

  emitSettingsUpdated(settings: Record<string, string>) {
    this.server.emit('settings:updated', settings);
  }

  emitPulseUpdate(bars: number[]) {
    this.server
      .to('pulse')
      .emit('pulse:update', { bars, timestamp: new Date().toISOString() });
  }

  getConnectedClients(): number {
    return this.server?.sockets?.sockets?.size || 0;
  }
}
