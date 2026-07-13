import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceStatus, DeviceProtocol } from '../entities/device.entity';
import { DeviceStatsDto } from './device-stats.dto';

export class DeviceResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'Main Server' })
  name: string;

  @ApiProperty({ example: '192.168.1.1' })
  host: string;

  @ApiProperty({ enum: DeviceProtocol })
  protocol: DeviceProtocol;

  @ApiPropertyOptional({ example: 80 })
  port: number | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  lastCheck: Date | null;

  @ApiPropertyOptional({ enum: DeviceStatus })
  lastStatus: DeviceStatus | null;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  updatedAt: Date;
}

export class DeviceWithStatsDto extends DeviceResponseDto {
  @ApiPropertyOptional({ type: DeviceStatsDto })
  stats?: DeviceStatsDto;
}
