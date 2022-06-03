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

  @IsOptional()
  userId?: number;

  @IsOptional()
  eventId?: number;
}
