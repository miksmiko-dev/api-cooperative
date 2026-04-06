import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionsEntity } from '../entities/transactions.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionDto } from '../dto/transactions.dto';
import { Member } from 'src/modules/members/entities/member.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionServices {
  constructor(
    @InjectRepository(TransactionsEntity)
    private readonly transactionsRepository: Repository<TransactionsEntity>,

    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  async add_transaction(val: TransactionDto) {
    const checkAccountId = await this.membersRepository.findOne({
      where: { account_id: val.member_id },
    });
    if (!checkAccountId) {
      throw new NotFoundException('Account does not exist');
    }
    const transaction_id = randomUUID();

    const insertTransaction = this.transactionsRepository.create({
      ...val,
      transaction_id,
    });

    await this.transactionsRepository.save(insertTransaction);
    return {
      message: `Transaction Added ${transaction_id}`,
    };
  }
}
