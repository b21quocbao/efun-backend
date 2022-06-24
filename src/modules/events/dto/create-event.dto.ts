import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { EventType } from '../enums/event-type.enum';
import { MarketType } from '../enums/market-type.enum';

export class CreateEventDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  thumbnailUrl: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsNumber()
  transactionId: number;

  @ApiPropertyOptional()
  @IsNumber()
  subCategoryId?: number;

  @ApiProperty()
  @IsNumber()
  competitionId: number;

  @ApiProperty()
  @IsString()
  type: EventType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  marketType?: MarketType;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  deadline: Date;

  @ApiProperty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  endTime: Date;

  @ApiProperty()
  @IsString()
  options: string;

  @ApiProperty()
  @IsString()
  odds: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  metadata: string;

  @ApiProperty()
  @IsString()
  shortDescription: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  streamUrl?: string;

  @ApiPropertyOptional()
  totalScore?: number;

  @ApiPropertyOptional()
  scoreOne?: number;

  @ApiPropertyOptional()
  scoreTwo?: number;
}
