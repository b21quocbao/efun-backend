import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { GameEntity } from '../../games/entities/game.entity';
import { LeagueEntity } from '../../leagues/entities/league.entity';
import { TeamEntity } from '../../teams/entities/team.entity';

@Entity('basketball_countries')
export class CountryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  flag?: string;

  @OneToMany(() => GameEntity, (game) => game.country)
  games: GameEntity[];

  @OneToMany(() => LeagueEntity, (league) => league.country)
  leagues: LeagueEntity[];

  @OneToMany(() => TeamEntity, (team) => team.country)
  teams: TeamEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
