import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/baseEntity/base.entity';
import { Movie } from '../../movie/entities/movie.entity';

@Entity()
export class Genre extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    unique: true,
  })
  name: string;
  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies: Movie[];
}
