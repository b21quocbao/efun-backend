import { EventEntity } from 'src/modules/events/entities/event.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('predictPools')
export class PredictPoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.predictPools)
  event: EventEntity;

  @PrimaryColumn()
  eventId: number;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.predictPool)
  transactions: TransactionEntity[];

  @PrimaryColumn()
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
