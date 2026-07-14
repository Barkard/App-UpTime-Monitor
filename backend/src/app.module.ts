import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { DevicesModule } from './modules/devices/devices.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { LogsModule } from './modules/logs/logs.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { SettingsModule } from './modules/settings/settings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { NetworkDiscoveryModule } from './modules/network-discovery/network-discovery.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CommonModule,
    RealtimeModule,
    DevicesModule,
    MonitoringModule,
    LogsModule,
    IncidentsModule,
    SettingsModule,
    DashboardModule,
    NetworkDiscoveryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
