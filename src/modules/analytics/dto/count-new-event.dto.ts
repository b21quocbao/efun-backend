import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CountNewEventDto {
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  playType?: string;
}
