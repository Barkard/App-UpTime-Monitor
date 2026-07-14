import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NetworkDiscoveryService } from './network-discovery.service';
import { DiscoveredDeviceDto } from './dto/discovered-device.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Network Discovery')
@Controller('network')
@UseGuards(ApiKeyGuard)
export class NetworkDiscoveryController {
  constructor(private readonly discoveryService: NetworkDiscoveryService) {}

  @Get('discover')
  @ApiOperation({
    summary:
      'Scan the local subnet (ping sweep) for responsive hosts, enriched with MAC/vendor/hostname where available',
  })
  @ApiResponse({ status: 200, type: [DiscoveredDeviceDto] })
  async discover(): Promise<DiscoveredDeviceDto[]> {
    return this.discoveryService.discover();
  }
}
