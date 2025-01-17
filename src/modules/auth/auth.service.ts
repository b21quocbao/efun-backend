import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseUserDto } from './dto/response-user.dto';
import { lookup } from 'geoip-lite';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private analyticService: AnalyticsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    address: string,
    signature: string,
    isAdmin?: boolean,
  ): Promise<Partial<UserEntity>> {
    try {
      if (isAdmin) {
        await this.adminLogin(address, signature);
      } else {
        let sameAddress = false;
        const payload: any = jwt.verify(
          signature,
          '4560ede97f76ee16cc61e81f4b406b04',
        );

        if (payload.username == address) {
          sameAddress = true;
        }
        if (!sameAddress) {
          throw new HttpException(
            { key: 'WRONG_SIGNATURE' },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (err) {
      throw new HttpException(
        { key: 'WRONG_SIGNATURE' },
        HttpStatus.BAD_REQUEST,
      );
    }

    let user = await this.userService.findByAddress(address);

    if (!user) {
      user = await this.userService.create({ address });
    }

    return {
      ...user,
    };
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async login(req): Promise<ResponseUserDto> {
    const ip =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const geoData = lookup(ip);

    const user = req.user;

    if (user.isBlocked) {
      throw new HttpException({ key: 'IS_BLOCKED' }, HttpStatus.FORBIDDEN);
    }

    const payload = {
      sub: user.id,
      address: user.address,
      isAdmin: user.isAdmin,
    };
    const refreshTokenPayload = { sub: user.id };
    const refreshTokenConfig = {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    };
    const response = {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(
        refreshTokenPayload,
        refreshTokenConfig,
      ),
      user: {
        ...user,
      },
    };

    await this.userService.setRefreshToken(response.refreshToken, user.id);
    if (geoData) {
      await this.userService.setCountry(ip, geoData.country, user.id);
    }
    await this.analyticService.updateCount();

    return response;
  }

  async getAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const refreshTokenConfig = {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    };
    let refreshTokenDecode;
    try {
      refreshTokenDecode = await this.jwtService.verify(
        refreshToken,
        refreshTokenConfig,
      );
    } catch (e) {
      throw new HttpException(
        { key: 'INVALID_TOKEN' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = refreshTokenDecode.sub;
    const user = await this.userService.getUserIfRefreshTokenMatch(
      refreshToken,
      userId,
    );
    const payload = {
      sub: user.id,
      address: user.address,
      isAdmin: user.isAdmin,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async adminLogin(address: string, signature: string) {
    const user = await this.userService.findByAddress(address);
    if (!this.comparePassword(signature, user.password)) {
      throw new Error();
    }
  }

  private comparePassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }
}
