import { UserEntity } from 'src/modules/users/entities/user.entity';

export class ResponseUserDto {
  accessToken: string;
  refreshToken: string;
  user: Partial<UserEntity>;
}
