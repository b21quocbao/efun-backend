import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SearchCategoryDto {
  @ApiPropertyOptional()
  @IsNumber()
  fatherId?: number;

  @ApiPropertyOptional()
  @IsString()
  name?: string;
}
