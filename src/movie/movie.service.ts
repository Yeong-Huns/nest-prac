import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class MovieService {
  private idCounter = 4;
  private movies: Movie[] = [
    new Movie({
      id: 1,
      name: '해리포터',
      character: ['해리포터', '엠마왓슨'],
    }),
    new Movie({
      id: 2,
      name: '해리포터2',
      character: ['해리포터', '엠마왓슨'],
    }),
    new Movie({
      id: 3,
      name: '해리포터3',
      character: ['해리포터', '엠마왓슨'],
    }),
  ];

  create(createMovieDto: CreateMovieDto) {
    const newMovie: Movie = new Movie({
      id: this.idCounter,
      ...createMovieDto,
    });
    this.idCounter++;
    this.movies.push(newMovie);
  }

  findAll(name?: string) {
    if (!name) {
      return this.movies;
    }
    return this.movies.filter((movie) => movie.name.startsWith(name));
  }

  findOne(id: number) {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return movie;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return movie.updateMovie(updateMovieDto);
  }

  remove(id: number) {
    const movie = this.movies.find((movie) => movie.id === +id);
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    this.movies = this.movies.filter((movie) => movie.id !== +id);
    return this.movies;
  }
}
