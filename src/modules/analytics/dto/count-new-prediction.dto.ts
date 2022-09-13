import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CountNewPredictionDto {
  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endTime: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  token?: string;
}
