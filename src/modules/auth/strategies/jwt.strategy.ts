import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { MembersService } from 'src/modules/members/services/members.service';
import { Member } from 'src/modules/members/entities/member.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private membersService: MembersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: any): Promise<Member> {
    const member = await this.membersService.findOne(payload.account_id);

    if (!member) {
      throw new UnauthorizedException();
    }
    // This return value is what will be available in req.user
    return member;
  }
}
