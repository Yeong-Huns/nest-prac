import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieResponse } from './dto/movie-response.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from '../director/entities/director.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('Director not found');
    }

    const movie = await this.movieRepository.save({
      name: createMovieDto.name,
      genre: createMovieDto.genre,
      character: createMovieDto.character,
      movieDetail: {
        detail: createMovieDto?.detail ?? null,
      },
      director: director,
    });
    return MovieResponse.fromMovie(movie);
  }

  async findAll(name?: string) {
    if (!name) {
      return (
        await this.movieRepository.find({
          relations: ['movieDetail', 'director'],
        })
      ).map((movie) => MovieResponse.fromMovie(movie));
    }
    return (
      await this.movieRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
        relations: ['movieDetail', 'director'],
      })
    ).map((searchResult) => MovieResponse.fromMovie(searchResult));
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id: id },
      relations: ['movieDetail', 'director'],
    });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return MovieResponse.fromMovie(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findMovieOrFail(id);

    const { detail, directorId, ...movieData } = updateMovieDto;

    await this.updateMovieData(id, movieData);

    if (detail) {
      await this.updateMovieDetail(movie, detail);
    }

    if (directorId) {
      await this.updateMovieDirector(movie, directorId);
    }

    return this.getUpdatedMovie(id);
  }

  private async findMovieOrFail(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail', 'director'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie ${id} not found`);
    }

    return movie;
  }

  /* 영화 조회 */
  private async updateMovieData(id: number, movieData: Partial<Movie>) {
    await this.movieRepository.update(id, movieData);
  }

  /*영화 상세 정보 업데이트 */
  private async updateMovieDetail(movie: Movie, detail: string) {
    if (movie.movieDetail) {
      /* 기존 상세 정보 업데이트 */
      await this.movieDetailRepository.update(
        { id: movie.movieDetail.id },
        { detail },
      );
    } else {
      /* 새 상세 정보 생성 */
      const newMovieDetail = this.movieDetailRepository.create({ detail });
      movie.movieDetail = await this.movieDetailRepository.save(newMovieDetail);
      await this.movieRepository.save(movie);
    }
  }

  /* 영화 감독 업데이트 */
  private async updateMovieDirector(movie: Movie, directorId: number) {
    const director = await this.directorRepository.findOne({
      where: { id: directorId },
    });

    if (!director) {
      throw new NotFoundException(`Director ${directorId} not found`);
    }

    movie.director = director;
    await this.movieRepository.save(movie);
  }

  /* 업데이트된 영화 정보 조회 */
  private async getUpdatedMovie(id: number) {
    const updatedMovie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail', 'director'],
    });
    console.log(updatedMovie);
    return MovieResponse.fromMovie(updatedMovie);
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findBy({ id: id });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return await this.movieRepository.delete(id);
  }
}
