import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Region } from './region.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Region)
  region: Region;
}
