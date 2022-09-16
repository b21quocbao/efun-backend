import { ApiProperty } from '@nestjs/swagger';

export class FollowUserDto {
  @ApiProperty()
  followUserId: number;
}
