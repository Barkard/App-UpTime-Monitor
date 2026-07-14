import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkDiscoveryService } from './network-discovery.service';
import { NetworkDiscoveryController } from './network-discovery.controller';
import { Device } from '../devices/entities/device.entity';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), MonitoringModule],
  controllers: [NetworkDiscoveryController],
  providers: [NetworkDiscoveryService],
})
export class NetworkDiscoveryModule {}
