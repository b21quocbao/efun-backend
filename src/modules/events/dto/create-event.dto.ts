import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventType } from '../enums/event-type.enum';
import { MarketType } from '../enums/market-type.enum';

export class CreateEventDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  thumbnailUrl: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  transactionId: number;

  @IsNumber()
  @IsOptional()
  subCategoryId?: number;

  @IsNumber()
  pro?: number;

  @IsNumber()
  fixtureId?: number;

  @IsNumber()
  @IsOptional()
  competitionId?: number;

  @IsNumber()
  @IsOptional()
  leagueId?: number;

  @IsString()
  type: EventType;

  @IsString()
  @IsOptional()
  marketType?: MarketType;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  startTime: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  deadline: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  endTime: Date;

  @IsString()
  options: string;

  @IsString()
  odds: string;

  @IsString()
  description: string;

  @IsString()
  metadata: string;

  playType?: string;

  tokens?: string[];

  @IsBoolean()
  affiliate: boolean;

  @IsNumber()
  hostFee: number;

  @IsString()
  creationFee: string;

  @IsString()
  shortDescription: string;

  @IsString()
  @IsOptional()
  streamUrl?: string;

  totalScore?: number;

  scoreOne?: number;

  scoreTwo?: number;
}
