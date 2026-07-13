import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

export enum LogStatus {
  UP = 'UP',
  DOWN = 'DOWN',
}

@Entity('monitoring_logs')
@Index('idx_monitoring_logs_device_id_timestamp', ['deviceId', 'timestamp'])
@Index('idx_monitoring_logs_timestamp', ['timestamp'])
@Index('idx_monitoring_logs_status', ['status'])
export class MonitoringLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'device_id' })
  deviceId: string;

  @ManyToOne(() => Device, (device) => device.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'enum', enum: LogStatus })
  status: LogStatus;

  @Column({ type: 'int', nullable: true })
  latency: number | null;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'timestamp' })
  timestamp: Date;
}
