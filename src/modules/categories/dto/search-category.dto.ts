import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SearchCategoryDto {
  @ApiPropertyOptional()
  @IsNumber()
  fatherId?: number;
}
