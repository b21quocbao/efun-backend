import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { Request as ReqExpress } from 'express';
import { AuthService } from '../auth.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ passReqToCallback: true });
  }

  async validate(
    @Request() req: ReqExpress,
    address: string,
    signature: string,
  ): Promise<Partial<UserEntity>> {
    const user = await this.authService.validateUser(address, signature);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
