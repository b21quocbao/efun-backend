import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';

export class CountNewEventDto {
  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endTime: Date;
}
