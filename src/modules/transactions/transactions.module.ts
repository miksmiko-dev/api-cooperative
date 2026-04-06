import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './controller/transactions.controller';
import { TransactionServices } from './services/transactions.service';
import { TransactionsEntity } from './entities/transactions.entity';
import { Member } from '../members/entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionsEntity, Member])],
  controllers: [TransactionController],
  providers: [TransactionServices],
  exports: [TransactionServices],
})
export class TransactionModule {}
