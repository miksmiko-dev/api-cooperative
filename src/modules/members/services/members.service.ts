import { Injectable, NotFoundException, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  async findAll(): Promise<Member[]> {
    const allMember = await this.membersRepository.find();
    return allMember;
  }

  async findOne(account_id: string): Promise<Member> {
    const member = await this.membersRepository.findOne({
      where: { account_id },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${account_id} not found`);
    }
    return member;
  }

  async update(account_id: string, val): Promise<Member | null> {
    const checkAccountId = await this.membersRepository.findOne({
      where: { account_id },
    });
    if (!checkAccountId) {
      throw new NotFoundException();
    }
    await this.membersRepository.update({ account_id }, val);
    return await this.membersRepository.findOne({
      where: { account_id },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} member`;
  }
}
