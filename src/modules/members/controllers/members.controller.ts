import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from '../services/members.service';
import { MemberDto } from '../dto/create-member.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/constants/roles.enum';
import { Roles } from 'src/common/decorators/role.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateMemberDto } from '../dto';

@Controller('member')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Roles(Role.ADMIN)
  @Get('fetchMembers')
  fetchMembers(@CurrentUser()) {
    return this.membersService.findAll();
  }

  @Get('profile/:account_id')
  getProfile(@Param('account_id') account_id: string) {
    return this.membersService.findOne(account_id);
  }

  @Patch('profile/:account_id')
  update(@Param('account_id') account_id: string, @Body() val: UpdateMemberDto) {
    return this.membersService.update(account_id, val);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(+id);
  }
}
