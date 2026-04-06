import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { TransactionServices } from '../services/transactions.service';
import { TransactionDto } from '../dto/transactions.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionsService: TransactionServices) {}

  @Post('add_transaction')
  addTransaction(@Body() val: TransactionDto) {
    return this.transactionsService.add_transaction(val);
  }
}
