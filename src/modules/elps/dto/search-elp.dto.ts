import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchElpDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
