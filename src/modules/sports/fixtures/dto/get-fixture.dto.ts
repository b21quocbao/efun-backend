import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetFixtureDto {
  @ApiPropertyOptional()
  leagueId?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  notFinised?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
