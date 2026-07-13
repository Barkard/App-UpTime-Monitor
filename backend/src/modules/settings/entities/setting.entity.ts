import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
import { SettingKey } from '../dto/update-settings.dto';

@Entity('settings')
export class Setting {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  key: SettingKey;

  @Column({ type: 'varchar', length: 255 })
  value: string;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
