import { Sex } from 'src/common/constants/sex.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'datetime' })
  birth_date: Date;

  @Column({ type: 'smallint' })
  sex: number;

  @CreateDateColumn({ type: 'datetime' })
  date_created: Date;
  @UpdateDateColumn({ type: 'datetime' })
  date_updated: Date;
}
