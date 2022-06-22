import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetFixtureDto {
  @ApiPropertyOptional()
  leagueId?: number;
}
