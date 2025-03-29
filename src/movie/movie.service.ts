import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieResponse } from './dto/movie-response.dto';
import { MovieDetail } from './entities/movie-detail.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movie = this.movieRepository.create({
      name: createMovieDto.name,
      genre: createMovieDto.genre,
      character: createMovieDto.character,
    });

    let movieDetail: MovieDetail | null = null;

    if (createMovieDto.detail) {
      movieDetail = this.movieDetailRepository.create({
        detail: createMovieDto.detail,
      });
      await this.movieDetailRepository.save(movieDetail);
    }

    movie.movieDetail = movieDetail;
    const savedMovie = await this.movieRepository.save(movie);
    return MovieResponse.fromMovie(savedMovie);
  }

  async findAll(name?: string) {
    if (!name) {
      return (
        await this.movieRepository.find({ relations: ['movieDetail'] })
      ).map((movie) => MovieResponse.fromMovie(movie));
    }
    return (
      await this.movieRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
        relations: ['movieDetail'],
      })
    ).map((searchResult) => MovieResponse.fromMovie(searchResult));
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id: id },
      relations: ['movieDetail'],
    });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return MovieResponse.fromMovie(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    await this.movieRepository.update(id, updateMovieDto);
    return MovieResponse.fromMovie(
      await this.movieRepository.findOneBy({ id: id }),
    );
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return await this.movieRepository.delete(id);
  }
}
