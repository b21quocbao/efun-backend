import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { GameEntity } from '../../games/entities/game.entity';

@Entity('basketball_seasons')
export class SeasonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  year?: number;

  @OneToMany(() => GameEntity, (game) => game.season)
  games: GameEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
