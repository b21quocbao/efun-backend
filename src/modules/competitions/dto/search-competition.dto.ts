import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchCompetitionDto {
  @ApiPropertyOptional()
  @IsString()
  name?: string;
}
