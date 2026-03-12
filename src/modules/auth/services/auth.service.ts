import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLoginDTO } from '../dto/auth-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from '../entities/credential.entity';
import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
import { HashService } from 'src/common/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
// import { AuthRegisterDTO } from '../dto/register.dto';
import { randomUUID } from 'crypto';
import { Member } from 'src/modules/members/entities/member.entity';
import { MemberDto } from 'src/modules/members/dto';
import { Role } from 'src/common/constants/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async login(value: AuthLoginDTO): Promise<any> {
    console.log(value);
    const member = await this.credentialRepository.findOne({
      where: { email: value.email },
    });

    // Check if member exists
    if (!member) throw new UnauthorizedException('Invalid Credential');

    const isPasswordMatch = await this.hashService.compare(
      value.password,
      member.password,
    );
    if (!isPasswordMatch) throw new UnauthorizedException('Invalid password');

    return {
      ...member,
      token: this.jwtService.sign({
        id: member.id,
        account_id: member.account_id,
        email: member.email,
        account_type: member.account_type,
      }),
    };
  }

  async registration(val: MemberDto) {
    const { email, password } = val;
    const checkEmail = await this.credentialRepository.findOne({
      where: { email },
    });
    if (checkEmail) {
      throw new ConflictException('Email already exist');
    }

    const uuid = randomUUID();
    const account_id = uuid;

    const insertMember = this.memberRepository.create({
      account_id,
      first_name: val.first_name,
      last_name: val.last_name,
      sex: val.sex,
      birth_date: val.birth_date,
    });

    const insertCrendetial = this.credentialRepository.create({
      email: val.email,
      password: await this.hashService.hash(password),
      account_id,
      account_type: Role.ADMIN,
    });
    await this.memberRepository.save(insertMember);
    await this.credentialRepository.save(insertCrendetial);
    return {
      message: 'Registration successful',
      account_id,
    };
  }
}
