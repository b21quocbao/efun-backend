import { ApiProperty } from '@nestjs/swagger';

export class UpdateBannerUrlDto {
  @ApiProperty()
  bannerUrl: string;
}
