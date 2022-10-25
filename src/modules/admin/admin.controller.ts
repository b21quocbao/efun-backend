import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuardAdmin } from 'src/shares/decorators/is-admin.decorator';
import { WhitelistDto } from './dto/whitelist.dto';
import { SetTimeDto } from './dto/set-time.dto';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly adminService: AdminService) {}

  @Put('block-event/:id')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async blockEvent(@Param('id') id: string): Promise<void> {
    return this.adminService.blockEvent(+id);
  }

  @Put('unblock-event/:id')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async unblockEvent(@Param('id') id: string): Promise<void> {
    return this.adminService.unblockEvent(+id);
  }

  @Post('whitelist')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async whitelistUser(@Body() request: WhitelistDto): Promise<void> {
    return this.adminService.whitelistUser(request.addresses);
  }

  @Post('remove-whitelist')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async removeWhitelistUser(@Body() request: WhitelistDto): Promise<void> {
    return this.adminService.removeWhitelistUser(request.addresses);
  }

  @Post('set-time')
  @UseGuards(JwtAuthGuard, RolesGuardAdmin)
  async setTime(@Body() request: SetTimeDto): Promise<void> {
    return this.adminService.setTime(request.startTime, request.endTime);
  }
}
