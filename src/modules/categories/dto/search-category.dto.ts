import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchCategoryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  fatherId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
