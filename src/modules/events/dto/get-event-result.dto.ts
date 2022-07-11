import { ApiProperty } from '@nestjs/swagger';

export class GetEventResultDto {
  @ApiProperty()
  eventIds: string;
}
