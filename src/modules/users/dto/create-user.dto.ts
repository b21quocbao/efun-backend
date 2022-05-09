export class CreateUserDto {
  address: string;
  refreshToken?: string;
  isAdmin: boolean;
  isBlocked: boolean;
  country?: string;
  ip?: string;
}
