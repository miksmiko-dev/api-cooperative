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

@Controller('member')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('getAllMembers')
  getProfiles() {
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(+id);
  }
}
