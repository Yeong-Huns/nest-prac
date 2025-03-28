import { UpdateMovieDto } from '../dto/update-movie.dto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  genre: string;

  @Column('text', { array: true })
  character: string[];

  updateMovie(updateMovieDto: UpdateMovieDto) {
    Object.assign(this, {
      ...this,
      ...updateMovieDto,
    });
  }
}
