import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { RolesGuardAdmin } from 'src/shares/decorators/is-admin.decorator';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowUserDto } from './dto/follow-user.dto';
import { UpdateBannerUrlDto } from './dto/update-banner-url.dto';
import { UpdateDescriptionDto } from './dto/update-description.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@UserID() userId: number) {
    return this.usersService.findOne(userId);
  }

  // @Delete()
  // @UseGuards(JwtAuthGuard)
  // async deleteAccount(@UserID() userId: number): Promise<void> {
  //   return this.usersService.remove(userId);
  // }

  @Put('block-user/:id')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async blockUser(@Param('id') id: string): Promise<void> {
    return this.usersService.blockUser(+id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async findAll(
    @Query() { pageNumber, pageSize }: PaginationInput,
  ): Promise<Response<UserEntity[]>> {
    return this.usersService.findAll(pageNumber, pageSize);
  }

  @Get(':address')
  async getUserByAddress(@Param('address') address: string) {
    return this.usersService.findByAddress(address);
  }

  @Post('description')
  async updateDescription(
    @UserID() userId: number,
    @Body() updateDescriptionDto: UpdateDescriptionDto,
  ): Promise<void> {
    return this.usersService.updateDescription(
      userId,
      updateDescriptionDto.description,
    );
  }

  @Post('nickname')
  async updateNickname(
    @UserID() userId: number,
    @Body() updateNicknameDto: UpdateNicknameDto,
  ): Promise<void> {
    return this.usersService.updateNickname(userId, updateNicknameDto.nickname);
  }

  @Post('banner-url')
  async updateBannerUrl(
    @UserID() userId: number,
    @Body() updateBannerUrlDto: UpdateBannerUrlDto,
  ): Promise<void> {
    return this.usersService.updateBannerUrl(
      userId,
      updateBannerUrlDto.bannerUrl,
    );
  }

  @Post('follow')
  async follow(
    @UserID() userId: number,
    @Body() followUser: FollowUserDto,
  ): Promise<void> {
    return this.usersService.follow(userId, followUser.followUserId);
  }

  @Post('unfollow')
  async unfollow(
    @UserID() userId: number,
    @Body() followUser: FollowUserDto,
  ): Promise<void> {
    return this.usersService.unfollow(userId, followUser.followUserId);
  }
}
