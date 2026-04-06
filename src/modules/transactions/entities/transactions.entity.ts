import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class TransactionsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transaction_id: string;

  @Column({ type: 'varchar', length: 50 })
  transaction_type: string;

  @Column({ type: 'varchar', length: 255 })
  member_id: string;

  @Column({ type: 'varchar', length: 100 })
  or_number: string;

  @Column({ type: 'int', nullable: true })
  stall_amount: number | null;

  @Column({ type: 'int', nullable: true })
  saving_amount: number | null;

  @Column({ type: 'int', nullable: true })
  share_capital_amount: number | null;

  @Column({ type: 'int', nullable: true })
  parking_amount: number | null;

  @Column({ type: 'int', nullable: true })
  miscellaneous_amount: number | null;

  @Column({ type: 'int', nullable: true })
  water_bill: number | null;

  @Column({ type: 'int', nullable: true })
  good_will_amount: number | null;

  @Column({ type: 'int', nullable: true })
  interest_on_loan: number | null;

  @Column({ type: 'int', nullable: true })
  service_fee: number | null;

  @Column({ type: 'int', nullable: true })
  loan_receivable: number | null;

  @Column({ type: 'int', nullable: true })
  acc_fed: number | null;

  @Column({ type: 'smallint', default: 0 })
  is_active: number;

  @CreateDateColumn({ type: 'datetime' })
  create_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
