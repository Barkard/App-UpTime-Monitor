import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { DeviceProtocol } from '../entities/device.entity';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Production Server' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  host: string;

  @ApiProperty({ enum: DeviceProtocol, example: DeviceProtocol.ICMP })
  @IsEnum(DeviceProtocol)
  protocol: DeviceProtocol;

  @ApiPropertyOptional({ example: 80, minimum: 1, maximum: 65535 })
  @IsOptional()
  @ValidateIf((o) => o.protocol === DeviceProtocol.TCP)
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
