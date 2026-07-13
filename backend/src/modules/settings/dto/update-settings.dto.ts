import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export enum SettingKey {
  MONITORING_INTERVAL_SECONDS = 'monitoring_interval_seconds',
  MONITORING_TIMEOUT_SECONDS = 'monitoring_timeout_seconds',
  MAX_CONCURRENT_CHECKS = 'max_concurrent_checks',
  LOG_RETENTION_DAYS = 'log_retention_days',
  INCIDENT_RETENTION_DAYS = 'incident_retention_days',
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: [10, 30, 60, 300, 600, 1800, 3600] })
  @IsOptional()
  @IsIn([10, 30, 60, 300, 600, 1800, 3600])
  monitoring_interval_seconds?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  monitoring_timeout_seconds?: number;

  @ApiPropertyOptional({ minimum: 5, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  max_concurrent_checks?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 365 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  log_retention_days?: number;

  @ApiPropertyOptional({ minimum: 30, maximum: 1095 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(1095)
  incident_retention_days?: number;
}
