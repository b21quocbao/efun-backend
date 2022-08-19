import { ApiProperty } from '@nestjs/swagger';

export class UpdateDescriptionDto {
  @ApiProperty()
  description: string;
}
