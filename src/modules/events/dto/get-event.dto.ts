import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;
}

export class GetOtherEventDto extends PaginationInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  eventId: string;
}
