import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MonitoringService } from './monitoring.service';
import { MonitoringScheduler } from './monitoring.scheduler';
import { MonitoringController } from './monitoring.controller';
import { MonitoringLog } from './entities/monitoring-log.entity';
import { Device } from '../devices/entities/device.entity';
import { Incident } from '../incidents/entities/incident.entity';
import { Setting } from '../settings/entities/setting.entity';
import { IcmpChecker } from './checkers/icmp.checker';
import { TcpChecker } from './checkers/tcp.checker';
import { RealtimeModule } from '../realtime/realtime.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MonitoringLog, Device, Incident, Setting]),
    ScheduleModule.forRoot(),
    RealtimeModule,
    DevicesModule,
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService, MonitoringScheduler, IcmpChecker, TcpChecker],
  exports: [MonitoringService, MonitoringScheduler, IcmpChecker, TcpChecker],
})
export class MonitoringModule {}
