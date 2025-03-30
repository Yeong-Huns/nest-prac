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
    const movie = await this.movieRepository.save({
      name: createMovieDto.name,
      genre: createMovieDto.genre,
      character: createMovieDto.character,
      movieDetail: {
        detail: createMovieDto?.detail ?? null,
      },
    });
    return MovieResponse.fromMovie(movie);
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
    const movie = await this.movieRepository.findOne({
      where: { id: id },
      relations: ['movieDetail'],
    });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);

    const { detail, ...restUpdateMovieDto } = updateMovieDto;

    await this.movieRepository.update(id, restUpdateMovieDto);
    if (detail) {
      if (movie.movieDetail) {
        await this.movieDetailRepository.update(
          { id: movie.movieDetail.id },
          { detail },
        );
      } else {
        const newMovieDetail = this.movieDetailRepository.create({ detail });
        movie.movieDetail =
          await this.movieDetailRepository.save(newMovieDetail);
        await this.movieRepository.save(movie);
      }
    }
    return MovieResponse.fromMovie(
      await this.movieRepository.findOne({
        where: { id: id },
        relations: ['movieDetail'],
      }),
    );
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return await this.movieRepository.delete(id);
  }
}
