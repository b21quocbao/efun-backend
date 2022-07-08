import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  readonly isAdmin?: boolean;
}
