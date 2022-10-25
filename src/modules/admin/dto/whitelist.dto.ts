import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';

export class WhitelistDto extends PaginationInput {
  @ApiProperty()
  @IsArray()
  addresses: string[];
}
