import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Province } from './province.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Province)
  province: Province;
}
