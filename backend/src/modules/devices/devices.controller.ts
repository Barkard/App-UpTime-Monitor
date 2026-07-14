import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DeviceQueryDto } from './dto/device-query.dto';
import {
  DeviceResponseDto,
  DeviceWithStatsDto,
} from './dto/device-response.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { ValidateUuid } from '../../common/decorators/validate-uuid.param.decorator';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Devices')
@Controller('devices')
@UseGuards(ApiKeyGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiResponse({ status: 201, type: DeviceResponseDto })
  @ApiResponse({ status: 409, description: 'Device already exists' })
  async create(
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all devices with pagination and filters' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto<DeviceResponseDto> })
  async findAll(
    @Query() query: DeviceQueryDto,
  ): Promise<PaginatedResponseDto<DeviceResponseDto>> {
    return this.devicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by ID with latest status' })
  @ApiParam({ name: 'id', description: 'Device UUID' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async findOne(@ValidateUuid('id') id: string): Promise<DeviceResponseDto> {
    return this.devicesService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get device statistics (avg latency, uptime %)' })
  @ApiParam({ name: 'id', description: 'Device UUID' })
  @ApiResponse({ status: 200, type: DeviceWithStatsDto })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getStats(@ValidateUuid('id') id: string): Promise<DeviceWithStatsDto> {
    return this.devicesService.findOneWithStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device' })
  @ApiParam({ name: 'id', description: 'Device UUID' })
  @ApiResponse({ status: 200, type: DeviceResponseDto })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiResponse({ status: 409, description: 'Device conflict' })
  async update(
    @ValidateUuid('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete device (cascades to logs and incidents)' })
  @ApiParam({ name: 'id', description: 'Device UUID' })
  @ApiResponse({ status: 204, description: 'Device deleted' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async remove(@ValidateUuid('id') id: string): Promise<void> {
    return this.devicesService.remove(id);
  }
}
