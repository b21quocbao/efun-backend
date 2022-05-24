import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchCompetitionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
