import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DevicesService } from '../devices/devices.service';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class MonitoringScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitoringScheduler.name);
  private intervalId: NodeJS.Timeout | null = null;
  private currentInterval: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly devicesService: DevicesService,
    private readonly monitoringService: MonitoringService,
  ) {
    this.currentInterval =
      this.configService.get<number>('monitoring.interval', 60) * 1000;
  }

  async onModuleInit() {
    this.start();
  }

  async onModuleDestroy() {
    this.stop();
  }

  start() {
    if (this.intervalId) {
      this.stop();
    }

    this.logger.log(
      `Starting monitoring scheduler with interval: ${this.currentInterval}ms`,
    );
    this.runCycle();
    this.intervalId = setInterval(() => this.runCycle(), this.currentInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.log('Monitoring scheduler stopped');
    }
  }

  reschedule(intervalSeconds: number) {
    const newInterval = intervalSeconds * 1000;
    if (newInterval !== this.currentInterval) {
      this.logger.log(
        `Rescheduling monitoring from ${this.currentInterval}ms to ${newInterval}ms`,
      );
      this.currentInterval = newInterval;
      this.start();
    }
  }

  private async runCycle() {
    try {
      const devices = await this.devicesService.findActiveDevices();

      if (devices.length === 0) {
        this.logger.debug('No active devices to check');
        return;
      }

      this.logger.log(`Starting check cycle for ${devices.length} devices`);
      const results = await this.monitoringService.checkDevices(devices);

      await this.monitoringService.processResults(results);

      this.logger.log(
        `Check cycle completed: ${results.filter((r) => r.success).length}/${results.length} UP`,
      );
    } catch (error) {
      this.logger.error(
        `Error in monitoring cycle: ${error.message}`,
        error.stack,
      );
    }
  }

  getStatus() {
    return {
      running: !!this.intervalId,
      interval: this.currentInterval,
      nextRun: this.intervalId ? Date.now() + this.currentInterval : null,
    };
  }
}
