import { ApiProperty } from '@nestjs/swagger';

export class UpdateNicknameDto {
  @ApiProperty()
  nickname: string;
}
