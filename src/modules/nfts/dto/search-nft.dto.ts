import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SearchNftOrder } from '../enums/search-nft-order.enum';

export class SearchNftDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orderBy?: SearchNftOrder;

  @ApiPropertyOptional()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsNumber()
  userId?: number;
}
