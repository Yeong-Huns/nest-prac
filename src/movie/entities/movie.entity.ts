import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/baseEntity/base.entity';
import { MovieDetail } from './movie-detail.entity';

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  genre: string;

  @Column('text', { array: true })
  character: string[];

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  movieDetail: MovieDetail;
}
