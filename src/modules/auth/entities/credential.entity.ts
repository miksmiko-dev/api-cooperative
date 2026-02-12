import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({})
  is_active: boolean;
}
