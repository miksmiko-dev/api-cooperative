import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { UpdateMemberDto } from '../dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  async findAll(): Promise<Member[]> {
    const allMember = await this.membersRepository
      .createQueryBuilder('M')
      .innerJoin('credentials', 'C', 'C.account_id = M.account_id')
      .where('C.is_active = :is_active', { is_active: 0 })
      .getMany();
    return allMember;
  }

  async findOne(account_id: string): Promise<Member> {
    const member = await this.membersRepository
      .createQueryBuilder('M')
      .innerJoin('credentials', 'C', 'C.account_id = M.account_id')
      .where('M.account_id = :account_id', { account_id })
      .andWhere('C.is_active = :is_active', { is_active: 0 })
      .getOne();

    if (!member) {
      throw new NotFoundException(`Member with ID ${account_id} not found`);
    }
    return member;
  }

  async update(
    account_id: string,
    val: UpdateMemberDto,
  ): Promise<Member | null> {
    const checkAccountId = await this.membersRepository.findOne({
      where: { account_id },
    });
    if (!checkAccountId) {
      throw new NotFoundException({
        message: 'Account id not found',
        error: 404,
      });
    }
    await this.membersRepository.update({ account_id }, val);
    return await this.membersRepository.findOne({
      where: { account_id },
    });
  }

  async remove(account_id: string) {
    const checkAccountId = await this.membersRepository.findOne({
      where: { account_id, is_active: 0 },
    });
    if (!checkAccountId) {
      throw new NotFoundException({
        message: 'Account already deactivated',
        error: 409,
      });
    }
    await this.membersRepository.update({ account_id }, { is_active: 1 });
    return { message: 'Account successfully deactivated' };
  }
}
