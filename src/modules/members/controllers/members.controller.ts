import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from '../services/members.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MemberDto } from '../dto';

@Controller('member')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // @Roles(Role.ADMIN)
  @Get('fetchMembers')
  fetchMembers() {
    return this.membersService.findAll();
  }

  @Get('profile/:account_id')
  getProfile(@Param('account_id') account_id: string) {
    return this.membersService.findOne(account_id);
  }

  @Patch('profile/:account_id')
  update(@Param('account_id') account_id: string, @Body() val: MemberDto) {
    return this.membersService.update(account_id, val);
  }

  @Patch('/deactivate/:account_id')
  remove(@Param('account_id') account_id: string) {
    return this.membersService.remove(account_id);
  }
}
