import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthLoginDTO } from '../dto/auth-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from '../entities/credential.entity';
import { Repository } from 'typeorm';
import { HashService } from 'src/common/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
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
    try {
      const token = this.jwtService.sign({
        id: member.id,
        account_id: member.account_id,
        email: member.email,
        account_type: member.account_type,
      });

      return {
        ...member,
        token,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to login, Please try again',
      );
    }
  }

  async registration(val: MemberDto) {
    const { birth_date, ...rest } = val;
    const password = 'Cooperative2026';
    const checkEmail = await this.credentialRepository.findOne({
      where: { email: val.email },
    });

    if (checkEmail) {
      throw new ConflictException('Email already exist');
    }

    const uuid = randomUUID();
    const account_id = uuid;

    try {
      await this.memberRepository.manager.transaction(async (manager) => {
        const insertMember = this.memberRepository.create({
          account_id,
          birth_date: new Date(birth_date),
          ...rest,
        });

        const insertCrendetial = this.credentialRepository.create({
          email: val.email,
          password: await this.hashService.hash(password),
          account_id,
          account_type: Role.ADMIN,
        });

        await manager.save(insertMember);
        await manager.save(insertCrendetial);
      });

      return {
        message: 'Registration successful',
        account_id,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
