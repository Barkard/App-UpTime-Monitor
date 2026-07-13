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

@Entity('incidents')
@Index('idx_incidents_device_id_started_at', ['deviceId', 'startedAt'])
@Index('idx_incidents_resolved_at', ['resolvedAt'], { where: 'resolved_at IS NOT NULL' })
@Index('idx_incidents_ongoing', ['deviceId'], { where: 'resolved_at IS NULL' })
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'device_id' })
  deviceId: string;

  @ManyToOne(() => Device, (device) => device.incidents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'timestamp with time zone', name: 'started_at' })
  startedAt: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'resolved_at',
    nullable: true,
  })
  resolvedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;
}
