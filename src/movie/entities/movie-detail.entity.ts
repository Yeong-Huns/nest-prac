import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    unique: true,
    nullable: false,
  })
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.movieDetail, { onDelete: 'CASCADE' })
  movie: Movie;
}
