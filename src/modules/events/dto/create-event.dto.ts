import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { EventType } from '../enums/event-type.enum';

export class CreateEventDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  thumbnailUrl: string;

  @ApiProperty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsString()
  type: EventType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  scoreData?: string;

  @ApiProperty()
  @IsDate()
  startTime: Date;

  @ApiProperty()
  @IsDate()
  deadline: Date;

  @ApiProperty()
  @IsDate()
  endTime: Date;

  @ApiProperty()
  @IsString()
  options: string;

  @ApiProperty()
  @IsString()
  odds: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  streamUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resultProofUrl?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  transactionId?: number;
}
