import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsInt,
  Min,
  Max,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { DeviceProtocol } from '../entities/device.entity';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 'Updated Server Name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: '10.0.0.1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  host?: string;

  @ApiPropertyOptional({ enum: DeviceProtocol })
  @IsOptional()
  @IsIn(Object.values(DeviceProtocol))
  protocol?: DeviceProtocol;

  @ApiPropertyOptional({
    example: 8080,
    minimum: 1,
    maximum: 65535,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o) => o.port !== null && o.port !== undefined)
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
