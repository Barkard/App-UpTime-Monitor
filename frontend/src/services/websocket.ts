import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function joinDeviceRoom(deviceId: string) {
  getSocket().emit('join:device-room', deviceId);
}

export function leaveDeviceRoom(deviceId: string) {
  getSocket().emit('leave:device-room', deviceId);
}

export function subscribeLiveLogs() {
  getSocket().emit('subscribe:live-logs');
}

export function unsubscribeLiveLogs() {
  getSocket().emit('unsubscribe:live-logs');
}

export function subscribePulse() {
  getSocket().emit('subscribe:pulse');
}

export function unsubscribePulse() {
  getSocket().emit('unsubscribe:pulse');
}
