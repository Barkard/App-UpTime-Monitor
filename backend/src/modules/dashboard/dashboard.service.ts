import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Device } from '../devices/entities/device.entity';
import {
  MonitoringLog,
  LogStatus,
} from '../monitoring/entities/monitoring-log.entity';
import { Incident } from '../incidents/entities/incident.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(MonitoringLog)
    private logRepository: Repository<MonitoringLog>,
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
  ) {}

  async getStats() {
    const [total, active, up, down] = await Promise.all([
      this.deviceRepository.count(),
      this.deviceRepository.count({ where: { isActive: true } }),
      this.logRepository.count({ where: { status: LogStatus.UP } }),
      this.logRepository.count({ where: { status: LogStatus.DOWN } }),
    ]);

    return { total, active, up, down };
  }

  async getDevicesWithSparkline() {
    const devices = await this.deviceRepository.find({
      where: { isActive: true },
      select: [
        'id',
        'name',
        'host',
        'protocol',
        'port',
        'lastCheck',
        'lastStatus',
        'lastLatency',
        'isActive',
      ],
    });

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const logs = await this.logRepository.find({
      where: {
        timestamp: Between(hourAgo, now),
      },
      order: { timestamp: 'ASC' },
    });

    const logsByDevice = new Map<string, MonitoringLog[]>();
    for (const log of logs) {
      if (!logsByDevice.has(log.deviceId)) {
        logsByDevice.set(log.deviceId, []);
      }
      logsByDevice.get(log.deviceId)!.push(log);
    }

    return devices.map((device) => {
      const deviceLogs = logsByDevice.get(device.id) || [];
      const sparkline = this.generateSparkline(deviceLogs);

      return {
        ...device,
        sparkline,
      };
    });
  }

  async getRecentIncidents(limit = 10) {
    return this.incidentRepository.find({
      relations: ['device'],
      order: { startedAt: 'DESC' },
      take: limit,
    });
  }

  private generateSparkline(logs: MonitoringLog[]): (number | null)[] {
    if (logs.length === 0) return Array(20).fill(null);

    const result: (number | null)[] = [];
    const bucketSize = Math.max(1, logs.length / 20);

    for (let i = 0; i < 20; i++) {
      const start = Math.floor(i * bucketSize);
      const end = Math.min(Math.floor((i + 1) * bucketSize), logs.length);
      const bucket = logs.slice(start, end);
      const upLogs = bucket.filter((l) => l.status === LogStatus.UP);
      const latencies = upLogs
        .map((l) => l.latency)
        .filter((l): l is number => l !== null);

      if (latencies.length > 0) {
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        result.push(Math.round(avg));
      } else {
        result.push(null);
      }
    }

    return result;
  }
}
