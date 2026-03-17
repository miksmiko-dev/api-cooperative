import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './city.entity';

@Entity('barangays')
export class Barangay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => City)
  city: City;
}
