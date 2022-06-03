import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { EventStatus } from '../enums/event-status.enum';
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
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  outOfTime?: boolean;

  @ApiPropertyOptional({
    enum: EventStatus,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsOptional()
  eventId?: number;
}

export class GetOtherEventDto extends PaginationInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  eventId: string;
}
