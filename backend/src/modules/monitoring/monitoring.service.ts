import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Device, DeviceProtocol, DeviceStatus } from '../devices/entities/device.entity';
import { MonitoringLog, LogStatus } from './entities/monitoring-log.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { IcmpChecker } from './checkers/icmp.checker';
import { TcpChecker } from './checkers/tcp.checker';
import { CheckerResult, Checker } from './checkers/checker.interface';
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface CheckJob {
  device: Device;
  checker: Checker;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly maxConcurrentChecks: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MonitoringLog)
    private readonly logRepository: Repository<MonitoringLog>,
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly icmpChecker: IcmpChecker,
    private readonly tcpChecker: TcpChecker,
    private readonly realtimeGateway: RealtimeGateway,
  ) {
    this.maxConcurrentChecks = this.configService.get<number>(
      'monitoring.maxConcurrentChecks',
      20,
    );
  }

  async checkDevices(devices: Device[]): Promise<CheckResult[]> {
    const jobs: CheckJob[] = devices.map((device) => ({
      device,
      checker:
        device.protocol === DeviceProtocol.ICMP
          ? this.icmpChecker
          : this.tcpChecker,
    }));

    return this.runWithConcurrency(jobs, this.maxConcurrentChecks);
  }

  private async runWithConcurrency(
    jobs: CheckJob[],
    limit: number,
  ): Promise<CheckResult[]> {
    const results: CheckResult[] = [];
    const executing: Promise<void>[] = [];

    for (const job of jobs) {
      const promise = this.executeCheck(job).then((result) => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
        const completedIndex = executing.findIndex((p) =>
          results.some((r) => r.deviceId === job.device.id),
        );
        if (completedIndex >= 0) {
          executing.splice(completedIndex, 1);
        }
      }
    }

    await Promise.all(executing);
    return results;
  }

  private async executeCheck(job: CheckJob): Promise<CheckResult> {
    const { device, checker } = job;
    const timeout =
      this.configService.get<number>('monitoring.timeout', 3) * 1000;

    try {
      const result = await checker.check(
        device.host,
        device.port ?? undefined,
        timeout,
      );
      return {
        deviceId: device.id,
        success: result.success,
        latency: result.latency,
        error: result.error,
        timestamp: result.timestamp,
      };
    } catch (error) {
      this.logger.error(
        `Check failed for device ${device.id}: ${error.message}`,
      );
      return {
        deviceId: device.id,
        success: false,
        latency: null,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async processResults(results: CheckResult[]): Promise<void> {
    const queryRunner =
      this.logRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const logs: MonitoringLog[] = [];
      const statusChanges: Array<{
        deviceId: string;
        status: DeviceStatus;
        timestamp: Date;
      }> = [];

      for (const result of results) {
        const device = await queryRunner.manager.findOne(Device, {
          where: { id: result.deviceId },
        });
        if (!device) continue;

        const status: DeviceStatus = result.success ? 'UP' : 'DOWN';

        const log = queryRunner.manager.create(MonitoringLog, {
          deviceId: result.deviceId,
          status: status === 'UP' ? LogStatus.UP : LogStatus.DOWN,
          latency: result.latency,
          errorMessage: result.error,
        });

        logs.push(log);

        if (device.lastStatus !== status) {
          statusChanges.push({
            deviceId: device.id,
            status,
            timestamp: result.timestamp,
          });
        }
      }

      await queryRunner.manager.save(logs);

      for (const change of statusChanges) {
        await queryRunner.manager.update(Device, change.deviceId, {
          lastStatus: change.status,
          lastCheck: change.timestamp,
          lastLatency:
            results.find((r) => r.deviceId === change.deviceId)?.latency ??
            null,
        });

        await this.handleStatusChange(
          queryRunner,
          change.deviceId,
          change.status,
          change.timestamp,
        );
      }

      await queryRunner.commitTransaction();

      this.emitRealtimeEvents(results, statusChanges);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to process results: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async handleStatusChange(
    queryRunner: QueryRunner,
    deviceId: string,
    newStatus: DeviceStatus,
    timestamp: Date,
  ): Promise<void> {
    if (newStatus === 'DOWN') {
      const existing = await queryRunner.manager.findOne(Incident, {
        where: { deviceId, resolvedAt: null },
      });

      if (!existing) {
        const incident = queryRunner.manager.create(Incident, {
          deviceId,
          startedAt: timestamp,
        });
        await queryRunner.manager.save(incident);

        this.realtimeGateway.emitIncidentCreated(incident);
      }
    } else if (newStatus === 'UP') {
      const incident = await queryRunner.manager.findOne(Incident, {
        where: { deviceId, resolvedAt: null },
      });

      if (incident) {
        incident.resolvedAt = timestamp;
        incident.duration = Math.floor(
          (timestamp.getTime() - incident.startedAt.getTime()) / 1000,
        );
        await queryRunner.manager.save(incident);

        this.realtimeGateway.emitIncidentResolved(incident);
      }
    }
  }

  private emitRealtimeEvents(
    results: CheckResult[],
    statusChanges: Array<{
      deviceId: string;
      status: DeviceStatus;
      timestamp: Date;
    }>,
  ): void {
    for (const result of results) {
      const status: DeviceStatus = result.success ? 'UP' : 'DOWN';

      this.realtimeGateway.emitDeviceStatus(
        result.deviceId,
        status,
        result.latency,
      );
      this.realtimeGateway.emitCheckResult(
        result.deviceId,
        result.success,
        result.latency,
        result.error,
      );

      if (statusChanges.some((c) => c.deviceId === result.deviceId)) {
        this.realtimeGateway.emitLiveLog({
          deviceId: result.deviceId,
          status,
          latency: result.latency,
          error: result.error,
          timestamp: result.timestamp,
        });
      }
    }
  }

  getHealthStatus() {
    return {
      status: 'ok',
      maxConcurrentChecks: this.maxConcurrentChecks,
    };
  }

  async runManualCheck(deviceId: string): Promise<CheckResult | null> {
    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      return null;
    }
    const results = await this.checkDevices([device]);
    return results[0] ?? null;
  }

  getStatus(): { status: string; maxConcurrentChecks: number; interval: number } {
    const interval = this.configService.get<number>('monitoring.interval', 30000);
    return {
      status: 'ok',
      maxConcurrentChecks: this.maxConcurrentChecks,
      interval,
    };
  }

  reschedule(intervalSeconds: number): void {
    this.configService.set('monitoring.interval', intervalSeconds * 1000);
    this.logger.log(`Monitoring interval updated to ${intervalSeconds} seconds`);
  }

  async findActiveDevices(): Promise<Device[]> {
    return this.deviceRepository.find({ where: { isActive: true } });
  }
}

interface CheckResult {
  deviceId: string;
  success: boolean;
  latency: number | null;
  error: string | null;
  timestamp: Date;
}
