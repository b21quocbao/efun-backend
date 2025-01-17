import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Request as ReqExpress } from 'express';
import { ResponseUserDto } from './dto/response-user.dto';
import { GetAccessTokenForm } from './dto/get-access-token.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: LoginUserDto,
  })
  @Post('login')
  @ApiBearerAuth()
  async login(@Request() req: ReqExpress): Promise<Partial<ResponseUserDto>> {
    return this.authService.login(req);
  }

  @Post('access-token')
  @ApiBody({
    type: GetAccessTokenForm,
  })
  async getAccessToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<Partial<ResponseUserDto>> {
    return this.authService.getAccessToken(refreshToken);
  }
}
