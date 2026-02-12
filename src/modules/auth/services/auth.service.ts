import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthLoginDTO } from '../dto/auth-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from '../entities/credential.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { HashService } from 'src/common/hash/hash.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credential)
    private readonly membersRepository: Repository<Credential>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async login(value: AuthLoginDTO): Promise<any> {
    const member = await this.membersRepository.findOne({
      where: { email: value.email },
    });

    // Check if member exists
    if (!member) throw new UnauthorizedException('Invalid Credential');

    // const isPasswordMatch = await this.hashService.compare(
    //   value.password,
    //   member.password,
    // );
    // if (!isPasswordMatch) throw new UnauthorizedException('Invalid password');

    return {
      ...member,
      token: this.jwtService.sign({
        id: member.id,
        account_id: member.account_id,
        email: member.email,
      }),
    };
  }
  registration() {
    return 'test';
  }
}
