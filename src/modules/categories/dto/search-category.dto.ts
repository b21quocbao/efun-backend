import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchCategoryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  fatherId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
