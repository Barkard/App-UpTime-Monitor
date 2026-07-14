import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), MonitoringModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
