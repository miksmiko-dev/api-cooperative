import {
  Column,
  CreateDateColumn,
  Entity,
  // ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account_id: string;

  @Column({ type: 'varchar', length: 20 })
  first_name: string;

  @Column({ type: 'varchar', length: 20 })
  last_name: string;

  @Column({ type: 'datetime' })
  birth_date: Date;

  @Column({ type: 'smallint' })
  sex: number;

  @Column({ type: 'varchar', length: 20 })
  region_id: string;

  @Column({ type: 'varchar', length: 20 })
  province_id: string;

  @Column({ type: 'varchar', length: 20 })
  city_id: string;

  @Column({ type: 'varchar', length: 20 })
  barangay_id: string;

  // @ManyToOne(() => Region)
  // region: Region;
  //
  // @ManyToOne(() => Province)
  // province: Province;
  //
  // @ManyToOne(() => City)
  // city: City;
  //
  // @ManyToOne(() => Barangay)
  // barangay: Barangay;

  @Column({ type: 'smallint', default: 0 })
  is_active: number;

  @CreateDateColumn({ type: 'datetime' })
  date_created: Date;
  @UpdateDateColumn({ type: 'datetime' })
  date_updated: Date;
}
