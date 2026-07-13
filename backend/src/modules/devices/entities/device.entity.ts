import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Unique,
} from 'typeorm';
import { MonitoringLog } from '../../monitoring/entities/monitoring-log.entity';
import { Incident } from '../../incidents/entities/incident.entity';

export enum DeviceProtocol {
  ICMP = 'ICMP',
  TCP = 'TCP',
}

export enum DeviceStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  INACTIVE = 'INACTIVE',
}

@Entity('devices')
@Index('idx_devices_is_active', ['isActive'])
@Index('idx_devices_host', ['host'])
@Index('idx_devices_protocol', ['protocol'])
@Unique('uniq_devices_host_protocol_port', ['host', 'protocol', 'port'])
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  host: string;

  @Column({ type: 'enum', enum: DeviceProtocol })
  protocol: DeviceProtocol;

  @Column({ type: 'int', nullable: true })
  port: number | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_check',
    nullable: true,
  })
  lastCheck: Date | null;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    name: 'last_status',
    nullable: true,
  })
  lastStatus: DeviceStatus | null;

  @Column({
    type: 'int',
    name: 'last_latency',
    nullable: true,
  })
  lastLatency: number | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => MonitoringLog, (log) => log.device, { cascade: true })
  logs: MonitoringLog[];

  @OneToMany(() => Incident, (incident) => incident.device, { cascade: true })
  incidents: Incident[];
}
