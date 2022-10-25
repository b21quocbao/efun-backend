import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';

export class SetTimeDto extends PaginationInput {
  @ApiProperty()
  @IsNumber()
  startTime: number;

  @ApiProperty()
  @IsNumber()
  endTime: number;
}
