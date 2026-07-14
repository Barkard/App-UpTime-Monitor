import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService implements OnModuleInit {
  private readonly logger = new Logger(RealtimeService.name);
  private pulseInterval: NodeJS.Timeout | null = null;

  constructor(private gateway: RealtimeGateway) {}

  onModuleInit() {
    this.startPulse();
  }

  startPulse() {
    if (this.pulseInterval) return;

    this.pulseInterval = setInterval(() => {
      const bars = Array.from({ length: 45 }, () =>
        Math.floor(Math.random() * 100),
      );
      this.gateway.emitPulseUpdate(bars);
    }, 500);

    this.logger.log('Pulse animation started');
  }

  stopPulse() {
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
      this.logger.log('Pulse animation stopped');
    }
  }

  getConnectedClients(): number {
    return this.gateway.getConnectedClients();
  }
}
