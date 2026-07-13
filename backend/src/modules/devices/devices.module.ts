import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';
import { MonitoringLog } from '../monitoring/entities/monitoring-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, MonitoringLog])],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
