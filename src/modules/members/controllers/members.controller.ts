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
import { Role } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { UpdateMemberDto } from '../dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('member')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Roles(Role.ADMIN)
  @Get('fetchMembers')
  fetchMembers() {
    return this.membersService.findAll();
  }

  @Get('profile/:account_id')
  getProfile(@Param('account_id') account_id: string) {
    return this.membersService.findOne(account_id);
  }

  @Patch('profile/:account_id')
  update(
    @Param('account_id') account_id: string,
    @Body() val: UpdateMemberDto,
  ) {
    return this.membersService.update(account_id, val);
  }

  @Patch('/deactivate/:account_id')
  remove(@Param('account_id') account_id: string) {
    return this.membersService.remove(account_id);
  }
}
