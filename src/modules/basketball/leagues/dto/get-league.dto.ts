import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetLeagueDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  notFinised?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  @IsBoolean()
  nullOddMeta?: boolean;
}
