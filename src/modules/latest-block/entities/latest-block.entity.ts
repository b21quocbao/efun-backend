import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('latestBlocks')
export class LatestBlockEntity {
  @PrimaryColumn()
  network: string;

  @PrimaryColumn()
  type: string;

  @Column()
  block: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
