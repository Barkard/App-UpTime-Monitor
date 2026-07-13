import { ApiProperty } from '@nestjs/swagger';

export class CheckResultDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  latency: number | null;

  @ApiProperty()
  error: string | null;

  @ApiProperty()
  timestamp: string;
}

export class ManualCheckResultDto {
  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  success: boolean;

  @ApiProperty()
  latency: number | null;

  @ApiProperty()
  error: string | null;

  @ApiProperty()
  timestamp: string;
}
