import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchCategoryDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @Transform(({ value }) => value.toLowerCase() === 'true')
  @IsOptional()
  nonFather?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  fatherId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;
}
