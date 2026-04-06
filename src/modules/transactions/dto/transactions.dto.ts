import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransactionDto {
  @IsNotEmpty()
  @IsString()
  transaction_type: string;

  @IsNotEmpty()
  @IsString()
  member_id: string;

  @IsNotEmpty()
  @IsString()
  or_number: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stall_amount: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  saving_amount: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  share_capital_amount: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parking_amount: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  miscellaneous_amount: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  water_bill: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  good_will_amount: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  interest_on_loan: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  service_fee: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  loan_receivable: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  acc_fed: number | null;
}

export class UpdateTransactionDto extends PartialType(TransactionDto) {}
