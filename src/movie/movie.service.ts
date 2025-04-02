import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieResponse } from './dto/movie-response.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from '../director/entities/director.entity';
import { Genre } from '../genre/entities/genre.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const { directorId, genres, detail, ...movieData } = createMovieDto;
    const [director, movieGenres, movieDetail] = await Promise.all([
      this.findDirectorById(directorId),
      this.findOrCreateGenres(genres),
      this.findOrCreateMovieDetail(detail),
    ]);
    const movie = await this.movieRepository.save({
      ...movieData,
      movieDetail: movieDetail,
      director: director,
      genres: movieGenres,
    });
    return MovieResponse.fromMovie(movie);
  }

  /* Director 검색 */
  private async findDirectorById(
    directorId: number,
    relations: string[] = ['movieDetail', 'director'],
  ) {
    const director = await this.directorRepository.findOne({
      where: { id: directorId },
      relations,
    });

    if (!director) {
      throw new NotFoundException(`Director with id ${directorId} not found`);
    }

    return director;
  }

  private async findOrCreateGenres(names: string[]) {
    const existingGenres = await this.genreRepository.find({
      where: { name: In(names) },
    });
    const existingGenreNames = existingGenres.map((genre) => genre.name);

    const newGenreNames = names.filter(
      (name) => !existingGenreNames.includes(name),
    );
    if (newGenreNames.length === 0) return existingGenres;

    const newGenres = newGenreNames.map((name) =>
      this.genreRepository.create({ name }),
    );
    const savedNewGenres = await this.genreRepository.save(newGenres);

    return [...existingGenres, ...savedNewGenres];
  }

  private async findOrCreateMovieDetail(detail?: string) {
    if (!detail) return null;

    const existDetail = await this.movieDetailRepository.findOneBy({ detail });
    if (existDetail) return existDetail;

    return await this.movieDetailRepository.save({ detail });
  }

  async findAll(name?: string) {
    if (!name) {
      return (
        await this.movieRepository.find({
          relations: ['movieDetail', 'director', 'genres'],
        })
      ).map((movie) => MovieResponse.fromMovie(movie));
    }
    return (
      await this.movieRepository.find({
        where: {
          name: Like(`%${name}%`),
        },
        relations: ['movieDetail', 'director', 'genres'],
      })
    ).map((searchResult) => MovieResponse.fromMovie(searchResult));
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id: id },
      relations: ['movieDetail', 'director', 'genres'],
    });
    if (!movie) throw new NotFoundException(`Movie ${id} not found`);
    return MovieResponse.fromMovie(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findMovieById(id);

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

  private async findMovieById(
    id: number,
    relations: string[] = ['movieDetail', 'director'],
  ) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations,
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
