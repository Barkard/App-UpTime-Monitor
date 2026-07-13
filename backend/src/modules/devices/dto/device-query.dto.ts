import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { DeviceProtocol } from '../entities/device.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class DeviceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'server' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DeviceProtocol })
  @IsOptional()
  @IsIn(Object.values(DeviceProtocol))
  protocol?: DeviceProtocol;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    enum: ['name', 'host', 'protocol', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['name', 'host', 'protocol', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'host' | 'protocol' | 'createdAt' | 'updatedAt' =
    'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
