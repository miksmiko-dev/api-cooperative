import { Exclude } from 'class-transformer';
import { Role } from 'src/common/constants/roles.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account_id: string;

  @Column()
  account_type: Role;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 0 })
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime' })
  date_created: Date;
  @UpdateDateColumn({ type: 'datetime' })
  date_updated: Date;
}
