import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ActionDto {
  @ApiProperty()
  @IsString()
  action: string;
}
