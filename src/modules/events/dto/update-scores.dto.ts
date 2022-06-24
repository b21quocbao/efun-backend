import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateScoresDto {
  @ApiPropertyOptional()
  totalScore: number;

  @ApiPropertyOptional()
  scoreOne: number;

  @ApiPropertyOptional()
  scoreTwo: number;
}
