import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchNftDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
