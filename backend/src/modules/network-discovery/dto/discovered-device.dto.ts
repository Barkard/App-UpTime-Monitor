import { ApiProperty } from '@nestjs/swagger';

export class DiscoveredDeviceDto {
  @ApiProperty({ example: '192.168.88.238' })
  ip: string;

  @ApiProperty({ example: 'android-phone.lan', nullable: true })
  hostname: string | null;

  @ApiProperty({ example: '9c:69:d3:1d:5f:6e', nullable: true })
  mac: string | null;

  @ApiProperty({ example: 'Samsung', nullable: true })
  vendor: string | null;

  @ApiProperty({ example: false })
  alreadyMonitored: boolean;

  @ApiProperty({ example: null, nullable: true })
  existingDeviceId: string | null;
}
