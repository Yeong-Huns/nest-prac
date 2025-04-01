import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../../common/baseEntity/base.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from '../../director/entities/director.entity';

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
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

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  director: Director;
}
