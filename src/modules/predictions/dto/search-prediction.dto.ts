import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PSortEvent } from '../enums/prediction-type.enum';

export class SearchPredictionDto {
  @ApiPropertyOptional({
    enum: PSortEvent,
  })
  @IsEnum(PSortEvent)
  @IsOptional()
  orderBy?: PSortEvent;

  @ApiPropertyOptional()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  eventId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  predictionId?: number;
}
