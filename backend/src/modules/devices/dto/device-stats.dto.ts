import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeviceStatsDto {
  @ApiPropertyOptional({ example: 45 })
  averageLatency24h: number | null;

  @ApiPropertyOptional({ example: 52 })
  averageLatency7d: number | null;

  @ApiPropertyOptional({ example: 99.5 })
  uptimePercentage24h: number;

  @ApiPropertyOptional({ example: 98.2 })
  uptimePercentage7d: number;

  @ApiPropertyOptional({ example: 1440 })
  totalChecks24h: number;

  @ApiPropertyOptional({ example: 1433 })
  upChecks24h: number;

  @ApiPropertyOptional({ example: 7 })
  downChecks24h: number;
}
