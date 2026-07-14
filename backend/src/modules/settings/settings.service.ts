import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { SettingKey } from './dto/update-settings.dto';
import { MonitoringService } from '../monitoring/monitoring.service';
import { MonitoringScheduler } from '../monitoring/monitoring.scheduler';

export const DEFAULT_SETTINGS = {
  monitoring_interval_seconds: '60',
  monitoring_timeout_seconds: '3',
  max_concurrent_checks: '20',
  log_retention_days: '30',
  incident_retention_days: '365',
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    private monitoringService: MonitoringService,
    private monitoringScheduler: MonitoringScheduler,
  ) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  async getAll(): Promise<Record<string, string>> {
    const settings = await this.settingRepository.find();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (!(key in result)) {
        result[key] = value;
      }
    }
    return result;
  }

  async get(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findOne({
      where: { key: key as SettingKey },
    });
    return (
      setting?.value ??
      DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS] ??
      null
    );
  }

  async set(key: string, value: string): Promise<void> {
    const setting = await this.settingRepository.findOne({
      where: { key: key as SettingKey },
    });
    if (setting) {
      setting.value = value;
      await this.settingRepository.save(setting);
    } else {
      await this.settingRepository.save(
        this.settingRepository.create({ key: key as SettingKey, value }),
      );
    }
  }

  async updateMultiple(updates: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(updates)) {
      await this.set(key, value);
    }

    if ('monitoring_interval_seconds' in updates) {
      const intervalSeconds = parseInt(updates.monitoring_interval_seconds, 10);
      await this.monitoringService.reschedule(intervalSeconds);
      this.monitoringScheduler.reschedule(intervalSeconds);
    }
  }

  async ensureDefaults(): Promise<void> {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const existing = await this.settingRepository.findOne({
        where: { key: key as SettingKey },
      });
      if (!existing) {
        await this.settingRepository.save(
          this.settingRepository.create({ key: key as SettingKey, value }),
        );
      }
    }
  }
}
