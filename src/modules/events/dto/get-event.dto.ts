import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { ESortEvent } from '../enums/event-type.enum';

export class GetAllEventDto extends PaginationInput {
  @ApiPropertyOptional({
    enum: ESortEvent,
  })
  @IsEnum(ESortEvent)
  @IsOptional()
  orderBy?: ESortEvent;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}