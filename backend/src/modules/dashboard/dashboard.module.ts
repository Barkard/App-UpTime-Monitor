import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Device } from '../devices/entities/device.entity';
import { MonitoringLog } from '../monitoring/entities/monitoring-log.entity';
import { Incident } from '../incidents/entities/incident.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, MonitoringLog, Incident])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
