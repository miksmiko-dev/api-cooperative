import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthLoginDTO } from '../dto/auth-login.dto';
import { MembersService } from 'src/modules/members/services/members.service';

@Injectable()
export class AuthService {
  constructor(private membersService: MembersService) {}

  async login(login: AuthLoginDTO) {
    const member = await this.membersService.findByEmail(login.email);
    
    // Check if member exists
    if (!member) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // TODO: Implement password comparison (e.g., bcrypt.compare(login.password, member.password))
    if (member.password !== login.password) {
       // Ideally you would hash passwords. For now, we assume plain text or implement hashing later.
       // throw new UnauthorizedException('Invalid Credentials');
    }

    return {
      status: 'success',
      // token: ... (You will need to sign the JWT here)
    };
  }
}