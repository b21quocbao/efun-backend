import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  predictionId: number;

  userId?: number;
}
