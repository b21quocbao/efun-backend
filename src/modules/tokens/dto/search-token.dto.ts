import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchTokenDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
