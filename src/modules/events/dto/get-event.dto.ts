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
  competitionId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  leagueId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  subCategoryId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  loginUserId?: number;

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

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  canBlock?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  haveReport?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  outOfEndTime?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  outOfEndTime7day?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  homeList?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  homeListTime?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  outOfTimeBeforeEnd?: boolean;

  @ApiPropertyOptional()
  biggestToken?: string;

  @ApiPropertyOptional()
  tokenIds?: string[];

  @ApiPropertyOptional()
  eventTypes?: string[];

  @ApiPropertyOptional()
  listingStatuses?: string[];

  @ApiPropertyOptional({
    enum: EventStatus,
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  followFirst?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  eventId?: number;

  isFollowFirst?: boolean;
  skip?: number = 0;
}

export class GetOtherEventDto extends PaginationInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  eventId: string;
}
